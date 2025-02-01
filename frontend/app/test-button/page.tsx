"use client";

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
      <div className="max-w-7xl mx-auto p-8 text-center">
        <h1 className="text-5xl font-bold text-center mb-8 pt-8 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">
          Welcome to the Entry Assessment
        </h1>

        <Link href="/test">
          <button className="bg-blue-600 text-white rounded-lg px-6 py-3 text-xl font-semibold hover:bg-blue-700 transition-colors">
            Take Assessment
          </button>
        </Link>
      </div>
    </div>
  );
}
