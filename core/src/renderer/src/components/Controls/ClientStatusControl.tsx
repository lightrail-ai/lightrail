import { trpcClient } from "@renderer/util/trpc-client";
import { LightrailControl } from "lightrail-sdk";
import { useEffect, useState } from "react";
import Button from "../ui-elements/Button/Button";

const ClientStatusControl = ({ control }: { control: LightrailControl }) => {
  const [isConnected, setIsConnected] = useState(false);

  async function fetchClientsData() {
    if (control.type !== "client-status") return;
    const response = await trpcClient.clients.query();
    setIsConnected(response[control.client]);
  }

  useEffect(() => {
    if (control.type !== "client-status") return;
    fetchClientsData();
    const intervalId = setInterval(fetchClientsData, 1000);
    return () => clearInterval(intervalId);
  }, [control]);

  if (control.type !== "client-status") return;

  return (
    <div className="w-full overflow-x-auto max-h-64 overflow-y-auto">
      <div className="flex flex-row items-center gap-4 px-4 pt-0.5 pb-1 border-y border-y-neutral-900 font-light">
        <div
          className="relative"
          title={isConnected ? "Connected" : "Not Connected"}
        >
          <div
            className={`rounded-full w-2 h-2 blur-sm ${
              isConnected ? "bg-green-400" : "bg-red-400"
            }`}
          />
          <div
            className={`rounded-full w-2 h-2 absolute left-0 top-0 ${
              isConnected ? "bg-green-400" : "bg-red-400"
            }`}
          />
        </div>
        {control.client} ({isConnected ? "Connected" : "Not Connected"})
      </div>
      <div className="flex flex-row gap-4 justify-end items-center pt-4">
        <a
          onClick={control.onSkip}
          className="underline italic opacity-50 text-sm cursor-pointer hover:opacity-80 "
        >
          {control.skipLabel ?? "Skip"}
        </a>
        <div className="flex-grow" />
        <Button
          primary
          onClick={control.onContinue}
          className=""
          disabled={!isConnected}
        >
          {control.continueLabel ?? "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default ClientStatusControl;
