import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
       accounts: {
  create: {
    iban: "GB" + Math.floor(Math.random() * 9999999999),
    balance: 1000,
    bonusGranted: true,
    transactions: {
      create: [
        {
          type: "DEPOSIT",
          amount: 200,
          description: "🎁 Welcome Bonus",
        },
        {
          type: "DEPOSIT",
          amount: 100,
          description: "🎉 Free Cashback",
        },
        {
          type: "DEPOSIT",
          amount: 50,
          description: "🏦 New Account Reward",
        },
      ],
    },
  },
},

      },
      include: { accounts: true },
    });

    const token = signToken({ userId: user.id });

    const res = NextResponse.json({ message: "Registered", user });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
