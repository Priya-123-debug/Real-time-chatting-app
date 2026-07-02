// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { ChatProvider } from "./context/ChatContext";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
   
    <AuthProvider>          {/* outermost — everyone needs auth */}
      <SocketProvider>      {/* needs auth (uses user._id) */}
        <ChatProvider> 
               {/* innermost — just chat state */}
               
               <App />
             
        </ChatProvider>
      </SocketProvider>
    </AuthProvider>
     </BrowserRouter>
  </React.StrictMode>
);