import { authOptions } from "@/lib/authOptions";
import NextAuth from "next-auth";

// Extend the session type to include custom properties
declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accountType?: string | null;
      role?: string | null;
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
