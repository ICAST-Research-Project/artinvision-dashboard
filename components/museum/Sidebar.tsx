"use client";
import { museumAdminSidebarLinks } from "@/constants";
import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Session } from "next-auth";

const Sidebar = ({ session }: { session: Session }) => {
  const pathname = usePathname();
  return (
    <div className="sticky left-0 top-0 flex h-dvh flex-col justify-between bg-white px-5 pb-5 pt-10">
      <div>
        <div className="flex flex-row items-center gap-2 border-b border-dashed border-primary-admin/20 pb-10 max-md:justify-center">
          <Image src="/museum/admin.png" alt="logo" height={37} width={37} />
          <h1 className="text-2xl font-semibold text-primary-admin max-md:hidden">
            Museum Admin
          </h1>
        </div>
        <div className="mt-10 flex flex-col gap-5">
          {museumAdminSidebarLinks.map((link) => {
            const isSelected =
              (link.route !== "/museum" &&
                pathname.includes(link.route) &&
                link.route.length > 1) ||
              pathname === link.route;

            return (
              <Link
                href={link.route}
                key={link.route}
                className={cn(
                  "link flex items-center gap-2 px-3 py-2 rounded-md",
                  isSelected
                    ? "bg-blue-500 shadow-sm"
                    : "hover:bg-primary-admin/10"
                )}
              >
                <div className="relative w-10 h-10">
                  <Image
                    src={link.img}
                    alt={link.text}
                    fill
                    className={cn(
                      "object-contain",
                      isSelected && "brightness-0 invert"
                    )}
                  />
                </div>
                <p
                  className={cn(
                    "hidden sm:block",
                    isSelected ? "text-white" : "text-dark"
                  )}
                >
                  {link.text}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="my-8 flex w-full flex-row gap-2 rounded-full items-center justify-center border border-light-400 px-6 py-2 shadow-sm max-md:px-2">
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
};

export default Sidebar;
