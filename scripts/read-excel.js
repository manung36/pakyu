const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const filePath = path.join(
  __dirname,
  "..",
  "data pegawai januari 2026.xls"
);

if (!fs.existsSync(filePath)) {
  console.error("File not found:", filePath);
  process.exit(1);
}

const workbook = XLSX.readFile(filePath, { cellDates: true });
console.log("Sheet names:", workbook.SheetNames);

workbook.SheetNames.forEach((sheetName) => {
  console.log("\n=== Sheet:", sheetName, "===");
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  console.log("Total rows:", jsonData.length);
  if (jsonData.length > 0) {
    console.log("Headers:", Object.keys(jsonData[0]));
    console.log("All rows:");
    console.log(JSON.stringify(jsonData, null, 2));
  }
});
