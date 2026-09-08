import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
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

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName, role } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ message: "Wypełnij wszystkie pola" }, { status: 400 });
    }

    // Sprawdź czy użytkownik już istnieje
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Użytkownik o tym adresie e-mail już istnieje" }, { status: 409 });
    }

    // Szyfrowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10);

    // Utworzenie użytkownika
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: "STUDENT", 
        isActive: false, // Wymaga zatwierdzenia przez administratora
      },
    });

    return NextResponse.json({ message: "Konto zostało utworzone", user: { email: user.email } }, { status: 201 });
  } catch (error) {
    console.error("Błąd rejestracji:", error);
    return NextResponse.json({ message: "Wystąpił błąd podczas rejestracji" }, { status: 500 });
  }
}
