import React from "react";

export default function AuthForm({ title, children }) {
  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
