import React, { useState } from "react";
import ProjectCreationModal from "../ProjectCreationModal/ProjectCreationModal";
import ProjectCreationPane from "../ProjectCreationPane/ProjectCreationPane";
import AuthModal from "../AuthModal/AuthModal";
import github from "@/assets/github-mark.svg";
import logo from "@/assets/logo.svg";
import Image from "next/image";

export interface FirstProjectFlowProps {}

function FirstProjectFlow({}: FirstProjectFlowProps) {
  const [authModalVisible, setAuthModalVisible] = useState(false);
  return (
    <div className="w-screen min-h-screen bg-slate-200 flex flex-col">
      <div className="flex flex-row p-8 ">
        <Image
          src={logo}
          alt={"Lightrail Logo"}
          className="inline-block"
          width={48}
        />
        <div className="flex-1" />
        <button
          className="place-self-end text-slate-500 bg-slate-900 bg-opacity-10 p-4 rounded-md font-semibold hover:bg-opacity-20 cursor-pointer"
          onClick={() => setAuthModalVisible(true)}
        >
          Log In / Sign Up
        </button>
      </div>
      <div className="flex-1 gap-4 flex flex-col items-center justify-center">
        <div className="bg-orange-300 bg-opacity-50 rounded-md border-2 border-orange-600 text-orange-700 p-4 mt-2 max-w-2xl">
          <span className="font-bold">
            Projects created without logging in will be viewable and editable by
            everyone!
          </span>{" "}
          If you'd like to save your project and keep it private, please make a
          (free) account first! Click the{" "}
          <span className="font-bold">Log In / Sign Up</span> button above.
        </div>
        <div className="w-[42rem] max-w-full rounded-md bg-slate-50 p-4">
          <div className="font-semibold text-2xl pb-4">New Project</div>
          <ProjectCreationPane />
        </div>
      </div>
      <div className="flex flex-row justify-center py-12 text-lg text-black">
        <a
          href="https://github.com/vishnumenon/lightrail"
          className="opacity-30 hover:opacity-60 cursor-pointer"
        >
          <Image src={github} alt={"Github Repo"} width={48} />
        </a>
      </div>
      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />
    </div>
  );
}

export default FirstProjectFlow;
