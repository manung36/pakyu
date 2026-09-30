"use client";

import * as XLSX from "xlsx";
import { COLUMN_MAP, Pegawai, PegawaiInput } from "@/lib/constants";
import { DB } from "@/lib/db";
import {
  excelDateToJS,
  formatDateISO,
  validatePegawaiRow,
  PegawaiRowResult,
} from "@/lib/utils";

export interface MappedRow extends Record<string, unknown> {
  _rowIndex: number;
}

export interface ConflictRow {
  newData: PegawaiInput & { _rowIndex: number };
  existingData: Pegawai;
}

export interface ImportResult {
  addedCount: number;
  updatedCount: number;
  skippedCount: number;
  errors: { row: number; error: string }[];
}

export async function parseExcel(file: File): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error("Ukuran file melebihi batas 10MB"));
      return;
    }

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (
      !validTypes.includes(file.type) &&
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls")
    ) {
      reject(
        new Error("Format file tidak valid. Silakan gunakan file .xlsx")
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (jsonData.length === 0) {
          reject(new Error("File Excel kosong atau tidak ada data"));
          return;
        }

        resolve(jsonData);
      } catch (err) {
        reject(
          new Error(
            "Gagal membaca file Excel: " +
              (err instanceof Error ? err.message : String(err))
          )
        );
      }
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsArrayBuffer(file);
  });
}

export function mapRows(rawRows: unknown[]): MappedRow[] {
  return rawRows.map((row, index) => {
    const mapped: MappedRow = { _rowIndex: index + 2 };

    for (const [excelCol, dbField] of Object.entries(COLUMN_MAP)) {
      const r = row as Record<string, unknown>;
      if (r[excelCol] !== undefined) {
        let value: unknown = r[excelCol];

        if (
          ["tanggal_lahir", "tmt_pangkat", "tmt_jabatan"].includes(dbField)
        ) {
          const dateObj = excelDateToJS(value);
          if (dateObj) {
            value = formatDateISO(dateObj);
          } else if (typeof value === "string") {
            value = value.trim();
          }
        }

        if (dbField === "nip") {
          value = String(value).replace(/\.0$/, "").trim();
        }

        mapped[dbField] = value;
      }
    }

    return mapped;
  });
}

export interface ValidatedRows {
  validRows: MappedRow[];
  invalidRows: MappedRow[];
}

export function validateRows(mappedRows: MappedRow[]): {
  validRows: (MappedRow & PegawaiRowResult["data"])[];
  invalidRows: MappedRow[];
} {
  const validRows: (MappedRow & PegawaiRowResult["data"])[] = [];
  const invalidRows: MappedRow[] = [];

  mappedRows.forEach((row) => {
    const result = validatePegawaiRow(row);
    if (result.valid && result.data) {
      validRows.push({ ...result.data, _rowIndex: row._rowIndex });
    } else {
      invalidRows.push(row);
    }
  });

  return { validRows, invalidRows };
}

export async function checkConflicts(validRows: MappedRow[]) {
  const newRows: (PegawaiInput & { _rowIndex: number })[] = [];
  const conflictRows: ConflictRow[] = [];

  for (const row of validRows) {
    const { _rowIndex, ...data } = row as PegawaiInput & {
      _rowIndex: number;
    };
    const existing = await DB.getPegawaiByNIP(data.nip);
    if (existing) {
      conflictRows.push({
        newData: { ...data, _rowIndex },
        existingData: existing,
      });
    } else {
      newRows.push({ ...data, _rowIndex });
    }
  }

  return { newRows, conflictRows };
}

export async function executeImport(
  newRows: (PegawaiInput & { _rowIndex: number })[],
  conflictRows: ConflictRow[] = [],
  conflictAction: "skip" | "update" = "skip"
): Promise<ImportResult> {
  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  const errors: { row: number; error: string }[] = [];

  for (const row of newRows) {
    try {
      const { _rowIndex, ...data } = row;
      await DB.addPegawai(data);
      addedCount++;
    } catch (err) {
      errors.push({
        row: row._rowIndex,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  for (const conflict of conflictRows) {
    if (conflictAction === "update") {
      try {
        const { _rowIndex, ...newData } = conflict.newData;
        const updatedData = { ...conflict.existingData, ...newData };
        await DB.updatePegawai(updatedData);
        updatedCount++;
      } catch (err) {
        errors.push({
          row: conflict.newData._rowIndex,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    } else {
      skippedCount++;
    }
  }

  return { addedCount, updatedCount, skippedCount, errors };
}

export function generateErrorLog(
  invalidRows: MappedRow[]
): void {
  const headers = ["Baris", "Kesalahan"];
  const rows = invalidRows.map((r) => [
    String(r._rowIndex),
    `"${(r.errors as string[] | undefined)?.join("; ") || ""}"`,
  ]);

  let csv = headers.join(",") + "\n";
  rows.forEach((r) => {
    csv += r.join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `import_error_log_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
