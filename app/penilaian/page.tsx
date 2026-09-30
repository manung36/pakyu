"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DB } from "@/lib/db";
import {
  Pegawai,
  Penilaian,
  PenilaianInput,
  JABATAN_LIST,
  PREDIKAT_LIST,
} from "@/lib/constants";
import { Calculator as AKCalculator } from "@/lib/calculator";
import { formatDisplay } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function PenilaianPage() {
  const [dosen, setDosen] = useState<Pegawai[]>([]);
  const [penilaian, setPenilaian] = useState<Penilaian[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<PenilaianInput>>({
    pegawai_id: undefined,
    tahun: undefined,
    periode_bulan: "",
    jumlah_bulan: 12,
    predikat: "Baik",
  });
  const [calc, setCalc] = useState({
    jabatan: "Asisten Ahli" as Pegawai["jabatan_fungsional"],
    predikat: "Baik" as PenilaianInput["predikat"],
    bulan: 12,
  });

  async function loadData() {
    try {
      const [d, p] = await Promise.all([
        DB.getAllPegawai(),
        DB.getAllPenilaian(),
      ]);
      setDosen(d);
      setPenilaian(p);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const dosenMap = useMemo(() => {
    const map: Record<number, Pegawai> = {};
    dosen.forEach((d) => (map[d.id] = d));
    return map;
  }, [dosen]);

  const akOtomatis = useMemo(() => {
    if (!form.pegawai_id || !form.predikat || !form.jumlah_bulan) return 0;
    const d = dosenMap[form.pegawai_id];
    if (!d) return 0;
    return AKCalculator.hitungAK(
      d.jabatan_fungsional,
      form.predikat,
      form.jumlah_bulan
    );
  }, [form.pegawai_id, form.predikat, form.jumlah_bulan, dosenMap]);

  const calcResult = useMemo(() => {
    return AKCalculator.hitungAK(calc.jabatan, calc.predikat, calc.bulan);
  }, [calc]);

  async function handleSave() {
    if (!form.pegawai_id) {
      toast.error("Silakan pilih dosen");
      return;
    }
    const d = dosenMap[form.pegawai_id];
    if (!d) {
      toast.error("Dosen tidak ditemukan");
      return;
    }
    const bulan = Number(form.jumlah_bulan) || 12;
    const predikat = form.predikat || "Baik";
    const ak = AKCalculator.hitungAK(d.jabatan_fungsional, predikat, bulan);

    const data: PenilaianInput = {
      pegawai_id: form.pegawai_id,
      tahun: Number(form.tahun) || new Date().getFullYear(),
      periode_bulan: form.periode_bulan || "",
      jumlah_bulan: bulan,
      predikat,
      persentase: AKCalculator.getPersentaseDisplay(predikat),
      koefisien: AKCalculator.getKoefisien(d.jabatan_fungsional),
      angka_kredit_didapat: ak,
    };

    try {
      await DB.addPenilaian(data);
      toast.success("Penilaian berhasil disimpan");
      setOpen(false);
      setForm({
        pegawai_id: undefined,
        tahun: undefined,
        periode_bulan: "",
        jumlah_bulan: 12,
        predikat: "Baik",
      });
      loadData();
    } catch (err) {
      toast.error("Kesalahan: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus rekaman penilaian ini?")) return;
    try {
      await DB.deletePenilaian(id);
      toast.success("Rekaman dihapus");
      loadData();
    } catch (err) {
      toast.error("Kesalahan: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  function badgeVariant(predikat: string) {
    switch (predikat) {
      case "Sangat Baik":
        return "default";
      case "Baik":
        return "secondary";
      case "Cukup":
        return "outline";
      default:
        return "destructive";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Penilaian Angka Kredit
          </h1>
          <p className="text-muted-foreground">
            Perhitungan konversi predikat kinerja ke angka kredit
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Penilaian
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-orange-600" />
            Kalkulator Cepat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>Jabatan Fungsional</Label>
              <Select
                value={calc.jabatan}
                onValueChange={(v) =>
                  setCalc({ ...calc, jabatan: v as Pegawai["jabatan_fungsional"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JABATAN_LIST.map((j) => (
                    <SelectItem key={j} value={j}>
                      {j}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Predikat Kinerja</Label>
              <Select
                value={calc.predikat}
                onValueChange={(v) =>
                  setCalc({ ...calc, predikat: (v || "Baik") as PenilaianInput["predikat"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PREDIKAT_LIST.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Jumlah Bulan</Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={calc.bulan}
                onChange={(e) =>
                  setCalc({ ...calc, bulan: Number(e.target.value) })
                }
              />
            </div>
            <div className="text-lg font-bold text-orange-600">
              AK = {formatDisplay(calcResult)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Rekaman Penilaian Konversi</CardTitle>
          <Badge variant="secondary">{penilaian.length} rekaman</Badge>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Dosen</TableHead>
                  <TableHead>Tahun</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Predikat</TableHead>
                  <TableHead>AK Didapat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-10 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : penilaian.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <Calculator className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>Belum ada rekaman penilaian.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  penilaian.map((p, i) => {
                    const d = dosenMap[p.pegawai_id];
                    return (
                      <TableRow key={p.id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>
                          {d ? d.nama_lengkap : "-"}
                        </TableCell>
                        <TableCell>{p.tahun}</TableCell>
                        <TableCell>
                          {p.periode_bulan || `${p.jumlah_bulan} Bulan`}
                        </TableCell>
                        <TableCell>
                          <Badge variant={badgeVariant(p.predikat)}>
                            {p.predikat}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatDisplay(p.angka_kredit_didapat)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Tambah Penilaian Konversi</DialogTitle>
            <DialogDescription>
              Hitung otomatis berdasarkan jabatan, predikat, dan periode.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dosen">
                Dosen <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.pegawai_id?.toString()}
                onValueChange={(v) =>
                  setForm({ ...form, pegawai_id: Number(v) })
                }
              >
                <SelectTrigger id="dosen">
                  <SelectValue placeholder="-- Pilih Dosen --" />
                </SelectTrigger>
                <SelectContent>
                  {dosen.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.nama_lengkap} ({d.nip})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tahun">
                  Tahun <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="tahun"
                  type="number"
                  placeholder="2024"
                  value={form.tahun || ""}
                  onChange={(e) =>
                    setForm({ ...form, tahun: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="periode">Periode Bulan</Label>
                <Input
                  id="periode"
                  placeholder="cth: JUNI - DESEMBER"
                  value={form.periode_bulan}
                  onChange={(e) =>
                    setForm({ ...form, periode_bulan: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bulan">
                  Jumlah Bulan <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bulan"
                  type="number"
                  min={1}
                  max={12}
                  value={form.jumlah_bulan}
                  onChange={(e) =>
                    setForm({ ...form, jumlah_bulan: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="predikat">
                  Predikat Kinerja <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.predikat}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      predikat: v as PenilaianInput["predikat"],
                    })
                  }
                >
                  <SelectTrigger id="predikat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDIKAT_LIST.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Angka Kredit (otomatis)</Label>
              <Input
                readOnly
                value={formatDisplay(akOtomatis)}
                className="font-bold text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Dihitung otomatis berdasarkan jabatan, predikat & periode
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSave}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
