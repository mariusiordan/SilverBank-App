import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function DELETE(req: Request) {
  try {
    const token = req.headers.get("cookie")
      ?.split("; ")
      .find(c => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Delete user's accounts and transactions
    await prisma.transaction.deleteMany({
      where: { account: { userId: decoded.userId } },
    });

    await prisma.account.deleteMany({
      where: { userId: decoded.userId },
    });

    await prisma.user.delete({
      where: { id: decoded.userId },
    });

    const res = NextResponse.json({ message: "Account deleted" });

    // Remove token cookie
    res.cookies.set("token", "", { maxAge: 0 });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: "Server error: " + err.message }, { status: 500 });
  }
}
