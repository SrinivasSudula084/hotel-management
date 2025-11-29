import React from "react";
import "../../styles/auth.css";

export default function AuthLayout({ children, subtitle }) {
  return (
    <div className="auth-root">

      {/* Background Image */}
      <img 
        src="/auth-bg.png" 
        className="auth-bg" 
        alt="background" 
      />

      {/* Overlay Layer */}
      <div className="auth-overlay"></div>

      <div className="auth-center">

        {/* HEADER (top left logo) */}
        <div className="auth-header">
          <div className="auth-logo">LuxStay</div>
          <div className="auth-tag">Exclusive Hotel Management</div>
        </div>

        {/* GLASS CARD */}
        <div className="auth-card">
          
          {subtitle?.title && (
            <h1 className="auth-title">{subtitle.title}</h1>
          )}
          
          {subtitle?.sub && (
            <p className="auth-subtitle">{subtitle.sub}</p>
          )}

          {children}

          <div className="auth-footer">
            © {new Date().getFullYear()} LuxStay
          </div>

        </div>
      </div>
    </div>
  );
}
