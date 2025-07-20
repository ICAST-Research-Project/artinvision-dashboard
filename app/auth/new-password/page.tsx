import { NewPasswordForm } from "@/components/auth/new-password-form";
import React from "react";

const NewPasswordPage = () => {
  return (
    <div
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
      <NewPasswordForm />
    </div>
  );
};

export default NewPasswordPage;
