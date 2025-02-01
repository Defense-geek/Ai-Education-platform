'use client'

import Image from 'next/image';
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <header className="bg-[#45D0D9] text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="mailto:support@inlustro.co">support@inlustro.co</Link>
              <Link href="tel:+917338709583">+91 7338709583</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="https://linkedin.com" aria-label="LinkedIn">
                {/* LinkedIn Icon */}
              </Link>
              <Link href="https://instagram.com" aria-label="Instagram">
                {/* Instagram Icon */}
              </Link>
              <Link href="https://facebook.com" aria-label="Facebook">
                {/* Facebook Icon */}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex-shrink-0">
            <div className="flex-shrink-0">
                  <Link href="/" className="text-2xl font-bold text-blue-600">
                    LOGO
                  </Link>
                </div>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-gray-900 hover:text-[#45D0D9]">Home</Link>
              <Link href="#" className="text-gray-900 hover:text-[#45D0D9]">More +</Link>
              <Button className="bg-[#45D0D9] text-white hover:bg-[#3bb8c0]">
                Get In Touch
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center space-y-8">
            <h1 className="text-4xl font-bold mb-8">Welcome to AI Learn</h1>
            
            {/* Sign In and Sign Up Buttons */}
            <div className="space-x-4">
              <Button
                asChild
                className="bg-[#45D0D9] text-gray-900 font-semibold hover:bg-[#3bb8c0] hover:text-white transition-transform hover:scale-105"
              >
                <Link href="/sign-in" aria-label="Sign in to your InLustro account">Sign In</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-[#45D0D9] text-gray-900 font-semibold hover:bg-[#45D0D9] hover:text-white transition-transform hover:scale-105"
              >
                <Link href="/sign-up" aria-label="Create a new InLustro account">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
