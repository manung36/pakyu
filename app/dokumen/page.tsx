"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getAllPegawaiAction,
  getAllPenilaianAction,
} from "@/lib/actions";
import { Pegawai, Penilaian } from "@/lib/constants";
import {
  generateDokumen1,
  generateDokumen2,
  generateDokumen3,
  openPrintPreview,
  PejabatData,
} from "@/lib/documents";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface KotaTanggal {
  kota: string;
  tanggal: string;
}

export default function DokumenPage() {
  const [dosen, setDosen] = useState<Pegawai[]>([]);
  const [penilaian, setPenilaian] = useState<Penilaian[]>([]);
  const [loading, setLoading] = useState(true);

  const [pejabat, setPejabat] = useState<PejabatData>({
    nama_pejabat: "",
    nip_pejabat: "",
    jabatan_pejabat: "",
  });

  const [doc1, setDoc1] = useState({
    pegawaiId: "",
    penilaianId: "",
    nomorSurat: "",
    periodeText: "",
    kota: "",
    tanggal: "",
  });

  const [doc2, setDoc2] = useState({
    pegawaiId: "",
    akIntegrasi: "0",
    kota: "",
    tanggal: "",
  });

  const [doc3, setDoc3] = useState({
    pegawaiId: "",
    nomorSurat: "",
    akDasarLama: "0",
    akIntegrasiLama: "0",
    akPenyesuaianLama: "0",
    akKonversiLama: "0",
    akPendidikanLama: "0",
    akDasar: "0",
    akIntegrasi: "0",
    akPenyesuaian: "0",
    akPendidikan: "0",
    akMinPangkat: "0",
    akMinJabatan: "0",
    kota: "",
    tanggal: "",
  });

  async function loadData() {
    try {
      const [d, p] = await Promise.all([
        getAllPegawaiAction(),
        getAllPenilaianAction(),
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

  const penilaianByDosen = useMemo(() => {
    const map: Record<number, Penilaian[]> = {};
    penilaian.forEach((p) => {
      map[p.pegawai_id] = map[p.pegawai_id] || [];
      map[p.pegawai_id].push(p);
    });
    return map;
  }, [penilaian]);

  function handleGenerateDoc1() {
    const pegawai = dosenMap[Number(doc1.pegawaiId)];
    const penilaian = penilaianByDosen[Number(doc1.pegawaiId)]?.find(
      (p) => p.id === Number(doc1.penilaianId)
    );
    if (!pegawai || !penilaian) {
      toast.warning("Silakan pilih dosen dan penilaian");
      return;
    }
    const html = generateDokumen1({
      pegawai,
      penilaian,
      pejabat,
      kota: doc1.kota,
      tanggal: doc1.tanggal,
      periodLabel:
        doc1.periodeText ||
        `${penilaian.tahun} — ${penilaian.periode_bulan || "12 Bulan"}`,
      nomorSurat: doc1.nomorSurat,
    });
    openPrintPreview(html);
  }

  function handleGenerateDoc2() {
    const pegawai = dosenMap[Number(doc2.pegawaiId)];
    if (!pegawai) {
      toast.warning("Silakan pilih dosen");
      return;
    }
    const list = penilaianByDosen[Number(doc2.pegawaiId)] || [];
    const html = generateDokumen2({
      pegawai,
      penilaianList: list,
      akIntegrasi: Number(doc2.akIntegrasi) || 0,
      pejabat,
      kota: doc2.kota,
      tanggal: doc2.tanggal,
    });
    openPrintPreview(html);
  }

  function handleGenerateDoc3() {
    const pegawai = dosenMap[Number(doc3.pegawaiId)];
    if (!pegawai) {
      toast.warning("Silakan pilih dosen");
      return;
    }
    const list = penilaianByDosen[Number(doc3.pegawaiId)] || [];
    const html = generateDokumen3({
      pegawai,
      penilaianList: list,
      pejabat,
      kota: doc3.kota,
      tanggal: doc3.tanggal,
      nomorSurat: doc3.nomorSurat,
      akDasar: doc3.akDasar,
      akIntegrasi: doc3.akIntegrasi,
      akPenyesuaian: doc3.akPenyesuaian,
      akPendidikan: doc3.akPendidikan,
      akMinimalPangkat: doc3.akMinPangkat,
      akMinimalJabatan: doc3.akMinJabatan,
      akDasarLama: doc3.akDasarLama,
      akIntegrasiLama: doc3.akIntegrasiLama,
      akPenyesuaianLama: doc3.akPenyesuaianLama,
      akKonversiLama: doc3.akKonversiLama,
      akPendidikanLama: doc3.akPendidikanLama,
    });
    openPrintPreview(html);
  }

  function PejabatFields({
    kota,
    tanggal,
    setKotaTanggal,
  }: {
    kota: string;
    tanggal: string;
    setKotaTanggal: (kt: KotaTanggal) => void;
  }) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nama Pejabat</Label>
          <Input
            value={pejabat.nama_pejabat}
            onChange={(e) =>
              setPejabat({ ...pejabat, nama_pejabat: e.target.value })
            }
            placeholder="Nama pejabat penilai"
          />
        </div>
        <div className="space-y-2">
          <Label>NIP Pejabat</Label>
          <Input
            value={pejabat.nip_pejabat}
            onChange={(e) =>
              setPejabat({ ...pejabat, nip_pejabat: e.target.value })
            }
            placeholder="NIP pejabat"
          />
        </div>
        <div className="space-y-2">
          <Label>Jabatan Pejabat</Label>
          <Input
            value={pejabat.jabatan_pejabat}
            onChange={(e) =>
              setPejabat({ ...pejabat, jabatan_pejabat: e.target.value })
            }
            placeholder="Jabatan / unit kerja"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Kota</Label>
            <Input
              value={kota}
              onChange={(e) =>
                setKotaTanggal({ kota: e.target.value, tanggal })
              }
              placeholder="Kota"
            />
          </div>
          <div className="space-y-2">
            <Label>Tanggal</Label>
            <Input
              type="date"
              value={tanggal}
              onChange={(e) =>
                setKotaTanggal({ kota, tanggal: e.target.value })
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Pembuatan Dokumen PAK
        </h1>
        <p className="text-muted-foreground">
          Buat 3 jenis dokumen rasmi PAK Konversi
        </p>
      </div>

      {loading && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-40" />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="doc1" className={`w-full ${loading ? "opacity-50 pointer-events-none" : ""}`}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="doc1">Dok. 1 — Konversi</TabsTrigger>
          <TabsTrigger value="doc2">Dok. 2 — Akumulasi</TabsTrigger>
          <TabsTrigger value="doc3">Dok. 3 — Penetapan</TabsTrigger>
        </TabsList>

        <TabsContent value="doc1">
          <Card>
            <CardHeader>
              <CardTitle>Konversi Predikat Kinerja ke Angka Kredit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Dosen <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={doc1.pegawaiId}
                    onValueChange={(v) =>
                      setDoc1({ ...doc1, pegawaiId: v || "", penilaianId: "" })
                    }
                  >
                    <SelectTrigger>
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
                <div className="space-y-2">
                  <Label>
                    Penilaian <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={doc1.penilaianId}
                    onValueChange={(v) =>
                      setDoc1({ ...doc1, penilaianId: v || "" })
                    }
                    disabled={!doc1.pegawaiId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Pilih dosen terlebih dahulu --" />
                    </SelectTrigger>
                    <SelectContent>
                      {(penilaianByDosen[Number(doc1.pegawaiId)] || []).map(
                        (p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.tahun} — {p.predikat}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nomor Surat SK</Label>
                  <Input
                    value={doc1.nomorSurat}
                    onChange={(e) =>
                      setDoc1({ ...doc1, nomorSurat: e.target.value })
                    }
                    placeholder="< AGAR DIISI PT >"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Periode Penilaian (Teks)</Label>
                  <Input
                    value={doc1.periodeText}
                    onChange={(e) =>
                      setDoc1({ ...doc1, periodeText: e.target.value })
                    }
                    placeholder="Juni 2023 s.d Desember 2023"
                  />
                </div>
              </div>
              <Separator />
              <PejabatFields
                kota={doc1.kota}
                tanggal={doc1.tanggal}
                setKotaTanggal={({ kota, tanggal }) =>
                  setDoc1({ ...doc1, kota, tanggal })
                }
              />
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleGenerateDoc1}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Buat Dokumen 1
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="doc2">
          <Card>
            <CardHeader>
              <CardTitle>Akumulasi Angka Kredit Jabatan Fungsional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Dosen <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={doc2.pegawaiId}
                    onValueChange={(v) => setDoc2({ ...doc2, pegawaiId: v || "" })}
                  >
                    <SelectTrigger>
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
                <div className="space-y-2">
                  <Label>AK Integrasi</Label>
                  <Input
                    type="number"
                    step="0.0000000001"
                    value={doc2.akIntegrasi}
                    onChange={(e) =>
                      setDoc2({ ...doc2, akIntegrasi: e.target.value })
                    }
                  />
                </div>
              </div>
              <Separator />
              <PejabatFields
                kota={doc2.kota}
                tanggal={doc2.tanggal}
                setKotaTanggal={({ kota, tanggal }) =>
                  setDoc2({ ...doc2, kota, tanggal })
                }
              />
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleGenerateDoc2}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Buat Dokumen 2
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="doc3">
          <Card>
            <CardHeader>
              <CardTitle>Penetapan Angka Kredit (PAK Final)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Dosen <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={doc3.pegawaiId}
                    onValueChange={(v) => setDoc3({ ...doc3, pegawaiId: v || "" })}
                  >
                    <SelectTrigger>
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
                <div className="space-y-2">
                  <Label>Nomor Surat SK PAK</Label>
                  <Input
                    value={doc3.nomorSurat}
                    onChange={(e) =>
                      setDoc3({ ...doc3, nomorSurat: e.target.value })
                    }
                    placeholder="Nomor SK"
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase">
                  AK Lama (Sebelumnya)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    ["akDasarLama", "AK Dasar Lama"],
                    ["akIntegrasiLama", "AK Integrasi Lama"],
                    ["akPenyesuaianLama", "AK Penyesuaian Lama"],
                    ["akKonversiLama", "AK Konversi Lama"],
                    ["akPendidikanLama", "AK Pendidikan Lama"],
                  ].map(([key, label]) => (
                    <div key={key} className="space-y-2">
                      <Label>{label}</Label>
                      <Input
                        type="number"
                        step="0.0000000001"
                        value={doc3[key as keyof typeof doc3]}
                        onChange={(e) =>
                          setDoc3({ ...doc3, [key]: e.target.value })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase">
                  AK Baru
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    ["akDasar", "AK Dasar Baru"],
                    ["akIntegrasi", "AK Integrasi Baru"],
                    ["akPenyesuaian", "AK Penyesuaian Baru"],
                    ["akPendidikan", "AK Pendidikan Baru"],
                  ].map(([key, label]) => (
                    <div key={key} className="space-y-2">
                      <Label>{label}</Label>
                      <Input
                        type="number"
                        step="0.0000000001"
                        value={doc3[key as keyof typeof doc3]}
                        onChange={(e) =>
                          setDoc3({ ...doc3, [key]: e.target.value })
                        }
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  AK Konversi Baru akan dihitung otomatis dari rekaman
                  penilaian dosen.
                </p>
              </div>

              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase">
                  Syarat Minimal
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>AK Minimal Syarat Pangkat</Label>
                    <Input
                      type="number"
                      step="0.0000000001"
                      value={doc3.akMinPangkat}
                      onChange={(e) =>
                        setDoc3({ ...doc3, akMinPangkat: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>AK Minimal Syarat Jenjang Jabatan</Label>
                    <Input
                      type="number"
                      step="0.0000000001"
                      value={doc3.akMinJabatan}
                      onChange={(e) =>
                        setDoc3({ ...doc3, akMinJabatan: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />
              <PejabatFields
                kota={doc3.kota}
                tanggal={doc3.tanggal}
                setKotaTanggal={({ kota, tanggal }) =>
                  setDoc3({ ...doc3, kota, tanggal })
                }
              />
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleGenerateDoc3}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <FileText className="h-4 w-4 mr-2" />
                Buat Dokumen 3 (PAK Final)
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
