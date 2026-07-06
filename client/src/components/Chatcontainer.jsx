import React, { useState, useRef, useEffect } from "react";
import { FaInfoCircle, FaArrowLeft, FaPaperPlane, FaUser, FaPaperclip, FaTimes, FaFileAlt, FaTrash, FaUserSlash, FaEllipsisV } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { getMessages, sendMessage, deleteMessage, clearChat } from "../services/messageService";
import { formatTime } from "../utilis/formatTime";

const TEN_MIN = 10 * 60 * 1000;

function Chatcontainer({ selectedUser, onBack }) {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
const typingTimeout = useRef(null);
const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  const isOnline = selectedUser && onlineUsers.includes(selectedUser._id);

  const handleTyping = (e) => {
    if (!socket || !selectedUser) return;
    setInput(e.target.value);

    if (!isTyping) {
        socket.emit("typingStart", {
            receiverId: selectedUser._id,
        });

        setIsTyping(true);
    }

    clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
        socket.emit("typingStop", {
            receiverId: selectedUser._id,
        });

        setIsTyping(false);
    }, 1000);
};

useEffect(() => {
  if (!socket || !selectedUser) return;

  const handleTypingStart = ({ userId }) => {
    if (userId === selectedUser._id) {
      setIsOtherUserTyping(true);
    }
  };

  const handleTypingStop = ({ userId }) => {
    if (userId === selectedUser._id) {
      setIsOtherUserTyping(false);
    }
  };

  socket.on("typingStart", handleTypingStart);
  socket.on("typingStop", handleTypingStop);

  return () => {
    socket.off("typingStart", handleTypingStart);
    socket.off("typingStop", handleTypingStop);
  };
}, [socket, selectedUser]);

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

    socket.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, text: "This message was deleted", deleted: true, mediaUrl: null } : m
        )
      );
    });

    return () => {
      socket.off("newMessage");
      socket.off("messageDeleted");
    };
  }, [socket, selectedUser]);

  // clear chat, triggered from Rightsidebar's info menu (kept for backward compatibility)
  useEffect(() => {
    const handler = async (e) => {
      if (!selectedUser || e.detail.userId !== selectedUser._id) return;
      try {
        await clearChat(selectedUser._id);
        setMessages([]);
      } catch (err) {
        console.error("Clear chat failed:", err);
      }
    };
    window.addEventListener("talkie:clear-chat", handler);
    return () => window.removeEventListener("talkie:clear-chat", handler);
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleToggleInfo = () => {
    window.dispatchEvent(new CustomEvent("talkie:toggle-info"));
  };

  // ---------- header menu: clear chat ----------
  const handleClearChat = async () => {
    try {
      await clearChat(selectedUser._id);
      setMessages([]);
    } catch (err) {
      console.error("Clear chat failed:", err);
    }
    setShowHeaderMenu(false);
  };

  // ---------- media picker ----------
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ---------- send ----------
  const handleSend = async () => {
    if (!input.trim() && !mediaFile) return;

    try {
      let res;
      if (mediaFile) {
        const formData = new FormData();
        formData.append("text", input);
        formData.append("media", mediaFile);
        res = await sendMessage(selectedUser._id, formData, true);
      } else {
        res = await sendMessage(selectedUser._id, input);
      }
      setMessages((prev) => [...prev, res.data]);
      setInput("");
      clearMedia();
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  // ---------- delete ----------
  const canDeleteForEveryone = (message) => {
    const isMine = message.senderId === user._id;
    if (!isMine) return false;
    return Date.now() - new Date(message.createdAt).getTime() < TEN_MIN;
  };

  const handleDeleteForMe = async (message) => {
    try {
      await deleteMessage(message._id, "me");
      setMessages((prev) => prev.filter((m) => m._id !== message._id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
    setActiveMessageId(null);
  };

  const handleDeleteForEveryone = async (message) => {
    try {
      await deleteMessage(message._id, "everyone");
      setMessages((prev) =>
        prev.map((m) =>
          m._id === message._id ? { ...m, text: "This message was deleted", deleted: true, mediaUrl: null } : m
        )
      );
      socket?.emit("deleteMessage", { messageId: message._id, receiverId: selectedUser._id });
    } catch (err) {
      console.error("Delete failed:", err);
    }
    setActiveMessageId(null);
  };


  useEffect(() => {
  setIsOtherUserTyping(false);
}, [selectedUser]);

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
    <div className="h-full min-h-0 flex flex-col bg-[#0B0F1A] relative">

      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-[#141924]">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack} className="md:hidden text-gray-400 hover:text-white p-1 -ml-1 shrink-0" aria-label="Back to chats">
            <FaArrowLeft className="text-lg" />
          </button>
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-br from-violet-500 to-cyan-400">
              {selectedUser.profilePic ? (
                <img src={selectedUser.profilePic} alt="" className="w-full h-full rounded-full object-cover border-2 border-[#141924]" />
              ) : (
                <div className="w-full h-full rounded-full bg-[#1C2333] border-2 border-[#141924] flex items-center justify-center">
                  <FaUser className="text-sm text-gray-400" />
                </div>
              )}
            </div>
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#141924] ${
              isOnline ? "bg-emerald-400" : "bg-gray-500"
            }`} />
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold font-['Sora'] truncate">{selectedUser.username}</p>
            <span className={isOnline ? "text-emerald-400 text-xs" : "text-gray-500 text-xs"}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        {/* Right side: info + three-dot menu */}
        <div className="flex items-center gap-1 shrink-0 relative">
        

          <button
            onClick={() => setShowHeaderMenu((prev) => !prev)}
            className="text-gray-400 hover:text-white transition p-2"
          >
            <FaEllipsisV className="text-lg" />
          </button>

          {showHeaderMenu && (
            <div className="absolute top-full right-0 mt-1 min-w-[160px] bg-[#1C2333] border border-white/10 rounded-xl shadow-xl shadow-black/40 overflow-hidden z-50">
              <button
                onClick={handleClearChat}
                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 flex items-center gap-2"
              >
                <FaTrash className="text-xs" /> Clear Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* backdrop to close message menu / header menu */}
      {activeMessageId && (
        <div className="fixed inset-0 z-40" onClick={() => setActiveMessageId(null)} />
      )}
      {showHeaderMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowHeaderMenu(false)} />
      )}

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-5 py-4 space-y-3">
        {loading ? (
          <p className="text-gray-500 text-center mt-4 text-sm">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-500 text-center mt-4 text-sm">No messages yet. Say hi 👋</p>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId === user._id;
            const isMenuOpen = activeMessageId === message._id;
            const isImage = message.mediaUrl && (message.mediaType || "").startsWith("image");

            return (
              <div key={message._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className="relative max-w-[78%] md:max-w-[65%]">
                  <div
                    onClick={() => !message.deleted && setActiveMessageId(isMenuOpen ? null : message._id)}
                    className={`inline-block w-fit max-w-full px-4 py-2.5 shadow-md cursor-pointer select-none ${
                      message.deleted
                        ? "bg-[#1C2333]/60 text-gray-500 italic rounded-2xl"
                        : isMine
                        ? "bg-gradient-to-br from-violet-500 to-cyan-500 text-white rounded-2xl rounded-br-sm"
                        : "bg-[#1C2333] text-white rounded-2xl rounded-bl-sm"
                    }`}
                  >
                    {message.deleted ? (
                      <p className="text-sm flex items-center gap-2"><FaUserSlash className="text-xs" /> This message was deleted</p>
                    ) : (
                      <>
                        {message.mediaUrl && (
                          isImage ? (
                            <img src={message.mediaUrl} alt="attachment" className="rounded-lg mb-2 max-w-full max-h-64 object-cover" />
                          ) : (
                            <a
                              href={message.mediaUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg mb-2 text-sm hover:bg-black/30 transition"
                            >
                              <FaFileAlt /> View file
                            </a>
                          )
                        )}
                        {message.text && <p className="text-sm break-words">{message.text}</p>}
                        <p className="text-[10px] mt-1.5 opacity-70 text-right">{formatTime(message.createdAt)}</p>
                      </>
                    )}
                  </div>

                  {/* tap menu */}
                  {isMenuOpen && !message.deleted && (
                    <div
                      className={`absolute z-50 mt-1 min-w-[170px] bg-[#1C2333] border border-white/10 rounded-xl shadow-xl shadow-black/40 overflow-hidden ${
                        isMine ? "right-0" : "left-0"
                      }`}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteForMe(message); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 flex items-center gap-2"
                      >
                        <FaTrash className="text-xs" /> Delete for me
                      </button>
                      {canDeleteForEveryone(message) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteForEveryone(message); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 flex items-center gap-2 border-t border-white/5"
                        >
                          <FaTrash className="text-xs" /> Delete for everyone
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Media preview strip */}
      {mediaPreview && (
        <div className="shrink-0 px-4 md:px-5 pt-3 bg-[#141924] border-t border-white/5">
          <div className="relative inline-block">
            {mediaFile?.type.startsWith("image") ? (
              <img src={mediaPreview} alt="preview" className="h-20 w-20 object-cover rounded-lg border border-white/10" />
            ) : (
              <div className="h-20 w-20 rounded-lg border border-white/10 bg-[#1C2333] flex flex-col items-center justify-center text-gray-400 text-xs px-1 text-center">
                <FaFileAlt className="mb-1" /> {mediaFile?.name}
              </div>
            )}
            <button
              onClick={clearMedia}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-white"
            >
              <FaTimes className="text-[10px]" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      {isOtherUserTyping && (
  <div className="px-5 py-2 bg-[#141924] border-t border-white/5">
    <div className="flex items-center gap-2">
      <span className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"></span>
        <span
          className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
          style={{ animationDelay: "0.15s" }}
        ></span>
        <span
          className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
          style={{ animationDelay: "0.3s" }}
        ></span>
      </span>

      <span className="text-sm text-gray-400 italic">
        {selectedUser.username} is typing...
      </span>
    </div>
  </div>
)}
      <div className="shrink-0 px-4 md:px-5 py-3 md:py-4 border-t border-white/5 bg-[#141924] flex items-center gap-2 md:gap-3">
    
    


      
      
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileSelect}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-400 hover:text-white transition p-2 shrink-0"
        >
          <FaPaperclip className="text-lg" />
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
         onChange={handleTyping}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
          className="flex-1 bg-[#1C2333] text-white px-5 py-3 rounded-full outline-none placeholder-gray-500 border border-white/5 focus:border-violet-500/50 transition"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() && !mediaFile}
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