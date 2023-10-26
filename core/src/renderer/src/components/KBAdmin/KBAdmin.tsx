import React, { useState } from "react";
import Button from "../ui-elements/Button/Button";
import { trpcClient } from "@renderer/util/trpc-client";
import classnames from "classnames"; // Import classNames library

export interface KBAdminProps {}

function KBAdmin({}: KBAdminProps) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  async function resetKnowledgeBase() {
    setLoading(true);
    await trpcClient.kb.reset.mutate();
    setLoading(false);
    setCompleted(true);
  }

  // Define class for changing the button's color
  const buttonClass = classnames({
    "bg-red-800 bg-opacity-100 hover:bg-opacity-70": !loading && !completed,
    "bg-yellow-500 hover:bg-yellow-300": loading,
    "bg-green-600 hover:bg-green-400": completed,
  });

  return (
    <div className="relative">
      <div className="py-4 px-6">
        <Button
          className={buttonClass} // Use the defined button class based on state
          title="Reset Knowledge Base"
          onClick={() => resetKnowledgeBase()}
        >
          {loading
            ? "Resetting..." // Changed message
            : completed
            ? "Reset Completed"
            : "Reset Knowledge Base"}
        </Button>
      </div>
    </div>
  );
}

export default KBAdmin;
