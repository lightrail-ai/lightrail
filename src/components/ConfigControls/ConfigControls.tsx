import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import { useRecoilState } from "recoil";
import { configState } from "./config-state";

export interface ConfigControlsProps {}

function ConfigControls({}: ConfigControlsProps) {
  const [configOpen, setConfigOpen] = useState(false);
  const [config, setConfig] = useRecoilState(configState);
  return (
    <div className="text-slate-300 hover:text-white cursor-pointer relative">
      <FontAwesomeIcon
        icon={faGear}
        onClick={() => setConfigOpen(!configOpen)}
      />
      {configOpen && (
        <div className="absolute right-0 bg-slate-900 z-[60] p-4 rounded-md border">
          <div className="flex flex-row gap-4 items-center">
            Theme:{" "}
            <select
              className="text-slate-900 p-1"
              value={config.theme}
              onChange={(e) =>
                setConfig({
                  ...config,
                  theme: e.target.value as typeof config.theme,
                })
              }
            >
              <option value="light">light</option>
              <option value="dark">dark</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConfigControls;
