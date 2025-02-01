// app/types/index.ts

export type CodingQuestion = {
  id: string;
  question: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  difficulty: number;
  sampleInput: string;
  sampleOutput: string;
  hiddenTestCases: string[]; // Hidden test cases for evaluation
  expectedOutputs: string[]; // Expected outputs for hidden test cases
};

  
