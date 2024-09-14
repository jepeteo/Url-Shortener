import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "../../../../lib/mongodb";
import { findUserByEmail, createNewUser } from "@/lib/userUtils";
import { compare } from "bcryptjs";

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
          return { id: user._id, name: user.name, email: user.email };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "github") {
        const client = await clientPromise;
        const db = client.db("urlShortener");
        const usersCollection = db.collection("users");

        const existingUser = await usersCollection.findOne({
          email: user.email,
        });
        if (!existingUser) {
          await usersCollection.insertOne({
            name: user.name,
            email: user.email,
            githubId: profile.id,
            createdAt: new Date(),
          });
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
      }
      return session;
    },

    // async session({ session, token }) {
    //   if (session?.user) {
    //     session.user.id = token.sub;
    //   }
    //   return session;
    // },
    // async jwt({ token, user }) {
    //   if (user) {
    //     token.sub = user.id;
    //   }
    //   return token;
    // },

    // async redirect({ url, baseUrl }) {
    //   return `${baseUrl}/dashboard`;
    // },
  },

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
