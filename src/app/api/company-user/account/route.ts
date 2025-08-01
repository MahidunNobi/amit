import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db";
import CompanyUser from "@/models/CompanyUser";
import Team from "@/models/Team";
import Project from "@/models/Project";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  
  if (!session || session.accountType !== "user") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find the user by email
    const user = await CompanyUser.findOne({ email: session.user.email }).select("-password");
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the team the user belongs to using the new teamMembers structure
    const team = await Team.findOne({ 
      "teamMembers.employee": user._id,
      company: user.company 
    }).populate({
      path: "teamMembers.employee",
      select: "firstName lastName email"
    });

    // Find the user's team role
    let teamRole = null;
    if (team) {
      const teamMember = team.teamMembers.find((member: any) => 
        member.employee._id.toString() === user._id.toString()
      );
      teamRole = teamMember ? teamMember.role : null;
    }

    // Find the project assigned to the user's team
    let project = null;
    if (team) {
      project = await Project.findOne({ team: team._id }).select("name details deadline");
    }

    // Prepare the response
    const userAccount = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      team: team ? team.name : null,
      teamRole: teamRole,
      project: project ? {
        name: project.name,
        details: project.details,
        deadline: project.deadline
      } : null
    };

    return NextResponse.json({ user: userAccount });
  } catch (error) {
    console.error("Error fetching user account:", error);
    return NextResponse.json({ error: "Failed to fetch account information" }, { status: 500 });
  }
} 