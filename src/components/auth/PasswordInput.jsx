import React, { useState } from "react";

export default function PasswordInput({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);

  return (
    <div className="input-field">
      <label>{label}</label>

      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{ marginLeft: "6px" }}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
