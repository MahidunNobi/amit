import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CompanyUser from '@/models/CompanyUser';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password, companyName } = await req.json();
    const user = await CompanyUser.findOne({ email, companyName });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials or company.' }, { status: 401 });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials or company.' }, { status: 401 });
    }
    // You can add session/cookie logic here if needed
    return NextResponse.json({ message: 'Login successful' }, { status: 200 });
  } catch (error) {
    console.error('Company user login error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
} 