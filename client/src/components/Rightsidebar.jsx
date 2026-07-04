import React, { useState, useEffect } from "react";
import { FaTimes, FaUser } from "react-icons/fa";
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';
import { useSocket } from "../context/SocketContext";

function Rightsidebar({ selectedUser }) {
  const { setUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const { onlineUsers } = useSocket();
  

  const isOnline = selectedUser && onlineUsers.includes(selectedUser._id);

  useEffect(() => {
    const toggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("talkie:toggle-info", toggle);
    return () => window.removeEventListener("talkie:toggle-info", toggle);
  }, []);

  useEffect(() => { setIsOpen(false); }, [selectedUser]);

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  if (!selectedUser) return null;

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
          <h3 className="font-semibold font-['Sora'] text-sm text-gray-400 uppercase tracking-wide mb-4">Media</h3>
          <div className="space-y-1 text-gray-300">
            <div className="cursor-pointer hover:bg-white/5 px-3 py-2.5 rounded-xl transition text-sm">📷 Photos</div>
            <div className="cursor-pointer hover:bg-white/5 px-3 py-2.5 rounded-xl transition text-sm">🎥 Videos</div>
            <div className="cursor-pointer hover:bg-white/5 px-3 py-2.5 rounded-xl transition text-sm">📄 Documents</div>
          </div>
        </div>

        {/* Shared Files */}
        <div className="p-6">
          <h3 className="font-semibold font-['Sora'] text-sm text-gray-400 uppercase tracking-wide mb-4">Shared Files</h3>
          <div className="space-y-2 text-gray-300">
            <div className="bg-[#1C2333] px-4 py-3 rounded-xl cursor-pointer hover:bg-white/10 transition text-sm">📄 resume.pdf</div>
            <div className="bg-[#1C2333] px-4 py-3 rounded-xl cursor-pointer hover:bg-white/10 transition text-sm">🖼️ image.jpg</div>
          </div>
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
    </>
  );
}

export default Rightsidebar;