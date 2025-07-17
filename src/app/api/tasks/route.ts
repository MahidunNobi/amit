import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import CompanyUser from "@/models/CompanyUser";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, priority, assignedTo, teamId, dueDate } = body;

    const user = await CompanyUser.findOne({ email: session?.user?.email });
    if (!user) {
      return NextResponse.json({ error: "You're not found" }, { status: 404 });
    }

    if (!title || !description || !priority || !assignedTo || !teamId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    const newTask = await Task.create({
      title,
      description,
      priority,
      assignedTo,
      teamId: teamId,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdBy: user._id, // optional if needed
    });

    return NextResponse.json({ success: true, task: newTask }, { status: 201 });
  } catch (error) {
    console.error("Task creation failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");
  const memberId = searchParams.get("memberId");
  const priority = searchParams.get("priority");

  if (!teamId || !memberId || !priority) {
    return NextResponse.json(
      { message: "Missing required query parameters" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    const user = await CompanyUser.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const tasks = await Task.find({
      teamId,
      assignedTo: memberId,
      priority: priority, // assuming priority stored as "low" | "medium" | "high"
      createdBy: user._id,
    }).sort({ dueDate: 1 });

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error("[GET_TASKS_ERROR]", error);
    return NextResponse.json(
      { message: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
