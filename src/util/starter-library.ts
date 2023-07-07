import { FileExternalItem } from "./storage";

export interface StarterComponentDescription {
  name: string;
  categories: string[];
  description: string;
  externals?: FileExternalItem[]; // Externals that this component depends on.
  example: string;
  variants: {
    external?: FileExternalItem; // External that provides this component. A variant can specify EITHER external OR src, not both.
    src?: string;
    for?: string[]; //An array of descriptors for which this variant is appropriate. Can be style names, or other descriptors (e.g. "style:nebula", "scheme:dark", "industry:tech"), etc.
  }[]; // When selecting an implementation of a component, the first one with a matching descriptor will be used. variants with 'for == undefined' match all descriptors.
}

export type Library = StarterComponentDescription[];

export const COMPLETE_LIBRARY: Library = [
  {
    name: "Button",
    categories: ["basic", "landing", "dashboard"],
    description: "A UI button with primary/not-primary variants.",
    example: "<Button>Cancel</Button><Button primary>Continue</Button>",
    variants: [
      {
        for: ["style:pine", "style:holly"],
        src: "ButtonB.render.jsx",
      },
      {
        src: "ButtonA.render.jsx",
      },
    ],
  },
  {
    name: "Input",
    categories: ["basic", "landing", "dashboard"],
    description: "A text input field.",
    example: "<Input placeholder='Enter your email' />",
    variants: [
      {
        src: "InputA.render.jsx",
      },
    ],
  },
  {
    name: "Hero",
    categories: ["landing"],
    description:
      "A big Includes a heading, subheading, and CTA button. Good for landing pages.",
    example:
      "<Hero heading='Quality resources shared by the community' subheading='Access 100+ resources of all kinds, for one low monthly price' tagline='By Artists, For Artists' cta='Get Access Now!' />",
    variants: [
      {
        for: ["style:pine", "style:holly"],
        src: "HeroA.render.jsx",
      },
      {
        src: "HeroB.render.jsx",
      },
    ],
  },
  {
    name: "SectionHeading",
    categories: ["landing"],
    description: "A heading (and subheading) for a section of a landing page.",
    example:
      "<SectionHeading heading='Features' subheading='Here are some of the features we offer' />",
    variants: [
      {
        src: "SectionHeadingA.render.jsx",
      },
    ],
  },
  {
    name: "FeatureGrid",
    categories: ["landing"],
    description:
      "A responsive grid of FeatureCards for displaying features, as a section on a landing page.",
    example:
      "<FeatureGrid> <FeatureCard icon='fa-gear' heading='Amazing Feature' description='This feature will make your experience incredibly smooth and efficient.' />  <FeatureCard icon='fa-rocket' heading='Cool Feature' description='This feature is fun!' /> </FeatureGrid>",
    variants: [
      {
        src: "FeatureGridA.render.jsx",
      },
    ],
  },
  {
    name: "FeatureCard",
    categories: ["landing"],
    description: "A card that showcases information about a single feature.",
    example:
      "<FeatureCard icon='fa-gear' heading='Amazing Feature' description='This feature will make your experience incredibly smooth and efficient.' />",
    variants: [
      {
        for: ["style:holly"],
        src: "FeatureCardB.render.jsx",
      },
      {
        src: "FeatureCardA.render.jsx",
      },
    ],
  },
  {
    name: "Navbar",
    categories: ["landing"],
    description:
      "A top-of-page navbar with a logo, links, and a CTA button (optional).",
    example:
      "<Navbar logo={'Nebula'} links={[ { url: '#features', text: 'Features' }, { url: '#testimonials', text: 'Testimonials' }, { url: '#contact', text: 'Contact', }, ]} cta={{ text: 'Sign Up', url: '/signup', }} />",
    variants: [
      {
        for: ["style:pine", "style:holly"],
        src: "NavbarA.render.jsx",
      },
      {
        src: "NavbarB.render.jsx",
      },
    ],
  },
  {
    name: "CTASection",
    categories: ["landing"],
    description:
      "A Call-to-Action section for a landing page, including a heading, subheading, and optionally 2-3 callouts of selling-points.",
    example:
      '<CTASection cta="Install Now" heading="Ready to dive in?" subheading="Join our community today." callouts={["Open-Source", "Free Forever"]} />',
    variants: [
      {
        for: ["style:pine"],
        src: "CTASectionB.render.jsx",
      },
      {
        src: "CTASectionA.render.jsx",
      },
    ],
  },
  {
    name: "Chart",
    categories: ["dashboard"],
    description:
      "A chart component for displaying data, from react-apexcharts. Props are 'type', 'series', 'width', 'height', and 'options'. Use your knowledge of React-ApexCharts docs when using this component. ",
    example:
      "<Chart type='bar' series={[{data: [{x: 'Jan', y: 100}, {x: 'Feb', y: 200}, {x: 'Mar', y: 300}]}]} options={{xaxis: {type: 'category'}}} width={350} />",
    variants: [
      {
        external: {
          default: "Chart",
          from: "react-apexcharts",
        },
      },
    ],
  },
  {
    name: "Card",
    categories: ["dashboard"],
    description:
      "A rounded card component with a mild shadow, with a heading/subheading (both optional), useful for displaying its children in a dashboard grid.",
    example:
      "<Card heading='Active Now' subheading='Currently active sessions'><span className='text-4xl'>35</span></Card>",
    variants: [
      {
        src: "CardA.render.jsx",
      },
    ],
  },
  {
    name: "index",
    categories: [], // Never included in "usableLibrary" for rendering
    description: "A page for testing themes (internal use only).",
    externals: [
      {
        default: "Chart",
        from: "react-apexcharts",
      },
    ],
    example: "",
    variants: [
      {
        src: "ThemeTester.render.jsx",
      },
    ],
  },
];

export const LIBRARY_CATEGORIES = [
  { value: "none", label: "None" },
  { value: "basic", label: "Basic (Buttons, Inputs, Cards, etc)" },
  { value: "landing", label: "Landing Page (Basic + Hero, Sections, etc)" },
  { value: "dashboard", label: "Dashboard (Basic + Graphs, Charts" },
  // { value: "all", label: "All" },
];
