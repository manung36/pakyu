-- Schema PostgreSQL untuk PAK Konversi Dosen
-- Jalankan di Neon SQL Editor atau via psql

DROP TABLE IF EXISTS pak_penetapan CASCADE;
DROP TABLE IF EXISTS penilaian_konversi CASCADE;
DROP TABLE IF EXISTS pejabat_penilai CASCADE;
DROP TABLE IF EXISTS pegawai CASCADE;

CREATE TABLE IF NOT EXISTS pegawai (
  id SERIAL PRIMARY KEY,
  nip VARCHAR(18) NOT NULL UNIQUE,
  nama_lengkap VARCHAR(255) NOT NULL,
  gelar_depan VARCHAR(100),
  gelar_belakang VARCHAR(100),
  no_karpeg VARCHAR(50),
  tempat_lahir VARCHAR(100),
  tanggal_lahir DATE,
  jenis_kelamin VARCHAR(20),
  pangkat_golongan VARCHAR(100),
  tmt_pangkat DATE,
  jabatan_fungsional VARCHAR(100),
  tmt_jabatan DATE,
  unit_kerja VARCHAR(255),
  subunit_kerja VARCHAR(255),
  homebase VARCHAR(255),
  status VARCHAR(50),
  status_aktif VARCHAR(100),
  substatus VARCHAR(100),
  jenis VARCHAR(50),
  gol VARCHAR(50),
  nama_golongan VARCHAR(100),
  nidn VARCHAR(50),
  nip_lama VARCHAR(50),
  nik VARCHAR(50),
  no_hp VARCHAR(50),
  email VARCHAR(255),
  alamat TEXT,
  npwp VARCHAR(50),
  agama VARCHAR(50),
  marital VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pegawai_nama ON pegawai (nama_lengkap);
CREATE INDEX IF NOT EXISTS idx_pegawai_jabatan ON pegawai (jabatan_fungsional);
CREATE INDEX IF NOT EXISTS idx_pegawai_unit ON pegawai (unit_kerja);
CREATE INDEX IF NOT EXISTS idx_pegawai_status_aktif ON pegawai (status_aktif);

CREATE TABLE IF NOT EXISTS pejabat_penilai (
  id SERIAL PRIMARY KEY,
  nama_pejabat VARCHAR(255) NOT NULL,
  nip_pejabat VARCHAR(18),
  jabatan_pejabat VARCHAR(255) NOT NULL,
  unit_kerja VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS penilaian_konversi (
  id SERIAL PRIMARY KEY,
  pegawai_id INTEGER NOT NULL REFERENCES pegawai(id) ON DELETE CASCADE,
  tahun INTEGER NOT NULL,
  periode_bulan VARCHAR(100),
  jumlah_bulan INTEGER NOT NULL DEFAULT 12,
  predikat VARCHAR(20) NOT NULL CHECK (predikat IN ('Sangat Baik', 'Baik', 'Cukup', 'Kurang', 'Sangat Kurang')),
  persentase VARCHAR(10) NOT NULL,
  koefisien NUMERIC(10, 2) NOT NULL,
  angka_kredit_didapat NUMERIC(20, 10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_penilaian_pegawai ON penilaian_konversi (pegawai_id);
CREATE INDEX IF NOT EXISTS idx_penilaian_tahun ON penilaian_konversi (tahun);

CREATE TABLE IF NOT EXISTS pak_penetapan (
  id SERIAL PRIMARY KEY,
  pegawai_id INTEGER NOT NULL REFERENCES pegawai(id) ON DELETE CASCADE,
  nomor_surat VARCHAR(255),
  pejabat_id INTEGER REFERENCES pejabat_penilai(id),
  ak_dasar NUMERIC(20, 10) NOT NULL DEFAULT 0,
  ak_integrasi NUMERIC(20, 10) NOT NULL DEFAULT 0,
  ak_penyesuaian NUMERIC(20, 10) NOT NULL DEFAULT 0,
  ak_pendidikan NUMERIC(20, 10) NOT NULL DEFAULT 0,
  ak_minimal_pangkat NUMERIC(20, 10) NOT NULL DEFAULT 0,
  ak_minimal_jabatan NUMERIC(20, 10) NOT NULL DEFAULT 0,
  tanggal_penetapan DATE,
  kota_penetapan VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_penetapan_pegawai ON pak_penetapan (pegawai_id);
