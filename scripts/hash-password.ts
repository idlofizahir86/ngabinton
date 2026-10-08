/**
 * Util: generate bcrypt hash (cost 10) untuk password admin.
 * Pakai: `pnpm tsx scripts/hash-password.ts <password>`
 */
import bcrypt from "bcryptjs";

async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error("Pakai: pnpm tsx scripts/hash-password.ts <password>");
    process.exit(1);
  }
  console.log(await bcrypt.hash(password, 10));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
