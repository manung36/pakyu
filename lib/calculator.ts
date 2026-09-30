import {
  JabatanFungsional,
  PredikatKinerja,
  KOEFISIEN,
  PERSENTASE,
  Penilaian,
} from "@/lib/constants";

export function getPersentaseDisplay(predikat: PredikatKinerja): string {
  const pct = PERSENTASE[predikat];
  if (pct === undefined) return "-";
  return `${(pct * 100).toFixed(0)}%`;
}

export function getKoefisien(jabatan: JabatanFungsional): number {
  return KOEFISIEN[jabatan] || 0;
}

export function hitungAKPenuh(
  jabatan: JabatanFungsional,
  predikat: PredikatKinerja
): number {
  const koefisien = KOEFISIEN[jabatan];
  const persentase = PERSENTASE[predikat];
  if (koefisien === undefined || persentase === undefined) return 0;
  return koefisien * persentase;
}

export function hitungAKProporsional(
  jabatan: JabatanFungsional,
  predikat: PredikatKinerja,
  bulan: number
): number {
  const koefisien = KOEFISIEN[jabatan];
  const persentase = PERSENTASE[predikat];
  if (koefisien === undefined || persentase === undefined) return 0;
  const safeBulan = Math.max(1, Math.min(12, Math.round(bulan) || 12));
  return koefisien * persentase * (safeBulan / 12);
}

export function hitungAK(
  jabatan: JabatanFungsional,
  predikat: PredikatKinerja,
  bulan = 12
): number {
  const safeBulan = Math.round(bulan) || 12;
  if (safeBulan >= 12) {
    return hitungAKPenuh(jabatan, predikat);
  }
  return hitungAKProporsional(jabatan, predikat, safeBulan);
}

export function hitungTotalAK(
  akIntegrasi: number,
  penilaianList: Penilaian[]
): number {
  const integrasi = Number(akIntegrasi) || 0;
  const totalKonversi = penilaianList.reduce((sum, p) => {
    return sum + (Number(p.angka_kredit_didapat) || 0);
  }, 0);
  return integrasi + totalKonversi;
}

export interface EvaluasiKelayakan {
  selisihPangkat: number;
  selisihJabatan: number;
  layakPangkat: boolean;
  layakJabatan: boolean;
}

export function evaluasiKelayakan(
  jumlahAKBaru: number,
  akMinimalPangkat: number,
  akMinimalJabatan: number
): EvaluasiKelayakan {
  const jumlah = Number(jumlahAKBaru) || 0;
  const minPangkat = Number(akMinimalPangkat) || 0;
  const minJabatan = Number(akMinimalJabatan) || 0;

  const selisihPangkat = jumlah - minPangkat;
  const selisihJabatan = jumlah - minJabatan;

  return {
    selisihPangkat,
    selisihJabatan,
    layakPangkat: selisihPangkat >= 0,
    layakJabatan: selisihJabatan >= 0,
  };
}

export interface PAKSummaryParams {
  pegawai_id: number;
  penilaianList?: Penilaian[];
  akDasar?: number;
  akIntegrasi?: number;
  akPenyesuaian?: number;
  akPendidikan?: number;
  akMinimalPangkat?: number;
  akMinimalJabatan?: number;
}

export interface PAKSummary extends EvaluasiKelayakan {
  pegawai_id: number;
  penilaianList: Penilaian[];
  akDasar: number;
  akIntegrasi: number;
  akPenyesuaian: number;
  akPendidikan: number;
  totalAKKonversi: number;
  jumlahAKBaru: number;
  akMinimalPangkat: number;
  akMinimalJabatan: number;
}

export function buildPAKSummary(params: PAKSummaryParams): PAKSummary {
  const {
    pegawai_id,
    penilaianList = [],
    akDasar = 0,
    akIntegrasi = 0,
    akPenyesuaian = 0,
    akPendidikan = 0,
    akMinimalPangkat = 0,
    akMinimalJabatan = 0,
  } = params;

  const totalAKKonversi = penilaianList.reduce((sum, p) => {
    return sum + (Number(p.angka_kredit_didapat) || 0);
  }, 0);

  const jumlahAKBaru =
    (Number(akDasar) || 0) +
    (Number(akIntegrasi) || 0) +
    (Number(akPenyesuaian) || 0) +
    totalAKKonversi +
    (Number(akPendidikan) || 0);

  const evaluasi = evaluasiKelayakan(
    jumlahAKBaru,
    akMinimalPangkat,
    akMinimalJabatan
  );

  return {
    pegawai_id,
    penilaianList,
    akDasar: Number(akDasar) || 0,
    akIntegrasi: Number(akIntegrasi) || 0,
    akPenyesuaian: Number(akPenyesuaian) || 0,
    akPendidikan: Number(akPendidikan) || 0,
    totalAKKonversi,
    jumlahAKBaru,
    akMinimalPangkat: Number(akMinimalPangkat) || 0,
    akMinimalJabatan: Number(akMinimalJabatan) || 0,
    ...evaluasi,
  };
}

export const Calculator = {
  getPersentaseDisplay,
  getKoefisien,
  hitungAKPenuh,
  hitungAKProporsional,
  hitungAK,
  hitungTotalAK,
  evaluasiKelayakan,
  buildPAKSummary,
};
