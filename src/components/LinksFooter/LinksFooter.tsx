import React from "react";
import Image from "next/image";
import github from "@/assets/github-mark.svg";
import discord from "@/assets/discord-mark.svg";

export interface LinksFooterProps {}

function LinksFooter({}: LinksFooterProps) {
  return (
    <div className="flex flex-row justify-center p-6  text-lg text-black gap-4">
      <a
        href="https://github.com/vishnumenon/lightrail"
        target="_blank"
        className="opacity-30 hover:opacity-60 cursor-pointer"
      >
        <Image src={github} alt={"Github Repo"} height={36} />
      </a>
      <a
        href="https://discord.gg/57bNyxgb7g"
        target="_blank"
        className="opacity-30 hover:opacity-60 cursor-pointer"
      >
        <Image src={discord} alt={"Join our Discord"} height={36} />
      </a>
    </div>
  );
}

export default LinksFooter;
