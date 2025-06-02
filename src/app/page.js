"use client";

import React, { useState } from "react";
import { Model } from "../components/model";
import Caption from "../components/Caption";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State for loader

  const handleSend = async (messageContent = inputText) => {
    // If messageContent is 'next', set inputText to 'next' for display in input field
    // before sending, but ensure the actual sent content is 'next'
    if (messageContent === "next" && inputText !== "next") {
      setInputText("next");
    }

    if (!messageContent.trim()) return;

    const newUserMessage = { role: "user", content: messageContent };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputText(""); // Clear input field immediately
    setIsLoading(true); // Show loader

    try {
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
        setIsLoading(false); // <--- HIDE LOADER HERE: AFTER AUDIO BLOB IS RECEIVED

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        setIsSpeaking(true);
        audio.play();

        audio.onended = () => {
          setIsSpeaking(false);
        };
      } else {
        setIsLoading(false); // Hide loader if no chat response content
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false); // Hide loader on error
    }
  };

  const handleStart = async () => {
    setHasStarted(true);
    setIsLoading(true); // Show loader

    const initialMessage = { role: "user", content: "start" };
    const updatedMessages = [initialMessage];
    setMessages(updatedMessages);

    try {
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
        setIsLoading(false); // <--- HIDE LOADER HERE: AFTER AUDIO BLOB IS RECEIVED

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        setIsSpeaking(true);
        audio.play();

        audio.onended = () => {
          setIsSpeaking(false);
        };
      } else {
        setIsLoading(false); // Hide loader if no chat response content
      }
    } catch (error) {
      console.error("Error starting lesson:", error);
      setIsLoading(false); // Hide loader on error
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
            disabled={isLoading} // Disable button while loading
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
          {isLoading && ( // Loader positioned here
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 10px)", // 10px above the input container
                left: "15px",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                color: "#fff",
                padding: "8px 12px",
                borderRadius: "6px",
                zIndex: 999, // Ensure it's above the input but below fixed elements
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div className="loader-small" /> {/* Smaller loader */}
              <p style={{ margin: 0, fontSize: "14px" }}>Loading...</p>
            </div>
          )}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            style={{ flexGrow: 1, padding: "12px", borderRadius: "6px" }}
            disabled={isLoading} // Disable input while loading
          />
          <button
            onClick={() => handleSend(inputText)} // Pass inputText directly
            disabled={!inputText.trim() || isLoading} // Disable button while loading
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              padding: "12px 18px",
              borderRadius: "6px",
              opacity: !inputText.trim() || isLoading ? 0.5 : 1,
            }}
          >
            Send
          </button>
          <button
            onClick={() => handleSend("next")} // Directly call handleSend with "next"
            disabled={isLoading} // Disable button while loading
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
