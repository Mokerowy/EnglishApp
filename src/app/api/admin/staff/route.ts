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

function generateLogin(firstName: string, lastName: string) {
  // e.g. j.kowalski
  const clean = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
  return `${clean(firstName.charAt(0))}.${clean(lastName)}`;
}

export async function GET(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET || "super_secret_key_for_dev_only" });
    if (!token || token.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const teachers = await prisma.user.findMany({
      where: { role: "TEACHER" },
      orderBy: { createdAt: "desc" },
      select: { id: true, firstName: true, lastName: true, login: true, email: true, createdAt: true, isActive: true }
    });

    return NextResponse.json(teachers);
  } catch (error) {
    return NextResponse.json({ error: "Wystąpił błąd" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET || "super_secret_key_for_dev_only" });
    if (!token || token.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { firstName, lastName, email } = await req.json();

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "Imię i nazwisko są wymagane" }, { status: 400 });
    }

    let baseLogin = generateLogin(firstName, lastName);
    let login = baseLogin;
    let counter = 1;
    
    // Ensure unique login
    while (await prisma.user.findUnique({ where: { login } })) {
      login = `${baseLogin}${counter}`;
      counter++;
    }

    const rawPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email || null,
        login,
        password: hashedPassword,
        role: "TEACHER",
        isActive: true, // Kadra dodawana przez admina jest od razu aktywna
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        login: newUser.login,
      },
      credentials: {
        login: newUser.login,
        password: rawPassword // Zwracamy to tylko raz!
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Wystąpił błąd podczas dodawania" }, { status: 500 });
  }
}
