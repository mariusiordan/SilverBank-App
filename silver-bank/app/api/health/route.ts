import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Verificăm că baza de date răspunde
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
      version: process.env.APP_VERSION || "1.0.0",
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({
      status: "error",
      database: "disconnected",
    }, { status: 503 });
  }
}
