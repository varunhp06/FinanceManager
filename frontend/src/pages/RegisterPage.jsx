import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMessage("please fill out both fields");
      return;
    }

    try {
      await axios.post("/api/user/register", { username, password });
      navigate("/login");
    } catch (err) {
      console.error(err);
      setErrorMessage("username taken");
    }
  };

  return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 relative">
        <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='M30 0L0 30L30 60L60 30L30 0'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
        ></div>

        <div
            data-test="register-box"
            className="bg-white/80 border border-stone-300 w-full max-w-md p-8 relative shadow-sm"
        >
          <div
              data-test="register-header"
              className="absolute top-0 left-6 -mt-3 bg-stone-50 px-3 text-stone-700 font-light text-sm"
          >
            register
          </div>

          <div className="space-y-6 mt-4">
            <div>
              <label className="block text-stone-700 font-light mb-2">
                username
              </label>
              <input
                  data-test="register-username"
                  type="text"
                  className="w-full p-3 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800"
                  placeholder="..."
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMessage("");
                  }}
              />
            </div>

            <div>
              <label className="block text-stone-700 font-light mb-2">
                password
              </label>
              <div className="relative">
                <input
                    data-test="register-password"
                    type={showPassword ? "text" : "password"}
                    className="w-full p-3 pr-10 bg-transparent border-b border-stone-300 focus:border-stone-600 focus:outline-none font-mono text-stone-800"
                    placeholder="..."
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage("");
                    }}
                />
                <button
                    type="button"
                    data-test="toggle-register-password"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-stone-500 hover:text-stone-700 transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {errorMessage && (
                <div
                    data-test="register-error"
                    className="text-red-600 text-sm font-light mt-2"
                >
                  {errorMessage}
                </div>
            )}

            <button
                data-test="register-button"
                onClick={handleRegister}
                className="w-full bg-stone-800 text-stone-50 py-3 text-sm font-light tracking-wide hover:bg-stone-700 transition-colors duration-200 mt-6"
            >
              create account
            </button>
          </div>

          <div className="mt-8 text-center">
            <div className="w-full h-px bg-stone-300 opacity-50 mb-4"></div>
            <p className="text-stone-600 font-light text-sm">
              already registered?{" "}
              <button
                  data-test="go-to-login"
                  onClick={() => navigate("/login")}
                  className="text-stone-800 hover:text-stone-900 border-b border-transparent hover:border-stone-400 transition-colors duration-200"
              >
                login
              </button>
            </p>
          </div>
        </div>
      </div>
  );
};

export default RegisterPage;
