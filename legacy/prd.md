Berikut adalah **Product Requirement Document (PRD)** yang disatukan dan disempurnakan secara menyeluruh untuk pembangunan **Aplikasi Penjana Dokumen Perhitungan Angka Kredit Dosen (PAK Konversi)**.

---

# Product Requirement Document (PRD)

**Nama Produk:** Aplikasi Penjana Dokumen PAK Konversi Dosen

**Versi:** 1.0 (Komprehensif)

**Status:** Draf Akhir

---

## 1. Pengenalan & Objektif Produk

### 1.1 Latar Belakang

Proses penilaian Angka Kredit (AK) dosen mengikut peraturan terkini Kementerian Pendidikan Tinggi, Sains dan Teknologi memerlukan konversi predikat kinerja tahunan/periodik ke dalam bentuk angka kredit. Aplikasi ini dibangunkan untuk mengautomasikan pengiraan, mengurus data master pegawai secara pukal (*bulk import*), serta menjana dokumen rasmi PAK Konversi secara tepat mengikut format piawai.

### 1.2 Objektif

* Mengurangkan ralat manual dalam pengiraan Angka Kredit Konversi dan Akumulasi.
* Memudahkan pihak pentadbir/operator memuat naik data master dosen secara pukal menerusi Excel.
* Menjana 3 jenis dokumen rasmi PAK Konversi secara automatik dan sedia untuk dicetak (PDF/Print).

---

## 2. Skop & Ciri-ciri Utama

1. **Pengurusan Data Master Pegawai (Dosen):**
* Import data pukal menerusi Excel (`.xlsx`).
* Ciri *Preview*, *Validation*, dan *Conflict Handling* (NIP bertindih).
* Carian, penapisan, dan kemas kini data dosen secara manual.


2. **Kalkulator & Modul Pengiraan PAK:**
* Pengiraan automatik berdasarkan Jabatan Fungsional, Predikat Kinerja, dan tempoh penilaian.
* Sokongan pengiraan proporsional mengikut bilangan bulan (contoh: Juni–Desember = 7 bulan).


3. **Papan Pemuka (Dashboard) & Pengurusan Rekod:**
* Penyimpanan riwayat penilaian AK Konversi mengikut tahun/periode.
* Pengiraan automatik kelayakan kenaikan pangkat / jenjang jabatan.


4. **Penjanaan & Eksport Dokumen:**
* Menjana 3 dokumen utama:
1. Dokumen Konversi Predikat Kinerja ke Angka Kredit.
2. Dokumen Akumulasi Angka Kredit Jabatan Fungsional.
3. Dokumen Penetapan Angka Kredit (PAK Final).





---

## 3. Logik Pengiraan & Aturan Perniagaan (Business Rules)

### 3.1 Jadual Koefisien Jabatan Fungsional (per Tahun)

| Jabatan Fungsional | Koefisien / Tahun |
| --- | --- |
| **Asisten Ahli** | 12.5 |
| **Lektor** | 25.0 |
| **Lektor Kepala** | 25.0 |
| **Profesor** | 50.0 |

### 3.2 Jadual Peratusan Predikat Kinerja

| Predikat Kinerja | Peratusan (%) |
| --- | --- |
| **Sangat Baik** | 150% |
| **Baik** | 100% |
| **Cukup** | 75% |
| **Kurang** | 50% |
| **Sangat Kurang** | 25% |

### 3.3 Formulasi Pengiraan

1. **AK Periode Penuh (12 Bulan / 1 Tahun):**

$$\text{AK} = \text{Koefisien} \times \text{Peratusan Predikat}$$


2. **AK Periode Parsial / Proporsional Bulan:**

$$\text{AK} = \text{Koefisien} \times \text{Peratusan Predikat} \times \left(\frac{\text{Bilangan Bulan}}{12}\right)$$



*Contoh (Juni - Desember = 7 bulan, Lektor/AA, Baik):*

$$\text{AK} = 12.5 \times 100\% \times \frac{7}{12} = 7.2916666667$$


3. **Total AK Konversi (Akumulasi):**

$$\text{Total AK} = \text{AK Integrasi} + \sum (\text{AK Konversi Periode})$$


4. **Kelebihan / Kekurangan AK & Status Kelayakan:**

$$\text{Selisih} = \text{Jumlah AK Baru} - \text{AK Minimal Syarat}$$


* Jika $\text{Selisih} \ge 0 \rightarrow$ **DAPAT DIPERTIMBANGKAN UNTUK KENAIKAN PANGKAT / JENJANG JABATAN**.
* Jika $\text{Selisih} < 0 \rightarrow$ **TIDAK DAPAT DIPERTIMBANGKAN UNTUK KENAIKAN PANGKAT / JENJANG JABATAN**.



---

## 4. Keperluan Fungsional (Functional Requirements)

### Modul A: Import Data Master Pegawai via Excel

* **Unggah Berkas:** Pengguna memuat naik fail `.xlsx` (saiz maksimum: 10MB).
* **Pemetaan Kolom Excel:**

| No | Kolom Excel | Field Database | Tipe Data | Wajib | Syarat & Validasi |
| --- | --- | --- | --- | --- | --- |
| 1 | `NIP (*)` | `nip` | Varchar(18) | Ya | Unique, Digit Angka 18 Karakter |
| 2 | `Nama Lengkap (*)` | `nama_lengkap` | Varchar(255) | Ya | Teks |
| 3 | `No. Seri Karpeg` | `no_karpeg` | Varchar(50) | Tidak | Alfanumerik |
| 4 | `Tempat Lahir (*)` | `tempat_lahir` | Varchar(100) | Ya | Teks |
| 5 | `Tanggal Lahir (*)` | `tanggal_lahir` | Date | Ya | Format `YYYY-MM-DD` |
| 6 | `Jenis Kelamin (*)` | `jenis_kelamin` | Enum | Ya | Nilai valid: `L` atau `P` |
| 7 | `Pangkat / Golongan (*)` | `pangkat_golongan` | Varchar(100) | Ya | Teks (contoh: Penata Muda / III/B) |
| 8 | `TMT Pangkat (*)` | `tmt_pangkat` | Date | Ya | Format `YYYY-MM-DD` |
| 9 | `Jabatan Fungsional (*)` | `jabatan_fungsional` | Enum | Ya | `Asisten Ahli`, `Lektor`, `Lektor Kepala`, `Profesor` |
| 10 | `TMT Jabatan (*)` | `tmt_jabatan` | Date | Ya | Format `YYYY-MM-DD` |
| 11 | `Unit Kerja (*)` | `unit_kerja` | Varchar(255) | Ya | Teks |

* **Pratinjau & Resolusi Konflik:**
* Paparan jadual pratinjau sebelum menyimpan data.
* Pilihan tindakan untuk NIP yang sudah wujud: **Abaikan (Skip)** atau **Kemas Kini (Update)**.
* Muat turun log ralat (*Error Log*) jika terdapat baris data yang tidak sah.



---

### Modul B: Form Parameter Penilaian & Pejabat

* **Parameter Dokumen:**
* Nomor Surat SK PAK.
* Masa Penilaian / Periode Penilaian (Tarikh Mula s.d Tarikh Akhir).
* Kota & Tarikh Penetapan.


* **Data Pejabat Penilai Kinerja:**
* Nama Pejabat Penilai.
* NIP Pejabat Penilai.
* Jabatan / Unit Kerja Pejabat Penilai.



---

### Modul C: Form AK Dasar & Penyesuaian

* Input nilai untuk komponen pendukung pada Penetapan Angka Kredit:
1. AK Dasar yang diberikan
2. AK Integrasi
3. AK Penyesuaian / Penyetaraan
4. AK Peningkatan Pendidikan
5. AK Minimal Syarat Pangkat
6. AK Minimal Syarat Jenjang Jabatan



---

## 5. Spesifikasi Penjanaan Dokumen Output

Sistem wajib menyediakan keupayaan menjana **3 jenis dokumen rasmi** mengikut format piawai Kementerian:

### 1. Dokumen 1: Konversi Predikat Kinerja ke Angka Kredit

* **Tujuan:** Menunjukkan pengiraan konversi untuk **satu periode penilaian tertentu**.
* **Komponen Utama:**
* Tajuk & Kop Kementerian/PT.
* Maklumat Dosen (NIP, Nama, Karpeg, Pangkat/Gol, Jabatan, Unit Kerja).
* Jadual Pengiraan: Predikat (1), Peratusan (2), Koefisien (3), Angka Kredit (4 = $2 \times 3$).
* Ruang Tanda Tangan Pejabat Penilai Kinerja.



### 2. Dokumen 2: Akumulasi Angka Kredit Jabatan Fungsional

* **Tujuan:** Mengumpul dan memaparkan sejarah AK dari beberapa tahun/periode penilaian.
* **Komponen Utama:**
* Jadual Sejarah: Tahun (1), Periodik/Bulan (2), Predikat (3), Peratusan (4), Koefisien (5), Angka Kredit (6).
* Baris Integrasi & Baris Penilaian Terdahulu/Semasa.
* Baris **JUMLAH ANGKA KREDIT YANG DIPEROLEH**.



### 3. Dokumen 3: Penetapan Angka Kredit (PAK Final)

* **Tujuan:** Dokumen keputusan rasmi penetapan AK dan status kelayakan kenaikan pangkat/jabatan.
* **Komponen Utama:**
* Jadual Perincian AK: Lama, Baru, Jumlah (AK Dasar, AK Integrasi, AK Penyesuaian, AK Konversi, AK Pendidikan).
* Kotak Evaluasi Syarat:
* Angka Kredit Minimal yang harus dicapai.
* Kelebihan / Kekurangan Angka Kredit.


* Pernyataan Keputusan: **DAPAT / TIDAK DAPAT DIPERTIMBANGKAN UNTUK KENAIKAN PANGKAT/JENJANG JABATAN**.



---

## 6. Keperluan Bukan Fungsional (Non-Functional Requirements)

1. **Ketepatan Angka Perpuluhan (Decimal Precision):**
* Pengiraan angka kredit wajib menggunakan ketepatan sehingga **10 digit di belakang koma** (misalnya `7.2916666667` dan `44.7916666667`) untuk megelakkan ralat pembundaran pada akumulasi akhir.


2. **Kualiti & Tata Letak Cetakan (Print Layout):**
* Menggunakan CSS `@media print` dengan tetapan kertas A4 / F4.
* Memastikan jadual dan ruang tanda tangan tidak terpotong merentasi muka surat.


3. **Prestasi Import Data:**
* Mampu memproses import berkas Excel sehingga 1,000 baris data dalam masa kurang daripada 5 saat.


4. **Keselamatan Data:**
* Kawalan akses berasaskan peranan (Role-Based Access Control / RBAC):
* **Admin / Operator:** Boleh import data, mengemas kini data master, dan menjana SK.
* **Dosen / Viewer:** Hanya boleh melihat rekod dan memuat turun dokumen PAK sendiri.





---

## 7. Skema Asas Data (Database Schema Outline)

```
1. users / pegawai
   - id (PK)
   - nip (Unique)
   - nama_lengkap
   - no_karpeg
   - tempat_lahir
   - tanggal_lahir
   - jenis_kelamin
   - pangkat_golongan
   - tmt_pangkat
   - jabatan_fungsional
   - tmt_jabatan
   - unit_kerja

2. pejabat_penilai
   - id (PK)
   - nama_pejabat
   - nip_pejabat
   - jabatan_pejabat
   - unit_kerja

3. penilaian_konversi
   - id (PK)
   - pegawai_id (FK)
   - tahun
   - periode_bulan (contoh: JUNI - DESEMBER)
   - jumlah_bulan (contoh: 7)
   - predikat (Sangat Baik / Baik / dll)
   - persentase (150%, 100%, dll)
   - koefisien (12.5, 25, 50)
   - angka_kredit_didapat (Decimal 15,10)

4. pak_penetapan
   - id (PK)
   - pegawai_id (FK)
   - nomor_surat
   - pejabat_id (FK)
   - ak_dasar
   - ak_integrasi
   - ak_penyesuaian
   - ak_pendidikan
   - ak_minimal_pangkat
   - ak_minimal_jabatan
   - tanggal_penetapan
   - kota_penetapan

```

---

Dokumen PRD ini telah disatukan dan merangkumi keseluruhan keperluan logik pengiraan, struktur import Excel, serta format 3 dokumen keluaran.