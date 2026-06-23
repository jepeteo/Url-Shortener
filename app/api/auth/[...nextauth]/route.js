import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb, users } from "@/lib/db";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "jsmith@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials.email?.toLowerCase().trim();
        if (!email || !credentials.password) {
          return null;
        }

        if (!(await checkRateLimit(`login:${email}`, RATE_LIMITS.login))) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        const db = getDb();
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (user?.password && (await compare(credentials.password, user.password))) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            plan: user.plan || "free",
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github") {
        const db = getDb();
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        });

        if (!existingUser) {
          const [created] = await db
            .insert(users)
            .values({
              name: user.name,
              email: user.email,
              githubId: account.providerAccountId,
              plan: "free",
              emailVerified: new Date(),
            })
            .returning({ id: users.id });
          user.id = created.id;
        } else {
          user.id = existingUser.id;
          if (!existingUser.emailVerified) {
            await db
              .update(users)
              .set({ emailVerified: new Date() })
              .where(eq(users.id, existingUser.id));
          }
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.plan = user.plan || "free";
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
        session.user.plan = token.plan || "free";
      }
      if (session.user?.email) {
        session.user.isAdmin = ADMIN_EMAILS.includes(session.user.email.toLowerCase());
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
