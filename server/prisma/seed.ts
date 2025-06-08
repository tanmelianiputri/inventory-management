import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function deleteAllData() {
  await prisma.expenseByCategory.deleteMany({});
  await prisma.sales.deleteMany({});
  await prisma.purchases.deleteMany({});
  await prisma.expenses.deleteMany({});
  await prisma.salesSummary.deleteMany({});
  await prisma.purchaseSummary.deleteMany({});
  await prisma.expenseSummary.deleteMany({});
  await prisma.users.deleteMany({});
  await prisma.products.deleteMany({});

  console.log("✅ All existing data deleted in correct order.");
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  await deleteAllData();

  const orderedFileNames = [
    "products.json",
    "users.json",
    "sales.json",
    "purchases.json",
    "expenses.json",
    "salesSummary.json",
    "purchaseSummary.json",
    "expenseSummary.json",
    "expenseByCategory.json"
  ];

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelName = path.basename(fileName, path.extname(fileName));
    const model = (prisma as any)[modelName];

    if (!model || typeof model.create !== "function") {
      console.error(`❌ No Prisma model matches the file name: ${fileName}`);
      continue;
    }

    for (const data of jsonData) {
      await model.create({ data });
    }

    console.log(`✅ Seeded ${modelName} with data from ${fileName}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
