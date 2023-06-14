interface StarterComponentDescription {
  as: string;
  categories: string[];
  description: string;
  src: string;
  dependencies: string[];
  example: string;
}

export interface Library {
  [name: string]: StarterComponentDescription;
}

export const CompleteLibrary: Library = {
  HeroA: {
    as: "Hero",
    categories: ["landing"],
    description:
      "A large, simple hero section for a landing page. Includes a heading, subheading, and CTA button. Good for tech-industry/startup landing pages.",
    src: "HeroA.render.jsx",
    dependencies: [],
    example:
      '<HeroA heading="Simplify Your Life Today" subheading="No more hassle, everything will be easy from now on." cta="Sign Up!" bgGradient="from-green-950 to-black" textGradient="from-green-300 to-white" />',
  },
  ButtonA: {
    as: "Button",
    categories: ["basic", "landing"],
    description:
      "A simple, professional button with primary/not-primary variants. Good for light-mode, enterprise-y pages.",
    src: "ButtonA.render.jsx",
    dependencies: [],
    example: "<ButtonA primary>Sign Up</ButtonA><ButtonA>Log In</ButtonA>",
  },
  ButtonB: {
    as: "Button",
    categories: ["basic", "landing"],
    description:
      "A sleek, modern, sexy button with primary/not-primary variants. Good for dark-mode, startup-y pages. Only works against dark backgrounds.",
    src: "ButtonB.render.jsx",
    dependencies: [],
    example: "<ButtonB primary>Sign Up</ButtonB><ButtonB>Log In</ButtonB>",
  },
};

export const LibraryCategories = [
  { value: "none", label: "None" },
  { value: "basic", label: "Basic (Buttons, Inputs, Cards, etc)" },
  { value: "landing", label: "Landing Page (Basic + Hero, Sections, etc)" },
  // { value: "dashboard", label: "Dashboard" },
  // { value: "all", label: "All" },
];
