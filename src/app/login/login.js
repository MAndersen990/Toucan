

export default function LoginPage() {
 

  return (
    <div className="relative flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 w-3/5">
  <div className="container mx-auto w-1/2">
    
    {/* Create Account Link - Positioned in top right */}
    <div className="absolute top-6 right-6">New User? 
      <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
        Create an account
      </a>
    </div>

    <div className="text-3xl my-6">Sign In</div>

    {/* Flex container for social sign-in buttons */}
    <div className="flex items-center justify-between">
      {/* Google Sign-In Button with Logo */}
      <button
        className="Socials flex items-center justify-center py-2 px-4 border border-gray-300 rounded-2xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
        style={{
            background: "transparent linear-gradient(90deg, #f9b035 0%, #f98c4e 53%, #f96767 100%) 0% 0% no-repeat padding-box;",
            borderRadius: "22px",
            opacity: "1",
            fontSize: "16px",
            padding: "15px",
            minWidth: "50%",
            textAlign: "center",
            whiteSpace: "nowrap",
            color: "#FFFFFF",
            cursor: "pointer",
            boxShadow: "3px 16px 40px #695F9724"



        }}
      >
        {/* Google Logo */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1280px-Google_%22G%22_logo.svg.png"
          alt="Google Logo"
          className="w-5 h-5 mr-2"
        />
        Sign in with Google
      </button>

      {/* Apple Sign-In Button */}
      <button
        className="Socials mr-9 flex items-center justify-center py-2 px-4 border border-gray-300 rounded-2xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
        style={{
            background: "#FFFFFF 0% 0% no-repeat padding-box;",
            borderRadius: "22px",
            opacity: "1",
            fontSize: "16px",
            padding: "15px",
            minWidth: "35%",
            textAlign: "center",
            whiteSpace: "nowrap",
            color: "#6149CD",
            cursor: "pointer",
            boxShadow: "3px 16px 40px #695F9724"



        }}
      >
        {/* Apple Logo */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Apple_Logo.svg/1280px-Apple_Logo.svg.png"
          alt="Apple Logo"
          className="w-5 h-5 mr-2"
          
        />
        With Apple
      </button>
    </div>

    <div className="my-6">Or sign in using your email address</div>

    {/* Flex container for inputs to be placed horizontally */}
    <div className="flex space-x-4 my-4 ">
      {/* Username Input */}
      <div className="w-1/2 ">
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
        <input 
          type="text" 
          id="username" 
          placeholder="Enter your username"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Password Input */}
      <div className="w-1/2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input 
          type="password" 
          id="password" 
          placeholder="Enter your password"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
    </div>

    {/* Flex container for Remember Me and Forgot Password */}
    <div className="flex items-center my-4">
      {/* Custom styled 'Remember Me' checkbox */}
      <div className="flex items-center">
        <div className="relative flex items-center h-5">
          <div className="w-4 h-4 bg-white border border-gray-300 rounded-md flex items-center justify-center cursor-pointer">
            <svg className="hidden w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <label className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer">
          Remember me
        </label>
      </div>

      {/* Forgot Password Link */}
      <div>
        <a href="#" className="ml-4 text-sm text-indigo-600 hover:text-indigo-500">
          Forgot your password?
        </a>
      </div>
    </div>

    {/* Sign In Button */}
    <div className="mt-6">
      <button
        type="submit"
        className="signUp w-1/2 py-2 px-4 border border-transparent text-sm font-medium rounded-2xl"
        style={{
            background: "transparent linear-gradient(90deg, #6149CD 0%, #A654AC 47%, #EA5F8B 100%) 0% 0% no-repeat padding-box;",
            borderRadius: "22px",
            opacity: "1",
            fontSize: "16px",
            padding: "15px",
            textAlign: "center",
            whiteSpace: "nowrap",
            color: "#FFFFFF",
            cursor: "pointer",
            boxShadow: "3px 16px 40px #695F9724"



        }}
        
      >
        Sign In
      </button>
    </div>
  </div>
</div>

  

       

        


  );
}
