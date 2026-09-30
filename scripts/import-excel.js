require("dotenv").config();
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { neon } = require("@neondatabase/serverless");

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not defined");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const filePath = path.join(__dirname, "..", "data pegawai januari 2026.xls");

function normalizeJenisKelamin(value) {
  const v = String(value || "").trim().toUpperCase();
  if (v === "L" || v === "LAKI-LAKI" || v === "LAKI") return "L";
  if (v === "P" || v === "PEREMPUAN") return "P";
  return null;
}

function convertDate(dateStr) {
  if (!dateStr) return null;
  const cleaned = String(dateStr).trim();
  const match = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }
  return null;
}

function cleanString(value) {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s.length > 0 ? s : null;
}

function mapRow(row) {
  return {
    nip: cleanString(row["NIP"]),
    nama_lengkap: cleanString(row["NAMA"]),
    gelar_depan: cleanString(row["GELARDEP"]),
    gelar_belakang: cleanString(row["GELARBEL"]),
    no_karpeg: cleanString(row["KARPEG"]),
    tempat_lahir: cleanString(row["TEMPAT LAHIR"]),
    tanggal_lahir: convertDate(row["TGL LAHIR"]),
    jenis_kelamin: normalizeJenisKelamin(row["JENKEL"]),
    pangkat_golongan: cleanString(row["GOL"]),
    tmt_pangkat: convertDate(row["TMTGOL"]),
    jabatan_fungsional: cleanString(row["FUNGSIONAL DOSEN"]),
    tmt_jabatan: convertDate(row["TMTFUNGSIONAL"]),
    unit_kerja: cleanString(row["UNIT KERJA"]),
    subunit_kerja: cleanString(row["SUBUNITKERJA"]),
    homebase: cleanString(row["HOMEBASE"]),
    status: cleanString(row["STATUS"]),
    status_aktif: cleanString(row["STATUSAKTIF"]),
    substatus: cleanString(row["SUBSTATUS"]),
    jenis: cleanString(row["JENIS"]),
    gol: cleanString(row["GOL"]),
    nama_golongan: cleanString(row["NAMAGOLONGAN"]),
    nidn: cleanString(row["NIDN"]),
    nip_lama: cleanString(row["NIP LAMA"]),
    nik: cleanString(row["NIK"]),
    no_hp: cleanString(row["NO HP"]),
    email: cleanString(row["EMAIL1"]),
    alamat: cleanString(row["ALAMAT"]),
    npwp: cleanString(row["NPWP"]),
    agama: cleanString(row["AGAMA"]),
    marital: cleanString(row["MARITAL"]),
  };
}

function buildBatchInsertQuery(rows) {
  const columns = [
    "nip", "nama_lengkap", "gelar_depan", "gelar_belakang", "no_karpeg",
    "tempat_lahir", "tanggal_lahir", "jenis_kelamin", "pangkat_golongan",
    "tmt_pangkat", "jabatan_fungsional", "tmt_jabatan", "unit_kerja",
    "subunit_kerja", "homebase", "status", "status_aktif", "substatus",
    "jenis", "gol", "nama_golongan", "nidn", "nip_lama", "nik", "no_hp",
    "email", "alamat", "npwp", "agama", "marital",
  ];

  const params = [];
  const placeholders = [];

  rows.forEach((row, rowIndex) => {
    const rowPlaceholders = [];
    columns.forEach((col) => {
      params.push(row[col]);
      rowPlaceholders.push(`$${params.length}`);
    });
    placeholders.push(`(${rowPlaceholders.join(", ")})`);
  });

  const query = `
    INSERT INTO pegawai (${columns.join(", ")})
    VALUES ${placeholders.join(", ")}
    ON CONFLICT (nip) DO NOTHING
  `;

  return { query, params };
}

async function main() {
  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    process.exit(1);
  }

  console.log("Reading Excel file...");
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const sheet = workbook.Sheets["Data SIHURA"];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  console.log(`Found ${rawRows.length} rows`);

  const mappedRows = rawRows
    .map(mapRow)
    .filter((r) => r.nip && r.nama_lengkap);

  console.log(`Mapped ${mappedRows.length} valid rows`);

  const countBefore = await sql.query(`SELECT COUNT(*) AS count FROM pegawai`);
  const countBeforeNum = Number(countBefore[0]?.count || 0);
  console.log(`Rows before import: ${countBeforeNum}`);

  const batchSize = 500;
  let errors = 0;

  for (let i = 0; i < mappedRows.length; i += batchSize) {
    const batch = mappedRows.slice(i, i + batchSize);
    try {
      const { query, params } = buildBatchInsertQuery(batch);
      await sql.query(query, params);
      console.log(`Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(mappedRows.length / batchSize)}: ${batch.length} rows processed`);
    } catch (err) {
      errors += batch.length;
      console.error(`Error in batch ${Math.floor(i / batchSize) + 1}:`, err.message);
    }
  }

  const countAfter = await sql.query(`SELECT COUNT(*) AS count FROM pegawai`);
  const countAfterNum = Number(countAfter[0]?.count || 0);
  const inserted = countAfterNum - countBeforeNum;
  const skipped = mappedRows.length - inserted;

  console.log("\nImport complete:");
  console.log(`  Rows before: ${countBeforeNum}`);
  console.log(`  Rows after: ${countAfterNum}`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Skipped (duplicate NIP or empty): ${skipped}`);
  console.log(`  Errors: ${errors}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
