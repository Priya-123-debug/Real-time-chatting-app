// src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user) return;  // only connect if logged in

    const s = io(import.meta.env.VITE_API_URL, {
      query: { userId: user._id },  // tell server who is connecting
    });

    setSocket(s);

    // server sends back list of online user IDs
    s.on("getOnlineUsers", (users) => setOnlineUsers(users));
    return () => {
  s.off("getOnlineUsers");
  s.disconnect();
};

   
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);