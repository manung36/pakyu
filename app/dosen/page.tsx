"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, UserCircle } from "lucide-react";
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
import {
  getAllPegawaiAction,
  addPegawaiAction,
  updatePegawaiAction,
  deletePegawaiAction,
} from "@/lib/actions";
import { Pegawai, JABATAN_LIST, PegawaiInput } from "@/lib/constants";
import { validateNIP, jenisKelaminLabel } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const initialForm: PegawaiInput = {
  nip: "",
  nama_lengkap: "",
  no_karpeg: "",
  tempat_lahir: "",
  tanggal_lahir: "",
  jenis_kelamin: "L",
  pangkat_golongan: "",
  tmt_pangkat: "",
  jabatan_fungsional: "Asisten Ahli",
  tmt_jabatan: "",
  unit_kerja: "",
};

export default function DosenPage() {
  const [dosen, setDosen] = useState<Pegawai[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterJabatan, setFilterJabatan] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Pegawai | null>(null);
  const [form, setForm] = useState<PegawaiInput>(initialForm);

  async function loadDosen() {
    try {
      const data = await getAllPegawaiAction();
      setDosen(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDosen();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return dosen.filter((d) => {
      const matchSearch =
        !q ||
        d.nama_lengkap.toLowerCase().includes(q) ||
        d.nip.includes(q) ||
        (d.unit_kerja || "").toLowerCase().includes(q);
      const matchJabatan =
        !filterJabatan || d.jabatan_fungsional === filterJabatan;
      return matchSearch && matchJabatan;
    });
  }, [dosen, search, filterJabatan]);

  function openAdd() {
    setEditing(null);
    setForm(initialForm);
    setOpen(true);
  }

  function openEdit(d: Pegawai) {
    setEditing(d);
    setForm({
      nip: d.nip,
      nama_lengkap: d.nama_lengkap,
      no_karpeg: d.no_karpeg || "",
      tempat_lahir: d.tempat_lahir,
      tanggal_lahir: d.tanggal_lahir,
      jenis_kelamin: d.jenis_kelamin,
      pangkat_golongan: d.pangkat_golongan,
      tmt_pangkat: d.tmt_pangkat,
      jabatan_fungsional: d.jabatan_fungsional,
      tmt_jabatan: d.tmt_jabatan,
      unit_kerja: d.unit_kerja,
    });
    setOpen(true);
  }

  async function handleSave() {
    const nipResult = validateNIP(form.nip);
    if (!nipResult.valid) {
      toast.error(nipResult.message);
      return;
    }

    try {
      if (editing) {
        await updatePegawaiAction({ ...editing, ...form });
        toast.success("Data dosen berhasil diperbarui");
      } else {
        await addPegawaiAction(form);
        toast.success("Dosen berhasil ditambahkan");
      }
      setOpen(false);
      loadDosen();
    } catch (err) {
      toast.error("Kesalahan: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function handleDelete(d: Pegawai) {
    if (!confirm(`Hapus data dosen "${d.nama_lengkap}"?`)) return;
    try {
      await deletePegawaiAction(d.id);
      toast.success("Data dosen berhasil dihapus");
      loadDosen();
    } catch (err) {
      toast.error("Kesalahan: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Dosen</h1>
          <p className="text-muted-foreground">
            Pengelolaan data master pegawai dosen
          </p>
        </div>
        <Button onClick={openAdd} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Dosen
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Dosen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, NIP, atau unit kerja..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterJabatan} onValueChange={(v) => setFilterJabatan(v || "")}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Semua Jabatan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Jabatan</SelectItem>
                {JABATAN_LIST.map((j) => (
                  <SelectItem key={j} value={j}>
                    {j}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>NIP</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>Jabatan Fungsional</TableHead>
                  <TableHead>Pangkat/Gol</TableHead>
                  <TableHead>Unit Kerja</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-20 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <UserCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>
                        Belum ada data dosen. Import melalui Excel atau tambah
                        secara manual.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((d, i) => (
                    <TableRow key={d.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {d.nip}
                      </TableCell>
                      <TableCell className="font-medium">
                        {d.nama_lengkap}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{d.jabatan_fungsional}</Badge>
                      </TableCell>
                      <TableCell>{d.pangkat_golongan}</TableCell>
                      <TableCell>{d.unit_kerja}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(d)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(d)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Dosen" : "Tambah Dosen"}
            </DialogTitle>
            <DialogDescription>
              Isi data master pegawai dosen dengan lengkap.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nip">
                  NIP <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nip"
                  maxLength={18}
                  placeholder="18 digit NIP"
                  value={form.nip}
                  onChange={(e) => setForm({ ...form, nip: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nama"
                  placeholder="Nama lengkap"
                  value={form.nama_lengkap}
                  onChange={(e) =>
                    setForm({ ...form, nama_lengkap: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="karpeg">No. Seri Karpeg</Label>
                <Input
                  id="karpeg"
                  placeholder="Opsional"
                  value={form.no_karpeg}
                  onChange={(e) =>
                    setForm({ ...form, no_karpeg: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jk">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.jenis_kelamin}
                  onValueChange={(v) =>
                    setForm({ ...form, jenis_kelamin: v as "L" | "P" })
                  }
                >
                  <SelectTrigger id="jk">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tempat">
                  Tempat Lahir <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="tempat"
                  placeholder="Tempat lahir"
                  value={form.tempat_lahir}
                  onChange={(e) =>
                    setForm({ ...form, tempat_lahir: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tgl_lahir">
                  Tanggal Lahir <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="tgl_lahir"
                  type="date"
                  value={form.tanggal_lahir}
                  onChange={(e) =>
                    setForm({ ...form, tanggal_lahir: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pangkat">
                  Pangkat / Golongan <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pangkat"
                  placeholder="cth: Penata Muda / III/B"
                  value={form.pangkat_golongan}
                  onChange={(e) =>
                    setForm({ ...form, pangkat_golongan: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tmt_pangkat">
                  TMT Pangkat <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="tmt_pangkat"
                  type="date"
                  value={form.tmt_pangkat}
                  onChange={(e) =>
                    setForm({ ...form, tmt_pangkat: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jabatan">
                  Jabatan Fungsional <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.jabatan_fungsional}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      jabatan_fungsional: v as PegawaiInput["jabatan_fungsional"],
                    })
                  }
                >
                  <SelectTrigger id="jabatan">
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
                <Label htmlFor="tmt_jabatan">
                  TMT Jabatan <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="tmt_jabatan"
                  type="date"
                  value={form.tmt_jabatan}
                  onChange={(e) =>
                    setForm({ ...form, tmt_jabatan: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">
                Unit Kerja <span className="text-red-500">*</span>
              </Label>
              <Input
                id="unit"
                placeholder="Fakultas / Program Studi"
                value={form.unit_kerja}
                onChange={(e) =>
                  setForm({ ...form, unit_kerja: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700">
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
