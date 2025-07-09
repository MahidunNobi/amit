import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Project from '@/models/Project';
import dbConnect from '@/lib/db';
import Company from '@/models/Company';
import { authOptions } from '../../auth/[...nextauth]/route';
import Team from '@/models/Team';

export async function GET(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || session.accountType !== 'company') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const company = await Company.findOne({ email: session.user.email });
  if (!company) {
    return NextResponse.json({ message: 'Company not found' }, { status: 404 });
  }
  const projects = await Project.find({ company: company._id })
    .sort({ createdAt: -1 })
    .populate({ path: 'team', select: "name"});    
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || session.accountType !== 'company') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const company = await Company.findOne({ email: session.user.email });
  if (!company) {
    return NextResponse.json({ message: 'Company not found' }, { status: 404 });
  }
  const { name, details, deadline, team } = await req.json();
  if (!name || !details || !deadline || !team) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }
  try {
    // Create the project
    const project = await Project.create({
      name,
      details,
      deadline,
      company: company._id,
      team,
    });

    // Update the team with the project name
    await Team.findByIdAndUpdate(
      team,
      { $addToSet: { projects: name } }, // Using $addToSet to avoid duplicates
      { new: true }
    );

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: 'Failed to create project', error: errorMessage },
      { status: 500 }
    );
  }  } 
