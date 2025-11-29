import React, { useState } from "react";
import AuthLayout from "./AuthLayout";
import Input from "../../components/Input";
import api from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../../styles/auth.css";

export default function OwnerLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        role: "owner",
      });

      toast.success("Owner login successful!");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/owner/dashboard");

    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <AuthLayout subtitle={{ title: "Owner Login", sub: "Access your hotel dashboard" }}>
      <form onSubmit={submit}>
        <Input placeholder="Email" type="email" onChange={(e)=>setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" onChange={(e)=>setPassword(e.target.value)} />
        <button className="auth-btn">Login</button>
      </form>

      <div className="auth-link" style={{ marginTop: "12px" }}>
        <Link to="/owner/register" className="auth-link">Register as Owner</Link>
         <Link  to="/" className="auth-link" >Home</Link>
      </div>
    </AuthLayout>
  );
}
