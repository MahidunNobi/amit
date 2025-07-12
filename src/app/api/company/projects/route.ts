import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Project from "@/models/Project";
import dbConnect from "@/lib/db";
import Company from "@/models/Company";
import { authOptions } from "@/lib/authOptions";
import Team from "@/models/Team";

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || session.accountType !== "company") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const company = await Company.findOne({ email: session.user.email });
  if (!company) {
    return NextResponse.json({ message: "Company not found" }, { status: 404 });
  }
  const projects = await Project.find({ company: company._id })
    .sort({ createdAt: -1 })
    .populate({ path: "team", select: "name" });
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || session.accountType !== "company") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const company = await Company.findOne({ email: session.user.email });
  if (!company) {
    return NextResponse.json({ message: "Company not found" }, { status: 404 });
  }
  const { name, details, deadline, team } = await req.json();
  if (!name || !details || !deadline || !team) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 }
    );
  }
  
  // Verify that the team belongs to this company
  const teamExists = await Team.findOne({ _id: team, company: company._id });
  if (!teamExists) {
    return NextResponse.json(
      { message: "Team not found or does not belong to this company" },
      { status: 400 }
    );
  }
  
  // Check if the team is already assigned to another project
  const existingProject = await Project.findOne({ team });
  if (existingProject) {
    return NextResponse.json(
      { message: "This team is already assigned to another project." },
      { status: 400 }
    );
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
    console.error("Error creating project:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: "Failed to create project", error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || session.accountType !== "company") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  
  const company = await Company.findOne({ email: session.user.email });
  if (!company) {
    return NextResponse.json({ message: "Company not found" }, { status: 404 });
  }
  
  const { projectId } = await req.json();
  if (!projectId) {
    return NextResponse.json(
      { message: "Project ID is required" },
      { status: 400 }
    );
  }
  
  // Verify that the project belongs to this company
  const project = await Project.findOne({ _id: projectId, company: company._id });
  if (!project) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }
  
  await Project.findByIdAndDelete(projectId);
  return NextResponse.json({ message: "Project deleted successfully" });
}
