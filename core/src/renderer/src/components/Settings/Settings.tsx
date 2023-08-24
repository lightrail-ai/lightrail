import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { viewAtom } from "@renderer/state";
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import TextInput from "../ui-elements/TextInput/TextInput";
import Button from "../ui-elements/Button/Button";
import type { SettingsObject } from "../../../../main/api";
import { trpcClient } from "@renderer/util/trpc-client";
import SelectInput from "../ui-elements/SelectInput/SelectInput";

export interface SettingsProps {}

const models = ["gpt-3.5-turbo-16k-0613", "gpt-4-0613"];

function Settings({}: SettingsProps) {
  const setView = useSetRecoilState(viewAtom);

  const [settings, setSettings] = useState<SettingsObject | undefined>();
  useEffect(() => {
    trpcClient.settings.get.query().then((res) => {
      setSettings(res);
    });
  }, []);

  return (
    <div className="min-w-[600px] py-4">
      <div className="px-6 py-2 flex flex-row items-center">
        <button
          className="opacity-50 hover:opacity-100"
          onClick={() => setView("prompt")}
        >
          <FontAwesomeIcon fixedWidth icon={faArrowLeft} className="pr-6 " />
        </button>
        <div className="text-neutral-50">Settings</div>
      </div>
      {settings && (
        <>
          <div className="px-6 py-2">
            <TextInput
              value={settings.openAIApiKey || ""}
              onChange={(newVal) =>
                setSettings({ ...settings, openAIApiKey: newVal })
              }
              label="OpenAI API Key"
              placeholder="Your API Key"
            />
          </div>
          <div className="px-6 py-2">
            <SelectInput
              options={models}
              value={settings.model || models[0]}
              onChange={(newVal) => setSettings({ ...settings, model: newVal })}
              label="Model"
              placeholder="Model Name"
            />
          </div>
        </>
      )}
      <div className="px-6 py-2 flex flex-row items-center justify-end">
        <Button
          primary
          onClick={async () => {
            if (settings) {
              await trpcClient.settings.set.mutate(settings);
              setView("prompt");
            }
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

export default Settings;
