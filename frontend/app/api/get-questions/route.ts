//app\api\get-questions\route.ts

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: number;
  lessonNo: number;
}

let difficulty = 3; // Starting difficulty level
const minDifficulty = 1;
const maxDifficulty = 5;
let correctStreak = 0;
let incorrectStreak = 0;

// Adjust difficulty for the current user (or session).
function adjustDifficulty(isCorrect: boolean) {
  if (isCorrect) {
    correctStreak += 1;
    incorrectStreak = 0;
    if (correctStreak >= 2 && difficulty < maxDifficulty) {
      difficulty += 1;
      correctStreak = 0; // Reset streak after difficulty change
    }
  } else {
    incorrectStreak += 1;
    correctStreak = 0;
    if (incorrectStreak >= 2 && difficulty > minDifficulty) {
      difficulty -= 1;
      incorrectStreak = 0; // Reset streak after difficulty change
    }
  }
  console.log("After adjustment -> Difficulty:", difficulty, "| Correct Streak:", correctStreak, "| Incorrect Streak:", incorrectStreak);
}


export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const isCorrect = url.searchParams.get('isCorrect') === 'true';
    adjustDifficulty(isCorrect);

    const questionsPath = path.join(process.cwd(), 'data', 'questions.json');
    const fileData = fs.readFileSync(questionsPath, 'utf-8');
    const allQuestions: Question[] = JSON.parse(fileData);

    // Filter questions by the current difficulty level
    const filteredQuestions = allQuestions.filter(q => q.difficulty === difficulty);

    // Select one random question from the filtered questions
    const selectedQuestion = [filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)]];

    // Return the selected question in an array format
    return NextResponse.json(selectedQuestion, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching questions:', error.message);
      return NextResponse.json({ message: 'Failed to fetch questions.', error: error.message }, { status: 500 });
    } else {
      console.error('Unknown error:', error);
      return NextResponse.json({ message: 'Failed to fetch questions.', error: 'Unknown error' }, { status: 500 });
    }
  }
}
