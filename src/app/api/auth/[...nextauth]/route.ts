import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// Funkcja pomocnicza do dekodowania URL dla lokalnego środowiska deweloperskiego
function getDirectUrl(url: string | undefined): string | undefined {
  if (url && url.startsWith("prisma+postgres://") && url.includes("api_key=")) {
    try {
      const b64 = url.split("api_key=")[1];
      const decoded = Buffer.from(b64, "base64").toString("utf-8");
      return JSON.parse(decoded).databaseUrl;
    } catch (e) {
      return url;
    }
  }
  return url;
}

const directUrl = getDirectUrl(process.env.DATABASE_URL);
const pool = new Pool({ connectionString: directUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Login lub E-mail", type: "text", placeholder: "j.kowalski lub jan@kowalski.pl" },
        password: { label: "Hasło", type: "password" }
      },
      async authorize(credentials) {
        // Domyślne konta demo dla wersji produkcyjnej (Vercel)
        if ((credentials.email === "admin" || credentials.email === "admin@effectiveenglish.pl") && credentials.password === "admin123") {
          return {
            id: "admin-demo",
            email: "admin@effectiveenglish.pl",
            name: "Szef Właściciel",
            role: "ADMIN"
          };
        }
        if ((credentials.email === "nauczyciel" || credentials.email === "nauczyciel@effectiveenglish.pl") && credentials.password === "teacher123") {
          return {
            id: "teacher-demo",
            email: "nauczyciel@effectiveenglish.pl",
            name: "Jan Nauczycielski",
            role: "TEACHER"
          };
        }
        if ((credentials.email === "uczen" || credentials.email === "uczen@effectiveenglish.pl") && credentials.password === "student123") {
          return {
            id: "student-demo",
            email: "uczen@effectiveenglish.pl",
            name: "Piotr Uczniowski",
            role: "STUDENT"
          };
        }

        try {
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: credentials.email },
                { login: credentials.email }
              ]
            }
          });

          if (!user) {
            throw new Error("Nie znaleziono użytkownika");
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            throw new Error("Błędne hasło");
          }

          if (!user.isActive) {
            throw new Error("Twoje konto oczekuje na weryfikację przez administratora");
          }

          return {
            id: user.id,
            email: user.email || "",
            name: `${user.firstName} ${user.lastName}`,
            role: user.role
          };
        } catch (dbError: any) {
          if (dbError.message?.includes("Błędne hasło") || dbError.message?.includes("oczekuje na weryfikację")) {
            throw dbError;
          }
          throw new Error("Nie znaleziono użytkownika lub błąd logowania");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/', 
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET || "super_secret_key_for_dev_only",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
