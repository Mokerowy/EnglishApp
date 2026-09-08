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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Podaj login/email i hasło");
        }

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
