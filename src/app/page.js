"use client";

import React, { useRef, useState } from "react";
import { Model } from "../components/model";
import Caption from "../components/Caption";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");

      const sttRes = await fetch("/api/stt", {
        method: "POST",
        body: formData,
      });

      const sttData = await sttRes.json();
      if (sttData.text) {
        setInputText(sttData.text);
      }
      setIsListening(false);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsListening(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <>
      {/* <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          backgroundColor: "#000",
        }}
      >
        <Model isSpeaking={isSpeaking} />
      </div> */}

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
        )}{" "}
        {/* ✅ Show caption */}
      </div>

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
          placeholder="Type or record your message..."
          style={{ flexGrow: 1, padding: "12px", borderRadius: "6px" }}
        />
        <button
          onClick={isListening ? stopRecording : startRecording}
          style={{
            backgroundColor: isListening ? "#ff4444" : "#4CAF50",
            color: "#fff",
            border: "none",
            padding: "12px 18px",
            borderRadius: "6px",
          }}
        >
          {isListening ? "Stop" : "Record"}
        </button>
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
      </div>
    </>
  );
}
