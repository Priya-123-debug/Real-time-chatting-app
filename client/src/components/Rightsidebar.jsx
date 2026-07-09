import React, { useState, useEffect, useMemo } from "react";
import { FaTimes, FaUser, FaFileAlt, FaPlay, FaDownload } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/authService";
import { useSocket } from "../context/SocketContext";
import { getMessages } from "../services/messageService";

const PREVIEW_COUNT = 6;

function getFileName(url = "") {
  try {
    const clean = url.split("?")[0];
    return decodeURIComponent(clean.substring(clean.lastIndexOf("/") + 1));
  } catch {
    return "file";
  }
}

function Rightsidebar({ selectedUser }) {
  const { user, setUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [showAllMedia, setShowAllMedia] = useState(false);
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const { socket, onlineUsers } = useSocket(); // <-- grab socket too

  const isOnline = selectedUser && onlineUsers.includes(selectedUser._id);

  useEffect(() => {
    const toggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("talkie:toggle-info", toggle);
    return () => window.removeEventListener("talkie:toggle-info", toggle);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setShowAllMedia(false);
    setShowAllDocs(false);
  }, [selectedUser]);

  // Initial fetch
  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoadingMedia(true);
        const res = await getMessages(selectedUser._id);
        if (!cancelled) setMessages(res.data || res || []);
      } catch (err) {
        console.error("Failed to load shared media:", err);
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setLoadingMedia(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedUser]);

  // NEW: live-update when the OTHER user sends a message (mirrors useChatEffects)
  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleNewMessage = (message) => {
      if (message.senderId === selectedUser._id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser]);

  // NEW: live-update when the CURRENT user sends a message
  // (Chatcontainer dispatches "talkie:message-sent" after a successful send)
  useEffect(() => {
    if (!selectedUser) return;

    const handleSentMessage = (e) => {
      const message = e.detail;
      if (
        message.receiverId === selectedUser._id ||
        message.senderId === selectedUser._id
      ) {
        setMessages((prev) => [...prev, message]);
      }
    };

    window.addEventListener("talkie:message-sent", handleSentMessage);
    return () =>
      window.removeEventListener("talkie:message-sent", handleSentMessage);
  }, [selectedUser]);

  // message.media is an object: { url, type, originalName }
  // `type` is a MIME string like "image/png", "video/mp4", "application/pdf"
  const { photosAndVideos, documents } = useMemo(() => {
    const withMedia = messages.filter((m) => m.media?.url && m.media?.type);

    return {
      photosAndVideos: withMedia
        .filter(
          (m) =>
            m.media.type.startsWith("image/") ||
            m.media.type.startsWith("video/"),
        )
        .reverse(),
      documents: withMedia
        .filter(
          (m) =>
            !m.media.type.startsWith("image/") &&
            !m.media.type.startsWith("video/"),
        )
        .reverse(),
    };
  }, [messages]);

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  if (!selectedUser) return null;

  const visibleMedia = showAllMedia
    ? photosAndVideos
    : photosAndVideos.slice(0, PREVIEW_COUNT);
  const visibleDocs = showAllDocs ? documents : documents.slice(0, 4);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`
          bg-[#141924] border-l border-white/5 text-white overflow-y-auto
          fixed top-0 right-0 h-full w-[80%] max-w-xs z-40 transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          md:static md:translate-x-0 md:w-full md:h-full md:z-0 md:flex md:flex-col
        `}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-white p-1"
        >
          <FaTimes className="text-lg" />
        </button>

        {/* Profile */}
        <div className="flex flex-col items-center p-6 border-b border-white/5">
          <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-br from-violet-500 to-cyan-400">
            {selectedUser.profilePic ? (
              <img
                src={selectedUser.profilePic}
                alt=""
                className="w-full h-full rounded-full object-cover border-2 border-[#141924]"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[#1C2333] border-2 border-[#141924] flex items-center justify-center">
                <FaUser className="text-3xl text-gray-400" />
              </div>
            )}
          </div>
          <h2 className="mt-4 text-xl font-semibold font-['Sora']">{selectedUser.username}</h2>
          <p className={`text-sm mt-1 flex items-center gap-1 ${isOnline ? "text-emerald-400" : "text-gray-500"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-400" : "bg-gray-500"}`} />
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>

        {/* Media */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold font-['Sora'] text-sm text-gray-400 uppercase tracking-wide">
              Media
            </h3>
            {photosAndVideos.length > 0 && (
              <span className="text-xs text-gray-500">{photosAndVideos.length}</span>
            )}
          </div>

          {loadingMedia ? (
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : photosAndVideos.length === 0 ? (
            <p className="text-sm text-gray-500">No shared photos or videos yet</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-1.5">
                {visibleMedia.map((m) => (
                  <button
                    key={m._id}
                    onClick={() =>
                      setLightbox({ url: m.media.url, mediaType: m.media.type })
                    }
                    className="relative aspect-square rounded-lg overflow-hidden bg-[#1C2333] group"
                  >
                    {m.media.type.startsWith("video/") ? (
                      <>
                        <video src={m.media.url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-90 group-hover:opacity-100 transition">
                          <FaPlay className="text-white text-xs" />
                        </div>
                      </>
                    ) : (
                      <img
                        src={m.media.url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    )}
                  </button>
                ))}
              </div>

              {photosAndVideos.length > PREVIEW_COUNT && (
                <button
                  onClick={() => setShowAllMedia((v) => !v)}
                  className="mt-3 text-xs text-violet-300 hover:text-violet-200 transition"
                >
                  {showAllMedia ? "Show less" : `View all ${photosAndVideos.length}`}
                </button>
              )}
            </>
          )}
        </div>

        {/* Shared Files */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold font-['Sora'] text-sm text-gray-400 uppercase tracking-wide">
              Shared Files
            </h3>
            {documents.length > 0 && (
              <span className="text-xs text-gray-500">{documents.length}</span>
            )}
          </div>

          {loadingMedia ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-11 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <p className="text-sm text-gray-500">No shared files yet</p>
          ) : (
            <>
              <div className="space-y-2">
                {visibleDocs.map((m) => (
                  <a
                    key={m._id}
                    href={m.media.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center gap-3 bg-[#1C2333] px-4 py-3 rounded-xl hover:bg-white/10 transition text-sm group"
                  >
                    <FaFileAlt className="text-cyan-400 shrink-0" />
                    <span className="truncate flex-1 text-gray-200">
                      {m.media.originalName || getFileName(m.media.url)}
                    </span>
                    <FaDownload className="text-gray-500 group-hover:text-white transition text-xs shrink-0" />
                  </a>
                ))}
              </div>

              {documents.length > 4 && (
                <button
                  onClick={() => setShowAllDocs((v) => !v)}
                  className="mt-3 text-xs text-violet-300 hover:text-violet-200 transition"
                >
                  {showAllDocs ? "Show less" : `View all ${documents.length}`}
                </button>
              )}
            </>
          )}
        </div>

        {/* Logout */}
        <div className="mt-auto p-6">
          <button
            className="w-full bg-red-500/90 hover:bg-red-500 py-3 rounded-full font-semibold transition text-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 text-white/70 hover:text-white p-2"
          >
            <FaTimes className="text-2xl" />
          </button>
          {lightbox.mediaType.startsWith("video/") ? (
            <video
              src={lightbox.url}
              controls
              autoPlay
              className="max-w-full max-h-[85vh] rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={lightbox.url}
              alt=""
              className="max-w-full max-h-[85vh] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </>
  );
}

export default Rightsidebar;