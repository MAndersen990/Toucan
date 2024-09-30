"use client"

import { useState } from 'react'
import { useFirebase } from '@/contexts/FirebaseContext'
import Link from 'next/link'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const { resetPassword } = useFirebase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await resetPassword(email)
      alert("Please check your email for instructions to reset your password.")
    } catch (error) {
      alert(error)
    }
  }

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

        <div>
          <h2 className="text-4xl my-10 text-center lg:text-left">Forgot password?</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the email address you used when you joined and we&apos;ll send you instructions to reset your password.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <input 
              type="email" 
              name="email"
              id="email" 
              autoComplete="email"
              required
              value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                style={{
                  padding: "16px",
                }}
            />
          </div>

          <div className="mt-10">
            <button
              type="submit"
              className="w-full mx-auto py-2 px-4 border border-transparent text-sm font-medium rounded-2xl"
              style={{
                background: "transparent linear-gradient(90deg, #6149CD 0%, #A654AC 47%, #EA5F8B 100%)",
                color: "#FFFFFF",
                cursor: "pointer",
                boxShadow: "3px 16px 40px #695F9724",
                padding: "16px"
              }}
            >
              Submit
            </button>
          </div>
        </form>
         {/* Forgot Password Link */}
         <div className="mt-5 lg:mt-5">
            <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
              Back to Sign in
            </Link>
          </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage