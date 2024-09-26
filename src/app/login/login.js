'use client'
import { useState } from "react";
import Link from 'next/link';

export default function LoginPage() {
  const [isRemembered, setIsRemembered] = useState(false);

  // Toggle the checkbox state
  const handleCheckboxClick = () => {
    setIsRemembered(!isRemembered);
  };

  return (
    <div className="relative flex min-h-full flex-col justify-center px-4 py-8 sm:px-6 lg:px-8 w-full lg:w-3/5 mx-auto">
      <div className="container mx-auto w-full sm:w-4/5 lg:w-1/2">
        
        {/* Create Account Link - Positioned in top right */}
        <div className="absolute top-6 right-6 hidden sm:flex">
          <span className="text-sm font-medium mr-1">New User?</span> 
          <Link href="/signup/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Create an account
          </Link>
        </div>

        <div className="text-4xl my-10 text-center lg:text-left">Sign In</div>

        {/* Flex container for social sign-in buttons */}
        <div className="flex flex-col lg:flex-row items-center justify-between">
          {/* Google Sign-In Button with Logo */}
          <button
            className="my-5 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-2xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 w-full lg:w-[48%]"
            style={{
              background: "transparent linear-gradient(90deg, #f9b035 0%, #f98c4e 53%, #f96767 100%)",
              color: "#FFFFFF",
              cursor: "pointer",
              boxShadow: "3px 16px 40px #695F9724",
              padding: "16px"
            }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1280px-Google_%22G%22_logo.svg.png"
              alt="Google Logo"
              className="w-5 h-5 mr-2"
            />
            Sign in with Google
          </button>

          {/* Apple Sign-In Button */}
          <button
            className="my-5 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-2xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 w-full lg:w-[40%]"
            style={{
              background: "#FFFFFF",
              color: "#6149CD",
              cursor: "pointer",
              boxShadow: "3px 16px 40px #695F9724",
              padding: "16px"
            }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Apple_Logo.svg/1280px-Apple_Logo.svg.png"
              alt="Apple Logo"
              className="w-5 h-5 mr-2"
            />
            With Apple
          </button>
        </div>

        <div className="my-7 text-center lg:text-left">Or sign in using your email address</div>

        {/* Flex container for inputs to be placed horizontally */}
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 my-4">
          {/* Username Input */}
          <div className="w-full lg:w-1/2">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input 
              type="text" 
              id="username" 
              placeholder="Enter your username"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              style={{
                padding: "16px",
              }}
            />
          </div>

          {/* Password Input */}
          <div className="w-full lg:w-1/2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Enter your password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              style={{
                padding: "16px",
              }}
            />
          </div>
        </div>

        {/* Flex container for Remember Me and Forgot Password */}
        <div className="flex flex-col lg:flex-row items-center lg:justify-between my-4">
          <div className="flex items-center" onClick={handleCheckboxClick}>
            <div className="relative flex items-center h-5 cursor-pointer">
              <div className="w-4 h-4 bg-white border border-gray-300 rounded-md flex items-center justify-center">
                {isRemembered && (
                  <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <label className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer">
              Remember me
            </label>
          </div>

          {/* Forgot Password Link */}
          <div className="mt-4 lg:mt-0">
            <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500">
              Forgot your password?
            </a>
          </div>
        </div>

        {/* Sign In Button */}
        <div className="mt-10">
            <Link href="/dashboard">
              <button
                type="submit"
                className="w-full lg:w-1/2 mx-auto py-2 px-4 border border-transparent text-sm font-medium rounded-2xl"
                style={{
                  background: "transparent linear-gradient(90deg, #6149CD 0%, #A654AC 47%, #EA5F8B 100%)",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  boxShadow: "3px 16px 40px #695F9724",
                  padding: "16px"
                }}
              >
              Sign In
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
