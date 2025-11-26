import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId = 1, toIban, amount } = body;

    if (!toIban || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // get sender
    const sender = await prisma.account.findFirst({
      where: { userId },
    });

    if (!sender) return NextResponse.json({ error: "Account not found" }, { status: 404 });
    if (sender.balance < amount)
      return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });

    // get receiver
    const receiver = await prisma.account.findFirst({
      where: { iban: toIban },
    });

    if (!receiver)
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 });

    // update sender
    await prisma.account.update({
      where: { id: sender.id },
      data: { balance: sender.balance - amount },
    });

    // update receiver
    await prisma.account.update({
      where: { id: receiver.id },
      data: { balance: receiver.balance + amount },
    });

    // create transactions
    await prisma.transaction.create({
      data: {
        type: "TRANSFER",
        amount,
        description: `Transfer to ${toIban}`,
        accountId: sender.id,
      },
    });

    await prisma.transaction.create({
      data: {
        type: "DEPOSIT",
        amount,
        description: `Transfer from ${sender.iban}`,
        accountId: receiver.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
