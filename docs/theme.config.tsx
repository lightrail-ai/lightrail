import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";
import logo from "../assets/icon-circle.png";
import Image from "next/image";

const config: DocsThemeConfig = {
  useNextSeoProps() {
    return {
      titleTemplate: "%s – Lightrail Docs",
      description: "Lightrail Documentation",
    };
  },
  logo: (
    <div
      style={{
        display: "inline-flex",
        gap: 8,
        alignItems: "center",
        fontSize: "1.3rem",
      }}
    >
      <Image src={logo} alt="Lightrail Logo" width={24} />
      Lightrail
    </div>
  ),
  project: {
    link: "https://github.com/lightrail-ai/lightrail",
  },
  chat: {
    link: "https://discord.gg/57bNyxgb7g",
  },
  docsRepositoryBase:
    "https://github.com/lightrail-ai/lightrail/tree/main/docs",
  footer: {
    text: "MIT 2023 © Lightrail",
  },
};

export default config;
