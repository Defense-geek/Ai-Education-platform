//app\api\get-coding-question\route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Named export for the GET method
export async function GET() {
  try {
    const codingQuestions = await prisma.codingQuestion.findMany();
    return NextResponse.json(codingQuestions, { status: 200 });
  } catch (error) {
    console.error('Error fetching coding questions:', error);
    return NextResponse.json({ error: 'Failed to fetch coding questions' }, { status: 500 });
  }
}
