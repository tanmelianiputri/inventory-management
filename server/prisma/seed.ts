import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const modelMap = {
  sales: prisma.sales,
  purchases: prisma.purchases,
  expensebycategory: prisma.expenseByCategory,
  expenses: prisma.expenses,
  salessummary: prisma.salesSummary,
  purchasesummary: prisma.purchaseSummary,
  expensesummary: prisma.expenseSummary,
  users: prisma.users,
  products: prisma.products,
};

type ModelKey = keyof typeof modelMap;

const deleteOrder: ModelKey[] = [
  "sales",
  "purchases",
  "expensebycategory",
  "expenses",
  "salessummary",
  "purchasesummary",
  "expensesummary",
  "users",
  "products",
];

async function deleteAllDataInOrder() {
  for (const name of deleteOrder) {
    const model = modelMap[name];
    await (model as { deleteMany: (args?: any) => Promise<any> }).deleteMany({});
    console.log(`✅ Cleared data from ${name}`);
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  await deleteAllDataInOrder();

  for (const name of [...deleteOrder].reverse()) {
    const filePath = path.join(dataDirectory, `${name}.json`);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File ${name}.json not found, skipping.`);
      continue;
    }

    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const model = modelMap[name];

    for (const data of jsonData) {
      await (model as { create: (args: any) => Promise<any> }).create({ data });
    }

    console.log(`✅ Seeded ${name} with ${jsonData.length} records`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });