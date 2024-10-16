'use client'

import { useState, FormEvent } from "react"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useFirebase } from '../../contexts/FirebaseContext'

export default function SignupPage() {
  const [isRemembered, setIsRemembered] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const { signUp, logAnalyticsEvent } = useFirebase()

  // Toggle the checkbox state
  const handleCheckboxClick = () => {
    setIsRemembered(!isRemembered);
    logAnalyticsEvent('sign_up_remember_email', { checked: !isRemembered });
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password || !name || !username) {
      setError("All fields are required")
      return
    }

    try {
      await signUp(email, password, name, username)
      logAnalyticsEvent('sign_up', { method: 'email' });
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
        logAnalyticsEvent('sign_up_error', { message: err.message });
      } else {
        setError("Failed to create an account. Please try again.")
        logAnalyticsEvent('sign_up_error', { message: "Failed to create an account." });
      }
      console.error(err)
    }
  }
  
  return (
    <div className="relative flex min-h-full flex-col justify-center px-4 py-8 sm:px-6 lg:px-8 w-full lg:w-3/5 mx-auto">
      <div className="container mx-auto w-full sm:w-4/5 lg:w-1/2">
        
        {/* Create Account Link - Positioned in top right */}
        <div className="absolute top-6 right-6 hidden sm:flex">
          <span className="text-sm font-medium mr-1">Already have an account?</span> 
          <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Sign In
          </Link>
        </div>

        <div className="text-4xl my-10 text-center lg:text-left">Create Your Account</div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

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
            Sign up with Google
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

        <div className="my-7 text-center lg:text-left">Or sign up using your email address</div>

        {/* Flex container for inputs to be placed horizontally */}
        <form onSubmit={handleSignUp}>
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 my-4">
            {/* Username Input */}
            <div className="w-full lg:w-1/2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input 
                type="text" 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                style={{
                  padding: "16px",
                }}
              />
            </div>

            {/* Password Input */}
            <div className="w-full lg:w-1/2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input 
                type="text" 
                id="username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                style={{
                  padding: "16px",
                }}
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 my-4">
            {/* Username Input */}
            <div className="w-full lg:w-1/2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Your email</label>
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              I accept the <a className="text-sm text-indigo-600 hover:text-indigo-500">Terms and Conditions</a>
            </label>
          </div>

          {/* Forgot Password Link */}
          
        </div>

        {/* Sign In Button */}
        <div className="mt-10">
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
            Sign Up
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}
