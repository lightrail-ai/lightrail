import { useCallback, useEffect, useRef, useState } from "react";
import PromptInput from "./components/PromptInput/PromptInput";
import { trpcClient } from "./util/trpc-client";
import { RecoilRoot, useRecoilValue, useSetRecoilState } from "recoil";
import { promptHistoryAtom, viewAtom } from "./state";
import ChatHistory from "./components/ChatHistory/ChatHistory";
import { library } from "@fortawesome/fontawesome-svg-core";
import { far } from "@fortawesome/free-regular-svg-icons";
import {
  LightrailControl,
  type ChatHistoryItem,
  ArgsValues,
  TaskProgress,
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
import Configuration from "./components/Configuration/Configuration";
import { loadTracks } from "./util/track-admin";
import { getArgHistoryKey } from "./components/OptionsList";
import { nanoid } from "nanoid";
import TasksDisplay, {
  TaskStatus,
} from "./components/TasksDisplay/TasksDisplay";
import NotificationsDisplay, {
  NotificationsDisplayRef,
} from "./components/NotificationsDisplay/NotificationsDisplay";
import { OnboardingScript, mainOnboardingScript } from "./onboarding-script";

library.add(far);

function App(): JSX.Element {
  const view = useRecoilValue(viewAtom);
  const setPromptHistory = useSetRecoilState(promptHistoryAtom);
  const [ready, setReady] = useState(false);
  const [maxWidth, setMaxWidth] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  const [targetWidth, setTargetWidth] = useState(0);
  const [targetHeight, setTargetHeight] = useState(0);

  const resizeObserverRef = useCallback((node: HTMLDivElement) => {
    if (!node) return;
    const resizeObserver = new ResizeObserver(() => {
      const newDimensions = {
        height: Math.ceil(node.getBoundingClientRect().height),
        width: Math.ceil(node.getBoundingClientRect().width),
      };
      if (newDimensions.height > 0 && newDimensions.width > 0) {
        setTargetWidth(newDimensions.width);
        setTargetHeight(newDimensions.height);
      }
    });
    resizeObserver.observe(node);
  }, []);

  const transitioningObserverRef = useCallback((node: HTMLDivElement) => {
    if (!node) return;
    const resizeObserver = new ResizeObserver(() => {
      const newDimensions = {
        height: Math.ceil(node.getBoundingClientRect().height),
        width: Math.ceil(node.getBoundingClientRect().width),
      };
      log.debug("Main Div Resized: ", newDimensions);
      if (newDimensions.height > 0 && newDimensions.width > 0) {
        trpcClient.size.set.mutate(newDimensions);
      }
    });
    resizeObserver.observe(node);
  }, []);

  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);

  const [controls, setControls] = useState<LightrailControl[]>([]);
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const notificationsDisplayRef = useRef<NotificationsDisplayRef>(null);

  const [partialMessage, setPartialMessage] = useState<string | null>(null);

  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardingHistory, setOnboardingHistory] = useState<ChatHistoryItem[]>(
    []
  );
  const [onboardingPartialMessage, setOnboardingPartialMessage] = useState<
    string | null
  >(null);
  const [currentOnboardingScript, setCurrentOnboardingScript] =
    useState<OnboardingScript | null>(null);
  const [onboardingStepIndex, setOnboardingStepIndex] = useState(0);
  const [isInputDisabledDuringOnboarding, setIsInputDisabledDuringOnboarding] =
    useState(true);

  const getTaskHandle = (id: string) => ({
    id: id,
    finishTask: () => {
      setTaskStatuses((statuses) =>
        statuses.filter((status) => status.id !== id)
      );
    },
    setMessage(message) {
      setTaskStatuses((statuses) =>
        statuses.map((status) => {
          if (status.id === id) {
            return {
              ...status,
              message,
            };
          }
          return status;
        })
      );
    },
    setProgress(progress) {
      setTaskStatuses((statuses) =>
        statuses.map((status) => {
          if (status.id === id) {
            return {
              ...status,
              progress,
            };
          }
          return status;
        })
      );
    },
  });

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
        notify(message) {
          notificationsDisplayRef.current?.addNotification({
            id: nanoid(),
            message,
          });
        },
        tasks: {
          startTask: () => {
            const id = nanoid();
            setTaskStatuses((statuses) => [
              ...statuses,
              {
                id,
                progress: undefined,
                message: "",
              },
            ]);
            return getTaskHandle(id);
          },
          getTaskHandle,
        },
        reset: () => {
          setChatHistory([]);
          setControls([]);
        },
      });

    window.electronIpc.onLightrailMessage(
      (_event, track, name, body, broadcast) => {
        log.debug(
          "Received message: ",
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
      log.info("Running setup routine");
      const setupStatus = await trpcClient.setup.mutate();
      if (setupStatus.onboard) {
        log.info("Onboarding...");
        processOnboardingScript(mainOnboardingScript);
      }
      log.info("Sending event to load tracks on main process...");
      const trackPaths = await trpcClient.tracks.load.mutate();
      log.info("Received track listing: ", trackPaths);
      await loadTracks(trackPaths);
      log.info("Sending event to start socket server on main process...");
      await trpcClient.startSocketServer.mutate();
      const { height, width } = await trpcClient.screenSize.query();
      log.info("Restoring history...");
      setPromptHistory(await trpcClient.history.get.query());
      setMaxHeight(height - 100);
      setMaxWidth(width - 100);
      setTimeout(() => setReady(true), 500);
    })();
  }, []);

  useEffect(() => {
    if (ready) {
      (async () => {
        processNotice(await trpcClient.notices.pop.mutate());
        window.electronIpc.onNewNotice(async () => {
          processNotice(await trpcClient.notices.pop.mutate());
        });
      })();
    }
  }, [ready]);

  function processNotice(notice: string | undefined) {
    if (!notice) return;
    setPartialMessage(notice);
    setTimeout(
      () =>
        setControls([
          {
            type: "buttons",
            buttons: [
              {
                label: "Dismiss",
                onClick: async () => {
                  setControls([]);
                  setPartialMessage(null);
                  processNotice(await trpcClient.notices.pop.mutate());
                },
              },
            ],
          },
        ]),
      2000
    );
  }

  function processOnboardingScript(onboardingScript: OnboardingScript) {
    setCurrentOnboardingScript(onboardingScript);
    setOnboardingStepIndex(0);
    setIsOnboarding(true);
  }

  async function typeOutOnboardingMessage(message?: string) {
    if (message) {
      const delay = 100;
      const words = message.split(" ");
      for (let i = 0; i < words.length; i++) {
        setOnboardingPartialMessage(words.slice(0, i + 1).join(" "));
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  useEffect(() => {
    if (isOnboarding && currentOnboardingScript) {
      setOnboardingHistory([]);
      setControls([]);
      setIsInputDisabledDuringOnboarding(true);
      typeOutOnboardingMessage(
        currentOnboardingScript.steps[onboardingStepIndex].content
      ).then(() => {
        setOnboardingPartialMessage(null);
        let content =
          currentOnboardingScript.steps[onboardingStepIndex].content;
        if (content) {
          setOnboardingHistory([
            {
              content,
              sender: "ai",
            },
          ]);
        }
        setIsInputDisabledDuringOnboarding(
          !!currentOnboardingScript.steps[onboardingStepIndex].disableInput
        );
        const stepControls = currentOnboardingScript.steps[
          onboardingStepIndex
        ].getControls(
          () => {
            if (
              onboardingStepIndex + 1 <
              currentOnboardingScript.steps.length
            ) {
              setOnboardingStepIndex(onboardingStepIndex + 1);
            } else {
              setIsOnboarding(false);
              setCurrentOnboardingScript(null);
              setOnboardingStepIndex(0);
              setOnboardingHistory([]);
              setControls([]);
            }
          },
          (name) => {
            const stepIndex = currentOnboardingScript?.steps.findIndex(
              (step) => step.name === name
            );
            if (stepIndex !== undefined && stepIndex !== -1) {
              setOnboardingStepIndex(stepIndex);
            }
          }
        );
        setControls(stepControls);
        stepControls.forEach((control) => {
          if (control.type === "loading") {
            control.task();
          }
        });
      });
    }
  }, [isOnboarding, currentOnboardingScript, onboardingStepIndex]);

  function appendToHistory(prompt: any) {
    trpcClient.history.append.mutate(prompt);
    setPromptHistory((history) => [prompt, ...history]);
  }

  async function executePromptAction(
    action: Option,
    prompt: object,
    args: ArgsValues | undefined
  ) {
    setError(null);
    log.info("Executing action: ", action.name);
    if (!action.name) {
      throw new Error("Cannot execute action without a name");
    }
    if (action.kind !== "actions") {
      throw new Error("Cannot execute action that is not an action");
    }

    if (prompt?.["content"]?.length > 0) {
      appendToHistory(prompt);
    }

    try {
      for (const arg of action.args) {
        if (args?.[arg.name]) {
          // Remove whitespace as needed
          args[arg.name] = args[arg.name].trim();

          if (arg.type === "history") {
            await trpcClient.argHistory.append.mutate({
              ...getArgHistoryKey(arg, undefined, action, "action-args")!,
              option: {
                value: args[arg.name] + " ",
                name: args[arg.name],
              },
            });
          }
        }
      }
      await trpcClient.action.mutate({
        track: action.track,
        name: action.name,
        prompt,
        args: args ?? {},
      });
    } catch (e: any) {
      log.error("Error executing action: ", e);
      setError(e.shape.message);
    }
  }

  function renderView() {
    switch (view) {
      case "settings":
        return <Configuration />;
      case "prompt":
        return (
          <>
            <ChatHistory
              items={isOnboarding ? onboardingHistory : chatHistory}
              partialMessage={
                isOnboarding ? onboardingPartialMessage : partialMessage
              }
              onReset={
                isOnboarding
                  ? undefined
                  : () => {
                      trpcClient.action.mutate({
                        track: "system",
                        name: "Reset Conversation",
                        prompt: null,
                        args: {},
                      });
                    }
              }
            />
            <Controls controls={controls} />
            <ErrorDisplay error={error} onDismiss={() => setError(null)} />
            <NotificationsDisplay ref={notificationsDisplayRef} />
            <PromptInput
              onAction={executePromptAction}
              disabled={isOnboarding && isInputDisabledDuringOnboarding}
            />
            <TasksDisplay statuses={taskStatuses} />
          </>
        );
    }
  }

  return (
    <div
      ref={transitioningObserverRef}
      style={{
        transitionProperty: "height, width",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        transitionDuration: "150ms",
        width: `${targetWidth}px`,
        height: `${targetHeight}px`,
      }}
    >
      <div
        ref={resizeObserverRef}
        className="w-fit h-fit flex flex-col overflow-hidden"
        style={{
          maxHeight: `${maxHeight}px`,
          maxWidth: `${maxWidth}px`,
        }}
      >
        {!ready ? <Loading /> : renderView()}
      </div>
    </div>
  );
}

export default () => (
  <RecoilRoot>
    <App />
  </RecoilRoot>
);
