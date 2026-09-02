import { db } from "../src/lib/db";

async function main() {
  // Clear all assets for a clean real-time operational state
  const deleted = await db.asset.deleteMany({});
  console.log(`Cleared existing assets (${deleted.count} records removed). Database ready for real-time asset uploads.`);
}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
