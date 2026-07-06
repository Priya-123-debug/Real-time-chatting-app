import { useEffect } from "react";
import { getMessages, clearChat } from "../../services/messageService";
import { markMessagesSeen } from "../../services/messageService";

export default function useChatEffects({
  socket,
  selectedUser,
  messages,
  setMessages,
  setLoading,
  bottomRef,
  setIsOtherUserTyping,
}) {
  // Load Messages
  useEffect(() => {
    if (!selectedUser) return;

    setLoading(true);

    getMessages(selectedUser._id)
      .then((res) => {
        if (Array.isArray(res.data)) setMessages(res.data);
        else setMessages([]);
      })
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [selectedUser]);

  // Receive Messages
  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleNewMessage = (message) => {
      if (message.senderId === selectedUser._id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? {
                ...m,
                text: "This message was deleted",
                deleted: true,
                mediaUrl: null,
              }
            : m,
        ),
      );
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageDeleted", handleDeleted);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDeleted", handleDeleted);
    };
  }, [socket, selectedUser]);

  // Typing Indicator
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

  // Clear Chat Event
  useEffect(() => {
    const handler = async (e) => {
      if (!selectedUser) return;

      if (e.detail.userId !== selectedUser._id) return;

      try {
        await clearChat(selectedUser._id);
        setMessages([]);
      } catch (err) {
        console.log(err);
      }
    };

    window.addEventListener("talkie:clear-chat", handler);

    return () => {
      window.removeEventListener("talkie:clear-chat", handler);
    };
  }, [selectedUser]);

  // Auto Scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [bottomRef, messages]);

  // Reset Typing
  useEffect(() => {
    setIsOtherUserTyping(false);
  }, [selectedUser]);

  // seen
  useEffect(() => {
    if (!socket) return;

    if (selectedUser) {
      socket.emit("openConversation", {
        receiverId: selectedUser._id,
      });
    } else {
      socket.emit("closeConversation");
    }
  }, [socket, selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;

    markMessagesSeen(selectedUser._id).catch(console.error);
  }, [selectedUser]);

  // notify other user
  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleMessagesSeen = ({ userId }) => {
      if (userId !== selectedUser._id) return;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.receiverId === userId ? { ...msg, seen: true } : msg,
        ),
      );
    };

    socket.on("messagesSeen", handleMessagesSeen);

    return () => {
      socket.off("messagesSeen", handleMessagesSeen);
    };
  }, [socket, selectedUser]);

useEffect(() => {
  if (!socket) return;

  const handleMessagesSeen = ({ messageIds }) => {
    setMessages((prev) =>
      prev.map((msg) =>
        messageIds.some((id) => id.toString() === msg._id.toString())
          ? { ...msg, seen: true }
          : msg
      )
    );
  };

  socket.on("messagesSeen", handleMessagesSeen);

  return () => {
    socket.off("messagesSeen", handleMessagesSeen);
  };
}, [socket]);
}
