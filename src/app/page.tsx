//import Image from "next/image";
//import prefix from "utils/prefix.ts"
//import { prefix } from "../../utils/prefix";
import Login from "./login/login.js"
import Logo from "./login/logo.js"

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <Logo/>
      <Login/>
    </div>
  );
}
