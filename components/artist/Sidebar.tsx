"use client";

import React, { useState, useEffect } from "react";
import { artistSidebarLinks } from "@/constants";
import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Session } from "next-auth";
import { Button } from "../ui/button";
import { signOut as nextAuthSignOut } from "next-auth/react";
import { CiLogout } from "react-icons/ci";

interface SidebarProps {
  session: Session;
}

export default function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="sticky left-0 top-0 flex h-dvh flex-col justify-between bg-white px-5 pb-5 pt-10">
      <div>
        <div className="flex items-center gap-2 border-b border-dashed border-primary-admin/20 pb-10 max-md:justify-center">
          <Image src="/account.png" alt="logo" height={37} width={37} />
          <h1 className="text-2xl font-semibold text-primary-admin max-md:hidden">
            Artist Account
          </h1>
        </div>

        <div className="mt-10 flex flex-col gap-5">
          {artistSidebarLinks.map((link) => {
            const isSelected = mounted && pathname === link.route;

            return (
              <Link
                key={link.route}
                href={link.route}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                  isSelected
                    ? "bg-blue-500 shadow-sm text-white"
                    : "hover:bg-primary-admin/10 text-dark"
                )}
              >
                <div className="relative w-10 h-10">
                  <Image
                    src={link.img}
                    alt={link.text}
                    fill
                    className={cn(
                      "object-contain transition-filter",
                      isSelected && "brightness-0 invert"
                    )}
                  />
                </div>
                <span className="hidden sm:block">{link.text}</span>
              </Link>
            );
          })}
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="w-full mt-6 p-4"
          onClick={() => nextAuthSignOut({ callbackUrl: "/" })}
        >
          <CiLogout /> Log out
        </Button>
      </div>

      <div className="my-8 flex items-center gap-2 rounded-full border border-light-400 px-6 py-2 shadow-sm max-md:px-2">
        <Avatar>
          <AvatarFallback className="bg-amber-100">
            {getInitials(session.user.name || "IN")}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col max-md:hidden">
          <p className="font-semibold text-dark-200">{session.user.name}</p>
          <p className="text-light-500 text-xs">{session.user.email}</p>
        </div>
      </div>
    </div>
  );
}
