import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Company from '@/models/Company';
import bcrypt from 'bcryptjs';
import CompanyUser from '@/models/CompanyUser';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { companyName, address, phoneNumber, website, email, password } = await req.json();

    const existingCompany = await Company.findOne({
      $or: [
        { email: email },
        { companyName }
      ]
    });
    
    if (existingCompany) {
      return NextResponse.json({ message: 'Company already exists' }, { status: 409 });
    }
   

    const hashedPassword = await bcrypt.hash(password, 10);

    const company = new Company({
      companyName,
      address,
      phoneNumber,
      website,
      email,
      password: hashedPassword,
    });

    await company.save();

    return NextResponse.json({ message: 'Company created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
} 