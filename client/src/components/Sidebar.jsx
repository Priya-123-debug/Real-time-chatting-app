import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaUser } from "react-icons/fa";
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';
import { getAvatarUrl } from "../utilis/avatar";
import { useSocket } from "../context/SocketContext";
import { useState } from 'react';
import { searchUsers } from '../services/usersService';
import { useEffect } from 'react';



function Sidebar({ users = [], loading, selectedUser, setSelectedUser }) {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [search, setSearch] = useState("");


const [searchResults, setSearchResults] = useState([]);
  
  const { onlineUsers } = useSocket();

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };


  useEffect(() => {

  if (!search.trim()) {

    setSearchResults([]);

    return;

  }

  const timer = setTimeout(async () => {

    try {

      const res = await searchUsers(search);

      setSearchResults(res.data);

    } catch (err) {

      console.error(err);

    }

  }, 300);

  return () => clearTimeout(timer);

}, [search]);
  const displayUsers = search.trim() ? searchResults : users;

  return (
    <div className={`bg-[#0B0F1A] h-full flex flex-col p-4 md:p-5 overflow-y-auto text-white ${selectedUser ? "max-md:hidden" : ""}`}>

      {/* Header */}
      <div className="pb-5 shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/chatbot-icon.png" alt="logo" className="w-9 h-9" />
            <span className="font-['Sora'] text-lg font-bold tracking-tight">Talkie</span>
          </div>

          <div className="relative py-2 group">
            <img src="/menuimage.png" alt="menu" className="max-h-5 cursor-pointer opacity-70 hover:opacity-100 transition" />
            <div className="absolute top-full right-0 z-20 w-36 p-2 rounded-xl bg-[#141924] border border-white/10 shadow-xl shadow-black/40 hidden group-hover:block">
              <p
                onClick={() => navigate("/profile")}
                className="cursor-pointer text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition"
              >
                Edit Profile
              </p>
              <p
                onClick={handleLogout}
                className="cursor-pointer text-sm px-3 py-2 rounded-lg text-red-400 hover:bg-red-400/10 transition"
              >
                Logout
              </p>
            </div>
          </div>
        </div>

        {/* Logged in user's own info */}
        <div className="flex items-center gap-3 mt-4 p-3 bg-[#141924] rounded-2xl border border-white/5">
          {user?.profilePic ? (
            <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-violet-500 to-cyan-400 shrink-0">
              <img src={user.profilePic} alt="" className="w-full h-full rounded-full object-cover border-2 border-[#141924]" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
              <FaUser className="text-lg text-gray-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.username}</p>
            <p className="text-emerald-400 text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-[#141924] rounded-full flex items-center gap-2 py-2.5 px-4 mt-4 border border-white/5 focus-within:border-violet-500/50 transition">
          <FaSearch className="text-gray-500 text-sm" />
          <input
            type="text"
            className="bg-transparent border-none outline-none text-white text-sm placeholder-gray-500 flex-1"
            placeholder="Search user..."
            value={search}

onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex flex-col gap-1">
        {loading ? (
          <p className="text-gray-500 text-sm text-center mt-6">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-6">No users found</p>
        ) : (
          displayUsers.map((u) => {
            const isActive = selectedUser?._id === u._id;
             const isOnline = onlineUsers.includes(u._id);
            return (
              <div
                key={u._id}
                onClick={() => setSelectedUser(u)}
                className={`flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition ${
                  isActive ? "bg-gradient-to-r from-violet-500/20 to-cyan-400/10 border border-violet-500/30" : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="relative shrink-0">
                  {u.profilePic ? (
                    <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-br from-violet-500 to-cyan-400">
                      <img src={u.profilePic} alt={u.username} className="w-full h-full rounded-full object-cover border-2 border-[#0B0F1A]" />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center">
                      <FaUser className="text-xl text-gray-400" />
                    </div>
                  )}
                 <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#141924] ${
  isOnline ? "bg-emerald-400" : "bg-gray-500"
}`} />
                </div>
                <div className="flex flex-col leading-5 min-w-0">
                  <p className="font-medium text-sm truncate">{u.username}</p>
                   <span className={`text-xs ${isOnline ? "text-emerald-400" : "text-gray-500"}`}>
          {isOnline ? "Online" : "Offline"}
        </span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

export default Sidebar;