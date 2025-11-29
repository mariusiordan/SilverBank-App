import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { toIban, amount } = await req.json();

    // 1. Verify token
    const token = req.headers.get("cookie")
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // 2. Fetch sender
    const sender = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { accounts: true },
    });

    if (!sender || sender.accounts.length === 0)
      return NextResponse.json({ error: "Sender account not found" }, { status: 404 });

    const senderAccount = sender.accounts[0];

    // 3. Fetch recipient
    const receiverAccount = await prisma.account.findUnique({
      where: { iban: toIban },
    });

    if (!receiverAccount)
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });

    // 4. Check balance
    if (senderAccount.balance < amount)
      return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });

    // 5. Execute transfer
    await prisma.$transaction([
      prisma.account.update({
        where: { id: senderAccount.id },
        data: { balance: senderAccount.balance - amount },
      }),

      prisma.account.update({
        where: { id: receiverAccount.id },
        data: { balance: receiverAccount.balance + amount },
      }),

      prisma.transaction.create({
        data: {
          type: "TRANSFER",
          amount,
          description: `Transfer to ${toIban}`,
          accountId: senderAccount.id,
        },
      }),

      prisma.transaction.create({
        data: {
          type: "DEPOSIT",
          amount,
          description: `Transfer from ${senderAccount.iban}`,
          accountId: receiverAccount.id,
        },
      }),
    ]);

    return NextResponse.json({ message: "Transfer completed" });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
