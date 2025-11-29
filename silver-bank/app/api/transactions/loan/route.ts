import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    const token = req.headers.get("cookie")
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { accounts: true },
    });

    if (!user || user.accounts.length === 0)
      return NextResponse.json({ error: "Account not found" }, { status: 404 });

    const account = user.accounts[0];

    // Loan must be <= 10x deposits
    const deposits = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { accountId: account.id, type: "DEPOSIT" },
    });

    if ((deposits._sum.amount ?? 0) * 10 < amount)
      return NextResponse.json(
        { error: "Loan not approved — insufficient deposit history" },
        { status: 400 }
      );

    await prisma.$transaction([
      prisma.account.update({
        where: { id: account.id },
        data: { balance: account.balance + amount },
      }),

      prisma.transaction.create({
        data: {
          type: "DEPOSIT",
          amount,
          description: "Loan approved",
          accountId: account.id,
        },
      }),
    ]);

    return NextResponse.json({ message: "Loan approved" });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
