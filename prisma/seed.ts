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

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const teacherPassword = await bcrypt.hash("teacher123", 10);
  const studentPassword = await bcrypt.hash("student123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@effectiveenglish.pl" },
    update: {
      role: "ADMIN",
      isActive: true,
      password: adminPassword,
      login: "admin",
    },
    create: {
      email: "admin@effectiveenglish.pl",
      login: "admin",
      firstName: "Szef",
      lastName: "Właściciel",
      role: "ADMIN",
      password: adminPassword,
      isActive: true,
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "nauczyciel@effectiveenglish.pl" },
    update: {
      login: "nauczyciel",
      password: teacherPassword,
    },
    create: {
      email: "nauczyciel@effectiveenglish.pl",
      login: "nauczyciel",
      firstName: "Jan",
      lastName: "Nauczycielski",
      role: "TEACHER",
      password: teacherPassword,
      isActive: true,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "uczen@effectiveenglish.pl" },
    update: {
      login: "uczen",
      password: studentPassword,
    },
    create: {
      email: "uczen@effectiveenglish.pl",
      login: "uczen",
      firstName: "Piotr",
      lastName: "Uczniowski",
      role: "STUDENT",
      password: studentPassword,
      isActive: true,
    },
  });

  console.log("Seeding finished.");
  console.log({ admin, teacher, student });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
