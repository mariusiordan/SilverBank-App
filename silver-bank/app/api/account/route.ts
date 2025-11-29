import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request) {
  try {
    // 1. Extract cookie token
    const token = req.headers
      .get("cookie")
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    // 2. Verify token
    const decoded: any = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 3. Fetch user → account → transactions (correct relations)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        accounts: {
          include: { transactions: true },
        },
      },
    });

    if (!user || user.accounts.length === 0) {
      return NextResponse.json(
        { error: "No account found" },
        { status: 404 }
      );
    }

    // Return the first account (you can later support multiple)
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      account: user.accounts[0],
    });
  } catch (err) {
    console.error("Account API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

