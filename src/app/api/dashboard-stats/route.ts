// app/api/dashboard-stats/route.ts
import { getServerSession } from "next-auth";

import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import CompanyUser from "@/models/CompanyUser";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await CompanyUser.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const createdCount = await Task.countDocuments({ createdBy: user._id });
    const assignedCount = await Task.countDocuments({ assignedTo: user._id });
    const completedCount = await Task.countDocuments({
      assignedTo: user._id,
      status: "completed",
    });
    const pendingCount = await Task.countDocuments({
      assignedTo: user._id,
      status: { $ne: "completed" },
    });

    return NextResponse.json({
      createdCount,
      assignedCount,
      completedCount,
      pendingCount,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
