import Image from 'next/image'



export default function LogoPage() {
  return (
    <div className="relative lg:flex min-h-screen flex-col px-6 py-12 lg:px-8 w-2/5 hidden"
    style={{
      background: "linear-gradient(90deg, #6149cd 0%, #a654ac 47%, #ea5f8b 100%) 0% 0% no-repeat padding-box"
    }}
  >
    {/* Logo and Title */}
    <div className="absolute top-6 left-6 sm:flex items-center ml-6">
      <Image
        src="../public/AlphaOrbit.png"
        width={48}
        height={48}
        alt="Alpha Orbit Logo"
      />
      <span className="ml-7 text-4xl text-white">Alpha Orbit</span>
    </div>
  
    {/* Invest like a Pro Title */}
    <div className="flex justify-left items-end h-1/5 w-5/6 ml-auto">
      <h1 className="text-white text-6xl ">Start Investing like a Pro today!</h1>
    </div>

    {/* Doughnut Image */}
    <div className="flex justify-left items-end h-3/5 w-5/6 ml-auto">
      <Image
        src="../../doughnut.png"
        width={350}
        height={350}
        alt="Alpha Orbit Logo"
      />
    </div>

    {/* Copyright Section at Bottom Right */}
    <div className="absolute bottom-0 left-0 p-4">
      <p className="text-white text-sm">&copy; 2023 Alpha Orbit. All rights reserved.</p>
    </div>

  </div>


  

  
  

  );
}
