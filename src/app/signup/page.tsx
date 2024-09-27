import LogoPage from "./logo.js";
import SignupPage from "./SignupPage";


export default function CreateAccount() {
    return (
      <div className="flex min-h-screen">
      <LogoPage></LogoPage>
      <SignupPage></SignupPage>
      </div>
    );
  }
