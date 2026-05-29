import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");
const NotificationContext = createContext();

export function ChatNotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user._id) {
      socket.emit("register_user", user._id);
    }

    socket.on("new_message_notification", (data) => {
      setUnreadCount((p) => p + 1);
    });

    return () => socket.off("new_message_notification");
  }, []);

  const clearUnread = () => setUnreadCount(0);

  return (
    <NotificationContext.Provider value={{ unreadCount, clearUnread }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);