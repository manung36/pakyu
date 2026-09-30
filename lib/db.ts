import { sql } from "@/lib/neon";
import {
  Pegawai,
  PegawaiInput,
  Pejabat,
  Penilaian,
  PenilaianInput,
  Penetapan,
  PenetapanInput,
} from "@/lib/constants";

// Helpers to convert rows to typed objects
function rowToPegawai(row: Record<string, unknown>): Pegawai {
  return {
    id: row.id as number,
    nip: row.nip as string,
    nama_lengkap: row.nama_lengkap as string,
    gelar_depan: (row.gelar_depan as string) || undefined,
    gelar_belakang: (row.gelar_belakang as string) || undefined,
    no_karpeg: (row.no_karpeg as string) || undefined,
    tempat_lahir: (row.tempat_lahir as string) || undefined,
    tanggal_lahir: (row.tanggal_lahir as string) || undefined,
    jenis_kelamin: (row.jenis_kelamin as string) || undefined,
    pangkat_golongan: (row.pangkat_golongan as string) || undefined,
    tmt_pangkat: (row.tmt_pangkat as string) || undefined,
    jabatan_fungsional: (row.jabatan_fungsional as string) || undefined,
    tmt_jabatan: (row.tmt_jabatan as string) || undefined,
    unit_kerja: (row.unit_kerja as string) || undefined,
    subunit_kerja: (row.subunit_kerja as string) || undefined,
    homebase: (row.homebase as string) || undefined,
    status: (row.status as string) || undefined,
    status_aktif: (row.status_aktif as string) || undefined,
    substatus: (row.substatus as string) || undefined,
    jenis: (row.jenis as string) || undefined,
    gol: (row.gol as string) || undefined,
    nama_golongan: (row.nama_golongan as string) || undefined,
    nidn: (row.nidn as string) || undefined,
    nip_lama: (row.nip_lama as string) || undefined,
    nik: (row.nik as string) || undefined,
    no_hp: (row.no_hp as string) || undefined,
    email: (row.email as string) || undefined,
    alamat: (row.alamat as string) || undefined,
    npwp: (row.npwp as string) || undefined,
    agama: (row.agama as string) || undefined,
    marital: (row.marital as string) || undefined,
  };
}

function rowToPenilaian(row: Record<string, unknown>): Penilaian {
  return {
    id: row.id as number,
    pegawai_id: row.pegawai_id as number,
    tahun: row.tahun as number,
    periode_bulan: (row.periode_bulan as string) || undefined,
    jumlah_bulan: row.jumlah_bulan as number,
    predikat: row.predikat as Penilaian["predikat"],
    persentase: row.persentase as string,
    koefisien: Number(row.koefisien),
    angka_kredit_didapat: Number(row.angka_kredit_didapat),
  };
}

function rowToPenetapan(row: Record<string, unknown>): Penetapan {
  return {
    id: row.id as number,
    pegawai_id: row.pegawai_id as number,
    nomor_surat: (row.nomor_surat as string) || undefined,
    pejabat_id: row.pejabat_id ? Number(row.pejabat_id) : undefined,
    ak_dasar: Number(row.ak_dasar),
    ak_integrasi: Number(row.ak_integrasi),
    ak_penyesuaian: Number(row.ak_penyesuaian),
    ak_pendidikan: Number(row.ak_pendidikan),
    ak_minimal_pangkat: Number(row.ak_minimal_pangkat),
    ak_minimal_jabatan: Number(row.ak_minimal_jabatan),
    tanggal_penetapan: (row.tanggal_penetapan as string) || undefined,
    kota_penetapan: (row.kota_penetapan as string) || undefined,
  };
}

function rowToPejabat(row: Record<string, unknown>): Pejabat {
  return {
    id: row.id as number,
    nama_pejabat: row.nama_pejabat as string,
    nip_pejabat: row.nip_pejabat as string,
    jabatan_pejabat: row.jabatan_pejabat as string,
    unit_kerja: (row.unit_kerja as string) || undefined,
  };
}

// Pegawai
export async function addPegawai(data: PegawaiInput): Promise<number> {
  const [row] = await sql`
    INSERT INTO pegawai (
      nip, nama_lengkap, gelar_depan, gelar_belakang, no_karpeg,
      tempat_lahir, tanggal_lahir, jenis_kelamin, pangkat_golongan,
      tmt_pangkat, jabatan_fungsional, tmt_jabatan, unit_kerja,
      subunit_kerja, homebase, status, status_aktif, substatus,
      jenis, gol, nama_golongan, nidn, nip_lama, nik, no_hp,
      email, alamat, npwp, agama, marital
    ) VALUES (
      ${data.nip}, ${data.nama_lengkap}, ${data.gelar_depan || null},
      ${data.gelar_belakang || null}, ${data.no_karpeg || null},
      ${data.tempat_lahir || null}, ${data.tanggal_lahir || null},
      ${data.jenis_kelamin || null}, ${data.pangkat_golongan || null},
      ${data.tmt_pangkat || null}, ${data.jabatan_fungsional || null},
      ${data.tmt_jabatan || null}, ${data.unit_kerja || null},
      ${data.subunit_kerja || null}, ${data.homebase || null},
      ${data.status || null}, ${data.status_aktif || null},
      ${data.substatus || null}, ${data.jenis || null},
      ${data.gol || null}, ${data.nama_golongan || null},
      ${data.nidn || null}, ${data.nip_lama || null},
      ${data.nik || null}, ${data.no_hp || null},
      ${data.email || null}, ${data.alamat || null},
      ${data.npwp || null}, ${data.agama || null},
      ${data.marital || null}
    )
    RETURNING id
  `;
  return row?.id as number;
}

export async function updatePegawai(data: Pegawai): Promise<number> {
  const [row] = await sql`
    UPDATE pegawai SET
      nip = ${data.nip},
      nama_lengkap = ${data.nama_lengkap},
      gelar_depan = ${data.gelar_depan || null},
      gelar_belakang = ${data.gelar_belakang || null},
      no_karpeg = ${data.no_karpeg || null},
      tempat_lahir = ${data.tempat_lahir || null},
      tanggal_lahir = ${data.tanggal_lahir || null},
      jenis_kelamin = ${data.jenis_kelamin || null},
      pangkat_golongan = ${data.pangkat_golongan || null},
      tmt_pangkat = ${data.tmt_pangkat || null},
      jabatan_fungsional = ${data.jabatan_fungsional || null},
      tmt_jabatan = ${data.tmt_jabatan || null},
      unit_kerja = ${data.unit_kerja || null},
      subunit_kerja = ${data.subunit_kerja || null},
      homebase = ${data.homebase || null},
      status = ${data.status || null},
      status_aktif = ${data.status_aktif || null},
      substatus = ${data.substatus || null},
      jenis = ${data.jenis || null},
      gol = ${data.gol || null},
      nama_golongan = ${data.nama_golongan || null},
      nidn = ${data.nidn || null},
      nip_lama = ${data.nip_lama || null},
      nik = ${data.nik || null},
      no_hp = ${data.no_hp || null},
      email = ${data.email || null},
      alamat = ${data.alamat || null},
      npwp = ${data.npwp || null},
      agama = ${data.agama || null},
      marital = ${data.marital || null},
      updated_at = NOW()
    WHERE id = ${data.id}
    RETURNING id
  `;
  return row?.id as number;
}

export async function deletePegawai(id: number): Promise<void> {
  await sql`DELETE FROM pegawai WHERE id = ${id}`;
}

export async function getPegawai(id: number): Promise<Pegawai | undefined> {
  const [row] = await sql`SELECT * FROM pegawai WHERE id = ${id}`;
  return row ? rowToPegawai(row) : undefined;
}

export async function getAllPegawai(): Promise<Pegawai[]> {
  const rows = await sql`SELECT * FROM pegawai ORDER BY nama_lengkap`;
  return rows.map(rowToPegawai);
}

export async function getPegawaiByNIP(nip: string): Promise<Pegawai | undefined> {
  const [row] = await sql`SELECT * FROM pegawai WHERE nip = ${nip}`;
  return row ? rowToPegawai(row) : undefined;
}

export async function countPegawai(): Promise<number> {
  const [row] = await sql`SELECT COUNT(*) AS count FROM pegawai`;
  return Number(row?.count);
}

// Penilaian
export async function addPenilaian(data: PenilaianInput): Promise<number> {
  const [row] = await sql`
    INSERT INTO penilaian_konversi (
      pegawai_id, tahun, periode_bulan, jumlah_bulan, predikat,
      persentase, koefisien, angka_kredit_didapat
    ) VALUES (
      ${data.pegawai_id}, ${data.tahun}, ${data.periode_bulan || null},
      ${data.jumlah_bulan}, ${data.predikat}, ${data.persentase},
      ${data.koefisien}, ${data.angka_kredit_didapat}
    )
    RETURNING id
  `;
  return row?.id as number;
}

export async function updatePenilaian(data: Penilaian): Promise<number> {
  const [row] = await sql`
    UPDATE penilaian_konversi SET
      pegawai_id = ${data.pegawai_id},
      tahun = ${data.tahun},
      periode_bulan = ${data.periode_bulan || null},
      jumlah_bulan = ${data.jumlah_bulan},
      predikat = ${data.predikat},
      persentase = ${data.persentase},
      koefisien = ${data.koefisien},
      angka_kredit_didapat = ${data.angka_kredit_didapat}
    WHERE id = ${data.id}
    RETURNING id
  `;
  return row?.id as number;
}

export async function deletePenilaian(id: number): Promise<void> {
  await sql`DELETE FROM penilaian_konversi WHERE id = ${id}`;
}

export async function getPenilaian(id: number): Promise<Penilaian | undefined> {
  const [row] = await sql`SELECT * FROM penilaian_konversi WHERE id = ${id}`;
  return row ? rowToPenilaian(row) : undefined;
}

export async function getAllPenilaian(): Promise<Penilaian[]> {
  const rows = await sql`SELECT * FROM penilaian_konversi ORDER BY tahun DESC, id DESC`;
  return rows.map(rowToPenilaian);
}

export async function getPenilaianByPegawai(pegawaiId: number): Promise<Penilaian[]> {
  const rows = await sql`
    SELECT * FROM penilaian_konversi
    WHERE pegawai_id = ${pegawaiId}
    ORDER BY tahun DESC, id DESC
  `;
  return rows.map(rowToPenilaian);
}

export async function countPenilaian(): Promise<number> {
  const [row] = await sql`SELECT COUNT(*) AS count FROM penilaian_konversi`;
  return Number(row?.count);
}

// Penetapan
export async function addPenetapan(data: PenetapanInput): Promise<number> {
  const [row] = await sql`
    INSERT INTO pak_penetapan (
      pegawai_id, nomor_surat, pejabat_id, ak_dasar, ak_integrasi,
      ak_penyesuaian, ak_pendidikan, ak_minimal_pangkat, ak_minimal_jabatan,
      tanggal_penetapan, kota_penetapan
    ) VALUES (
      ${data.pegawai_id}, ${data.nomor_surat || null}, ${data.pejabat_id || null},
      ${data.ak_dasar}, ${data.ak_integrasi}, ${data.ak_penyesuaian},
      ${data.ak_pendidikan}, ${data.ak_minimal_pangkat}, ${data.ak_minimal_jabatan},
      ${data.tanggal_penetapan || null}, ${data.kota_penetapan || null}
    )
    RETURNING id
  `;
  return row?.id as number;
}

export async function updatePenetapan(data: Penetapan): Promise<number> {
  const [row] = await sql`
    UPDATE pak_penetapan SET
      pegawai_id = ${data.pegawai_id},
      nomor_surat = ${data.nomor_surat || null},
      pejabat_id = ${data.pejabat_id || null},
      ak_dasar = ${data.ak_dasar},
      ak_integrasi = ${data.ak_integrasi},
      ak_penyesuaian = ${data.ak_penyesuaian},
      ak_pendidikan = ${data.ak_pendidikan},
      ak_minimal_pangkat = ${data.ak_minimal_pangkat},
      ak_minimal_jabatan = ${data.ak_minimal_jabatan},
      tanggal_penetapan = ${data.tanggal_penetapan || null},
      kota_penetapan = ${data.kota_penetapan || null}
    WHERE id = ${data.id}
    RETURNING id
  `;
  return row?.id as number;
}

export async function deletePenetapan(id: number): Promise<void> {
  await sql`DELETE FROM pak_penetapan WHERE id = ${id}`;
}

export async function getPenetapan(id: number): Promise<Penetapan | undefined> {
  const [row] = await sql`SELECT * FROM pak_penetapan WHERE id = ${id}`;
  return row ? rowToPenetapan(row) : undefined;
}

export async function getAllPenetapan(): Promise<Penetapan[]> {
  const rows = await sql`SELECT * FROM pak_penetapan ORDER BY id DESC`;
  return rows.map(rowToPenetapan);
}

export async function countPenetapan(): Promise<number> {
  const [row] = await sql`SELECT COUNT(*) AS count FROM pak_penetapan`;
  return Number(row?.count);
}

// Pejabat
export async function addPejabat(data: Omit<Pejabat, "id">): Promise<number> {
  const [row] = await sql`
    INSERT INTO pejabat_penilai (nama_pejabat, nip_pejabat, jabatan_pejabat, unit_kerja)
    VALUES (${data.nama_pejabat}, ${data.nip_pejabat}, ${data.jabatan_pejabat}, ${data.unit_kerja || null})
    RETURNING id
  `;
  return row?.id as number;
}

export async function getAllPejabat(): Promise<Pejabat[]> {
  const rows = await sql`SELECT * FROM pejabat_penilai ORDER BY nama_pejabat`;
  return rows.map(rowToPejabat);
}

// Backward-compatible typed DB object (server-side only)
export const DB = {
  addPegawai,
  updatePegawai,
  deletePegawai,
  getPegawai,
  getAllPegawai,
  getPegawaiByNIP,
  countPegawai,

  addPenilaian,
  updatePenilaian,
  deletePenilaian,
  getPenilaian,
  getAllPenilaian,
  getPenilaianByPegawai,
  countPenilaian,

  addPenetapan,
  updatePenetapan,
  deletePenetapan,
  getPenetapan,
  getAllPenetapan,
  countPenetapan,

  addPejabat,
  getAllPejabat,
} as const;
