import { faCheck, faClose, faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";

export interface ComponentNameEditorProps {
  name: string;
  onNameChange: (newName: string) => void;
}

function ComponentNameEditor({ name, onNameChange }: ComponentNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [confirmationModalVisible, setConfirmationModalVisible] =
    useState(false);

  useEffect(() => {
    setNewName(name);
    setIsEditing(false);
  }, [name]);

  return (
    <>
      <div className="bg-sky-300 rounded-lg px-2 py-0.5 text-slate-900 inline-flex justify-center items-center transition-all">
        {isEditing ? (
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="rounded-lg bg-white bg-opacity-50 px-1"
          />
        ) : name === "index" ? (
          "index (root)"
        ) : (
          `<${name} />`
        )}
      </div>
      {isEditing ? (
        <>
          <button
            className="rounded-full hint--bottom hint--rounded"
            aria-label="Save Name"
            onClick={() => {
              if (name !== newName) {
                setConfirmationModalVisible(true);
              } else {
                setIsEditing(false);
              }
            }}
          >
            <FontAwesomeIcon icon={faCheck} className="text-green-600" />
          </button>
          <button
            className="rounded-full hint--bottom hint--rounded"
            aria-label="Cancel"
            onClick={() => setIsEditing(false)}
          >
            <FontAwesomeIcon icon={faClose} className="text-red-500" />
          </button>
        </>
      ) : (
        name !== "index" && (
          <button
            className="rounded-full hint--bottom hint--rounded"
            aria-label="Edit Name"
            onClick={() => setIsEditing(true)}
          >
            <FontAwesomeIcon icon={faPencil} />
          </button>
        )
      )}
      <Modal
        visible={confirmationModalVisible}
        onClose={() => setConfirmationModalVisible(false)}
        title="Confirm Name Change"
        content={
          <div className="text-slate-600 font-normal">
            Are you sure you want to change the name of this component?
            Currently, this{" "}
            <b>will cause references to this component in your code to break</b>
            , and you will need to update them manually.{" "}
            <b>
              Additionally, the revision history of this component will be lost.
            </b>
          </div>
        }
        actions={[
          <Button
            className="w-full mt-4"
            key={1}
            onClick={() => {
              setConfirmationModalVisible(false);
              setNewName(name);
              setIsEditing(false);
            }}
            secondary
          >
            Cancel
          </Button>,
          <Button
            className="w-full mt-4"
            key={0}
            onClick={() => {
              setConfirmationModalVisible(false);
              onNameChange(newName);
              setIsEditing(false);
            }}
          >
            Change Name
          </Button>,
        ]}
      />
    </>
  );
}

export default ComponentNameEditor;
