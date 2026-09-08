import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { getToken } from "next-auth/jwt";

function getDirectUrl(url: string | undefined): string | undefined {
  if (url && url.startsWith("prisma+postgres://") && url.includes("api_key=")) {
    try {
      const b64 = url.split("api_key=")[1];
      const decoded = Buffer.from(b64, "base64").toString("utf-8");
      return JSON.parse(decoded).databaseUrl;
    } catch (e) { return url; }
  }
  return url;
}

const pool = new Pool({ connectionString: getDirectUrl(process.env.DATABASE_URL) });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function POST(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET || "super_secret_key_for_dev_only" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ message: "Brak uprawnień" }, { status: 403 });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "Brak ID użytkownika" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: true },
    });

    return NextResponse.json({ message: "Użytkownik zatwierdzony", user }, { status: 200 });
  } catch (error) {
    console.error("Błąd podczas zatwierdzania:", error);
    return NextResponse.json({ message: "Wystąpił błąd" }, { status: 500 });
  }
}
