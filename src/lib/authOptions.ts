import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import Company from "@/models/Company";
import bcrypt from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";
import CompanyUser from "@/models/CompanyUser";
import crypto from "crypto";

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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        await dbConnect();
        let account;
        if (credentials.accountType === "company") {
          account = await Company.findOne({ email: credentials.email });
        } else if (credentials.accountType === "user") {
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
            name:
              credentials.accountType === "company"
                ? account.companyName
                : account.firstName + " " + account.lastName,
            sessionToken,
            accountType: account.accountType,
            role: account.role,
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
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await dbConnect();
        let companyName = null;
        if (account?.callbackUrl && typeof account.callbackUrl === "string") {
          const match = account.callbackUrl.match(/\/([^\/]+)\/dashboard/);
          if (match) companyName = decodeURIComponent(match[1]);
        }
        // Fallback: try from profile or email domain
        // Find company by name
        let company = null;
        if (companyName) {
          company = await Company.findOne({
            companyName: { $regex: new RegExp(`^${companyName}$`, "i") },
          });
        }
        // If not found, try to find by email domain
        if (!company && user?.email) {
          const domain = user.email.split("@")[1];
          company = await Company.findOne({
            email: { $regex: new RegExp(`@${domain}$`, "i") },
          });
        }
        if (!company) {
          // No company found, reject sign in
          return false;
        }
        // Check if user exists
        let companyUser = await CompanyUser.findOne({ email: user.email });
        if (!companyUser) {
          // Create new CompanyUser
          const [firstName, ...rest] = (user.name || "").split(" ");
          const lastName = rest.join(" ") || "-";
          const number = "N/A";
          const password = crypto.randomBytes(32).toString("hex");
          companyUser = new CompanyUser({
            firstName: firstName || "-",
            lastName,
            number,
            companyName: company.companyName,
            email: user.email,
            password,
            company: company._id,
            accountType: "user",
            role: "General",
          });
          await companyUser.save();
        }
        user.accountType = "user";
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.sessionToken = user.sessionToken;
        token.accountType = user.accountType;
        if ("role" in user) {
          token.role = (user as any).role; // 👈 Add this line
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string;
        session.sessionToken = token.sessionToken;
        session.accountType = token.accountType as string | null;
        session.user.role = token.role as string;
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
          if (token.accountType === "company") {
            await Company.findByIdAndUpdate(token.sub, {
              activeSessionToken: null,
            });
          } else if (token.accountType === "user") {
            await CompanyUser.findByIdAndUpdate(token.sub, {
              activeSessionToken: null,
            });
          }
        } catch (error) {
          console.error("Error clearing session token:", error);
        }
      }
    },
  },
};
