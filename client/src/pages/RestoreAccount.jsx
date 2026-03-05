import { useState } from "react";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { motion } from "framer-motion";

export default function RestoreAccount() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [loading, setLoading] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleRestore = async () => {
    setLoading(true);
    try {
      await api.post("/auth/restore-account", { email });
      alert("Account restored. Please login.");
      navigate("/login");
    } catch {
      alert("Restore failed.");
    }
    setLoading(false);
  };

  const handlePermanentDelete = async () => {
    if (confirmText !== "PERMANENT DELETE") {
      alert('Type "PERMANENT DELETE" to confirm.');
      return;
    }

    const confirm = window.confirm(
      "This action is irreversible. Continue?"
    );
    if (!confirm) return;

    setLoading(true);

    try {
      await api.delete("/auth/hard-delete", {
        data: { email }
      });

      alert("Account permanently deleted.");
      navigate("/");
    } catch {
      alert("Permanent deletion failed.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          bg-zinc-900/70 backdrop-blur-xl
          border border-zinc-800
          rounded-3xl p-10
          w-full max-w-md
          space-y-8
        "
      >
        <div className="text-center space-y-3">
          <div className="text-lg font-semibold">
            Account Deactivated
          </div>
          <div className="text-sm text-zinc-400">
            You can restore your account or permanently delete it.
          </div>
        </div>

        {/* Restore Button */}
        <button
          onClick={handleRestore}
          disabled={loading}
          className="
            w-full py-3 rounded-xl
            bg-zinc-200 text-zinc-900
            hover:scale-[1.02] transition
          "
        >
          {loading ? "Processing..." : "Restore Account"}
        </button>

        {/* Advanced Section */}
        <div className="border-t border-zinc-800 pt-6 space-y-4">

          <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="text-xs text-zinc-500 hover:text-red-400 transition"
          >
            Advanced: Permanent Deletion
          </button>

          {advancedOpen && (
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
                This will permanently remove all validations,
                activity logs, and account data.
              </div>

              <input
                type="text"
                placeholder='Type "PERMANENT DELETE"'
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="
                  w-full px-4 py-3
                  bg-zinc-900 border border-red-900
                  rounded-xl text-sm
                  focus:border-red-500 transition
                "
              />

              <button
                onClick={handlePermanentDelete}
                disabled={loading}
                className="
                  w-full py-3 rounded-xl
                  bg-red-700 text-white
                  hover:bg-red-600 transition
                "
              >
                Permanently Delete Account
              </button>
            </div>
          )}

        </div>

      </motion.div>

    </div>
  );
}