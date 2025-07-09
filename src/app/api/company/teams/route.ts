import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Team from '@/models/Team';
import dbConnect from '@/lib/db';
import CompanyUser from '@/models/CompanyUser';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || session.accountType !== 'company') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const teams = await Team.find({})
    .sort({ createdAt: -1 })
    .populate({ path: 'employees', select: 'firstName lastName email' });
  return NextResponse.json({ teams });
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || session.accountType !== 'company') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const { name, employees } = await req.json();
  if (!name) {
    return NextResponse.json({ message: 'Team name is required' }, { status: 400 });
  }
  if (!Array.isArray(employees) || employees.length === 0) {
    return NextResponse.json({ message: 'At least one employee is required' }, { status: 400 });
  }
  // Check if any employee is already in a team
  const existingTeam = await Team.findOne({ employees: { $in: employees } });
  if (existingTeam) {
    return NextResponse.json({ message: 'One or more employees are already in a team' }, { status: 400 });
  }
  const team = await Team.create({
    name,
    employees,
  });  
  // Update each employee's team information
  try {
    await CompanyUser.updateMany(
      { _id: { $in: employees } },
      { $set: { team: name } }
    );
  } catch (error) {
    // If user update fails, delete the team that was just created
    await Team.findByIdAndDelete(team._id);
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { message: 'Failed to update employee team information', error: errorMessage },
      { status: 500 }
    );
  }
  return NextResponse.json({ team }, { status: 201 });
} 

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || session.accountType !== 'company') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const { teamId } = await req.json();
  if (!teamId) {
    return NextResponse.json({ message: 'Team ID is required' }, { status: 400 });
  }
  // Find the team and its employees
  const team = await Team.findById(teamId);
  if (!team) {
    return NextResponse.json({ message: 'Team not found' }, { status: 404 });
  }
  // Remove team assignment from employees
  await CompanyUser.updateMany(
    { _id: { $in: team.employees } },
    { $unset: { team: "" } }
  );
  // Delete the team
  await Team.findByIdAndDelete(teamId);
  return NextResponse.json({ message: 'Team deleted successfully' });
} 