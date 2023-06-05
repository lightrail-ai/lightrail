"use client";
import React from "react";

export interface AccountNavbarProps {}

function AccountNavbar({}: AccountNavbarProps) {
  return (
    <div className="pt-12 pb-8 mb-8 mx-20 px-4 flex flex-row border-b">
      <span className="text-3xl font-semibold">🪄 Projects</span>
    </div>
  );
}

export default AccountNavbar;
