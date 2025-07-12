import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Team from "@/models/Team";
import dbConnect from "@/lib/db";
import CompanyUser from "@/models/CompanyUser";
import Company from "@/models/Company";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || session.accountType !== "company") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  // Find the company by email (admin's email)
  const company = await Company.findOne({ email: session.user.email });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }  
  // Find teams that belong to this company
  const teams = await Team.find({ company: company._id })
    .sort({ createdAt: -1 })
    .populate({ path: "teamMembers.employee", select: "firstName lastName email" });
  
  return NextResponse.json({ teams });
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || session.accountType !== "company") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  // Find the company by email (admin's email)
  const company = await Company.findOne({ email: session.user.email });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }
  
  const { name, teamMembers } = await req.json();
  if (!name) {
    return NextResponse.json(
      { message: "Team name is required" },
      { status: 400 }
    );
  }
  if (!Array.isArray(teamMembers) || teamMembers.length === 0) {
    return NextResponse.json(
      { message: "At least one team member is required" },
      { status: 400 }
    );
  }
  
  // Validate teamMembers structure
  for (const member of teamMembers) {
    if (!member.employee || !member.role) {
      return NextResponse.json(
        { message: "Each team member must have an employee ID and role" },
        { status: 400 }
      );
    }
  }
  
  // Extract employee IDs for validation
  const employeeIds = teamMembers.map((member: { employee: string; role: string }) => member.employee);
  
  // Verify that all employees belong to this company
  const companyUsers = await CompanyUser.find({ 
    _id: { $in: employeeIds },
    company: company._id 
  });
  
  if (companyUsers.length !== employeeIds.length) {
    return NextResponse.json(
      { message: "One or more employees do not belong to this company" },
      { status: 400 }
    );
  }
  
  // Check if any employee is already in a team
  const existingTeam = await Team.findOne({ 
    "teamMembers.employee": { $in: employeeIds },
    company: company._id 
  });
  if (existingTeam) {
    return NextResponse.json(
      { message: "One or more employees are already in a team" },
      { status: 400 }
    );
  }
  
  const team = await Team.create({
    name,
    teamMembers,
    company: company._id,
  });
  
  // Update each employee's team information
  try {
    await CompanyUser.updateMany(
      { _id: { $in: employeeIds } },
      { $set: { team: name } }
    );
  } catch (error) {
    // If user update fails, delete the team that was just created
    await Team.findByIdAndDelete(team._id);
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      {
        message: "Failed to update employee team information",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
  return NextResponse.json({ team }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || session.accountType !== "company") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  // Find the company by email (admin's email)
  const company = await Company.findOne({ email: session.user.email });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }
  
  const { teamId, name, teamMembers } = await req.json();
  if (!teamId) {
    return NextResponse.json(
      { message: "Team ID is required" },
      { status: 400 }
    );
  }
  if (!name) {
    return NextResponse.json(
      { message: "Team name is required" },
      { status: 400 }
    );
  }
  if (!Array.isArray(teamMembers) || teamMembers.length === 0) {
    return NextResponse.json(
      { message: "At least one team member is required" },
      { status: 400 }
    );
  }
  
  // Validate teamMembers structure
  for (const member of teamMembers) {
    if (!member.employee || !member.role) {
      return NextResponse.json(
        { message: "Each team member must have an employee ID and role" },
        { status: 400 }
      );
    }
  }
  
  // Find the team and verify it belongs to this company
  const existingTeam = await Team.findOne({ _id: teamId, company: company._id });
  if (!existingTeam) {
    return NextResponse.json({ message: "Team not found" }, { status: 404 });
  }
  
  // Extract employee IDs for validation
  const employeeIds = teamMembers.map((member: { employee: string; role: string }) => member.employee);
  
  // Verify that all employees belong to this company
  const companyUsers = await CompanyUser.find({ 
    _id: { $in: employeeIds },
    company: company._id 
  });
  
  if (companyUsers.length !== employeeIds.length) {
    return NextResponse.json(
      { message: "One or more employees do not belong to this company" },
      { status: 400 }
    );
  }
  
  // Check if any employee is already in another team (excluding current team)
  const existingTeamWithEmployee = await Team.findOne({ 
    "teamMembers.employee": { $in: employeeIds },
    company: company._id,
    _id: { $ne: teamId }
  });
  if (existingTeamWithEmployee) {
    return NextResponse.json(
      { message: "One or more employees are already in another team" },
      { status: 400 }
    );
  }
  
  // Get current team members to update their team assignment
  const currentEmployeeIds = existingTeam.teamMembers.map((member: { employee: mongoose.Types.ObjectId; role: string }) => member.employee.toString());
  const newEmployeeIds = employeeIds;
  
  // Remove team assignment from employees who are no longer in the team
  const employeesToRemove = currentEmployeeIds.filter((id: string) => !newEmployeeIds.includes(id));
  if (employeesToRemove.length > 0) {
    await CompanyUser.updateMany(
      { _id: { $in: employeesToRemove } },
      { $unset: { team: "" } }
    );
  }
  
  // Update team assignment for new employees
  const employeesToAdd = newEmployeeIds.filter((id: string) => !currentEmployeeIds.includes(id));
  if (employeesToAdd.length > 0) {
    await CompanyUser.updateMany(
      { _id: { $in: employeesToAdd } },
      { $set: { team: name } }
    );
  }
  
  // Update team name for all current members if name changed
  if (existingTeam.name !== name) {
    await CompanyUser.updateMany(
      { _id: { $in: newEmployeeIds } },
      { $set: { team: name } }
    );
  }
  
  // Update the team
  const updatedTeam = await Team.findByIdAndUpdate(
    teamId,
    {
      name,
      teamMembers,
    },
    { new: true }
  ).populate({ path: "teamMembers.employee", select: "firstName lastName email" });
  
  return NextResponse.json({ team: updatedTeam });
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || session.accountType !== "company") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  // Find the company by email (admin's email)
  const company = await Company.findOne({ email: session.user.email });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }
  
  const { teamId } = await req.json();
  if (!teamId) {
    return NextResponse.json(
      { message: "Team ID is required" },
      { status: 400 }
    );
  }
  
  // Find the team and verify it belongs to this company
  const team = await Team.findOne({ _id: teamId, company: company._id });
  if (!team) {
    return NextResponse.json({ message: "Team not found" }, { status: 404 });
  }
  
  // Extract employee IDs from team members
  const employeeIds = team.teamMembers.map((member: { employee: mongoose.Types.ObjectId; role: string }) => member.employee);
  
  // Remove team assignment from employees
  await CompanyUser.updateMany(
    { _id: { $in: employeeIds } },
    { $unset: { team: "" } }
  );
  
  // Delete the team
  await Team.findByIdAndDelete(teamId);
  return NextResponse.json({ message: "Team deleted successfully" });
}

