"use client";
import React from "react";
import logo from "@/assets/logo.svg";
import Image from "next/image";

export interface AccountNavbarProps {}

function AccountNavbar({}: AccountNavbarProps) {
  return (
    <div className="pt-12 pb-8 mb-8 mx-20 px-4 flex flex-row items-center border-b">
      <Image
        src={logo}
        alt={"Lightrail Logo"}
        className="inline-block"
        width={36}
      />
      <span className="pl-4 text-3xl font-semibold"> Projects</span>
    </div>
  );
}

export default AccountNavbar;
