import { ResetForm } from "@/components/auth/reset-form";
import React from "react";

const ResetPage = () => {
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
      <ResetForm />
    </div>
  );
};

export default ResetPage;
