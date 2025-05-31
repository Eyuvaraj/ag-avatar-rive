"use client";

export default function Caption({ text }) {
  return (
    <div style={{
      position: "absolute",
      bottom: "120px",
      left: "50%",
      transform: "translateX(-50%)",
      padding: "12px 20px",
      background: "rgba(0, 0, 0, 0.7)",
      color: "white",
      fontSize: "18px",
      borderRadius: "12px",
      maxWidth: "80%",
      textAlign: "center",
      zIndex: 10
    }}>
      {text}
    </div>
  );
}
