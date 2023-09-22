import React, { useEffect, useRef, useImperativeHandle, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export interface Notification {
  id: string;
  message: string;
}

export interface NotificationsDisplayRef {
  addNotification: (notification: Notification) => void;
}

const NotificationsDisplay = React.forwardRef<NotificationsDisplayRef>(
  (_props, ref) => {
    const notificationEndTimes = useRef<{ [id: string]: number }>({});
    // Manage notifications as part of the component's state.
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const [parent, _] = useAutoAnimate({
      duration: 100,
    });

    useImperativeHandle(ref, () => ({
      addNotification(notification: Notification) {
        notificationEndTimes.current[notification.id] =
          Date.now() +
          Math.min(Math.max(notification.message.length * 50, 2000), 7000);
        // Add new notification to the state to trigger re-render.
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          notification,
        ]);
      },
    }));

    useEffect(() => {
      const intervalId = setInterval(() => {
        const now = Date.now();
        let needRerender = false;
        for (const [id, endTime] of Object.entries(
          notificationEndTimes.current
        )) {
          if (now >= endTime) {
            delete notificationEndTimes.current[id];
            // Mark that re-render is needed.
            needRerender = true;
          }
        }
        if (needRerender) {
          // Remove expired notifications from the state to trigger re-render.
          setNotifications((prevNotifications) =>
            prevNotifications.filter((n) => notificationEndTimes.current[n.id])
          );
        }
      }, 1000);
      return () => clearInterval(intervalId);
    }, []);

    return (
      <div ref={parent}>
        {notifications.map((n) => (
          <div
            key={n.id}
            className="flex flex-row items-center text-sm gap-4 px-4 pt-0.5 pb-1 border-y border-y-neutral-900 font-light"
          >
            <div className="relative">
              <div className="rounded-full bg-sky-400 w-2 h-2 blur-sm" />
              <div className="rounded-full bg-sky-400 w-2 h-2 absolute left-0 top-0" />
            </div>
            {n.message}
          </div>
        ))}
      </div>
    );
  }
);

export default NotificationsDisplay;
