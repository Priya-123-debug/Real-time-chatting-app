import React, { useState, useRef, useEffect } from "react";
import { FaInfoCircle, FaArrowLeft, FaPaperPlane, FaUser } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { getMessages, sendMessage } from "../services/messageService";
import { formatTime } from "../utilis/formatTime";

function Chatcontainer({ selectedUser, onBack }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!selectedUser) return;

    setLoading(true);
    getMessages(selectedUser._id)
      .then((res) => {
        if (Array.isArray(res.data)) setMessages(res.data);
        else setMessages([]);
      })
      .catch((err) => {
        console.error(err);
        setMessages([]);
      })
      .finally(() => setLoading(false));
  }, [selectedUser]);

  useEffect(() => {
    if (!socket || !selectedUser) return;

    socket.on("newMessage", (message) => {
      if (message.senderId === selectedUser._id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => socket.off("newMessage");
  }, [socket, selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === "") return;

    try {
      const res = await sendMessage(selectedUser._id, input);
      setMessages((prev) => [...prev, res.data]);
      setInput("");
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  const handleToggleInfo = () => {
    window.dispatchEvent(new CustomEvent("talkie:toggle-info"));
  };

  if (!selectedUser) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0B0F1A] text-gray-400 max-md:hidden">
        <div className="w-32 h-32 mb-6 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-400/10 flex items-center justify-center">
          <img src="/chatbot-icon.png" alt="ChatBot" className="w-16 h-16 opacity-90" />
        </div>
        <h1 className="font-['Sora'] text-3xl md:text-4xl font-bold text-white">Talkie</h1>
        <p className="mt-3 text-sm">Select a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 flex flex-col bg-[#0B0F1A]">

      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-[#141924]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="md:hidden text-gray-400 hover:text-white p-1 -ml-1 shrink-0"
            aria-label="Back to chats"
          >
            <FaArrowLeft className="text-lg" />
          </button>
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-br from-violet-500 to-cyan-400">
              {selectedUser.profilePic ? (
                <img
                  src={selectedUser.profilePic}
                  alt=""
                  className="w-full h-full rounded-full object-cover border-2 border-[#141924]"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#1C2333] border-2 border-[#141924] flex items-center justify-center">
                  <FaUser className="text-sm text-gray-400" />
                </div>
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#141924]" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold font-['Sora'] truncate">{selectedUser.username}</p>
            <span className="text-emerald-400 text-xs">Online</span>
          </div>
        </div>
        <button onClick={handleToggleInfo} className="text-gray-400 hover:text-white transition shrink-0 p-1">
          <FaInfoCircle className="text-xl" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-5 py-4 space-y-3">
        {loading ? (
          <p className="text-gray-500 text-center mt-4 text-sm">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-500 text-center mt-4 text-sm">No messages yet. Say hi 👋</p>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId === user._id;
            return (
              <div key={message._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[78%] md:max-w-[65%] px-4 py-2.5 shadow-md ${
                    isMine
                      ? "bg-gradient-to-br from-violet-500 to-cyan-500 text-white rounded-2xl rounded-br-sm"
                      : "bg-[#1C2333] text-white rounded-2xl rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm break-words">{message.text}</p>
                  <p className="text-[10px] mt-1.5 opacity-70 text-right">
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 md:px-5 py-3 md:py-4 border-t border-white/5 bg-[#141924] flex items-center gap-3">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
          className="flex-1 bg-[#1C2333] text-white px-5 py-3 rounded-full outline-none placeholder-gray-500 border border-white/5 focus:border-violet-500/50 transition"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="bg-gradient-to-br from-violet-500 to-cyan-500 w-11 h-11 md:w-auto md:px-6 md:py-3 rounded-full text-white font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center shrink-0"
        >
          <FaPaperPlane className="text-sm md:hidden" />
          <span className="hidden md:inline">Send</span>
        </button>
      </div>

    </div>
  );
}

export default Chatcontainer;