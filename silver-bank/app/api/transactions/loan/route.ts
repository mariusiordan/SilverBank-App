import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId = 1, amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const account = await prisma.account.findFirst({
      where: { userId },
    });

    if (!account)
      return NextResponse.json({ error: "Account not found" }, { status: 404 });

    const updated = await prisma.account.update({
      where: { id: account.id },
      data: { balance: account.balance + amount },
    });

    await prisma.transaction.create({
      data: {
        type: "DEPOSIT",
        amount,
        description: "Loan approved",
        accountId: account.id,
      },
    });

    return NextResponse.json({ ok: true, balance: updated.balance });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
