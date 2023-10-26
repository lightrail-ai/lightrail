import React from "react";
import { LightrailControl } from "lightrail-sdk";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Button from "../ui-elements/Button/Button";
import DataTableControl from "./DataTableControl";

interface ControlsProps {
  controls: LightrailControl[];
}

function Controls({ controls }: ControlsProps) {
  const [parent, _] = useAutoAnimate({
    duration: 100,
  });

  return (
    <div className="" ref={parent}>
      {controls.map((control, index) => (
        <div key={index} className="px-4 py-2">
          {control.label && (
            <div className="pb-4 pt-2 text-sm">{control.label}</div>
          )}
          {(control.type === "button-group" || control.type === "buttons") && (
            <div className="flex flex-row gap-4">
              {control.buttons.map((button, buttonIndex) => (
                <Button
                  primary={button.color === "primary"}
                  key={buttonIndex}
                  onClick={button.onClick}
                  className="flex-1"
                  style={
                    ["primary", "secondary", undefined].includes(button.color)
                      ? undefined
                      : {
                          backgroundColor: button.color,
                        }
                  }
                >
                  {button.label}
                </Button>
              ))}
            </div>
          )}
          {control.type === "output" && (
            <div className="border border-neutral-600 rounded-sm p-2 max-h-48 overflow-auto">
              <pre>
                {control.stdout ? (
                  control.stdout
                ) : (
                  <span className="opacity-30 italic">No stdout output</span>
                )}
              </pre>

              {control.stderr && (
                <pre className="text-red-800">{control.stderr}</pre>
              )}
            </div>
          )}
          {control.type === "data-table" && (
            <div>
              <DataTableControl data={control.data} />
            </div>
          )}
          {control.type === "slider" && <input type="range" />}
          {control.type === "custom" && <div>Custom Control</div>}
        </div>
      ))}
    </div>
  );
}

export default Controls;
