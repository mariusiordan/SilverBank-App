import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    // TOKEN
    const cookie = req.headers.get("cookie");
    const token = cookie
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    const decoded = verifyToken(token || "");
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = decoded.userId;

    // BODY
    const { toIban, amount } = await req.json();
    if (!toIban || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid transfer data" }, { status: 400 });
    }

    // SENDER ACCOUNT
    const senderAccount = await prisma.account.findFirst({
      where: { userId },
    });

    if (!senderAccount)
      return NextResponse.json({ error: "Sender account not found" }, { status: 404 });

    if (senderAccount.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // RECEIVER ACCOUNT
    const receiverAccount = await prisma.account.findFirst({
      where: { iban: toIban },
    });

    if (!receiverAccount)
      return NextResponse.json({ error: "Recipient IBAN not found" }, { status: 404 });

    // UPDATE BALANCES
    await prisma.$transaction([
      prisma.account.update({
        where: { id: senderAccount.id },
        data: { balance: { decrement: amount } },
      }),
      prisma.account.update({
        where: { id: receiverAccount.id },
        data: { balance: { increment: amount } },
      }),

      // LOG SENDER (withdraw)
      prisma.transaction.create({
        data: {
          type: "WITHDRAW",
          amount,
          description: `Transfer to ${toIban}`,
          accountId: senderAccount.id,
        },
      }),

      // LOG RECEIVER (deposit)
      prisma.transaction.create({
        data: {
          type: "DEPOSIT",
          amount,
          description: `Received from ${senderAccount.iban}`,
          accountId: receiverAccount.id,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
