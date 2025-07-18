// app/api/my-tasks/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import CompanyUser from "@/models/CompanyUser";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();

    const user = await CompanyUser.findOne({ email: session.user.email });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { status } = body;

    const updatedTask = await Task.findOneAndUpdate(
      { _id: params.id, assignedTo: user._id }, // only allow user to update their own tasks
      { status },
      { new: true }
    );

    if (!updatedTask) {
      return NextResponse.json(
        { error: "Task not found or not authorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Task update error:", error);
    return NextResponse.json(
      { error: "Failed to update task status" },
      { status: 500 }
    );
  }
}
