import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CompanyUser from '@/models/CompanyUser';
import bcrypt from 'bcryptjs';
import Company from '@/models/Company';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { firstName, lastName, number, companyName, email, password } = await req.json();
    console.log(companyName);
    const company = await Company.findOne({ companyName: { $regex: new RegExp(`^${companyName}$`, "i") } });
    if (!company) {
      return NextResponse.json({ message: 'Company not found' }, { status: 404 });
    }

    const existingUser = await CompanyUser.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new CompanyUser({
      firstName,
      lastName,
      number,
      companyName,
      email,
      password: hashedPassword,
      company: company._id,
    });

    await user.save();

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Company user signup error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
} 