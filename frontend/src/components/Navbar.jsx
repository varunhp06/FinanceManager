import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <nav className="bg-stone-50 border-b border-stone-300 p-4 relative" data-test="navbar">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-stone-400 opacity-60"></div>

            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <div className="relative">
                    <button
                        data-test="navbar-dashboard"
                        className="text-stone-700 font-light text-2xl hover:text-stone-500 transition-colors duration-200 border-b border-transparent hover:border-stone-500"
                        onClick={() => navigate("/dashboard")}
                    >
                        dashboard
                    </button>
                </div>

                <div className="flex items-center space-x-6">
                    <div data-test="navbar-date" className="text-stone-600 font-mono text-sm">
                        {new Date().toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        })}
                    </div>

                    <button
                        data-test="navbar-logout"
                        onClick={logout}
                        className="text-stone-700 font-light text-sm hover:text-red-500 transition-colors duration-200 border-b border-transparent hover:border-red-500"
                    >
                        logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
