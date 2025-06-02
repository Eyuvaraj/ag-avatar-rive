"use client";

import React, { useState } from "react";
import { Model } from "../components/model";
import Caption from "../components/Caption";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newUserMessage = { role: "user", content: inputText };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputText("");

    const chatResponse = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: updatedMessages }),
    }).then((res) => res.json());

    if (chatResponse && chatResponse.content) {
      const assistantMessage = {
        role: "assistant",
        content: chatResponse.content,
      };
      setMessages([...updatedMessages, assistantMessage]);

      const ttsResponse = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: chatResponse.content }),
      });

      const audioBlob = await ttsResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      setIsSpeaking(true);
      audio.play();

      audio.onended = () => {
        setIsSpeaking(false);
      };
    }
  };

  const handleStart = async () => {
    setHasStarted(true);

    const initialMessage = { role: "user", content: "start" };
    const updatedMessages = [initialMessage];
    setMessages(updatedMessages);

    const chatResponse = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: updatedMessages }),
    }).then((res) => res.json());

    if (chatResponse && chatResponse.content) {
      const assistantMessage = {
        role: "assistant",
        content: chatResponse.content,
      };
      setMessages([...updatedMessages, assistantMessage]);

      const ttsResponse = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: chatResponse.content }),
      });

      const audioBlob = await ttsResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      setIsSpeaking(true);
      audio.play();

      audio.onended = () => {
        setIsSpeaking(false);
      };
    }
  };

  return (
    <>
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          backgroundColor: "#000",
          position: "relative",
        }}
      >
        <Model isSpeaking={isSpeaking} />
        {isSpeaking && (
          <Caption text={messages[messages.length - 1]?.content || ""} />
        )}
      </div>

      {!hasStarted ? (
        // START BUTTON
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            width: "100%",
            padding: "15px",
            background: "#111",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            onClick={handleStart}
            style={{
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              padding: "14px 24px",
              fontSize: "16px",
              borderRadius: "8px",
            }}
          >
            Start Lesson
          </button>
        </div>
      ) : (
        // CHAT INPUT + NEXT BUTTON
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            width: "100%",
            padding: "15px",
            background: "#111",
            display: "flex",
            gap: "10px",
          }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            style={{ flexGrow: 1, padding: "12px", borderRadius: "6px" }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              padding: "12px 18px",
              borderRadius: "6px",
              opacity: !inputText.trim() ? 0.5 : 1,
            }}
          >
            Send
          </button>
          <button
            onClick={() => {
              setInputText("next");
              handleSend();
            }}
            style={{
              backgroundColor: "#ffc107",
              color: "#000",
              border: "none",
              padding: "12px 18px",
              borderRadius: "6px",
            }}
          >
            Continue ➡️
          </button>
        </div>
      )}
    </>
  );
}
