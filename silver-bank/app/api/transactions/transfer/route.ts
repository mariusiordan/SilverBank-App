import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("cookie")
      ?.split("; ").find(c => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

    const decoded: any = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { toIban, amount } = await req.json();

    if (!toIban || !amount) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Find sender & receiver
    const sender = await prisma.account.findFirst({ where: { userId: decoded.userId }});
    const receiver = await prisma.account.findUnique({ where: { iban: toIban }});

    if (!sender) return NextResponse.json({ error: "Sender not found" }, { status: 404 });
    if (!receiver) return NextResponse.json({ error: "Receiver not found" }, { status: 404 });

    if (sender.balance < amount) {
      return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
    }

    // Perform transfer
    await prisma.$transaction([
      prisma.account.update({
        where: { id: sender.id },
        data: { balance: sender.balance - amount }
      }),
      prisma.account.update({
        where: { id: receiver.id },
        data: { balance: receiver.balance + amount }
      }),
      prisma.transaction.create({
        data: {
          type: "TRANSFER",
          amount,
          description: `Transfer to ${toIban}`,
          accountId: sender.id
        }
      }),
      prisma.transaction.create({
        data: {
          type: "DEPOSIT",
          amount,
          description: `Received from ${sender.iban}`,
          accountId: receiver.id
        }
      })
    ]);

    return NextResponse.json({ success: true });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
