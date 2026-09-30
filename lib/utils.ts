import { cn } from "cn";

export { cn };

export function formatDecimal(value: unknown, places = 10): string {
  if (value === null || value === undefined || isNaN(Number(value))) return "0";
  return Number(value).toFixed(places);
}

export function formatDisplay(value: unknown, places = 4): string {
  if (value === null || value === undefined || isNaN(Number(value))) return "0";
  return Number(value).toFixed(places);
}

export function formatAK(value: unknown): string {
  if (value === null || value === undefined || isNaN(Number(value)))
    return "0.0000000000";
  return Number(value).toFixed(10);
}

export function formatAKComma(value: unknown): string {
  if (value === null || value === undefined || isNaN(Number(value))) return "0";
  const num = Number(value);
  let str = num.toFixed(9).replace(/\.?0+$/, "");
  return str.replace(".", ",");
}

export function formatDateID(dateStr: string | Date | undefined): string {
  if (!dateStr) return "-";
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return "-";
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateISO(dateStr: string | Date | undefined): string {
  if (!dateStr) return "";
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

export interface ValidationResult<T> {
  valid: boolean;
  value?: T;
  message?: string;
}

export function validateNIP(nip: string | number): ValidationResult<string> {
  if (!nip) return { valid: false, message: "NIP wajib diisi" };
  const cleaned = String(nip).trim();
  if (!/^\d{18}$/.test(cleaned)) {
    return { valid: false, message: "NIP harus 18 digit angka" };
  }
  return { valid: true, value: cleaned };
}

export function validateDate(dateStr: string): ValidationResult<string> {
  if (!dateStr) return { valid: false, message: "Tanggal wajib diisi" };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return { valid: false, message: "Format tanggal tidak valid" };
  }
  return { valid: true, value: formatDateISO(d) };
}

export function validateJenisKelamin(
  value: string
): ValidationResult<"L" | "P"> {
  const v = String(value).trim().toUpperCase();
  if (v === "L" || v === "P") {
    return { valid: true, value: v };
  }
  return { valid: false, message: "Jenis kelamin harus L atau P" };
}

const VALID_JABATAN = [
  "Asisten Ahli",
  "Lektor",
  "Lektor Kepala",
  "Profesor",
] as const;

export function validateJabatan(value: string) {
  const v = String(value).trim();
  const match = VALID_JABATAN.find(
    (j) => j.toLowerCase() === v.toLowerCase()
  );
  if (match) {
    return { valid: true, value: match };
  }
  return {
    valid: false,
    message: `Jabatan fungsional harus salah satu: ${VALID_JABATAN.join(", ")}`,
  };
}

export function validateRequired(value: unknown, fieldName: string) {
  const v = String(value || "").trim();
  if (!v) {
    return { valid: false, message: `${fieldName} wajib diisi` };
  }
  return { valid: true, value: v };
}

export interface PegawaiRowErrors {
  _rowIndex: number;
  errors: string[];
  originalData: Record<string, unknown>;
}

export interface PegawaiRowData {
  nip: string;
  nama_lengkap: string;
  no_karpeg: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: "L" | "P";
  pangkat_golongan: string;
  tmt_pangkat: string;
  jabatan_fungsional: (typeof VALID_JABATAN)[number];
  tmt_jabatan: string;
  unit_kerja: string;
}

export interface PegawaiRowResult {
  valid: boolean;
  errors: string[];
  data?: PegawaiRowData;
}

export function validatePegawaiRow(row: Record<string, unknown>): PegawaiRowResult {
  const errors: string[] = [];
  let data: PegawaiRowData | undefined;

  const nipResult = validateNIP(row.nip as string);
  if (!nipResult.valid) errors.push(nipResult.message || "NIP tidak valid");

  const namaResult = validateRequired(row.nama_lengkap, "Nama Lengkap");
  if (!namaResult.valid) errors.push(namaResult.message || "Nama tidak valid");

  const tempatResult = validateRequired(row.tempat_lahir, "Tempat Lahir");
  if (!tempatResult.valid)
    errors.push(tempatResult.message || "Tempat lahir tidak valid");

  const tglLahirResult = validateDate(row.tanggal_lahir as string);
  if (!tglLahirResult.valid)
    errors.push("Tanggal Lahir: " + (tglLahirResult.message || ""));

  const jkResult = validateJenisKelamin(row.jenis_kelamin as string);
  if (!jkResult.valid) errors.push(jkResult.message || "Jenis kelamin tidak valid");

  const pangkatResult = validateRequired(row.pangkat_golongan, "Pangkat/Golongan");
  if (!pangkatResult.valid)
    errors.push(pangkatResult.message || "Pangkat/Golongan tidak valid");

  const tmtPangkatResult = validateDate(row.tmt_pangkat as string);
  if (!tmtPangkatResult.valid)
    errors.push("TMT Pangkat: " + (tmtPangkatResult.message || ""));

  const jabatanResult = validateJabatan(row.jabatan_fungsional as string);
  if (!jabatanResult.valid)
    errors.push(jabatanResult.message || "Jabatan tidak valid");

  const tmtJabatanResult = validateDate(row.tmt_jabatan as string);
  if (!tmtJabatanResult.valid)
    errors.push("TMT Jabatan: " + (tmtJabatanResult.message || ""));

  const unitResult = validateRequired(row.unit_kerja, "Unit Kerja");
  if (!unitResult.valid) errors.push(unitResult.message || "Unit kerja tidak valid");

  if (
    errors.length === 0 &&
    nipResult.value &&
    namaResult.value &&
    tempatResult.value &&
    tglLahirResult.value &&
    jkResult.value &&
    pangkatResult.value &&
    tmtPangkatResult.value &&
    jabatanResult.value &&
    tmtJabatanResult.value &&
    unitResult.value
  ) {
    data = {
      nip: nipResult.value,
      nama_lengkap: namaResult.value,
      no_karpeg: String(row.no_karpeg || "").trim(),
      tempat_lahir: tempatResult.value,
      tanggal_lahir: tglLahirResult.value,
      jenis_kelamin: jkResult.value,
      pangkat_golongan: pangkatResult.value,
      tmt_pangkat: tmtPangkatResult.value,
      jabatan_fungsional: jabatanResult.value as PegawaiRowData["jabatan_fungsional"],
      tmt_jabatan: tmtJabatanResult.value,
      unit_kerja: unitResult.value,
    };
  }

  return {
    valid: errors.length === 0,
    errors,
    data,
  };
}

export function escapeHtml(text: unknown): string {
  if (text === null || text === undefined) return "";
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

export function excelDateToJS(serial: unknown): Date | null {
  if (!serial) return null;
  if (typeof serial === "string") {
    const d = new Date(serial);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof serial === "number") {
    const utcDays = Math.floor(serial - 25569);
    return new Date(utcDays * 86400 * 1000);
  }
  return null;
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay = 300
) {
  let timer: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function generateId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
  );
}

export function jenisKelaminLabel(value: string): string {
  return value === "L" ? "Laki-laki" : value === "P" ? "Perempuan" : "-";
}

import { JabatanFungsional, JABATAN_LIST } from "@/lib/constants";

export function getValidJabatan(
  jabatan: string | undefined
): JabatanFungsional | undefined {
  return JABATAN_LIST.includes(jabatan as JabatanFungsional)
    ? (jabatan as JabatanFungsional)
    : undefined;
}

export function normalizeJenisKelamin(value: string): "L" | "P" | undefined {
  const v = String(value || "").trim().toUpperCase();
  if (v === "L" || v === "LAKI-LAKI" || v === "LAKI") return "L";
  if (v === "P" || v === "PEREMPUAN") return "P";
  return undefined;
}

export function convertDateIDToISO(dateStr: string): string | undefined {
  if (!dateStr) return undefined;
  const cleaned = String(dateStr).trim();
  // Try DD/MM/YYYY
  const match = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  // Fallback: try ISO / standard date parse
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) {
    return formatDateISO(d);
  }
  return undefined;
}

export const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
