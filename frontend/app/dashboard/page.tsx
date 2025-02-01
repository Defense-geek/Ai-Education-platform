// Import necessary modules and components
import React from 'react';
import { FaBook } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import DeleteAccount from './DeleteAccount';
import activeCourses from '@/data/activeCourses'; // Import active courses
import completedCourses from '@/data/completedcourses'; // Import completed courses

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto p-8">
        {/* Colorful Dashboard Heading */}
        <h1 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
          Dashboard
        </h1>

        {/* Profile Section with improved styling */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome, User!</h2>
              <p className="text-gray-400">AI Learning Explorer</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <ActiveCourses />
          <CompletedCourses />
        </div>

        {/* Quick Actions Section */}
        <div className="flex flex-col items-center space-y-4 mt-8">
          <Link 
            href="http://localhost:3000/dashboard/sign-upCourses" 
            className="w-full max-w-md bg-blue-600 text-white rounded-lg px-6 py-3 text-center font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <FaBook className="w-5 h-5" />
            <span>Take New Course</span>
          </Link>
          
          <button 
            className="w-full max-w-md bg-red-900 text-red-100 rounded-lg px-6 py-3 font-semibold hover:bg-red-800 transition-colors flex items-center justify-center space-x-2"
          >
            <span><DeleteAccount/></span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Active Courses Component
// Active Courses Component
function ActiveCourses() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-200">Active Courses</h2>
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4 min-w-max" style={{ WebkitOverflowScrolling: 'touch' }}>
          {activeCourses.map((course) => (
            <div 
              key={course.id} 
              className="bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow w-64 flex-shrink-0"
            >
              <div className="h-40 relative">
                <Image
                  src={course.image}
                  alt={course.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg mb-2 text-gray-200">{course.name}</h3>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400 mt-1">{course.progress}% complete</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Completed Courses Component
function CompletedCourses() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-200">Completed Courses</h2>
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4 min-w-max" style={{ WebkitOverflowScrolling: 'touch' }}>
          {completedCourses.map((course) => {
            // Apply grade color based on course grade
            let gradeColor;
            switch (course.grade) {
              case 'O':
                gradeColor = 'text-purple-400';
                break;
              case 'A+':
                gradeColor = 'text-red-400';
                break;
              case 'A':
                gradeColor = 'text-orange-400';
                break;
              case 'B+':
                gradeColor = 'text-yellow-400';
                break;
              case 'B':
                gradeColor = 'text-green-400';
                break;
              case 'C':
                gradeColor = 'text-blue-400';
                break;
              default:
                gradeColor = 'text-gray-400';
            }

            return (
              <div 
                key={course.id} 
                className="bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow w-64 flex-shrink-0"
              >
                <div className="h-40 relative">
                  <Image
                    src={course.image}
                    alt={course.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-2 text-gray-200">{course.name}</h3>
                  <p className="text-sm text-gray-400 mb-1">
                    Grade: <span className={`font-bold ${gradeColor}`}>{course.grade}</span>
                  </p>
                  <p className="text-sm text-gray-400 flex items-center">
                    <span className="mr-1">{course.emoji}</span>
                    <span>{course.description}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}