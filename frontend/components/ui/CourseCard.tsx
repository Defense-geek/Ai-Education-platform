
// components/ui/course-card.tsx

'use client';

import React from 'react';
import Image from 'next/image';

interface CourseCardProps {
  title: string;
  description: string;
  duration: string;
  level: string;
  image: string;
  onEnroll?: () => void; // Add the optional onEnroll prop
}

export function CourseCard({
  title,
  description,
  duration,
  level,
  image,
  onEnroll,
}: CourseCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
      <div className="h-48 relative">
        <Image
          src={image}
          alt={title}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-100 mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-4">{description}</p>
        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {duration}
          </span>
          <span className={`px-2 py-1 rounded-full ${
            level === 'Beginner' ? 'bg-green-900 text-green-200' :
            level === 'Intermediate' ? 'bg-yellow-900 text-yellow-200' :
            'bg-red-900 text-red-200'
          }`}>
            {level}
          </span>
        </div>
        <button 
          className="w-full bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          onClick={onEnroll || (() => alert('Course enrollment coming soon!'))} // Use onEnroll if provided
        >
          <span>Enroll Now</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
