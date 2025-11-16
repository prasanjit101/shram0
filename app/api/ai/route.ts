import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { api } from "@/lib/trpc-client";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    return NextResponse.json({ message: "Hello from AI route!" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
