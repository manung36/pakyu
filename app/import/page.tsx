"use client";

import { useCallback, useState } from "react";
import { Upload, Download, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  parseExcel,
  mapRows,
  validateRows,
  checkConflicts,
  executeImport,
  generateErrorLog,
  MappedRow,
  ConflictRow,
} from "@/lib/import";
import { PegawaiInput } from "@/lib/constants";
import { toast } from "sonner";

export default function ImportPage() {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<{
    newRows: (PegawaiInput & { _rowIndex: number })[];
    conflictRows: ConflictRow[];
    invalidRows: MappedRow[];
  } | null>(null);
  const [conflictAction, setConflictAction] = useState<"skip" | "update">("skip");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    addedCount: number;
    updatedCount: number;
    skippedCount: number;
    errors: { row: number; error: string }[];
  } | null>(null);

  const handleFile = useCallback(async (file: File) => {
    try {
      setLoading(true);
      toast.info("Membaca file Excel...");
      const rawRows = await parseExcel(file);
      const mappedRows = mapRows(rawRows);
      const { validRows, invalidRows } = validateRows(mappedRows);
      const { newRows, conflictRows } = await checkConflicts(validRows);
      setPreview({ newRows, conflictRows, invalidRows });
      setResult(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  async function handleImport() {
    if (!preview) return;
    setLoading(true);
    try {
      const res = await executeImport(
        preview.newRows,
        preview.conflictRows,
        conflictAction
      );
      setResult(res);
      setPreview(null);
      toast.success(`Import selesai: ${res.addedCount} ditambahkan`);
    } catch (err) {
      toast.error("Kesalahan import: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }

  const allValid = preview
    ? [...preview.newRows, ...preview.conflictRows.map((c) => c.newData)]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import Data Excel</h1>
        <p className="text-muted-foreground">
          Unggah file .xlsx untuk import data master dosen secara pukal
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-orange-600" />
            Unggah File Excel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors cursor-pointer ${
              dragOver
                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                : "border-muted-foreground/25 hover:border-orange-500/50"
            }`}
          >
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">Seret & Lepas file Excel di sini</p>
              <p className="text-sm text-muted-foreground">
                atau klik untuk memilih file (.xlsx, maks 10MB)
              </p>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={onFileChange}
            />
          </label>
        </CardContent>
      </Card>

      {preview && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pratinjau Data</CardTitle>
            <div className="flex gap-2">
              <Badge variant="default" className="bg-green-600">
                {preview.newRows.length} baru
              </Badge>
              {preview.conflictRows.length > 0 && (
                <Badge variant="outline" className="text-amber-600 border-amber-600">
                  {preview.conflictRows.length} konflik NIP
                </Badge>
              )}
              {preview.invalidRows.length > 0 && (
                <Badge variant="destructive">
                  {preview.invalidRows.length} tidak valid
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {allValid.length > 0 ? (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Baris</TableHead>
                      <TableHead>NIP</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Jabatan</TableHead>
                      <TableHead>Unit Kerja</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.newRows.map((r) => (
                      <TableRow key={r._rowIndex}>
                        <TableCell>{r._rowIndex}</TableCell>
                        <TableCell className="font-mono text-xs">{r.nip}</TableCell>
                        <TableCell>{r.nama_lengkap}</TableCell>
                        <TableCell>{r.jabatan_fungsional}</TableCell>
                        <TableCell>{r.unit_kerja}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-600">
                            Baru
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {preview.conflictRows.map((c) => (
                      <TableRow key={c.newData._rowIndex}>
                        <TableCell>{c.newData._rowIndex}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {c.newData.nip}
                        </TableCell>
                        <TableCell>{c.newData.nama_lengkap}</TableCell>
                        <TableCell>{c.newData.jabatan_fungsional}</TableCell>
                        <TableCell>{c.newData.unit_kerja}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-amber-600 border-amber-600">Konflik</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Tidak ada data valid untuk diimport.
              </p>
            )}

            {preview.invalidRows.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">
                    {preview.invalidRows.length} baris tidak valid:
                  </p>
                  <div className="max-h-36 overflow-y-auto text-xs space-y-1">
                    {preview.invalidRows.map((r) => (
                      <div key={r._rowIndex}>
                        Baris {r._rowIndex}: {(r.errors as string[])?.join(", ")}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => generateErrorLog(preview.invalidRows)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Unduh Log Kesalahan
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          {allValid.length > 0 && (
            <CardFooter className="flex flex-col sm:flex-row gap-4 justify-end items-start sm:items-center border-t pt-6">
              {preview.conflictRows.length > 0 && (
                <div className="flex-1">
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Konflik NIP:
                  </Label>
                  <RadioGroup
                    value={conflictAction}
                    onValueChange={(v) =>
                      setConflictAction(v as "skip" | "update")
                    }
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="skip" id="skip" />
                      <Label htmlFor="skip">Abaikan (Skip)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="update" id="update" />
                      <Label htmlFor="update">Perbarui (Update)</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => setPreview(null)}
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                onClick={handleImport}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? "Mengimport..." : `Import ${allValid.length} Data`}
              </Button>
            </CardFooter>
          )}
        </Card>
      )}

      {result && (
        <Card>
          <CardContent className="py-10 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-4">Import Berhasil!</h3>
            <div className="flex justify-center gap-3">
              <Badge variant="default" className="bg-green-600">
                {result.addedCount} ditambahkan
              </Badge>
              <Badge variant="secondary">
                {result.updatedCount} diperbarui
              </Badge>
              <Badge variant="outline">{result.skippedCount} dilewati</Badge>
            </div>
            {result.errors.length > 0 && (
              <p className="text-red-600 mt-4 text-sm">
                {result.errors.length} kesalahan saat import
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
