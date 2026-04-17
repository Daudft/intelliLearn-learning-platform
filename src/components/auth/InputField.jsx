import React from "react";

export default function InputField({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div className="input-field">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
    </div>
  );
}
