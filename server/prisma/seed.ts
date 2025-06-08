import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
const prisma = new PrismaClient();

// Deletion must occur in the correct order due to FK constraints
const orderedFileNames = [
  "sales.json",
  "purchases.json",
  "expenseByCategory.json", // depends on expenseSummary
  "expenses.json",
  "salesSummary.json",
  "purchaseSummary.json",
  "expenseSummary.json",
  "users.json",
  "products.json" // must be last
];

async function deleteAllData(fileNames: string[]) {
  // Convert file names to model names (capitalize)
  const modelNames = fileNames.map((fileName) => {
    const modelName = path.basename(fileName, path.extname(fileName));
    return modelName.charAt(0).toUpperCase() + modelName.slice(1);
  });

  for (const modelName of modelNames) {
    const model = prisma[modelName as keyof typeof prisma];
    if (model && typeof model.deleteMany === "function") {
      try {
        await model.deleteMany({});
        console.log(`✅ Cleared data from ${modelName}`);
      } catch (error) {
        console.error(`❌ Failed to delete ${modelName}:`, error);
      }
    } else {
      console.error(`❌ Model ${modelName} not found`);
    }
  }
}

async function seedAllData(fileNames: string[]) {
  const dataDirectory = path.join(__dirname, "seedData");

  for (const fileName of fileNames) {
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelName = path.basename(fileName, path.extname(fileName));
    const model = prisma[modelName as keyof typeof prisma];

    if (!model || typeof model.create !== "function") {
      console.error(`❌ No matching Prisma model for file: ${fileName}`);
      continue;
    }

    for (const data of jsonData) {
      try {
        await model.create({ data });
      } catch (error) {
        console.error(`❌ Failed to insert into ${modelName}:`, error);
      }
    }

    console.log(`✅ Seeded ${modelName} with data from ${fileName}`);
  }
}

async function main() {
  await deleteAllData(orderedFileNames);
  await seedAllData(orderedFileNames);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
