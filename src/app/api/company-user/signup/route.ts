import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CompanyUser from '@/models/CompanyUser';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { firstName, lastName, number, companyName, email, password } = await req.json();

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
    });

    await user.save();

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Company user signup error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
} 