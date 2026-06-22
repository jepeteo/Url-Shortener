import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "../../../../lib/mongodb";
import { compare } from "bcryptjs";
import { ObjectId } from "mongodb";

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
        const client = await clientPromise;
        const usersCollection = client.db("urlShortener").collection("users");

        const user = await usersCollection.findOne({
          email: credentials.email,
        });
        if (user && (await compare(credentials.password, user.password))) {
          return {
            id: user._id.toString(),
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
        const client = await clientPromise;
        const db = client.db("urlShortener");
        const usersCollection = db.collection("users");

        const existingUser = await usersCollection.findOne({
          email: user.email,
        });

        if (!existingUser) {
          const result = await usersCollection.insertOne({
            name: user.name,
            email: user.email,
            githubId: account.providerAccountId,
            plan: "free",
            createdAt: new Date(),
          });
          user.id = result.insertedId.toString();
        } else {
          user.id = existingUser._id.toString();
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
