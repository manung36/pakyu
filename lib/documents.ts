"use client";

import { Pegawai, Penilaian } from "@/lib/constants";
import { Calculator } from "@/lib/calculator";
import {
  escapeHtml,
  formatDateID,
  formatAKComma,
  formatAK,
  getValidJabatan,
} from "@/lib/utils";

export interface PejabatData {
  nama_pejabat: string;
  nip_pejabat: string;
  jabatan_pejabat: string;
}

function renderKop() {
  return `
    <div class="doc-kop">
      <div class="doc-kop-ministry">KEMENTERIAN PENDIDIKAN TINGGI, SAINS DAN TEKNOLOGI</div>
      <div class="doc-kop-university">UNIVERSITAS NEGERI</div>
      <div class="doc-kop-address">Jalan Raya Kampus No. 1 — Telepon (021) 1234567</div>
    </div>
  `;
}

function renderBiodata(pegawai: Pegawai) {
  const e = escapeHtml;
  return `
    <table class="doc-biodata">
      <tr>
        <td class="label-col">Nama</td>
        <td class="sep-col">:</td>
        <td class="value-col">${e(pegawai.nama_lengkap)}</td>
      </tr>
      <tr>
        <td class="label-col">NIP</td>
        <td class="sep-col">:</td>
        <td class="value-col">${e(pegawai.nip)}</td>
      </tr>
      <tr>
        <td class="label-col">No. Seri Karpeg</td>
        <td class="sep-col">:</td>
        <td class="value-col">${e(pegawai.no_karpeg || "-")}</td>
      </tr>
      <tr>
        <td class="label-col">Tempat / Tanggal Lahir</td>
        <td class="sep-col">:</td>
        <td class="value-col">${e(pegawai.tempat_lahir)} / ${formatDateID(
    pegawai.tanggal_lahir
  )}</td>
      </tr>
      <tr>
        <td class="label-col">Jenis Kelamin</td>
        <td class="sep-col">:</td>
        <td class="value-col">${e(pegawai.jenis_kelamin)}</td>
      </tr>
      <tr>
        <td class="label-col">Pangkat / Golongan Ruang</td>
        <td class="sep-col">:</td>
        <td class="value-col">${e(pegawai.pangkat_golongan)}</td>
      </tr>
      <tr>
        <td class="label-col">TMT Pangkat</td>
        <td class="sep-col">:</td>
        <td class="value-col">${formatDateID(pegawai.tmt_pangkat)}</td>
      </tr>
      <tr>
        <td class="label-col">Jabatan Fungsional / TMT</td>
        <td class="sep-col">:</td>
        <td class="value-col">${e(
          pegawai.jabatan_fungsional
        )} / ${formatDateID(pegawai.tmt_jabatan)}</td>
      </tr>
      <tr>
        <td class="label-col">Unit Kerja</td>
        <td class="sep-col">:</td>
        <td class="value-col">${e(pegawai.unit_kerja)}</td>
      </tr>
    </table>
  `;
}

function renderSignature(pejabat: PejabatData, kota: string, tanggal: string) {
  const e = escapeHtml;
  return `
    <div class="doc-signature">
      <div class="doc-signature-block">
        <div class="doc-signature-place-date">${e(kota)}, ${formatDateID(
    tanggal
  )}</div>
        <div class="doc-signature-role">${e(
          pejabat.jabatan_pejabat || "Pejabat Penilai Kinerja"
        )}</div>
        <div class="doc-signature-name">${e(pejabat.nama_pejabat)}</div>
        <div class="doc-signature-nip">NIP. ${e(pejabat.nip_pejabat)}</div>
      </div>
    </div>
  `;
}

function renderTutWuriLogo() {
  return `
    <div style="text-align: center; margin-bottom: 8px;">
      <svg width="80" height="80" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="94" fill="none" stroke="#000" stroke-width="2.5" stroke-dasharray="5 3.5"/>
        <circle cx="100" cy="100" r="88" fill="none" stroke="#000" stroke-width="2"/>
        <circle cx="100" cy="100" r="74" fill="none" stroke="#000" stroke-width="1.5"/>
        <path id="tutwuriPath" fill="none" d="M 28,100 A 72,72 0 1,1 172,100" />
        <text font-family="'Times New Roman', serif" font-size="14.5" font-weight="bold" fill="#000" text-anchor="middle" letter-spacing="1">
          <textPath href="#tutwuriPath" startOffset="50%">TUT WURI HANDAYANI</textPath>
        </text>
        <g transform="translate(100, 108) scale(0.68)" fill="none" stroke="#000" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
          <path d="M 0,-10 C -25,-40 -60,-40 -80,-10 C -60,0 -40,10 0,30 C 40,10 60,0 80,-10 C 60,-40 25,-40 0,-10 Z" />
          <path d="M -20,-20 C -45,-30 -65,-20 -70,-5" />
          <path d="M 20,-20 C 45,-30 65,-20 70,-5" />
          <path d="M -40,30 Q 0,45 40,30 L 45,45 Q 0,60 -45,45 Z" fill="#000" fill-opacity="0.08"/>
          <path d="M -40,30 Q 0,45 40,30 L 45,45 Q 0,60 -45,45 Z"/>
          <line x1="0" y1="37" x2="0" y2="52"/>
          <path d="M 0,-15 C -15,-35 -5,-55 0,-70 C 5,-55 15,-35 0,-15 Z" fill="#000"/>
          <path d="M 0,-25 C -8,-38 -2,-50 0,-60 C 2,-50 8,-38 0,-25 Z" fill="#fff"/>
        </g>
      </svg>
    </div>
  `;
}

export interface Dokumen1Params {
  pegawai: Pegawai;
  penilaian: Penilaian;
  pejabat: PejabatData;
  kota: string;
  tanggal: string;
  periodLabel?: string;
  nomorSurat?: string;
}

export function generateDokumen1(params: Dokumen1Params): string {
  const { pegawai, penilaian, pejabat, kota, tanggal, periodLabel, nomorSurat } =
    params;
  const e = escapeHtml;

  const jabatan = getValidJabatan(pegawai.jabatan_fungsional);
  const koefisien = jabatan ? Calculator.getKoefisien(jabatan) : 0;
  const persentaseDisplay = Calculator.getPersentaseDisplay(penilaian.predikat);
  const ak =
    Number(penilaian.angka_kredit_didapat) ||
    (jabatan
      ? Calculator.hitungAK(jabatan, penilaian.predikat, penilaian.jumlah_bulan)
      : 0);

  let jabatanDisplay: string = pegawai.jabatan_fungsional || "-";
  if (jabatanDisplay.toLowerCase().includes("asisten ahli")) {
    jabatanDisplay = "AA";
  }

  const periodText =
    periodLabel ||
    `${penilaian.tahun} — ${penilaian.periode_bulan || "12 Bulan"}`;

  return `
    <div class="print-preview-page" id="dokumen-1" style="font-family: 'Times New Roman', serif; color: #000; background: #fff; padding: 24px; max-width: 820px; margin: 0 auto; box-sizing: border-box;">
      ${renderTutWuriLogo()}
      <div style="text-align: center; font-weight: bold; font-size: 13pt; text-transform: uppercase; margin-bottom: 22px; line-height: 1.35;">
        KEMENTERIAN PENDIDIKAN TINGGI, SAINS DAN TEKNOLOGI<br>
        REPUBLIK INDONESIA
      </div>
      <div style="text-align: center; margin-bottom: 22px; line-height: 1.35;">
        <div style="font-weight: bold; font-size: 12pt; text-transform: uppercase;">KONVERSI PREDIKAT KINERJA KE ANGKA KREDIT</div>
        <div style="font-weight: bold; font-size: 12pt; text-transform: uppercase;">JABATAN FUNGSIONAL DOSEN</div>
        <div style="font-size: 11pt; margin-top: 2px;">NOMOR ${e(
          nomorSurat || "< AGAR DIISI PT >"
        )}</div>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 10.5pt; border: 1px solid #000;">
        <tr>
          <td style="width: 50%; padding: 5px 8px; border-right: 1px solid #000; vertical-align: top; line-height: 1.4;">
            Instansi :<br>
            Kementerian Pendidikan Tinggi, Sains dan Teknologi
          </td>
          <td style="width: 50%; padding: 5px 8px; vertical-align: top; line-height: 1.4;">
            Periode :<br>
            ${e(periodText)}
          </td>
        </tr>
      </table>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 10pt; line-height: 1.35;">
        <tr>
          <th colspan="4" style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; text-transform: uppercase; background: #fff;">
            PEJABAT FUNGSIONAL YANG DINILAI
          </th>
        </tr>
        ${[
          [1, "Nama", e(pegawai.nama_lengkap).toUpperCase()],
          [2, "NIP", "'" + e(pegawai.nip)],
          [3, "Nomor Seri Karpeg", e(pegawai.no_karpeg || "")],
          [
            4,
            "Tempat / Tanggal Lahir",
            `${e(pegawai.tempat_lahir)} / ${formatDateID(pegawai.tanggal_lahir)}`,
          ],
          [5, "Jenis Kelamin", e(pegawai.jenis_kelamin)],
          [
            6,
            "Pangkat / Golongan Ruang /",
            `${e(pegawai.pangkat_golongan)} / ${formatDateID(
              pegawai.tmt_pangkat
            )}`,
          ],
          [7, "Jabatan/TMT", `${e(jabatanDisplay)} / ${formatDateID(
            pegawai.tmt_jabatan
          )}`],
          [8, "Unit Kerja", e(pegawai.unit_kerja)],
        ]
          .map(
            ([no, label, value]) => `
          <tr>
            <td style="border: 1px solid #000; padding: 4px 6px; width: 28px; text-align: center;">${no}</td>
            <td style="border: 1px solid #000; padding: 4px 8px; width: 210px;">${label}</td>
            <td style="border: 1px solid #000; padding: 4px 4px; width: 12px; text-align: center;">:</td>
            <td style="border: 1px solid #000; padding: 4px 8px; font-weight: bold;">${value}</td>
          </tr>
        `
          )
          .join("")}
        <tr>
          <th colspan="4" style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; text-transform: uppercase; background: #fff;">
            KONVERSI PREDIKAT KINERJA KE ANGKA KREDIT
          </th>
        </tr>
        <tr style="background: #e0e0e0;">
          <td colspan="2" style="border: 1px solid #000; padding: 5px; text-align: center; font-weight: bold;">Hasil Penilaian Kinerja</td>
          <td rowspan="2" style="border: 1px solid #000; padding: 5px; text-align: center; font-weight: bold; vertical-align: middle;">Koefisien per tahun</td>
          <td rowspan="2" style="border: 1px solid #000; padding: 5px; text-align: center; font-weight: bold; vertical-align: middle;">Angka kredit yang didapat<br><span style="font-weight: normal; font-size: 9pt;">(kolom 2 x kolom 3)</span></td>
        </tr>
        <tr style="background: #e0e0e0;">
          <td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; width: 130px;">PREDIKAT</td>
          <td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; width: 130px;">PROSENTASE</td>
        </tr>
        <tr style="background: #e0e0e0; text-align: center; font-weight: bold;">
          <td style="border: 1px solid #000; padding: 3px;">1</td>
          <td style="border: 1px solid #000; padding: 3px;">2</td>
          <td style="border: 1px solid #000; padding: 3px;">3</td>
          <td style="border: 1px solid #000; padding: 3px;">4</td>
        </tr>
        <tr>
          <td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; text-transform: uppercase;">${e(
            penilaian.predikat
          )}</td>
          <td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">${persentaseDisplay}</td>
          <td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">${formatAKComma(
            koefisien
          )}</td>
          <td style="border: 1px solid #000; padding: 8px; text-align: center; font-weight: bold;">${formatAKComma(
            ak
          )}</td>
        </tr>
      </table>
      <div style="display: flex; justify-content: flex-end; margin-top: 24px; font-size: 10.5pt; line-height: 1.4;">
        <div style="width: 320px;">
          <div>Ditetapkan di ${e(kota || "Jakarta")}</div>
          <div>Pada tanggal ${e(
            tanggal ? formatDateID(tanggal) : "< AGAR DIISI PT >"
          )}</div>
          <br>
          <div>Pejabat Penilai Kinerja</div>
          <br><br><br><br>
          <div>${e(pejabat.nama_pejabat || "... < AGAR DIISI PT >")}</div>
          <div>NIP ${e(pejabat.nip_pejabat || "< AGAR DIISI PT >")}</div>
        </div>
      </div>
      <div style="margin-top: 30px; font-size: 9.5pt; line-height: 1.4;">
        <div>Tembusan disampaikan kepada:</div>
        <div style="margin-left: 8px;">1 Pejabat Fungsional yang bersangkutan</div>
        <div style="margin-left: 8px;">2 ...</div>
        <div style="margin-left: 8px;">3 dst</div>
      </div>
    </div>
  `;
}

export interface Dokumen2Params {
  pegawai: Pegawai;
  penilaianList: Penilaian[];
  akIntegrasi: number;
  pejabat: PejabatData;
  kota: string;
  tanggal: string;
}

export function generateDokumen2(params: Dokumen2Params): string {
  const { pegawai, penilaianList, akIntegrasi, pejabat, kota, tanggal } = params;
  const e = escapeHtml;

  let totalAK = Number(akIntegrasi) || 0;
  let tableRows = "";
  let no = 1;

  if (Number(akIntegrasi) > 0) {
    tableRows += `
      <tr>
        <td>${no++}</td>
        <td colspan="4" style="text-align:left; font-style:italic;">AK Integrasi</td>
        <td>${formatAK(akIntegrasi)}</td>
      </tr>
    `;
  }

  const sorted = [...penilaianList].sort(
    (a, b) => (a.tahun || 0) - (b.tahun || 0)
  );

  sorted.forEach((p) => {
    const ak = Number(p.angka_kredit_didapat) || 0;
    totalAK += ak;

    tableRows += `
      <tr>
        <td>${no++}</td>
        <td>${e(String(p.tahun || "-"))}</td>
        <td>${e(p.periode_bulan || `${p.jumlah_bulan} Bulan`)}</td>
        <td>${e(p.predikat)}</td>
        <td>${Calculator.getPersentaseDisplay(p.predikat)}</td>
        <td>${
          getValidJabatan(pegawai.jabatan_fungsional)
            ? Calculator.getKoefisien(getValidJabatan(pegawai.jabatan_fungsional)!)
            : 0
        }</td>
        <td>${formatAK(ak)}</td>
      </tr>
    `;
  });

  return `
    <div class="print-preview-page" id="dokumen-2">
      ${renderKop()}
      <div class="doc-title">AKUMULASI ANGKA KREDIT JABATAN FUNGSIONAL</div>
      ${renderBiodata(pegawai)}
      <table class="doc-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Tahun (1)</th>
            <th>Periodik/Bulan (2)</th>
            <th>Predikat (3)</th>
            <th>Persentase (4)</th>
            <th>Koefisien (5)</th>
            <th>Angka Kredit (6)</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
          <tr class="total-row">
            <td colspan="6" style="text-align:right; font-weight:bold;">JUMLAH ANGKA KREDIT YANG DIPEROLEH</td>
            <td style="font-weight:bold;">${formatAK(totalAK)}</td>
          </tr>
        </tbody>
      </table>
      ${renderSignature(pejabat, kota, tanggal)}
    </div>
  `;
}

export interface Dokumen3Params {
  pegawai: Pegawai;
  penilaianList: Penilaian[];
  pejabat: PejabatData;
  kota: string;
  tanggal: string;
  nomorSurat?: string;
  akDasar?: number | string;
  akIntegrasi?: number | string;
  akPenyesuaian?: number | string;
  akPendidikan?: number | string;
  akMinimalPangkat?: number | string;
  akMinimalJabatan?: number | string;
  akDasarLama?: number | string;
  akIntegrasiLama?: number | string;
  akPenyesuaianLama?: number | string;
  akKonversiLama?: number | string;
  akPendidikanLama?: number | string;
}

export function generateDokumen3(params: Dokumen3Params): string {
  const {
    pegawai,
    penilaianList,
    pejabat,
    kota,
    tanggal,
    nomorSurat,
    akDasar,
    akIntegrasi,
    akPenyesuaian,
    akPendidikan,
    akMinimalPangkat,
    akMinimalJabatan,
    akDasarLama,
    akIntegrasiLama,
    akPenyesuaianLama,
    akKonversiLama,
    akPendidikanLama,
  } = params;

  const totalAKKonversiBaru = penilaianList.reduce(
    (sum, p) => sum + (Number(p.angka_kredit_didapat) || 0),
    0
  );

  const dL = Number(akDasarLama) || 0;
  const iL = Number(akIntegrasiLama) || 0;
  const pL = Number(akPenyesuaianLama) || 0;
  const kL = Number(akKonversiLama) || 0;
  const pdL = Number(akPendidikanLama) || 0;

  const dB = Number(akDasar) || 0;
  const iB = Number(akIntegrasi) || 0;
  const pB = Number(akPenyesuaian) || 0;
  const kB = totalAKKonversiBaru;
  const pdB = Number(akPendidikan) || 0;

  const totalLama = dL + iL + pL + kL + pdL;
  const totalBaru = dB + iB + pB + kB + pdB;
  const jumlahAK = totalLama + totalBaru;

  const minPangkat = Number(akMinimalPangkat) || 0;
  const minJabatan = Number(akMinimalJabatan) || 0;

  const selisihPangkat = jumlahAK - minPangkat;
  const selisihJabatan = jumlahAK - minJabatan;
  const layakPangkat = selisihPangkat >= 0;
  const layakJabatan = selisihJabatan >= 0;
  const overallLayak = layakPangkat && layakJabatan;

  return `
    <div class="print-preview-page" id="dokumen-3">
      ${renderKop()}
      <div class="doc-title">PENETAPAN ANGKA KREDIT</div>
      ${nomorSurat ? `<div class="doc-nomor">Nomor: ${escapeHtml(nomorSurat)}</div>` : ""}
      ${renderBiodata(pegawai)}
      <table class="doc-table">
        <thead>
          <tr>
            <th rowspan="2">No</th>
            <th rowspan="2">Unsur / Sub Unsur</th>
            <th colspan="3">Angka Kredit</th>
          </tr>
          <tr>
            <th>Lama</th>
            <th>Baru</th>
            <th>Jumlah</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td class="text-left">AK Dasar yang diberikan</td>
            <td>${formatAK(dL)}</td>
            <td>${formatAK(dB)}</td>
            <td>${formatAK(dL + dB)}</td>
          </tr>
          <tr>
            <td>2</td>
            <td class="text-left">AK Integrasi</td>
            <td>${formatAK(iL)}</td>
            <td>${formatAK(iB)}</td>
            <td>${formatAK(iL + iB)}</td>
          </tr>
          <tr>
            <td>3</td>
            <td class="text-left">AK Penyesuaian / Penyetaraan</td>
            <td>${formatAK(pL)}</td>
            <td>${formatAK(pB)}</td>
            <td>${formatAK(pL + pB)}</td>
          </tr>
          <tr>
            <td>4</td>
            <td class="text-left">AK Konversi Predikat Kinerja</td>
            <td>${formatAK(kL)}</td>
            <td>${formatAK(kB)}</td>
            <td>${formatAK(kL + kB)}</td>
          </tr>
          <tr>
            <td>5</td>
            <td class="text-left">AK Peningkatan Pendidikan</td>
            <td>${formatAK(pdL)}</td>
            <td>${formatAK(pdB)}</td>
            <td>${formatAK(pdL + pdB)}</td>
          </tr>
          <tr class="total-row">
            <td colspan="2" style="text-align:right; font-weight:bold;">JUMLAH</td>
            <td style="font-weight:bold;">${formatAK(totalLama)}</td>
            <td style="font-weight:bold;">${formatAK(totalBaru)}</td>
            <td style="font-weight:bold;">${formatAK(jumlahAK)}</td>
          </tr>
        </tbody>
      </table>
      <div class="doc-eval-box no-break">
        <div class="doc-eval-title">EVALUASI SYARAT KENAIKAN PANGKAT / JENJANG JABATAN</div>
        <table class="doc-eval-table" style="width:100%">
          <tr>
            <td style="width:60%">Jumlah Angka Kredit yang diperoleh</td>
            <td style="width:5%; text-align:center">:</td>
            <td style="width:35%">${formatAK(jumlahAK)}</td>
          </tr>
          <tr>
            <td>AK Minimal Syarat Kenaikan Pangkat</td>
            <td style="text-align:center">:</td>
            <td>${formatAK(minPangkat)}</td>
          </tr>
          <tr>
            <td>Kelebihan / (Kekurangan) AK Pangkat</td>
            <td style="text-align:center">:</td>
            <td>${selisihPangkat >= 0 ? "" : "("}${formatAK(
    Math.abs(selisihPangkat)
  )}${selisihPangkat >= 0 ? "" : ")"}</td>
          </tr>
          <tr><td colspan="3" style="height:8pt"></td></tr>
          <tr>
            <td>AK Minimal Syarat Jenjang Jabatan</td>
            <td style="text-align:center">:</td>
            <td>${formatAK(minJabatan)}</td>
          </tr>
          <tr>
            <td>Kelebihan / (Kekurangan) AK Jabatan</td>
            <td style="text-align:center">:</td>
            <td>${selisihJabatan >= 0 ? "" : "("}${formatAK(
    Math.abs(selisihJabatan)
  )}${selisihJabatan >= 0 ? "" : ")"}</td>
          </tr>
        </table>
      </div>
      <div class="doc-result ${overallLayak ? "doc-result-dapat" : "doc-result-tidak"}" style="border-color: #000;">
        ${
          overallLayak
            ? "<strong>DAPAT DIPERTIMBANGKAN UNTUK KENAIKAN PANGKAT / JENJANG JABATAN</strong>"
            : "<strong>TIDAK DAPAT DIPERTIMBANGKAN UNTUK KENAIKAN PANGKAT / JENJANG JABATAN</strong>"
        }
      </div>
      ${renderSignature(pejabat, kota, tanggal)}
    </div>
  `;
}

export function openPrintPreview(htmlContent: string): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>PAK Konversi — Cetak Dokumen</title>
      <style>
        @page { size: A4; margin: 1.5cm 2cm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #000; background: #fff; }
        .print-preview-page { padding: 0; }

        .doc-kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 10pt; margin-bottom: 16pt; }
        .doc-kop-ministry { font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5pt; }
        .doc-kop-university { font-size: 14pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1pt; }
        .doc-kop-address { font-size: 9pt; margin-top: 2pt; }

        .doc-title { text-align: center; font-size: 13pt; font-weight: bold; text-transform: uppercase; margin: 20pt 0 16pt; text-decoration: underline; letter-spacing: 0.5pt; }
        .doc-subtitle { text-align: center; font-size: 11pt; margin-bottom: 16pt; }
        .doc-nomor { text-align: center; font-size: 11pt; margin-bottom: 20pt; }

        .doc-biodata { width: 100%; border-collapse: collapse; margin-bottom: 16pt; }
        .doc-biodata td { padding: 2pt 4pt; font-size: 11pt; vertical-align: top; border: none; }
        .doc-biodata .label-col { width: 35%; }
        .doc-biodata .sep-col { width: 3%; text-align: center; }
        .doc-biodata .value-col { width: 62%; }

        .doc-table { width: 100%; border-collapse: collapse; margin: 12pt 0; font-size: 10pt; }
        .doc-table th, .doc-table td { border: 1px solid #000; padding: 4pt 6pt; text-align: center; vertical-align: middle; }
        .doc-table th { font-weight: bold; background-color: #f0f0f0; }
        .doc-table td.text-left { text-align: left; }
        .doc-table td.text-right { text-align: right; }
        .doc-table .total-row td { font-weight: bold; border-top: 2px solid #000; }

        .doc-eval-box { border: 2px solid #000; padding: 10pt; margin: 16pt 0; page-break-inside: avoid; }
        .doc-eval-title { font-weight: bold; font-size: 11pt; text-align: center; margin-bottom: 8pt; text-transform: uppercase; }
        .doc-eval-table { width: 100%; border-collapse: collapse; font-size: 10pt; }
        .doc-eval-table td { padding: 3pt 6pt; vertical-align: top; }

        .doc-result { border: 2px solid #000; padding: 12pt 16pt; margin: 20pt 0; text-align: center; font-weight: bold; font-size: 11pt; text-transform: uppercase; }

        .doc-signature { margin-top: 30pt; width: 100%; overflow: hidden; }
        .doc-signature-block { float: right; width: 45%; text-align: center; }
        .doc-signature-place-date { font-size: 11pt; margin-bottom: 4pt; }
        .doc-signature-role { font-size: 11pt; font-weight: bold; margin-bottom: 60pt; }
        .doc-signature-name { font-size: 11pt; font-weight: bold; text-decoration: underline; }
        .doc-signature-nip { font-size: 10pt; margin-top: 2pt; }

        .doc-notes { font-size: 9pt; font-style: italic; margin-top: 12pt; }
        .doc-notes p { margin-bottom: 4pt; }

        .page-break-before { page-break-before: always; }
        .no-break { page-break-inside: avoid; }

        @media print {
          .no-print { display: none !important; }
        }

        .print-actions { text-align: center; padding: 20px; background: #f5f5f5; border-bottom: 1px solid #ddd; }
        .print-actions button { padding: 10px 24px; font-size: 14px; cursor: pointer; margin: 0 8px; border: 1px solid #ccc; border-radius: 6px; background: #fff; }
        .print-actions button.primary { background: #f97316; color: #fff; border-color: #f97316; }
      </style>
    </head>
    <body>
      <div class="print-actions no-print">
        <button class="primary" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
        <button onclick="window.close()">✕ Tutup</button>
      </div>
      ${htmlContent}
    </body>
    </html>
  `);
  printWindow.document.close();
}
