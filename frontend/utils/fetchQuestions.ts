//app\utils\fetchQuestions.ts
import { CodingQuestion } from "../types"; // Adjust the import path based on your folder structure

export const fetchCodingQuestions = async (): Promise<CodingQuestion[]> => {
  try {
    const response = await fetch("/api/get-coding-question");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: CodingQuestion[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching coding questions:", error);
    throw error;
  }
};
