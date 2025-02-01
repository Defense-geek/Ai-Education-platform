// Location: /api/log-mcq/route.ts

import { NextRequest, NextResponse } from "next/server";
import { mongoPrisma } from "@/lib/prismaClients";
import { z } from "zod";

// Schema for validation using zod
const mcqAnswerSchema = z.object({
  mcqId: z.string(),
  selected: z.array(z.string()),
  isCorrect: z.boolean(),
});

const bodySchema = z.object({
  userId: z.string().min(1, { message: "User ID must be a non-empty string" }), // userId as plain string
  mcqAnswers: z.array(mcqAnswerSchema),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body using zod
    const validatedBody = bodySchema.parse(body);

    // Prepare data for database insertion
    const validatedAnswers = validatedBody.mcqAnswers.map((answer) => ({
      userId: validatedBody.userId, // User ID is now just a string
      mcqId: answer.mcqId, // MCQ ID is a string as well
      selected: answer.selected,
      isCorrect: answer.isCorrect,
    }));

    // Insert into the database
    await Promise.all(
      validatedAnswers.map((answer) =>
        mongoPrisma.mcqAnswer.create({ data: answer })
      )
    );

    return NextResponse.json(
      { message: "MCQ answers saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error in POST /api/log-mcq:", errorMessage);
    return NextResponse.json(
      { message: "Internal server error", error: errorMessage },
      { status: error instanceof z.ZodError ? 400 : 500 }
    );
  }
}
