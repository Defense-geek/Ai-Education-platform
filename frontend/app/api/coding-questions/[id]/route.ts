//app\api\coding-questions\[id]\route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Named export for the GET method to fetch question by ID
export async function GET(req: Request) {
  try {
    // Extract question ID from URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();  // Extract the ID from the URL

    console.log('Extracted ID:', id);  // Log the extracted ID

    if (!id) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Fetch question data by ID
    const codingQuestion = await prisma.codingQuestion.findUnique({
      where: { id },  // Use the ID directly here as a string
    });

    if (!codingQuestion) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Return the full question data, including hidden test cases
    return NextResponse.json(codingQuestion, { status: 200 });
  } catch (error) {
    console.error("Error fetching coding question by ID:", error);
    return NextResponse.json({ error: "Failed to fetch coding question" }, { status: 500 });
  }
}
