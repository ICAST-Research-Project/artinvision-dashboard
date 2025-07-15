import { auth } from "@/auth";
import Header from "@/components/museum/Header";

import Sidebar from "@/components/museum/Sidebar";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  if (!session?.user.id) redirect("/auth/login");
  return (
    <main className="flex min-h-screen w-full flex-row">
      <Sidebar session={session} />

      <div className="flex w-[calc(100%-264px)] flex-1 flex-col bg-light-900 p-5 xs:p-10">
        <Header session={session} />
        {children}
      </div>
    </main>
  );
};

export default Layout;
