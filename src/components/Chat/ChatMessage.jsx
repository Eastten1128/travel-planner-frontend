import React from "react";

function ChatMessage({ role, content }) {
  return (
    <div className={`message ${role === "user" ? "user" : "assistant"}`}>
      {content}
    </div>
  );
}

export default ChatMessage;
