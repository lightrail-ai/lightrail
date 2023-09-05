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

const models = ["gpt-3.5-turbo-16k", "gpt-4", "gpt-3.5-turbo"];

export interface SettingsProps {}

function Settings({}: SettingsProps) {
  const setView = useSetRecoilState(viewAtom);

  const [settings, setSettings] = useState<SettingsObject | undefined>();

  useEffect(() => {
    trpcClient.settings.get.query().then((res) => {
      setSettings(res);
    });
  }, []);

  return (
    <div className="py-4">
      {settings && (
        <>
          <div className="px-6 py-2">
            <SelectInput
              options={["lightrail", "openai"]}
              value={settings.provider}
              onChange={(newVal) =>
                setSettings({
                  ...settings,
                  provider: newVal as SettingsObject["provider"],
                })
              }
              label="Provider"
              placeholder="LLM Provider"
            />
          </div>
          <div className="px-6 py-2">
            <SelectInput
              options={models}
              value={settings.model}
              onChange={(newVal) =>
                setSettings({
                  ...settings,
                  model: newVal as SettingsObject["model"],
                })
              }
              label="Model"
              placeholder="Model Name"
            />
          </div>
          {settings.provider === "openai" && (
            <div className="px-6 py-2">
              <TextInput
                value={settings.apiKeys["openai"] || ""}
                onChange={(newVal) =>
                  setSettings({
                    ...settings,
                    apiKeys: { ...settings.apiKeys, openai: newVal },
                  })
                }
                label="OpenAI API Key (Required)"
                placeholder="Your API Key"
              />
            </div>
          )}
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
