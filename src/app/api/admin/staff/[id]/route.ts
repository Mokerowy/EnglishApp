import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { getToken } from "next-auth/jwt";
import bcrypt from "bcryptjs";

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

function generatePassword() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let pass = "";
  for (let i = 0; i < 12; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET || "super_secret_key_for_dev_only" });
    if (!token || token.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Wystąpił błąd przy usuwaniu" }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET || "super_secret_key_for_dev_only" });
    if (!token || token.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const resolvedParams = await context.params;
    const { id } = resolvedParams;

    // We generate a new password, save it, and return the raw one to show to the admin
    const rawPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({
      success: true,
      newPassword: rawPassword
    });

  } catch (error) {
    return NextResponse.json({ error: "Wystąpił błąd przy resetowaniu hasła" }, { status: 500 });
  }
}
