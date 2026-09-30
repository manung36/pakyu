const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const filePath = path.join(__dirname, "..", "data pegawai januari 2026.xls");
const workbook = XLSX.readFile(filePath, { cellDates: true });
const sheet = workbook.Sheets["Data SIHURA"];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

function uniqueValues(key, limit = 50) {
  const values = new Set();
  rows.forEach((r) => values.add(String(r[key] || "").trim()));
  return Array.from(values).slice(0, limit);
}

function countValues(key) {
  const counts = {};
  rows.forEach((r) => {
    const v = String(r[key] || "").trim();
    counts[v] = (counts[v] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);
}

console.log("Total rows:", rows.length);
console.log("\n=== JENKEL ===");
console.log(countValues("JENKEL"));
console.log("\n=== FUNGSIONAL DOSEN ===");
console.log(countValues("FUNGSIONAL DOSEN"));
console.log("\n=== GOL ===");
console.log(countValues("GOL"));
console.log("\n=== NAMAGOLONGAN ===");
console.log(countValues("NAMAGOLONGAN"));
console.log("\n=== STATUSAKTIF ===");
console.log(countValues("STATUSAKTIF"));
console.log("\n=== JENIS ===");
console.log(countValues("JENIS"));
console.log("\n=== Sample TGL LAHIR ===");
console.log(uniqueValues("TGL LAHIR", 10));
console.log("\n=== Sample TMTGOL ===");
console.log(uniqueValues("TMTGOL", 10));
console.log("\n=== Sample TMTFUNGSIONAL ===");
console.log(uniqueValues("TMTFUNGSIONAL", 10));
