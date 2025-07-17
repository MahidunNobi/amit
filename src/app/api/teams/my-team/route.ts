// app/api/teams/my-team/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db";
import Team, { ITeam } from "@/models/Team";
import CompanyUser from "@/models/CompanyUser";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.accountType !== "user") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await CompanyUser.findOne({ email: session.user?.email });
    if (!user || user.role !== "Project Manager") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const team = await Team.findOne({ "teamMembers.employee": user._id })
      .populate("teamMembers.employee", "firstName lastName email role ")
      .lean<ITeam>();

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(
      { teamMembers: team.teamMembers, team_id: team._id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
