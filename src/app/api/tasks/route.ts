import { NextResponse } from "next/server";
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
