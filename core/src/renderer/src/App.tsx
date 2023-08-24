import { useCallback, useEffect, useState } from "react";
import PromptInput from "./components/PromptInput/PromptInput";
import { trpcClient } from "./util/trpc-client";
import Settings from "./components/Settings/Settings";
import {
  RecoilRoot,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";
import { promptHistoryAtom, viewAtom } from "./state";
import ChatHistory from "./components/ChatHistory/ChatHistory";
import { Option } from "./components/OptionsList";
import { TRACKS } from "../../tracks";
import { rendererLightrail } from "./util/renderer-lightrail";
import { library } from "@fortawesome/fontawesome-svg-core";
import { far } from "@fortawesome/free-regular-svg-icons";
import { LightrailControl, type ChatHistoryItem } from "lightrail-sdk";
import Loading from "./components/Loading"; // Import the Loading component
import Controls from "./components/Controls/Controls";
import log from "./util/logger";

library.add(far);

function App(): JSX.Element {
  const view = useRecoilValue(viewAtom);
  const setPromptHistory = useSetRecoilState(promptHistoryAtom);
  const [ready, setReady] = useState(false);
  const [maxHeight, setMaxHeight] = useState(0);

  const resizeObserverRef = useCallback((node: HTMLDivElement) => {
    if (!node) return;
    const resizeObserver = new  ResizeObserver(() => {
      const newDimensions = {
        height: Math.ceil(node.getBoundingClientRect().height),
        width: Math.ceil(node.getBoundingClientRect().width),
      };
      log.silly("Main Div Resized: ", newDimensions)
      if(newDimensions.height > 0 && newDimensions.width > 0) {
        trpcClient.size.mutate(newDimensions);
      }
    });
    resizeObserver.observe(node);
  }, []);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [controls, setControls] = useState<LightrailControl[]>([]);

  const [partialMessage, setPartialMessage] = useState<string | null>(null);

  async function loadTracks() {
    log.silly("Loading tracks...");
    for (const TrackClass of TRACKS) {
      await new TrackClass(rendererLightrail).init();
    }
  }

  useEffect(() => {
    if (!rendererLightrail.ui) {
      (async () => {
        rendererLightrail.ui = {
          chat: {
            setHistory: setChatHistory,
            setPartialMessage: setPartialMessage,
          },
          controls: {
            setControls: setControls,
          },
          reset: () => {
            setChatHistory([]);
            setControls([]);
          },
        };
        window.electronIpc.onLightrailEvent((_event, data) => {
          log.silly("Received event: ", data);
          rendererLightrail._processEvent(data);
        });

        await loadTracks();
        log.silly("Sending event to load tracks on main process...");
        await trpcClient.loadTracks.mutate();
        log.silly("Sending event to start socket server on main process...");
        await trpcClient.startSocketServer.mutate();
        const { height } = await trpcClient.screenSize.query();
        log.silly("Restoring history...");
        setPromptHistory(await trpcClient.history.get.query());
        setMaxHeight(height - 100);
        setTimeout(() => setReady(true), 2000);
      })();
    }
  }, []);

  function appendToHistory(prompt: any) {
    trpcClient.history.append.mutate(prompt);
    setPromptHistory((history) => [prompt, ...history]);
  }

  async function executePromptAction(action: Option, prompt: object) {
    log.silly("Executing action: ", action.name);
    if (!action.name) {
      throw new Error("Cannot execute action without a name");
    }
    if (!rendererLightrail.actions.has(action.name)) {
      throw new Error(`Action ${action.name} does not exist`);
    }

    appendToHistory(prompt);

    rendererLightrail.actions.get(action.name)?.rendererHandler?.(prompt, []); // TODO: add support for additional args)
    await trpcClient.action.mutate({
      name: action.name,
      prompt,
      args: [], // TODO: add support for additional args
    });
  }

  function renderView() {
    switch (view) {
      case "settings":
        return <Settings />;
      case "prompt":
      case "chat":
        return (
          <>
            <ChatHistory items={chatHistory} partialMessage={partialMessage} />
            <Controls controls={controls} />
            <PromptInput onAction={executePromptAction} />
          </>
        );
    }
  }

  return (
    <div
      ref={resizeObserverRef}
      className="w-fit h-fit flex flex-col overflow-hidden"
      style={{
        maxHeight: `${maxHeight}px`,
      }}
    >
      {!ready ? <Loading /> : renderView()}
    </div>
  );
}

export default () => (
  <RecoilRoot>
    <App />
  </RecoilRoot>
);
