import React, { useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import PlaceCard from "./PlaceCard";

import { useNavigate } from "react-router-dom";
import { sendChatMessage, createAutoPlan } from "../../api/chat";

const ChatBox = () => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]); // { role: "user" | "assistant", text, places? }
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setLastQuestion(trimmed);
    setInput("");
    setLoading(true);

    try {
      const data = await sendChatMessage(trimmed); // { speech, places }

      const assistantMsg = {
        role: "assistant",
        text: data.speech || "",
        places: data.places || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠ 여행 추천 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ChatBox.jsx 중 일부

const handleAutoPlan = async () => {
  if (!lastQuestion) {
    alert("먼저 질문을 입력해서 AI에게 여행지를 추천받아주세요.");
    return;
  }

  if (saving) return;
  setSaving(true);

  try {
    // 🔹 기존: const data = await createAutoPlan(lastQuestion);
    //          const planner = data.planner;
    const planner = await createAutoPlan(lastQuestion);

    console.log("auto-plan planner:", planner);

    if (!planner || !planner.plannerNo) {
      alert("일정 생성에는 성공했지만 플래너 정보를 확인할 수 없습니다.");
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: `✅ "${planner.plannerTitle}" 일정이 생성되었습니다. 상세 페이지로 이동합니다.`,
      },
    ]);

    // ✅ plannerNo 그대로 사용
    navigate(`/main/plan/detail/${planner.plannerNo}`);
  } catch (err) {
    console.error("auto-plan error:", err);
    alert("AI 추천 일정을 저장하는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
  } finally {
    setSaving(false);
  }
};

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        background: "#fff",
        borderRadius: "24px",
        padding: "16px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
      }}
    >
      {/* 메시지 영역 */}
      <div
        style={{
          height: "60vh",
          overflowY: "auto",
          padding: "8px",
          marginBottom: "12px",
        }}
      >
        {messages.length === 0 && (
          <div style={{ fontSize: "13px", color: "#999" }}>
            예) &quot;내일 부산 해운대 근처에서 바다 보면서 밥먹고 싶은데 추천해줘&quot;
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                borderRadius: "16px",
                padding: "8px 12px",
                fontSize: "14px",
                whiteSpace: "pre-wrap",
                background: msg.role === "user" ? "#000" : "#f3f3f3",
                color: msg.role === "user" ? "#fff" : "#111",
              }}
            >
              <div>{msg.text}</div>

              {/* AI가 돌려준 places 카드 출력 */}
              {msg.role === "assistant" &&
                msg.places &&
                msg.places.length > 0 && (
                  <div style={{ marginTop: "8px" }}>
                    {msg.places.map((p, i) => (
                      <div
                        key={i}
                        style={{
                          background: "#fff",
                          borderRadius: "12px",
                          padding: "6px 8px",
                          border: "1px solid #e5e5e5",
                          marginBottom: "4px",
                          fontSize: "12px",
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        {p.address && (
                          <div style={{ color: "#666" }}>📍 {p.address}</div>
                        )}
                        {p.description && (
                          <div style={{ marginTop: "2px" }}>{p.description}</div>
                        )}
                        {p.reason && (
                          <div style={{ marginTop: "2px", color: "#555" }}>
                            추천 이유: {p.reason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* 입력 & 버튼 영역 */}
      <div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='예: "1박 2일로 제주도 서쪽 위주로 추천해줘"'
          style={{
            width: "100%",
            resize: "none",
            borderRadius: "16px",
            border: "1px solid #ddd",
            padding: "8px 12px",
            fontSize: "14px",
            outline: "none",
          }}
          rows={2}
        />
        <div
          style={{
            marginTop: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "12px",
            color: "#666",
          }}
        >
          <span>
            Tip: &quot;차 없이 이동&quot;, &quot;커플 여행&quot; 같은 조건도 같이 적어보세요.
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={handleAutoPlan}
              disabled={saving}
              style={{
                borderRadius: "999px",
                border: "1px solid #ccc",
                padding: "6px 10px",
                fontSize: "12px",
                background: "#fff",
                cursor: saving ? "default" : "pointer",
                opacity: saving ? 0.5 : 1,
              }}
            >
              {saving ? "저장 중..." : "AI 추천 일정 저장하기"}
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={loading}
              style={{
                borderRadius: "999px",
                padding: "6px 16px",
                fontSize: "13px",
                background: "#000",
                color: "#fff",
                border: "none",
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? "전송 중..." : "전송"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;