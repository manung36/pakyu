require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { neon } = require("@neondatabase/serverless");

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not defined");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function main() {
  const schemaPath = path.join(__dirname, "..", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  // Split by semicolon to run statements individually
  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    try {
      await sql.query(statement);
      console.log("Executed statement successfully");
    } catch (err) {
      console.error("Error executing statement:", err.message);
      console.error(statement);
      process.exit(1);
    }
  }

  console.log("Schema initialized successfully");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
