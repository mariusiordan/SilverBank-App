import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie");
    const token = cookie
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    const decoded = verifyToken(token || "");
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount } = await req.json();
    if (!amount || amount <= 0)
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    const userId = decoded.userId;

    const account = await prisma.account.findFirst({ where: { userId } });
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    await prisma.$transaction([
      prisma.account.update({
        where: { id: account.id },
        data: { balance: { increment: amount } },
      }),

      prisma.transaction.create({
        data: {
          type: "DEPOSIT",
          amount,
          description: "Loan Approved",
          accountId: account.id,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch  {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
