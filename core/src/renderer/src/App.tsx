import { useCallback, useEffect, useState } from "react";
import PromptInput from "./components/PromptInput/PromptInput";
import { trpcClient } from "./util/trpc-client";
import Settings from "./components/Settings/Settings";
import { RecoilRoot, useRecoilState } from "recoil";
import { viewAtom } from "./state";
import ChatHistory from "./components/ChatHistory/ChatHistory";
import { Option } from "./components/OptionsList";
import { TRACKS } from "../../tracks";
import { rendererLightrail } from "./util/renderer-lightrail";
import { library } from "@fortawesome/fontawesome-svg-core";
import { far } from "@fortawesome/free-regular-svg-icons";
import type { ChatHistoryItem } from "lightrail-sdk";

library.add(far);

function App(): JSX.Element {
  const [view, setView] = useRecoilState(viewAtom);
  const [ready, setReady] = useState(false);
  const [maxHeight, setMaxHeight] = useState(0);

  const resizeObserverRef = useCallback((node: HTMLDivElement) => {
    if (!node) return;
    const resizeObserver = new ResizeObserver(() => {
      const newDimensions = {
        height: Math.ceil(node.getBoundingClientRect().height),
        width: Math.ceil(node.getBoundingClientRect().width),
      };
      trpcClient.size.mutate(newDimensions);
    });
    resizeObserver.observe(node);
  }, []);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([
    // {
    //   sender: "ai",
    //   content:
    //     "```\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nhi\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n```",
    // },
  ]);
  const [partialMessage, setPartialMessage] = useState<string | null>(null);

  async function loadTracks() {
    for (const TrackClass of TRACKS) {
      new TrackClass(rendererLightrail).init();
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
          setView: setView,
        };
        window.electronIpc.onLightrailEvent((_event, data) => {
          rendererLightrail._processEvent(data);
        });
        await loadTracks();
        const { height } = await trpcClient.screenSize.query();
        setMaxHeight(height - 100);
        setReady(true);
      })();
    }
  }, []);

  async function executePromptAction(action: Option, prompt: object) {
    if (!action.name) {
      throw new Error("Cannot execute action without a name");
    }
    if (!rendererLightrail.actions.has(action.name)) {
      throw new Error(`Action ${action.name} does not exist`);
    }

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
        return <PromptInput onAction={executePromptAction} />;
      case "chat":
        return (
          <>
            <ChatHistory items={chatHistory} partialMessage={partialMessage} />
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
      {renderView()}
    </div>
  );
}

export default () => (
  <RecoilRoot>
    <App />
  </RecoilRoot>
);
