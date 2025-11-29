import React, { useState } from "react";
import AuthLayout from "./AuthLayout";
import Input from "../../components/Input";
import api from "../../api/axios";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import "../../styles/auth.css";

export default function AdminLogin() {
  const [params] = useSearchParams();
  const secret = params.get("key");
  const navigate = useNavigate();

  if (secret !== import.meta.env.VITE_ADMIN_KEY) {
    return (
      <AuthLayout subtitle={{ title:"Not Found", sub:"Admin login is private" }}>
        <h2 className="auth-title">404</h2>
        <p className="auth-subtitle">Admin login cannot be accessed.</p>
        <Link className="auth-link" to="/">Go Home</Link>
      </AuthLayout>
    );
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        role: "admin",
      });

      toast.success("Admin login successful!");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/admin/dashboard");

    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <AuthLayout subtitle={{ title:"Administrator Login", sub:"Secure access only" }}>
      <form onSubmit={submit}>
        <Input placeholder="Email" type="email" onChange={(e)=>setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" onChange={(e)=>setPassword(e.target.value)} />
        <button className="auth-btn">Login</button>
        <Link to="/" className="auth-link" >Home</Link>
      </form>
    </AuthLayout>
  );
}
