"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Correct import for app directory
import Link from 'next/link';

const AddQuestion = () => {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newQuestion = { question, options, correctAnswer };
  
    try {
      const response: Response = await fetch('/api/add-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion),
      });
  
      const data = await response.json(); // Make sure to parse the response to JSON
  
      // Log the response data for debugging
      console.log('Response from server:', data);
  
      if (response.ok) {
        alert('Question added successfully!');
        router.push('/'); // Redirect to home after adding
      } else {
        alert(`Failed to add question: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Failed to add question.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-gray-100 relative">
      <div className="max-w-4xl mx-auto p-8">
        {/* Go Back Button */}
        <Link href="/test">
          <button className="absolute top-4 left-4 bg-blue-600 text-white rounded-full p-3 hover:bg-gray-700 transition-all duration-300">
            Go Back
          </button>
        </Link>

        {/* New Question Form */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-8 mb-8 mt-16">
          <h2 className="text-3xl font-bold mb-4">Add New Question</h2>
          <form onSubmit={handleSubmit}>
            {/* Question Input */}
            <div className="mb-4">
              <label className="block text-gray-200 mb-2">Question</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-700 text-gray-200"
                required
              />
            </div>

            {/* Options Inputs */}
            <div className="mb-4">
              <label className="block text-gray-200 mb-2">Options</label>
              {options.map((option, index) => (
                <input
                  key={index}
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="w-full p-2 mb-2 rounded-lg bg-gray-700 text-gray-200"
                  required
                />
              ))}
            </div>

            {/* Correct Answer Dropdown */}
            <div className="mb-4">
              <label className="block text-gray-200 mb-2">Correct Answer</label>
              <select
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-700 text-gray-200"
                required
              >
                <option value="" disabled>Select Correct Answer</option>
                {options.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddQuestion;
