import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie");
  const token = cookie
    ?.split("; ")
    .find(c => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: {
      accounts: {
        include: { transactions: true },
      },
    },
  });

  if (!user || user.accounts.length === 0) {
    return NextResponse.json({ error: "No account found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    account: user.accounts[0],
  });
}

