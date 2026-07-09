import React, { useState, useRef, useEffect } from "react";
import { FaCamera, FaUser, FaTimes, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/usersService";

const MAX_FILE_SIZE_MB = 5;

function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user.username);
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(user.profilePic || "");
  const [loading, setLoading] = useState(false);

  const objectUrlRef = useRef(null);

  const hasChanges =
    username.trim() !== user.username || selectedImage !== null;

  // clean up any object URL we created, on unmount or when replaced
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);

    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;

    setSelectedImage(file);
    setPreview(url);
  };

  const handleRemovePreview = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setSelectedImage(null);
    setPreview(user.profilePic || "");
  };

  const handleSave = async () => {
    const trimmed = username.trim();

    if (!trimmed) {
      toast.error("Username can't be empty");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("username", trimmed);
      if (selectedImage) {
        formData.append("profilePic", selectedImage);
      }

      const res = await updateProfile(formData);

      setUser(res.data);
      setSelectedImage(null);
      toast.success("Profile updated");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#141924] rounded-3xl border border-white/10 p-6 shadow-2xl shadow-black/40">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition mb-4"
        >
          <FaArrowLeft className="text-xs" />
          Back to chat
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
          <p className="text-gray-400 text-sm mt-1">
            Update your profile information
          </p>
        </div>

        <div className="flex flex-col items-center mt-6">
          <div className="relative">
            {preview ? (
              <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-br from-violet-500 to-cyan-400">
                <img
                  src={preview}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-[#141924]"
                />
              </div>
            ) : (
              <div className="w-28 h-28 rounded-full bg-white/5 flex items-center justify-center">
                <FaUser className="text-4xl text-gray-400" />
              </div>
            )}

            <label className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center cursor-pointer shadow-lg hover:opacity-90 transition">
              <FaCamera className="text-white text-sm" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>

            {selectedImage && (
              <button
                type="button"
                onClick={handleRemovePreview}
                title="Discard new photo"
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#0B0F1A] border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:border-red-400/60 transition"
              >
                <FaTimes className="text-[10px]" />
              </button>
            )}
          </div>

          {selectedImage && (
            <span className="text-xs text-violet-300 mt-2">
              New photo selected
            </span>
          )}
        </div>

        <div className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={30}
              className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/60 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full bg-[#0B0F1A] border border-white/10 rounded-2xl px-4 py-3 text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading || !hasChanges}
          className="w-full mt-8 bg-gradient-to-r from-violet-500 to-cyan-400 text-white font-semibold py-3 rounded-2xl hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : hasChanges ? "Save Changes" : "No Changes Yet"}
        </button>
      </div>
    </div>
  );
}

export default Profile;