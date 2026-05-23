import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // TODO Phase 1: swap mock lookup for real DB query once Railway DB is provisioned
        // const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        // if (!user) return null;
        // const valid = await bcrypt.compare(credentials.password, user.hashedPassword);
        // if (!valid) return null;
        // return { id: user.id, email: user.email, name: user.fullName };

        // ── Mock auth — remove when DB is live ──
        if (credentials.email === "demo@teesheet.app" && credentials.password === "demo1234") {
          return { id: "mock-user-001", email: "demo@teesheet.app", name: "Demo Golfer" };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { (session.user as any).id = token.id; }
      return session;
    },
  },
};
