import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import CompanyUser from "@/models/CompanyUser";
import Company from "@/models/Company";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || session.accountType !== "company") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Find the company by email (admin's email)
  const company = await Company.findOne({ email: session.user.email });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }
  // Find all users with this companyId
  const users = await CompanyUser.find({ company: company._id }).select(
    "-password"
  );
  return NextResponse.json({ users });
}

export async function PUT(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || session.accountType !== "company") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const company = await Company.findOne({ email: session.user.email });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const { userId, role } = await req.json();
  
  if (!userId || !role) {
    return NextResponse.json({ error: "User ID and role are required" }, { status: 400 });
  }

  // Validate role
  const validRoles = ["General", "Developer", "Project Manager", "QA", "Designer"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  try {
    const user = await CompanyUser.findOneAndUpdate(
      { _id: userId, company: company._id },
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
  }
}
