import { useCallback, useEffect, useState } from "react";
import PromptInput from "./components/PromptInput/PromptInput";
import { trpcClient } from "./util/trpc-client";
import Settings from "./components/Settings/Settings";
import { RecoilRoot, useRecoilValue, useSetRecoilState } from "recoil";
import { promptHistoryAtom, viewAtom } from "./state";
import ChatHistory from "./components/ChatHistory/ChatHistory";
import { library } from "@fortawesome/fontawesome-svg-core";
import { far } from "@fortawesome/free-regular-svg-icons";
import {
  LightrailControl,
  type ChatHistoryItem,
  LightrailTrack,
} from "lightrail-sdk";
import Loading from "./components/Loading"; // Import the Loading component
import Controls from "./components/Controls/Controls";
import log from "./util/logger";
import {
  RendererHandle,
  rendererMessagingHub,
  rendererTracksManager,
} from "./util/lightrail-renderer";
import { Option } from "../../util/tracks";
import ErrorDisplay from "./components/Error/Error";
import ChatTrack from "../../basic-tracks/chat";
import SystemTrack from "../../basic-tracks/system";

library.add(far);

function App(): JSX.Element {
  const view = useRecoilValue(viewAtom);
  const setPromptHistory = useSetRecoilState(promptHistoryAtom);
  const [ready, setReady] = useState(false);
  const [maxHeight, setMaxHeight] = useState(0);

  const resizeObserverRef = useCallback((node: HTMLDivElement) => {
    if (!node) return;
    const resizeObserver = new ResizeObserver(() => {
      const newDimensions = {
        height: Math.ceil(node.getBoundingClientRect().height),
        width: Math.ceil(node.getBoundingClientRect().width),
      };
      log.silly("Main Div Resized: ", newDimensions);
      if (newDimensions.height > 0 && newDimensions.width > 0) {
        trpcClient.size.mutate(newDimensions);
      }
    });
    resizeObserver.observe(node);
  }, []);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [controls, setControls] = useState<LightrailControl[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [partialMessage, setPartialMessage] = useState<string | null>(null);

  useEffect(() => {
    rendererTracksManager.processHandleFactory = (track) =>
      new RendererHandle(track, {
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
      });

    window.electronIpc.onLightrailMessage(
      (_event, track, name, body, broadcast) => {
        log.silly(
          "Received event: ",
          track,
          name,
          body,
          broadcast ? "(broadcast)" : ""
        );
        rendererMessagingHub.routeMessage(
          track,
          rendererTracksManager,
          name,
          body,
          broadcast
        );
      }
    );

    (async () => {
      log.silly("Running setup routine");
      await trpcClient.setup.mutate();
      log.silly("Sending event to load tracks on main process...");
      const trackPaths = await trpcClient.loadTracks.mutate();
      log.silly("Received track listing: ", trackPaths);
      for (const browserPath of trackPaths) {
        log.silly("Loading track from path: " + browserPath);
        const imp = await import(/* @vite-ignore */ browserPath);
        const track: LightrailTrack = imp.default;
        if (!track.name) {
          log.error("Track import failed from path: " + browserPath);
        } else {
          rendererMessagingHub.registerTrack(track);
          rendererTracksManager.registerTrack(track);
        }
      }
      log.silly("Loading built-in tracks...");
      for (const track of [SystemTrack, ChatTrack]) {
        rendererMessagingHub.registerTrack(track);
        rendererTracksManager.registerTrack(track);
      }
      log.silly("Sending event to start socket server on main process...");
      await trpcClient.startSocketServer.mutate();
      const { height } = await trpcClient.screenSize.query();
      log.silly("Restoring history...");
      setPromptHistory(await trpcClient.history.get.query());
      setMaxHeight(height - 100);
      setTimeout(() => setReady(true), 2000);
    })();
  }, []);

  function appendToHistory(prompt: any) {
    trpcClient.history.append.mutate(prompt);
    setPromptHistory((history) => [prompt, ...history]);
  }

  async function executePromptAction(action: Option, prompt: object) {
    setError(null);
    log.silly("Executing action: ", action.name);
    if (!action.name) {
      throw new Error("Cannot execute action without a name");
    }
    if (action.kind !== "actions") {
      throw new Error("Cannot execute action that is not an action");
    }

    appendToHistory(prompt);

    try {
      await trpcClient.action.mutate({
        track: action.track,
        name: action.name,
        prompt,
        args: {}, // TODO: add support for additional args
      });
    } catch (e: any) {
      log.error("Error executing action: ", e);
      setError(e.shape.message);
    }
  }

  function renderView() {
    switch (view) {
      case "settings":
        return <Settings />;
      case "prompt":
        return (
          <>
            <ChatHistory items={chatHistory} partialMessage={partialMessage} />
            <Controls controls={controls} />
            <ErrorDisplay error={error} />
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
