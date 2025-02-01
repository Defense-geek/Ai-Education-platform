//app\test\page.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import { RecordingHandler } from "../components/Recorder";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export default function HomePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const recordinghandler = new RecordingHandler();
  const [status, setStatus] = useState("Idle");

  // check for recording status 
  //can be used to block the candidate from taking test if not connected
  const [recordingStatus, setRecordingStatus] = useState(
    recordinghandler.getRecordingStatus()
  );

  const [playbackStatus, setPlaybackStatus] = useState(
    recordinghandler.getPlaybackStatus()
  );
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRecordingStatus(recordinghandler.getRecordingStatus());
      setPlaybackStatus(recordinghandler.getPlaybackStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Monitor fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);

      if (!isFull) {
        setShowModal(true); // Prompt user to re-enter fullscreen
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Prevent tab switching
  useEffect(() => {
    const handleTabSwitch = () => {
      if (document.visibilityState !== "visible") {
        alert("Please do not switch tabs during the test.");
        enterFullscreen(); // Force re-entry into fullscreen
      }
    };

    document.addEventListener("visibilitychange", handleTabSwitch);

    return () => {
      document.removeEventListener("visibilitychange", handleTabSwitch);
    };
  }, []);

  // Fetch questions when fullscreen is active
  useEffect(() => {
    if (isFullscreen) {
      fetchNextQuestion(true);
    }
  }, [isFullscreen]); 

  useEffect(() => {
    // Update the status whenever it changes
    setStatus(recordinghandler.getRecordingStatus());
  }, [status]);

  const fetchNextQuestion = async (isCorrect: boolean) => {
    try {
      const response = await fetch(`/api/get-questions?isCorrect=${isCorrect}`);
      const data = await response.json();
      const mappedData = data.map((q: any) => ({
        ...q,
        id: q._id, // Ensure id is mapped correctly
      }));
      setQuestions((prevQuestions) => [...prevQuestions, ...mappedData]);
    } catch (error) {
      console.error("Error fetching question:", error);
    }
  };
  

  const handleStartRecording = async () => {
    await recordinghandler.startStreaming();
    setStatus(recordinghandler.getRecordingStatus());
  };

  // Stop recording function
  const handleStopRecording = async () => {
    try {
      await recordinghandler.stopRecording();
      setStatus(recordinghandler.getRecordingStatus());
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };
  

  const handleAnswerChange = (value: string) => {
    const updatedOptions = [...selectedOptions];
    updatedOptions[currentPage] = value;
    setSelectedOptions(updatedOptions);
  };

  const handleNext = () => {
    const currentQuestion = questions[currentPage];
    const isCorrect =
      selectedOptions[currentPage] === currentQuestion.correctAnswer;

    logAnswerData(
      "user_2oXUzBUBhXgB74ZJgWg2f860GWl",
      currentQuestion.id,
      [selectedOptions[currentPage]],
      isCorrect
    );

    if (isCorrect) {
      setScore(score + 1);
    }

    if (questionCount < 9) {
      setQuestionCount(questionCount + 1);
      setCurrentPage(currentPage + 1);
      fetchNextQuestion(isCorrect);
    } else {
      handleSubmit()
    }
  };

  

  const handleSubmit = async () => {
    setShowScore(true);
  };  
  const logAnswerData = async (
    userId: string, // userId is a plain string here
    mcqId: string,
    selected: string[],
    isCorrect: boolean
  ) => {
    try {
      const response = await fetch("/api/log-mcq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId, // No need to convert to ObjectId
          mcqAnswers: [
            {
              mcqId,
              selected,
              isCorrect,
            },
          ],
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to log answer data:", errorData);
      }
    } catch (error) {
      console.error("Error logging answer:", error);
    }
  };
  
  
  

  const enterFullscreen = () => {
    if (containerRef.current) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Error entering fullscreen mode:", err);
        alert(
          "Your browser has blocked fullscreen mode. Please enable fullscreen permissions and try again."
        );
      });
    } else {
      alert("Fullscreen mode is required to start the test.");
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center"
    >
      {/* Modal for recording*/}
      <div>
        <h2>Recording Status: {status}</h2>
        <button onClick={handleStartRecording}>Start Recording</button>
        <button onClick={handleStopRecording}>Stop Recording</button>
      </div>
      {/* Modal for fullscreen prompt */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg text-center shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-4">
              Please Enter Fullscreen Mode
            </h2>
            <p className="text-gray-300 mb-6">
              This test requires you to be in fullscreen mode. Click the button below to continue.
            </p>
            <button
              onClick={() => {
                enterFullscreen();
                setShowModal(false);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Enter Fullscreen
            </button>
          </div>
        </div>
      )}
  
      <div className="w-full max-w-4xl p-8">
        <h1 className="text-5xl font-bold text-center mb-8 pt-8 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">
          Entry Assessment
        </h1>
  
        {showScore ? (
          <div className="text-center text-3xl mt-8">
            <p>
              Your score: {score} / {questions.length}
            </p>
            <button
              onClick={() => {
                window.location.href = "/editor";
              }}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
            >
              Go to Editor 
            </button>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            {questions.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">{questions[currentPage]?.question}</h2>
                <div className="space-y-2">
                  {questions[currentPage]?.options.map((option, i) => (
                    <label key={i} className="block p-2 rounded-lg bg-gray-700">
                      <input
                        type="radio"
                        name={`question-${currentPage}`}
                        value={option}
                        checked={selectedOptions[currentPage] === option}
                        onChange={() => handleAnswerChange(option)}
                        className="mr-2"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={handleNext}
                className={`${
                  selectedOptions[currentPage]
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-500 cursor-not-allowed"
                } text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors`}
                disabled={!selectedOptions[currentPage]}
              >
                {questionCount === 9 ? "Submit" : "Next"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
