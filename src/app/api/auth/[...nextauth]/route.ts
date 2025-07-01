import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";
import dbConnect from "@/lib/db";
import Company from "@/models/Company";
import bcrypt from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";
import CompanyUser from "@/models/CompanyUser";

// Extend the session type to include custom properties
declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accountType?: string | null;
    };
    sessionToken?: string;
    accountType?: string | null;
  }
  
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    sessionToken?: string;
    accountType?: string | null;
  }
}

// Extend JWT type to include sessionToken
declare module "next-auth/jwt" {
  interface JWT {
    sessionToken?: string;
  }
}

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        accountType: { label: "Account Type", type: "text" },
      },  
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        await dbConnect();
        let account;
        if(credentials.accountType === "company"){
          account = await Company.findOne({ email: credentials.email });
        }else if(credentials.accountType === "user"){
          account = await CompanyUser.findOne({ email: credentials.email });
        }

        if (
          account &&
          (await bcrypt.compare(credentials.password, account.password))
        ) {
          // Creating a new token and saving it to DB.
          const sessionToken = uuidv4();
          account.activeSessionToken = sessionToken;
          await account.save();

          return {
            id: account._id.toString(),
            email: account.email,
            name: credentials.accountType === "company" ? account.companyName : account.firstName + " " + account.lastName,
            sessionToken,
            accountType: account.accountType,
          };
        }

        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.sessionToken = user.sessionToken;
        token.accountType = user.accountType;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string;
        session.sessionToken = token.sessionToken;
        session.accountType = token.accountType as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    async signOut({ token }) {
      if (token?.sub) {
        try {
          await dbConnect();
          // Clear the active session token when user signs out
          if(token.accountType === "company"){
            await Company.findByIdAndUpdate(token.sub, { activeSessionToken: null });
          }else if(token.accountType === "user"){
            await CompanyUser.findByIdAndUpdate(token.sub, { activeSessionToken: null });
          }
        } catch (error) {
          console.error("Error clearing session token:", error);
        }
      }
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
