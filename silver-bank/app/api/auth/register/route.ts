import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let name = "", email = "", password = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      name = body.name; email = body.email; password = body.password;
    } else {
      const form = await req.formData();
      name = String(form.get("name")); email = String(form.get("email")); password = String(form.get("password"));
    }

    if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name, email, password: hashed,
        accounts: {
          create: {
            iban: "GB" + Math.floor(Math.random() * 9000000000 + 1000000000).toString(),
            balance: 1000, // ✅ Welcome bonus
            bonusGranted: true,
            transactions: {
              create: {
                type: "DEPOSIT",
                amount: 1000,
                description: "🎉 Welcome Bonus — Thanks for joining SilverBank!",
              }
            }
          },
        },
      },
    });

    return NextResponse.json({ message: "Account created" }, { status: 201 });
  } catch  {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}