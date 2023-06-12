export const Library = {
  HeroA: {
    as: "Hero",
    categories: ["landing"],
    description:
      "A large, simple hero section for a landing page. Includes a heading, subheading, and CTA button. Use for tech-industry/startup landing pages. Do not use for things outside the tech industry or for pages that aren't landing pages.",
    src: "HeroA.render.jsx",
    dependencies: ["ButtonA"],
    example:
      '<HeroA heading="Simplify Your Life Today" subheading="No more hassle, everything will be easy from now on." cta="Sign Up!" bgGradient="from-green-950 to-black" textGradient="from-green-300 to-white" />',
  },
};

export const LibraryCategories = [
  { value: "none", label: "None" },
  { value: "basic", label: "Basic (Buttons, Inputs, Cards, etc)" },
  { value: "landing", label: "Landing Page (Basic + Hero, Sections, etc)" },
  // { value: "dashboard", label: "Dashboard" },
  // { value: "all", label: "All" },
];
