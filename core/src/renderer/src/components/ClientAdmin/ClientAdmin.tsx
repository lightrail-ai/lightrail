import React, { useEffect, useState } from "react";
import { trpcClient } from "@renderer/util/trpc-client";
import Spinner from "../Spinner/Spinner";

export interface ClientAdminProps {}

function ClientAdmin({}: ClientAdminProps) {
  const [clients, setClients] = useState<any>(null);

  async function fetchClientsData() {
    const response = await trpcClient.clients.query();
    setClients(response);
  }

  useEffect(() => {
    fetchClientsData();
    const intervalId = setInterval(fetchClientsData, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="p-4 relative">
      {clients ? (
        <ul className="space-y-2">
          {Object.entries(clients).map(([client, status]) => (
            <li
              key={client}
              className="flex flex-row items-center gap-4 px-4 pt-0.5 pb-1 border-y border-y-neutral-900 font-light"
            >
              <div
                className="relative"
                title={status ? "Connected" : "Not Connected"}
              >
                <div
                  className={`rounded-full w-2 h-2 blur-sm ${
                    status ? "bg-green-400" : "bg-red-400"
                  }`}
                />
                <div
                  className={`rounded-full w-2 h-2 absolute left-0 top-0 ${
                    status ? "bg-green-400" : "bg-red-400"
                  }`}
                />
              </div>
              {client}
            </li>
          ))}
        </ul>
      ) : (
        <div className="bg-neutral-950 bg-opacity-90 absolute top-0 left-0 w-full h-full flex gap-4 items-center justify-center z-10">
          <Spinner /> Loading...
        </div>
      )}
    </div>
  );
}

export default ClientAdmin;
