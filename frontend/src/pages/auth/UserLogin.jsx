import React, { useState } from "react";
import AuthLayout from "./AuthLayout";
import Input from "../../components/Input";
import api from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../../styles/auth.css";

export default function UserLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        role: "user",
      });

      toast.success("Login successful!");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/user/dashboard");

    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <AuthLayout subtitle={{ title: "User Login", sub: "Sign in to your LuxStay account" }}>
      <form onSubmit={submit}>
        <Input placeholder="Email" type="email" onChange={(e)=>setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" onChange={(e)=>setPassword(e.target.value)} />
        <button className="auth-btn">Login</button>
      </form>

      <div className="auth-link"style={{ marginTop: "12px" }}>
        <Link to="/register" className="auth-link">Don't have an account? Register</Link>
        <Link to="/" className="auth-link" >Home</Link>
      </div>
    </AuthLayout>
  );
}
