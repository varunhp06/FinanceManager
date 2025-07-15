import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 relative overflow-hidden">
            <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='M30 0L0 30L30 60L60 30L30 0'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />

            <div className="bg-white/80 border border-stone-300 w-full max-w-lg p-10 relative shadow-sm text-center">
                <div className="absolute top-0 left-8 -mt-3 bg-stone-50 px-4 text-stone-700 font-light text-sm">
                    finance manager
                </div>

                <h1 className="text-4xl font-serif text-stone-800 mb-4 tracking-wide">
                    track and analyze your finances.
                </h1>
                <p className="text-stone-600 font-light mb-5 max-w-md mx-auto leading-relaxed text-sm">
                    expenses. loans. debt.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => navigate("/login")}
                        className="bg-stone-800 text-stone-50 px-6 py-3 text-sm font-light tracking-wide hover:bg-stone-700 transition-colors duration-200 w-full sm:w-auto"
                    >
                        login
                    </button>
                    <button
                        onClick={() => navigate("/register")}
                        className="border border-stone-800 text-stone-800 px-6 py-3 text-sm font-light tracking-wide hover:bg-stone-800 hover:text-stone-50 transition-colors duration-200 w-full sm:w-auto"
                    >
                        register
                    </button>
                </div>
                <div className="mt-6 text-xs text-stone-400 font-light italic">
                    as simple as it gets.
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
