// app/(final)/career-path/[pathName]/page.tsx
'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { CourseCard } from "@/components/ui/CourseCard";
import machineLearningEngineerSyllabus from '@/data/mlSyllabus'; // Import the syllabus

export default function CareerPathCoursesPage({ params }: { params: { pathName: string } }) {
  const router = useRouter();

  // Define the enroll function for the "Enroll Now" button
  const handleEnroll = () => {
    router.push('/course-content/page'); // Redirects to the specified course content page
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Combined Information Box */}
      <div className="max-w-5xl mx-auto px-8 py-12 bg-gray-800 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Path Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Path Details</h2>
            <div className="space-y-3 text-gray-400">
              <p>• Total Duration: {machineLearningEngineerSyllabus.length * 9} weeks (approximate)</p>
              <p>• Difficulty: Beginner to Advanced</p>
              <p>• Prerequisites: Basic programming knowledge</p>
              <p>• Certificate: Upon completion</p>
            </div>
          </div>

          {/* Career Opportunities */}
          <div>
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Career Opportunities</h2>
            <div className="space-y-3 text-gray-400">
              <p>• Machine Learning Engineer</p>
              <p>• AI Research Scientist</p>
              <p>• Data Scientist</p>
              <p>• ML Operations Engineer</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-3 transition-colors"
          >
            Continue Learning
          </button>
          <p className="mt-4 text-gray-400">
            Join thousands of students already learning on our platform
          </p>
        </div>
      </div>

      {/* Course Grid */}
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {machineLearningEngineerSyllabus.map((course) => (
          <CourseCard 
            key={course.id} 
            {...course} 
            onEnroll={handleEnroll} // Pass the enroll function to each CourseCard
          />
        ))}
      </div>
    </div>
  );
}