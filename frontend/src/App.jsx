import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./auth/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Expenses from "./components/Expenses.jsx";
import Loans from "./components/Loans.jsx";
import Debts from "./components/Debts.jsx";
import Analytics from "./components/Analytics.jsx";

function App() {
    return (
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/loans" element={<Loans />} />
                <Route path="/debts" element={<Debts />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
    );
}

export default App;