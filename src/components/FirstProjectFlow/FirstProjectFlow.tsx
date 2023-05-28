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
          Log in / Sign up
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-2xl rounded-md bg-slate-50">
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
