import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. User demo
  const user = await prisma.user.create({
    data: {
      email: "demo@silverbank.com",
      password: "test1234", // îl hash-uim mai târziu
      name: "Demo User",
    },
  });

  // 2. Cont demo
  const account = await prisma.account.create({
    data: {
      iban: "SB01-2025-998877",
      balance: 4200,
      userId: user.id,
    },
  });

  // 3. Tranzacții demo
  await prisma.transaction.createMany({
    data: [
      {
        type: "DEPOSIT",
        amount: 2000,
        description: "Salary",
        accountId: account.id,
      },
      {
        type: "DEPOSIT",
        amount: 500,
        description: "Freelance project",
        accountId: account.id,
      },
      {
        type: "WITHDRAW",
        amount: 150,
        description: "Groceries",
        accountId: account.id,
      },
      {
        type: "TRANSFER",
        amount: 300,
        description: "Sent to friend",
        accountId: account.id,
      },
      {
        type: "DEPOSIT",
        amount: 350,
        description: "Bonus",
        accountId: account.id,
      },
    ],
  });

  console.log("🌱 Seed completed successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());

