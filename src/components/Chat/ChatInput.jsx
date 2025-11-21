import React from "react";

function ChatInput({ value, onChange, onSend }) {
  return (
    <div className="chat-input-box">
      <input
        value={value}
        onChange={onChange}
        placeholder="여행 관련 질문을 입력하세요..."
        onKeyDown={(e) => e.key === "Enter" && onSend()}
      />
      <button onClick={onSend}>전송</button>
    </div>
  );
}

export default ChatInput;
