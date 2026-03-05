import { useState } from "react";
import React from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import PageContainer from "../components/ui/PageContainer";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/register", form);
      navigate("/dashboard");
    } catch (err) {
      alert("Registration failed");
    }

    setLoading(false);
  };

  return (
    <PageContainer>
      
      <AuthLayout>
        <h2 className="text-2xl font-semibold mb-6">
          Create Account
        </h2>

        <form onSubmit={handleRegister} className="space-y-5">

          <Input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
          />

          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 rounded-xl
              bg-zinc-200 text-zinc-900
              font-medium
              transition-all duration-300
              hover:scale-[1.02]
            "
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          <div className="mt-6 text-sm text-zinc-400 text-center">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-zinc-200 cursor-pointer hover:underline"
            >
              Sign in
            </span>
          </div>

        </form>
      </AuthLayout>
    </PageContainer>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="
        w-full px-4 py-3
        bg-zinc-800
        border border-zinc-700
        rounded-xl
        outline-none
        focus:border-zinc-400
        transition
      "
    />
  );
}