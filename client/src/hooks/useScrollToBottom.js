// src/hooks/useScrollToBottom.js
import { useEffect, useRef } from "react";

export function useScrollToBottom(dependency) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dependency]);

  return bottomRef;
}
