import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";

function isFormRequest(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  return contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data");
}


export async function POST(req: Request) {
  try {
    let name = "";
    let email = "";
    let password = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await req.json();
      name = data.name;
      email = data.email;
      password = data.password;
    } else {
      const form = await req.formData();
      name = String(form.get("name"));
      email = String(form.get("email"));
      password = String(form.get("password"));
    }

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
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
                { type: "DEPOSIT", amount: 200, description: "🎁 Welcome Bonus" },
                { type: "DEPOSIT", amount: 100, description: "🎉 Free Cashback" },
                { type: "DEPOSIT", amount: 50, description: "🏦 New Account Reward" },
              ]
            }
          },
        },
      },
      include: { accounts: true },
    });

    const token = signToken({ userId: user.id });

   // IMPORTANT: form submit -> redirect to /account
    const res = isFormRequest(req)
      ? NextResponse.redirect(new URL("/account", req.url))
      : NextResponse.json({ message: "Registered", user });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // ✅ Redirect to account
    res.headers.set("Location", "/account");

    return res;
  } catch (err: any) {
      if (isFormRequest(req)) {
        return NextResponse.redirect(new URL("/signup?error=server_error", req.url));
      }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
