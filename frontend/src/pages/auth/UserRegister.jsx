import React, { useState } from "react";
import AuthLayout from "./AuthLayout";
import Input from "../../components/Input";
import api from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../../styles/auth.css";

export default function UserRegister() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        role: "user",
      });

      toast.success("User registered successfully!");
      navigate("/login");

    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  }

  return (
    <AuthLayout subtitle={{ title: "User Registration", sub: "Create your LuxStay account" }}>
      <form onSubmit={submit}>
        <Input placeholder="Full Name" value={name} onChange={(e)=>setName(e.target.value)} />
        <Input placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />

        <button className="auth-btn">Register</button>
      </form>

      <div className="auth-link" style={{ marginTop: "12px" }}>
        <Link className="auth-link" to="/login">Already have an account? Login</Link>
         <Link to="/" className="auth-link" >Home</Link>
      </div>
    </AuthLayout>
  );
}
