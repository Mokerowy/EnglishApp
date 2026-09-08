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

export async function GET(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET || "super_secret_key_for_dev_only" });
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ message: "Brak uprawnień" }, { status: 403 });
    }

    const pendingUsers = await prisma.user.findMany({
      where: {
        isActive: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(pendingUsers, { status: 200 });
  } catch (error) {
    console.error("Błąd podczas pobierania oczekujących:", error);
    return NextResponse.json({ message: "Wystąpił błąd" }, { status: 500 });
  }
}
