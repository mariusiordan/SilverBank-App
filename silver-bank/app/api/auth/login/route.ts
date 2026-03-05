import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    let email = "";
    let password = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      email = body.email;
      password = body.password;
    } else {
      const form = await req.formData();
      email = String(form.get("email"));
      password = String(form.get("password"));
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: "Wrong password" }, { status: 401 });

    const token = signToken({ userId: user.id });

    // ✅ Returnează JSON în loc de redirect
    const res = NextResponse.json({ message: "Login successful" }, { status: 200 });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}