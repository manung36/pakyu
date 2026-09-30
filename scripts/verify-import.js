require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const count = await sql.query(`SELECT COUNT(*) AS count FROM pegawai`);
  console.log("Total pegawai:", count[0]?.count);

  const sample = await sql.query(`SELECT nip, nama_lengkap, jenis_kelamin, tanggal_lahir, jabatan_fungsional, unit_kerja, status_aktif FROM pegawai LIMIT 5`);
  console.log("\nSample rows:");
  console.log(JSON.stringify(sample, null, 2));

  const jabatan = await sql.query(`SELECT jabatan_fungsional, COUNT(*) AS count FROM pegawai GROUP BY jabatan_fungsional ORDER BY count DESC`);
  console.log("\nJabatan distribution:");
  console.log(JSON.stringify(jabatan, null, 2));

  const status = await sql.query(`SELECT status_aktif, COUNT(*) AS count FROM pegawai GROUP BY status_aktif ORDER BY count DESC`);
  console.log("\nStatus aktif distribution:");
  console.log(JSON.stringify(status, null, 2));
}

main().catch(console.error);
