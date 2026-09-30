require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const result = await sql.query(
    `INSERT INTO pegawai (nip, nama_lengkap) VALUES ($1, $2) ON CONFLICT (nip) DO NOTHING`,
    ["123456789012345678", "Test Person"]
  );
  console.log("Result:", JSON.stringify(result, null, 2));

  const count = await sql.query(`SELECT COUNT(*) AS count FROM pegawai`);
  console.log("Count:", count);
}

main().catch(console.error);
