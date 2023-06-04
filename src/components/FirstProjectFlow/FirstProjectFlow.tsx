import React, { useState } from "react";
import ProjectCreationModal from "../ProjectCreationModal/ProjectCreationModal";
import ProjectCreationPane from "../ProjectCreationPane/ProjectCreationPane";
import AuthModal from "../AuthModal/AuthModal";

export interface FirstProjectFlowProps {}

function FirstProjectFlow({}: FirstProjectFlowProps) {
  const [authModalVisible, setAuthModalVisible] = useState(false);
  return (
    <div className="w-screen h-screen absolute top-0 left-0 bg-slate-200 flex flex-col">
      <div className="text-right p-8">
        <button
          className="text-slate-500 bg-slate-900 bg-opacity-10 p-4 rounded-md font-semibold hover:bg-opacity-20 cursor-pointer"
          onClick={() => setAuthModalVisible(true)}
        >
          Log In / Sign Up
        </button>
      </div>
      <div className="flex-1 gap-4 flex flex-col items-center justify-center">
        <div className="bg-orange-300 bg-opacity-50 rounded-md border-2 border-orange-600 text-orange-700 p-4 max-w-2xl">
          <span className="font-bold">
            Projects created without logging in will be viewable and editable by
            everyone!
          </span>{" "}
          If you'd like to save your project and keep it private, please make a
          (free) account first! Click the{" "}
          <span className="font-bold">Log In / Sign Up</span> button above.
        </div>
        <div className="w-[42rem] rounded-md bg-slate-50 p-4">
          <div className="font-semibold text-2xl pb-4">New Project</div>
          <ProjectCreationPane />
        </div>
      </div>
      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />
    </div>
  );
}

export default FirstProjectFlow;
