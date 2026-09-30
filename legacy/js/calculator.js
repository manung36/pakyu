/**
 * PAK Konversi Dosen — AK Calculator Engine
 * Implements business rules from PRD §3
 */

const Calculator = {
  /**
   * Coefficient table per Jabatan Fungsional (per year)
   * PRD §3.1
   */
  KOEFISIEN: {
    'Asisten Ahli': 12.5,
    'Lektor': 25.0,
    'Lektor Kepala': 25.0,
    'Profesor': 50.0,
  },

  /**
   * Predikat Kinerja percentage table
   * PRD §3.2
   */
  PREDIKAT: {
    'Sangat Baik': 1.50,
    'Baik': 1.00,
    'Cukup': 0.75,
    'Kurang': 0.50,
    'Sangat Kurang': 0.25,
  },

  /**
   * Get display percentage for a predikat
   */
  getPersentaseDisplay(predikat) {
    const pct = Calculator.PREDIKAT[predikat];
    if (pct === undefined) return '-';
    return `${(pct * 100).toFixed(0)}%`;
  },

  /**
   * Get koefisien for a jabatan
   */
  getKoefisien(jabatan) {
    return Calculator.KOEFISIEN[jabatan] || 0;
  },

  /**
   * Calculate AK for full period (12 months)
   * Formula: AK = Koefisien × Persentase Predikat
   * PRD §3.3.1
   */
  hitungAKPenuh(jabatan, predikat) {
    const koefisien = Calculator.KOEFISIEN[jabatan];
    const persentase = Calculator.PREDIKAT[predikat];
    if (koefisien === undefined || persentase === undefined) return 0;
    return koefisien * persentase;
  },

  /**
   * Calculate AK for partial period (proportional months)
   * Formula: AK = Koefisien × Persentase × (Bulan / 12)
   * PRD §3.3.2
   */
  hitungAKProporsional(jabatan, predikat, bulan) {
    const koefisien = Calculator.KOEFISIEN[jabatan];
    const persentase = Calculator.PREDIKAT[predikat];
    if (koefisien === undefined || persentase === undefined) return 0;
    bulan = Math.max(1, Math.min(12, parseInt(bulan) || 12));
    return koefisien * persentase * (bulan / 12);
  },

  /**
   * Calculate AK (auto-detect full or partial)
   */
  hitungAK(jabatan, predikat, bulan = 12) {
    bulan = parseInt(bulan) || 12;
    if (bulan >= 12) {
      return Calculator.hitungAKPenuh(jabatan, predikat);
    }
    return Calculator.hitungAKProporsional(jabatan, predikat, bulan);
  },

  /**
   * Calculate Total AK Konversi (Accumulation)
   * Formula: Total AK = AK Integrasi + Σ(AK Konversi per Periode)
   * PRD §3.3.3
   */
  hitungTotalAK(akIntegrasi, penilaianList) {
    akIntegrasi = parseFloat(akIntegrasi) || 0;
    const totalKonversi = penilaianList.reduce((sum, p) => {
      return sum + (parseFloat(p.angka_kredit_didapat) || 0);
    }, 0);
    return akIntegrasi + totalKonversi;
  },

  /**
   * Calculate eligibility for promotion
   * Formula: Selisih = Jumlah AK Baru - AK Minimal Syarat
   * PRD §3.3.4
   *
   * @returns {{ selisihPangkat: number, selisihJabatan: number, layakPangkat: boolean, layakJabatan: boolean }}
   */
  evaluasiKelayakan(jumlahAKBaru, akMinimalPangkat, akMinimalJabatan) {
    jumlahAKBaru = parseFloat(jumlahAKBaru) || 0;
    akMinimalPangkat = parseFloat(akMinimalPangkat) || 0;
    akMinimalJabatan = parseFloat(akMinimalJabatan) || 0;

    const selisihPangkat = jumlahAKBaru - akMinimalPangkat;
    const selisihJabatan = jumlahAKBaru - akMinimalJabatan;

    return {
      selisihPangkat,
      selisihJabatan,
      layakPangkat: selisihPangkat >= 0,
      layakJabatan: selisihJabatan >= 0,
    };
  },

  /**
   * Build a complete PAK calculation summary for a pegawai
   *
   * @param {Object} params
   * @param {Object} params.pegawai - Pegawai data
   * @param {Array} params.penilaianList - List of penilaian_konversi records
   * @param {number} params.akDasar - AK Dasar
   * @param {number} params.akIntegrasi - AK Integrasi
   * @param {number} params.akPenyesuaian - AK Penyesuaian
   * @param {number} params.akPendidikan - AK Pendidikan
   * @param {number} params.akMinimalPangkat - AK Minimal Syarat Pangkat
   * @param {number} params.akMinimalJabatan - AK Minimal Syarat Jenjang Jabatan
   */
  buildPAKSummary(params) {
    const {
      pegawai,
      penilaianList = [],
      akDasar = 0,
      akIntegrasi = 0,
      akPenyesuaian = 0,
      akPendidikan = 0,
      akMinimalPangkat = 0,
      akMinimalJabatan = 0,
    } = params;

    // Total AK Konversi from all periods
    const totalAKKonversi = penilaianList.reduce((sum, p) => {
      return sum + (parseFloat(p.angka_kredit_didapat) || 0);
    }, 0);

    // Jumlah AK Baru (all components)
    const jumlahAKBaru =
      parseFloat(akDasar) +
      parseFloat(akIntegrasi) +
      parseFloat(akPenyesuaian) +
      totalAKKonversi +
      parseFloat(akPendidikan);

    // Evaluasi
    const evaluasi = Calculator.evaluasiKelayakan(
      jumlahAKBaru,
      akMinimalPangkat,
      akMinimalJabatan
    );

    return {
      pegawai,
      penilaianList,
      akDasar: parseFloat(akDasar),
      akIntegrasi: parseFloat(akIntegrasi),
      akPenyesuaian: parseFloat(akPenyesuaian),
      akPendidikan: parseFloat(akPendidikan),
      totalAKKonversi,
      jumlahAKBaru,
      akMinimalPangkat: parseFloat(akMinimalPangkat),
      akMinimalJabatan: parseFloat(akMinimalJabatan),
      ...evaluasi,
    };
  },

  /**
   * Get list of all jabatan fungsional
   */
  getJabatanList() {
    return Object.keys(Calculator.KOEFISIEN);
  },

  /**
   * Get list of all predikat kinerja
   */
  getPredikatList() {
    return Object.keys(Calculator.PREDIKAT);
  },
};

window.Calculator = Calculator;
