import React from "react";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-700 via-cyan-500 to-blue-300">
      {children}
    </div>
  );
};

export default AuthLayout;
