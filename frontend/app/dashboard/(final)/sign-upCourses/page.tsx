// frontend/app/dashboard/(final)/CareerPathsPage.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import careerPaths from '@/data/careerPaths'; // Import the careerPaths from the data file
import '@/app/globals.css';

export default function CareerPathsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Fixed header section */}
      <div className="sticky top-0 bg-gray-900 z-10 p-8">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
          Choose Your AI Career Path
        </h1>
      </div>

      {/* Scrollable content */}
      <div className="max-w-7xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {careerPaths.map((path) => (
            <CareerPathCard key={path.pathName} {...path} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CareerPathCard({
  pathName,
  pathDescription,
  duration,
  image,
}: {
  pathName: string;
  pathDescription: string;
  duration: string;
  image: string;
}) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-40 relative">
        <Image src={image} alt={pathName} layout="fill" objectFit="cover" />
      </div>
      <div className="p-4 flex flex-col justify-between h-64">
        <div>
          <h3 className="font-medium text-lg mb-2 text-gray-200 truncate" title={pathName}>{pathName}</h3>
          <p className="text-gray-400 mb-4 text-sm line-clamp-2" title={pathDescription}>{pathDescription}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-4">Duration: {duration}</p>
          <Link href={`/dashboard/career-path/${encodeURIComponent(pathName)}`}>
            <button className="w-full bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors">
              Explore Path
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}