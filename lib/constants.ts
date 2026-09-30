export const JABATAN_LIST = [
  "Asisten Ahli",
  "Lektor",
  "Lektor Kepala",
  "Profesor",
] as const;

export type JabatanFungsional = (typeof JABATAN_LIST)[number];

export const PREDIKAT_LIST = [
  "Sangat Baik",
  "Baik",
  "Cukup",
  "Kurang",
  "Sangat Kurang",
] as const;

export type PredikatKinerja = (typeof PREDIKAT_LIST)[number];

export const KOEFISIEN: Record<JabatanFungsional, number> = {
  "Asisten Ahli": 12.5,
  Lektor: 25.0,
  "Lektor Kepala": 25.0,
  Profesor: 50.0,
};

export const PERSENTASE: Record<PredikatKinerja, number> = {
  "Sangat Baik": 1.5,
  Baik: 1.0,
  Cukup: 0.75,
  Kurang: 0.5,
  "Sangat Kurang": 0.25,
};

export const COLUMN_MAP: Record<string, keyof PegawaiInput> = {
  "NIP (*)": "nip",
  NIP: "nip",
  "Nama Lengkap (*)": "nama_lengkap",
  "Nama Lengkap": "nama_lengkap",
  "No. Seri Karpeg": "no_karpeg",
  "No Seri Karpeg": "no_karpeg",
  "Tempat Lahir (*)": "tempat_lahir",
  "Tempat Lahir": "tempat_lahir",
  "Tanggal Lahir (*)": "tanggal_lahir",
  "Tanggal Lahir": "tanggal_lahir",
  "Jenis Kelamin (*)": "jenis_kelamin",
  "Jenis Kelamin": "jenis_kelamin",
  "Pangkat / Golongan (*)": "pangkat_golongan",
  "Pangkat / Golongan": "pangkat_golongan",
  "Pangkat/Golongan (*)": "pangkat_golongan",
  "Pangkat/Golongan": "pangkat_golongan",
  "TMT Pangkat (*)": "tmt_pangkat",
  "TMT Pangkat": "tmt_pangkat",
  "Jabatan Fungsional (*)": "jabatan_fungsional",
  "Jabatan Fungsional": "jabatan_fungsional",
  "TMT Jabatan (*)": "tmt_jabatan",
  "TMT Jabatan": "tmt_jabatan",
  "Unit Kerja (*)": "unit_kerja",
  "Unit Kerja": "unit_kerja",
};

export interface Pegawai {
  id: number;
  nip: string;
  nama_lengkap: string;
  no_karpeg?: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: "L" | "P";
  pangkat_golongan: string;
  tmt_pangkat: string;
  jabatan_fungsional: JabatanFungsional;
  tmt_jabatan: string;
  unit_kerja: string;
}

export type PegawaiInput = Omit<Pegawai, "id">;

export interface Pejabat {
  id: number;
  nama_pejabat: string;
  nip_pejabat: string;
  jabatan_pejabat: string;
  unit_kerja?: string;
}

export interface Penilaian {
  id: number;
  pegawai_id: number;
  tahun: number;
  periode_bulan?: string;
  jumlah_bulan: number;
  predikat: PredikatKinerja;
  persentase: string;
  koefisien: number;
  angka_kredit_didapat: number;
}

export type PenilaianInput = Omit<Penilaian, "id">;

export interface Penetapan {
  id: number;
  pegawai_id: number;
  nomor_surat?: string;
  pejabat_id?: number;
  ak_dasar: number;
  ak_integrasi: number;
  ak_penyesuaian: number;
  ak_pendidikan: number;
  ak_minimal_pangkat: number;
  ak_minimal_jabatan: number;
  tanggal_penetapan?: string;
  kota_penetapan?: string;
}

export type PenetapanInput = Omit<Penetapan, "id">;
