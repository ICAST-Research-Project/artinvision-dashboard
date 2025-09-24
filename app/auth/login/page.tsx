import { LoginForm } from "@/components/auth/login-form";
import React from "react";

const LoginPage = () => {
  return (
    <main
      className="
        flex
        flex-col
        items-center
        justify-center  
      
        min-h-screen       
        px-4               
        py-8               
      "
    >
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  );
};

export default LoginPage;
