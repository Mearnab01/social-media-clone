import { createContext, useContext, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};
export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const user = useRecoilValue(userAtom);

  useEffect(() => {
    const getSocketURL = () => {
      const isLocalhost = window.location.hostname === "localhost";
      return isLocalhost
        ? "http://localhost:3000"
        : "http://192.168.0.177:5173"; // Replace with your local IP
    };

    const socket = io(getSocketURL(), {
      query: {
        userId: user?._id,
      },
    });
    setSocket(socket);
    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });
    return () => socket && socket.close();
  }, [user?._id]);
  //console.log("online user", onlineUsers);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
