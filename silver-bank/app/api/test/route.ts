export async function GET() {
  console.log("JWT:", process.env.JWT_SECRET);
  return Response.json({ ok: true });
}

