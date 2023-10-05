import {
  faApple,
  faDiscord,
  faGithub,
  faLinux,
} from "@fortawesome/free-brands-svg-icons";
import { faAnglesDown, faBook } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Manrope } from "next/font/google";
import Image from "next/image";

const manrope = Manrope({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`bg-neutral-950 text-neutral-50 min-h-screen ${manrope.className}`}
    >
      <nav className="sticky top-0 z-10 bg-neutral-50 bg-opacity-5 backdrop-filter backdrop-blur-lg  w-full ">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <span className="inline-flex flex-row items-center gap-2 text-3xl">
              <Image
                width={36}
                height={36}
                src={"/logo.png"}
                alt="Lightrail Logo"
              />
              Lightrail
            </span>
            <div className="flex space-x-4 items-center">
              <a
                href="https://docs.lightrail.ai"
                className="inline-flex flex-col gap-1 items-center bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-full px-4 py-2 hover:bg-opacity-20"
              >
                <span className="text-sm font-extrabold uppercase ">guide</span>
              </a>
              <a href="https://discord.gg/57bNyxgb7g">
                <FontAwesomeIcon icon={faDiscord} size={"2x"} />
              </a>
              <a href="https://github.com/lightrail-ai/lightrail">
                <FontAwesomeIcon icon={faGithub} size={"2x"} />
              </a>
            </div>
          </div>
        </div>
      </nav>
      <div className="w-full h-screen absolute top-0 left-0 hero-bg"></div>
      <div className="w-full h-screen absolute top-0 left-0 bg-gradient-to-b from-transparent to-neutral-950"></div>
      <div className="container m-auto max-w-6xl min-h-screen mb-8 flex flex-col items-center px-4 py-24 relative gap-8">
        <div className="text-center text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-slate-500">
          The Ultimate <br /> AI Command Center
        </div>
        <div className="rounded-full border text-xs md:text-base border-neutral-600 px-4 py-2 opacity-40 text-center">
          Simplifying Software Development
        </div>
        <img
          src={"/screenshot5.png"}
          className="flex-shrink shadow-lg rounded-md max-h-72 my-6"
        />
        <div className="inline-flex flex-col sm:flex-row gap-4">
          <a
            href="https://github.com/lightrail-ai/lightrail#installation"
            className="rounded-full border px-4 py-2 inline-flex flex-row justify-center items-center gap-2 text-lg hover:bg-neutral-100 hover:text-neutral-950 active:bg-neutral-300 active:text-neutral-950  transition-colors"
          >
            <FontAwesomeIcon icon={faLinux} />
            <div>
              Download <span className="opacity-50">for Linux</span>
            </div>
          </a>
          <a
            href="https://github.com/lightrail-ai/lightrail#installation"
            className="rounded-full border px-4 py-2 inline-flex flex-row justify-center items-center gap-2 text-lg hover:bg-neutral-100 hover:text-neutral-950 active:bg-neutral-300 active:text-neutral-950 transition-colors"
          >
            <FontAwesomeIcon icon={faApple} />
            <div>
              Download <span className="opacity-50">for OS&nbsp;X</span>
            </div>
          </a>
        </div>
        <div className="flex-1" />
        <div>
          <FontAwesomeIcon icon={faAnglesDown} className="animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col gap-16">
        <div className="container mx-auto flex flex-col lg:flex-row ">
          <div className="flex-1 h-96 py-8 mx-4 pl-4 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-500 flex justify-center items-end flex-col">
            <div>
              <img
                src="/screenshot2-cut.png"
                className="shadow-lg rounded-l-md h-auto max-h-40"
              />
            </div>
          </div>
          <div className="flex-1 flex-shrink flex justify-center items-center min-w-0 px-24 py-12">
            <div className="max-w-md">
              <div className="text-4xl font-extrabold pb-4">Context-Aware</div>
              <div className="opacity-60">
                Leverage data from active applications like code editors and web
                browsers to refine AI command outputs.
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto flex flex-col-reverse lg:flex-row">
          <div className="flex-1 flex-shrink flex justify-center items-center min-w-0 px-24 py-12">
            <div className="max-w-md">
              <div className="text-4xl font-extrabold pb-4">Integrated</div>
              <div className="opacity-60">
                Let AI commands interact with your applications on your behalf,
                by proposing code, navigating software, or creating files.
              </div>
            </div>
          </div>
          <div className="flex-1 h-96 py-8 mx-4 pr-4 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-500 flex justify-center items-start flex-col">
            <div>
              <img
                src="/screenshot3-cut.png"
                className="shadow-lg rounded-r-md max-h-64"
              />
            </div>
          </div>
        </div>
        <div className="container mx-auto flex flex-col lg:flex-row ">
          <div className="flex-1 h-96 py-8 mx-4 pl-4 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-500 flex justify-center items-end flex-col">
            <div>
              <img
                src="/screenshot4-cut.png"
                className="shadow-lg rounded-l-md h-auto max-h-64"
              />
            </div>
          </div>{" "}
          <div className="flex-1 flex-shrink flex justify-center items-center min-w-0 px-24 py-12">
            <div className="max-w-md">
              <div className="text-4xl font-extrabold pb-4">
                Broadly Extensible
              </div>
              <div className="opacity-60">
                Add new commands and context sources to your Lightrail instance
                with the Lightrail Tracks or develop your own using our
                straightforward API!
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto ">
          <div className="mx-4 px-4 border rounded-3xl border-neutral-600 h-96 mb-6 flex flex-col gap-16 justify-center items-center ">
            <div className="font-extrabold text-4xl text-center">
              100% Free & Open Source
            </div>
            <div className="inline-flex flex-col md:flex-row gap-4">
              <a
                href="https://github.com/lightrail-ai/lightrail#installation"
                className="rounded-full border px-4 py-2 inline-flex flex-row justify-center items-center gap-2 text-lg hover:bg-neutral-100 hover:text-neutral-950 active:bg-neutral-300 active:text-neutral-950  transition-colors"
              >
                <FontAwesomeIcon icon={faLinux} />
                <div>
                  Download <span className="opacity-50">for Linux</span>
                </div>
              </a>

              <a
                href="https://github.com/lightrail-ai/lightrail#installation"
                className=" rounded-full border px-4 py-2 inline-flex flex-row justify-center items-center gap-2 text-lg hover:bg-neutral-100 hover:text-neutral-950 active:bg-neutral-300 active:text-neutral-950 transition-colors"
              >
                <FontAwesomeIcon icon={faApple} />
                <div>
                  Download <span className="opacity-50">for OS&nbsp;X</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
