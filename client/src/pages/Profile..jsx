import { useEffect, useState } from "react";
import React from "react";
import api from "../api/axios";
import { motion } from "framer-motion";
import { usePreferences } from "../context/PreferencesContext";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get("/auth/me")
      .then(res => setUser(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Invalid file type");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("avatar", selectedFile);

    setUploading(true);

    try {
      const res = await api.post("/auth/upload-avatar", formData);
      setUser(prev => ({ ...prev, profileImage: res.data.profileImage }));
      setPreview(null);
      setSelectedFile(null);
    } catch {
      alert("Upload failed");
    }

    setUploading(false);
  };

  if (!user) {
    return (
      <div className="px-8 py-16 text-zinc-400">
        Loading profile...
      </div>
    );
  }

  const handleSoftDelete = async () => {
    const confirm = window.confirm(
      "Are you sure you want to deactivate your account?"
    );

    if (!confirm) return;

    try {
      await api.post("/auth/soft-delete");
      window.location.href = "/login";
    } catch {
      alert("Failed to deactivate account");
    }
  };

  return (
    <div className="
      w-full
      max-w-[1400px]
      mx-auto
      px-4 sm:px-6 md:px-10 lg:px-16
      py-10 sm:py-12
      grid grid-cols-1 lg:grid-cols-2
      gap-6 sm:gap-8 lg:gap-10
    ">

      {/* Identity */}
      <Panel title="Operator Identity">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* Avatar */}
          <div className="flex flex-col items-center space-y-5">

        <div className="
          relative
          w-28 h-28
          sm:w-32 sm:h-32
          lg:w-36 lg:h-36
          rounded-full
          overflow-hidden
          border border-zinc-700
          group
        ">

              <img
                src={preview || user.profileImage || "/default-avatar.png"}
                className="w-full h-full object-cover"
                alt="avatar"
              />

<label
  className="
    absolute inset-0
    bg-black/60
    flex items-center justify-center
    opacity-0 group-hover:opacity-100
    group-active:opacity-100
    transition
    cursor-pointer
    text-sm text-white
  "
>
                Change
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </label>

              <div className="absolute inset-0 rounded-full border border-white/10 animate-spin-slow pointer-events-none" />

            </div>

            {preview && (
              <button
                onClick={handleAvatarUpload}
                disabled={uploading}
                className="px-4 py-2 rounded-lg bg-zinc-200 text-zinc-900 text-sm hover:scale-[1.03] transition"
              >
                {uploading ? "Uploading..." : "Save Photo"}
              </button>
            )}

          </div>

          {/* Info */}
          <div className="space-y-6">
            <EditableName user={user} setUser={setUser} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Account ID" value={user._id} copy />
            <InfoRow label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
            {user.lastLogin && (
              <InfoRow label="Last Login" value={new Date(user.lastLogin).toLocaleString()} />
            )}
          </div>

        </div>
      </Panel>

      {/* Security */}
      <Panel title="Security">
        <TwoFactorToggle user={user} setUser={setUser} />
        <ChangePassword />
      </Panel>

      {/* Preferences */}
      <Panel title="Experience Control">

        <PreferenceSlider
          label="Background Intensity"
          min={0.6}
          max={1.6}
          step={0.1}
          field="bgIntensity"
        />

        <PreferenceSlider
          label="Motion Sensitivity"
          min={0.5}
          max={2}
          step={0.1}
          field="motionSensitivity"
        />

        <PreferenceSlider
          label="Glass Blur"
          min={10}
          max={40}
          step={2}
          field="blurStrength"
        />

      </Panel>

      {/* Danger Zone */}
      <Panel title="Account Control" danger>

        <div className="space-y-8">

          {/* Soft Delete */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-zinc-200">
              Deactivate Account
            </div>
            <div className="text-xs text-zinc-500">
              Your account will be disabled. You can restore it later.
            </div>

            <button
              onClick={handleSoftDelete}
              className="
                w-full py-3 rounded-xl
                border border-zinc-700
                text-zinc-300
                hover:border-red-500 hover:text-red-400
                transition
              "
            >
              Deactivate Account
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-800" />

          {/* Advanced Section */}
          <AdvancedDeletion />

        </div>

      </Panel>

    </div>
  );
}

/* ------------------ Components ------------------ */

function Panel({ title, children, danger }) {
  const { preferences } = usePreferences();
  const blur = preferences?.blurStrength ?? 20;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        backdropFilter: `blur(${blur}px)`
      }}
      className={`
        bg-zinc-900/60
        border ${danger ? "border-red-800" : "border-zinc-800"}
        rounded-2xl p-8
        transition-all duration-500
        hover:shadow-[0_0_50px_rgba(255,255,255,0.05)]
      `}
    >
      <h3 className={`text-lg font-semibold mb-6 ${danger ? "text-red-500" : ""}`}>
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

function InfoRow({ label, value, copy }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="space-y-1">

      {/* Label */}
      <div className="text-xs uppercase tracking-wider text-zinc-500">
        {label}
      </div>

      {/* Value Row */}
      <div className="flex items-center justify-between gap-4">

        <div className="text-sm text-zinc-200 break-all">
          {value}
        </div>

        {copy && (
          <button
            onClick={handleCopy}
            className="
              text-xs
              px-3 py-1
              border border-zinc-700
              rounded-lg
              text-zinc-400
              hover:text-white
              hover:border-zinc-500
              transition
            "
          >
            Copy
          </button>
        )}

      </div>

    </div>
  );
}

function EditableName({ user, setUser }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const save = async () => {
    if (!name.trim()) return;

    try {
      const res = await api.put("/auth/update-profile", {
        name: name.trim()
      });
      setUser(res.data);
      setEditing(false);
    } catch {
      alert("Update failed");
    }
  };

  return (
    <div className="space-y-2">

      <div className="text-xs uppercase tracking-wider text-zinc-500">
        Full Name
      </div>

      {editing ? (
        <div className="flex flex-col sm:flex-row gap-3">

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="
              w-full
              bg-zinc-800
              border border-zinc-700
              rounded-xl
              px-4 py-3
              focus:outline-none
              focus:border-zinc-500
              transition
            "
          />

          <div className="flex gap-2">
            <button
              onClick={save}
              className="
                min-h-[44px]
                px-4
                rounded-xl
                bg-zinc-200
                text-zinc-900
                text-sm
                hover:scale-[1.03]
                transition
              "
            >
              Save
            </button>

            <button
              onClick={() => {
                setEditing(false);
                setName(user.name);
              }}
              className="
                min-h-[44px]
                px-4
                rounded-xl
                border border-zinc-700
                text-sm
                hover:bg-zinc-800
                transition
              "
            >
              Cancel
            </button>
          </div>

        </div>
      ) : (
        <div className="
          flex items-center justify-between
          bg-zinc-800/40
          border border-zinc-800
          rounded-xl
          px-4 py-3
        ">
          <span className="text-lg font-medium">
            {user.name}
          </span>

          <button
            onClick={() => setEditing(true)}
            className="
              text-sm
              text-zinc-400
              hover:text-white
              transition
            "
          >
            Edit
          </button>
        </div>
      )}

    </div>
  );
}

function TwoFactorToggle({ user, setUser }) {

  const toggle = async () => {
    const res = await api.put("/auth/toggle-2fa");
    setUser(res.data);
  };

  return (
    <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-6">
      <div>
        <div className="text-sm font-medium">Two-Factor Authentication</div>
        <div className="text-xs text-zinc-500">
          Adds extra login security
        </div>
      </div>
      <button
        onClick={toggle}
        className={`px-4 py-2 rounded-lg text-sm transition ${
          user.twoFactorEnabled
            ? "bg-emerald-600 text-white"
            : "bg-zinc-700 text-zinc-300"
        }`}
      >
        {user.twoFactorEnabled ? "Enabled" : "Disabled"}
      </button>
    </div>
  );
}

function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showNew, setShowNew] = useState(false);
  const [strength, setStrength] = useState("");
  const [loading, setLoading] = useState(false);

  const evaluateStrength = (password) => {
    if (password.length < 6) return "Weak";
    if (password.match(/[A-Z]/) && password.match(/[0-9]/) && password.length >= 8)
      return "Strong";
    return "Medium";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === "newPassword") {
      setStrength(evaluateStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await api.put("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });

      alert("Password updated successfully");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setStrength("");
    } catch {
      alert("Password update failed");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">

      <form onSubmit={handleSubmit} className="space-y-4">

        <Input
          name="currentPassword"
          type="password"
          placeholder="Current Password"
          value={form.currentPassword}
          onChange={handleChange}
        />

        <div className="relative">
          <Input
            name="newPassword"
            type={showNew ? "text" : "password"}
            placeholder="New Password"
            value={form.newPassword}
            onChange={handleChange}
          />

          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-3 text-xs text-zinc-500"
          >
            {showNew ? "Hide" : "Show"}
          </button>
        </div>

        {form.newPassword && (
          <div className={`text-xs ${
            strength === "Strong"
              ? "text-emerald-400"
              : strength === "Medium"
              ? "text-yellow-400"
              : "text-red-400"
          }`}>
            Strength: {strength}
          </div>
        )}

        <Input
          name="confirmPassword"
          type="password"
          placeholder="Confirm New Password"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-zinc-200 text-zinc-900 hover:scale-[1.02] transition"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

      </form>

      {/* Session Info */}
      <SessionControls />

    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:border-zinc-400 transition"
    />
  );
}

function SessionControls() {

  const handleLogoutAll = async () => {
    try {
      await api.post("/auth/logout-all");
      alert("Logged out from all sessions");
      window.location.href = "/login";
    } catch {
      alert("Failed to logout sessions");
    }
  };

  return (
    <div className="pt-6 border-t border-zinc-800 space-y-4">

      <div className="text-sm text-zinc-400">
        Current Session: Active
      </div>

      <button
        onClick={handleLogoutAll}
        className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:border-zinc-400 transition"
      >
        Log Out From All Devices
      </button>

    </div>
  );
}

function PreferenceSlider({ label, min, max, step, field }) {
  const { preferences, setPreferences } = usePreferences();

  if (!preferences) {
    return (
      <div className="text-zinc-500 text-sm">
        Loading preferences...
      </div>
    );
  }

  const value = preferences?.[field] ?? min;

  const handleChange = async (e) => {
    const newValue = parseFloat(e.target.value);

    // Update UI instantly
    setPreferences(prev => ({
      ...prev,
      [field]: newValue
    }));

    // Persist in backend
    await api.put("/auth/update-preferences", {
      [field]: newValue
    });

    console.log(field, newValue);
  };

  console.log("Preferences in Profile:", preferences);
  

  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-200">{value}</span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full accent-zinc-300"
      />
    </div>
  );
}

function AdvancedDeletion() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleHardDelete = async () => {
    if (input !== "PERMANENT DELETE") {
      alert("Type PERMANENT DELETE to confirm.");
      return;
    }

    setLoading(true);

    try {
      await api.delete("/auth/hard-delete");
      window.location.href = "/";
    } catch {
      alert("Permanent deletion failed.");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-4">

      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-zinc-500 hover:text-red-400 transition"
      >
        Advanced Permanent Deletion
      </button>

      {open && (
        <div className="
          p-6 rounded-xl
          border border-red-900
          bg-red-950/20
          backdrop-blur-xl
          space-y-4
        ">

          <div className="text-sm text-red-400 font-medium">
            Permanent Account Deletion
          </div>

          <div className="text-xs text-zinc-500">
            This action is irreversible. All validations, activity logs,
            and account data will be permanently removed.
          </div>

          <input
            type="text"
            placeholder='Type "PERMANENT DELETE"'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="
              w-full px-4 py-3
              bg-zinc-900 border border-red-900
              rounded-xl text-sm
              focus:border-red-500 transition
            "
          />

          <button
            onClick={handleHardDelete}
            disabled={loading}
            className="
              w-full py-3 rounded-xl
              bg-red-700 text-white
              hover:bg-red-600 transition
            "
          >
            {loading ? "Deleting..." : "Permanently Delete Account"}
          </button>

        </div>
      )}

    </div>
  );
}