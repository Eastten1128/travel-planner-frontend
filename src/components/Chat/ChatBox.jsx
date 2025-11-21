import React, { useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import PlaceCard from "./PlaceCard";
import "../Chat/ChatBox.css";
import { sendChatMessage } from "../../api/chat";

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState([]);

  const onSend = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: "user", content: input }]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendChatMessage(input);

      setMessages(prev => [...prev, { role: "assistant", content: res.speech }]);

      if (res.places) setPlaces(res.places);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠ 서버 오류 발생" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-wrapper">

      {/* LEFT: CHAT */}
      <div className="chat-container">
        <div className="messages-box">
          {messages.map((msg, index) => (
            <ChatMessage key={index} role={msg.role} content={msg.content} />
          ))}
          {loading && <div className="loading">AI가 여행 정보를 생성 중입니다...</div>}
        </div>

        <ChatInput value={input} onChange={(e) => setInput(e.target.value)} onSend={onSend} />
      </div>

      {/* RIGHT: SUGGESTED PLACES */}
      <div className="place-panel">
        <h3>📌 추천 여행지</h3>

        {places.length === 0 && <p className="placeholder">추천 결과가 없습니다.</p>}

        {places.map((place, index) => (
          <PlaceCard key={index} place={place} />
        ))}
      </div>

    </div>
  );
}

export default ChatBox;
