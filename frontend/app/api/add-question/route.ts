//app\api\add-question\route.ts

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'questions.json');

export async function POST(request: Request) {
  console.log('POST request received'); // Log to verify the request is received

  const newQuestion = await request.json();
  console.log('New question data:', newQuestion); // Log the incoming data

  try {
    // Validate required fields
    const { question, options, correctAnswer, difficulty, lessonNumber } = newQuestion;
    if (!question || !options || !correctAnswer || !difficulty || !lessonNumber) {
      return NextResponse.json({ message: 'Invalid question data' }, { status: 400 });
    }

    // Generate a unique id for the new question
    const id = `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Add the id to the new question data
    const questionWithId = { id, ...newQuestion };

    // Read existing questions
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(fileContents);

    // Add new question
    questions.push(questionWithId);

    // Write the updated questions back to the file
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2));

    return NextResponse.json({ message: `Question added successfully with ID: ${id}!`, id, question: questionWithId}, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error adding question:', errorMessage);

    return NextResponse.json({ message: 'Failed to add question.', error: errorMessage }, { status: 500 });
  }
}
