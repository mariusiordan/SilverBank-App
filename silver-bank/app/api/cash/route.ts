import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

function getUserId(req: Request) {
  const cookie = req.headers.get("cookie");
  const token = cookie?.split("; ").find(c => c.startsWith("token="))?.split("=")[1];
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded?.userId ?? null;
}

export async function GET(req: Request) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entries = await prisma.cashEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(entries);
}

export async function POST(req: Request) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { description, amount, category } = await req.json();
  if (!description || !amount || !category)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const entry = await prisma.cashEntry.create({
    data: { description, amount: Number(amount), category, userId },
  });

  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(req: Request) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.cashEntry.deleteMany({ where: { id, userId } });
  return NextResponse.json({ message: "Deleted" });
}
