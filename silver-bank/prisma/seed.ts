import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 1️⃣ Create demo user
  const user = await prisma.user.create({
    data: {
      email: "demo@silverbank.com",
      password: "test1234",
      name: "Demo User",
    },
  });

  // 2️⃣ Create main account
  const account = await prisma.account.create({
    data: {
      iban: "SB00-NEW-0001",
      balance: 5000,
      userId: user.id,
      bonusGranted: true,
    },
  });

  // 3️⃣ Add demo + bonus transactions
  await prisma.transaction.createMany({
    data: [
      // BONUS TRANSACTIONS
       {
      type: "DEPOSIT",
      amount: 200,
      description: "🎁 Welcome Bonus",
      accountId: account.id,
    },
    {
      type: "DEPOSIT",
      amount: 100,
      description: "🎉 Free Cashback",
      accountId: account.id,
    },
    {
      type: "DEPOSIT",
      amount: 50,
      description: "🏦 New Account Reward",
      accountId: account.id,
    },

      // REALISTIC HISTORY
      {
        type: "DEPOSIT",
        amount: 2500,
        description: "Salary",
        accountId: account.id,
      },
      {
        type: "WITHDRAW",
        amount: 280,
        description: "Groceries",
        accountId: account.id,
      },
      {
        type: "DEPOSIT",
        amount: 320,
        description: "Side Project",
        accountId: account.id,
      },
      {
        type: "TRANSFER",
        amount: 200,
        description: "Sent to friend",
        accountId: account.id,
      },
      {
        type: "WITHDRAW",
        amount: 120,
        description: "Coffee & Snacks",
        accountId: account.id,
      },
    ],
  });

  console.log("🌱 Seed finished!");
}

main().finally(() => prisma.$disconnect());
