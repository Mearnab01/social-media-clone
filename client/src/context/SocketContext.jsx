import { createContext, useContext, useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import io from "socket.io-client";
import notificationAtom from "../atoms/notificationAtom";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};
export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const setNotifications = useSetRecoilState(notificationAtom);

  const user = useRecoilValue(userAtom);
  const baseURL =
    import.meta.env.MODE === "production"
      ? "/"
      : import.meta.env.VITE_SOCKET_URL;
  useEffect(() => {
    const socket = io(baseURL, {
      query: {
        userId: user?._id,
      },
    });
    setSocket(socket);
    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });
    socket.on("error", (err) => {
      console.log("Socket error:", err);
    });
    socket.on("newNotification", (data) => {
      console.log("📩 New notification received:", data);
      setNotifications((prev) => [...prev, data]);
    });
    return () => socket && socket.close();
  }, [user?._id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
