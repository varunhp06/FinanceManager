import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("/authenticate", { username, password });
      const token = res.data;
      localStorage.setItem("token", token);

      const userInfo = await axios.get("/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.setItem("userId", userInfo.data.id);
      navigate("/dashboard");
    } catch (err) {
      setLoginFailed(true);
      console.error(err);
    }
  };

  return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 relative">
        {/* Subtle background texture */}
        <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='M30 0L0 30L30 60L60 30L30 0'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
        ></div>

        {/* Login form */}
        <div className="bg-white/80 border border-stone-300 w-full max-w-md p-8 relative shadow-sm">
          <div className="absolute top-0 left-6 -mt-3 bg-stone-50 px-3 text-stone-700 font-light text-sm">
            login
          </div>

          {/* Form content */}
          <div className="space-y-6 mt-4">
            <div>
              <label className="block text-stone-700 font-light mb-2">
                username
              </label>
              <input
                  type="text"
                  className="w-full p-3 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800"
                  placeholder="..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-stone-700 font-light mb-2">
                password
              </label>
              <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    className="w-full p-3 pr-10 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800"
                    placeholder="..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-stone-500 hover:text-stone-700 text-xs"
                >
                  {showPassword ? "hide" : "show"}
                </button>
              </div>
            </div>

            {loginFailed && (
                <div className="text-red-600 text-sm font-light mt-2">
                  login failed: invalid or empty credentials
                </div>
            )}

            <button
                onClick={handleLogin}
                className="w-full bg-stone-800 text-stone-50 py-3 text-sm font-light tracking-wide hover:bg-stone-700 transition-colors duration-200 mt-6"
            >
              enter
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="w-full h-px bg-stone-300 opacity-50 mb-4"></div>
            <p className="text-stone-600 font-light text-sm">
              need an account?{" "}
              <button
                  onClick={() => navigate("/register")}
                  className="text-stone-800 hover:text-stone-900 border-b border-transparent hover:border-stone-400 transition-colors duration-200"
              >
                register
              </button>
            </p>
          </div>
        </div>
      </div>
  );
};

export default LoginPage;
