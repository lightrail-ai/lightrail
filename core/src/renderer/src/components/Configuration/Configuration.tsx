import React, { useState } from "react";
import Settings from "../Settings/Settings";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { viewAtom } from "@renderer/state";
import { useSetRecoilState } from "recoil";
import classNames from "classnames";
import TrackAdmin from "../TrackAdmin/TrackAdmin";

const TabButton = ({ label, currentTab, setTab }) => (
  <button
    className={classNames("hover:opacity-100", {
      "opacity-40": currentTab !== label,
      "opacity-80": currentTab === label,
    })}
    onClick={() => setTab(label)}
  >
    <div className="text-neutral-50">{label}</div>
  </button>
);

const Configuration = () => {
  const [tab, setTab] = useState("Tracks");
  const setView = useSetRecoilState(viewAtom);

  return (
    <div className="min-w-[600px] py-4">
      <div className="flex flex-row items-stretch">
        <div className="px-6 py-2 flex flex-col gap-4 border-r border-r-neutral-700">
          <TabButton label="Tracks" currentTab={tab} setTab={setTab} />
          <TabButton label="Settings" currentTab={tab} setTab={setTab} />
        </div>
        <div className="px-6 py-2 flex-1">
          <div className="px-6 py-2 flex flex-row items-center">
            <button
              className="opacity-50 hover:opacity-100"
              onClick={() => setView("prompt")}
            >
              <FontAwesomeIcon
                fixedWidth
                icon={faArrowLeft}
                className="pr-6 "
              />
            </button>
            <div className="text-neutral-50">{tab}</div>
          </div>
          {tab === "Settings" && <Settings />}
          {tab === "Tracks" && <TrackAdmin />}
        </div>
      </div>
    </div>
  );
};

export default Configuration;
