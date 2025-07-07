import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Company from "@/models/Company";

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const companyName = searchParams.get("companyName");
  if (!companyName) {
    return NextResponse.json({ error: "Missing companyName parameter" }, { status: 400 });
  }
  console.log(companyName)
  // Make the query case-insensitive
  const company = await Company.findOne({ companyName: { $regex: `^${companyName}$`, $options: "i" } });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }
  return NextResponse.json({ exists: true, companyName });
} 