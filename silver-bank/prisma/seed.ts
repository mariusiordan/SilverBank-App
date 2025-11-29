import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Demo user
  const user = await prisma.user.create({
    data: {
      email: "demo@silverbank.com",
      password: "test1234",
      name: "Demo User",
    },
  });

  // GB account
  const account = await prisma.account.create({
    data: {
      iban: "GB00-SILVER-" + Math.floor(100000 + Math.random() * 900000),
      balance: 5000,
      userId: user.id,
    },
  });

  // Transactions
  await prisma.transaction.createMany({
    data: [
      // Welcome bonuses
      {
        type: "DEPOSIT",
        amount: 300,
        description: "🎁 Welcome Gift",
        accountId: account.id,
      },
      {
        type: "DEPOSIT",
        amount: 100,
        description: "🎉 Cashback Reward",
        accountId: account.id,
      },

      // History samples
      {
        type: "DEPOSIT",
        amount: 2500,
        description: "Monthly Salary",
        accountId: account.id,
      },
      {
        type: "WITHDRAW",
        amount: 180,
        description: "Groceries",
        accountId: account.id,
      },
      {
        type: "TRANSFER",
        amount: 250,
        description: "Sent to friend",
        accountId: account.id,
      },
      {
        type: "WITHDRAW",
        amount: 60,
        description: "Coffee & Snacks",
        accountId: account.id,
      },
    ],
  });

  console.log("🌱 Seed finished!");
}

main().finally(() => prisma.$disconnect());
