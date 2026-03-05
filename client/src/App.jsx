import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import React from "react";
import api from "./api/axios";
import { usePreferences } from "./context/PreferencesContext";
import AppLayout from "./layout/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Analyze from "./pages/Analyze";
import Portfolio from "./pages/Portfolio";
import Activity from "./pages/Activity";
import Config from "./pages/Config";
import ProductDetail from "./pages/ProductDetail";
import Profile from "./pages/Profile.";
import Verify2FA from "./pages/Verify2FA";
import RestoreAccount from "./pages/RestoreAccount";

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

function App() {
  const [isAuth, setIsAuth] = useState(null); // null = loading
  const { setPreferences } = usePreferences();

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const res = await api.get("/auth/me");

        setIsAuth(true);

        setPreferences(res.data.preferences || {
          bgIntensity: 1,
          motionSensitivity: 1,
          blurStrength: 20,
          defaultPage: "dashboard",
          reduceMotion: false,
          theme: "dark"
        });

      } catch (err) {
        setIsAuth(false);
      }
    };

    bootstrapAuth();
  }, []);

  if (isAuth === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400">
        Loading...
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />

      <Routes>

        {/* Root Redirect */}
        <Route
          path="/"
          element={
            isAuth
              ? <Navigate to="/dashboard" />
              : <Navigate to="/login" />
          }
        />
        <Route
          path="/verify-2fa"
          element={
            <AppLayout>
              <Verify2FA setIsAuth={setIsAuth} />
            </AppLayout>
          }
        />

        {/* Public Routes */}
        <Route path="/login" element={
          <AppLayout>
          <Login setIsAuth={setIsAuth} />
          </AppLayout>} />
        <Route path="/register" element={
          <AppLayout>
          <Register />
          </AppLayout>} />

        <Route path="/restore-account" element={
          <AppLayout>
          <RestoreAccount />
          </AppLayout>}/>

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            isAuth ? (
              <AppLayout>
                <Dashboard />
              </AppLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/analyze"
          element={
            isAuth ? (
              <AppLayout>
                <Analyze />
              </AppLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/portfolio"
          element={
            isAuth ? (
              <AppLayout>
                <Portfolio />
              </AppLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/activity"
          element={
            isAuth ? (
              <AppLayout>
                <Activity />
              </AppLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/config"
          element={
            isAuth ? (
              <AppLayout>
                <Config />
              </AppLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/profile"
          element={
            isAuth ? (
              <AppLayout>
                <Profile setIsAuth={setIsAuth} />
              </AppLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/product/:id"
          element={
            isAuth ? (
              <AppLayout>
                <ProductDetail />
              </AppLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

      </Routes>
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default AppWrapper;