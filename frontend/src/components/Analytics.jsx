import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie, Line, Bar } from "react-chartjs-2";
import {Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, BarElement,} from "chart.js";
import Navbar from "./Navbar.jsx";

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, BarElement);

function Analytics() {
    const [insights, setInsights] = useState(null);
    const [weekly, setWeekly] = useState(null);
    const [monthly, setMonthly] = useState(null);
    const [yearly, setYearly] = useState(null);
    const [categoryChart, setCategoryChart] = useState(null);
    const [monthlyChart, setMonthlyChart] = useState(null);
    const [weeklyChart, setWeeklyChart] = useState(null);
    const [loading, setLoading] = useState(true);

    const userId = localStorage.getItem("userId");

    useEffect(() => {
        if (!userId) return;

        const fetchInsights = axios.get("http://localhost:8080/api/analytics/insights", { params: { userId }, withCredentials: true });
        const fetchWeekly = axios.get("http://localhost:8080/api/analytics/weekly", { params: { userId }, withCredentials: true });
        const fetchMonthly = axios.get("http://localhost:8080/api/analytics/monthly", { params: { userId }, withCredentials: true });
        const fetchYearly = axios.get("http://localhost:8080/api/analytics/yearly", { params: { userId }, withCredentials: true });
        const fetchMonthlyBreakdown = axios.get("http://localhost:8080/api/analytics/monthly-breakdown", { params: { userId }, withCredentials: true });
        const fetchWeeklyBreakdown = axios.get("http://localhost:8080/api/analytics/weekly-breakdown", { params: { userId }, withCredentials: true });

        Promise.all([fetchInsights, fetchWeekly, fetchMonthly, fetchYearly, fetchMonthlyBreakdown, fetchWeeklyBreakdown])
            .then(([insightsRes, weeklyRes, monthlyRes, yearlyRes, monthlyBreakdownRes, weeklyBreakdownRes]) => {
                const insightsData = typeof insightsRes.data === "string" ? JSON.parse(insightsRes.data) : insightsRes.data;

                setInsights(insightsData);
                setWeekly(weeklyRes.data);
                setMonthly(monthlyRes.data);
                setYearly(yearlyRes.data);

                const catMap = new Map();
                insightsData.anomalies.forEach(item => {
                    const cat = item.category.toLowerCase();
                    catMap.set(cat, (catMap.get(cat) || 0) + item.amount);
                });

                const borderPalette = [
                    "#f87171", "#60a5fa", "#34d399", "#fbbf24", "#c084fc",
                    "#fb7185", "#38bdf8", "#4ade80", "#facc15", "#f472b6"
                ];

                setCategoryChart({
                    labels: Array.from(catMap.keys()),
                    datasets: [{
                        data: Array.from(catMap.values()),
                        backgroundColor: "#ffffff",
                        borderColor: borderPalette.slice(0, catMap.size),
                        borderWidth: 3,
                        hoverOffset: 4,
                    }],
                });

                const monthlyBreakdown = monthlyBreakdownRes.data;
                setMonthlyChart({
                    labels: Object.keys(monthlyBreakdown),
                    datasets: [{
                        label: "monthly spending",
                        data: Object.values(monthlyBreakdown),
                        borderColor: "#3b82f6",
                        backgroundColor: "#dbeafe",
                        fill: true,
                        tension: 0.4,
                    }]
                });

                const weeklyBreakdown = weeklyBreakdownRes.data;
                const barColors = [
                    "#f87171", "#60a5fa", "#34d399", "#fbbf24", "#c084fc",
                    "#fb7185", "#38bdf8", "#4ade80", "#facc15", "#f472b6"
                ];

                setWeeklyChart({
                    labels: Object.keys(weeklyBreakdown),
                    datasets: [{
                        label: "weekly averages",
                        data: Object.values(weeklyBreakdown),
                        backgroundColor: "#ffffff",
                        borderColor: barColors.slice(0, Object.keys(weeklyBreakdown).length),
                        borderWidth: 2,
                        borderSkipped: false,
                        barThickness: 24,
                    }]
                });


                setLoading(false);
            })
            .catch((err) => {
                console.error("failed to load analytics data", err);
                setLoading(false);
            });
    }, [userId]);

    if (loading) return <div className="text-center mt-12 text-stone-500">loading analytics...</div>;
    if (!insights) return <div className="text-center mt-12 text-stone-500">no insights available.</div>;

    return (
        <div className="min-h-screen bg-stone-50 relative">
            <Navbar/>
            <div className="max-w-7xl mx-auto">
                <div className="max-w-4xl mx-auto p-8">
                    <div className="text-center mb-5">
                        <h2 className="text-4xl text-stone-800 font-light tracking-wider mb-4">
                            analytics
                        </h2>
                        <div className="w-32 h-px bg-stone-400 mx-auto opacity-50"></div>
                    </div>
                </div>

                <div className="bg-white/80 border border-stone-300 rounded-none mb-8 p-6 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-6">
                        <div>
                            <p className="text-sm text-stone-600 font-light mb-1">this week</p>
                            <p className="text-lg font-mono text-stone-800">₹{weekly.toFixed(2) || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-stone-600 font-light mb-1">this month</p>
                            <p className="text-lg font-mono text-stone-800">₹{monthly.toFixed(2) || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-stone-600 font-light mb-1">this year</p>
                            <p className="text-lg font-mono text-stone-800">₹{yearly.toFixed(2) || 0}</p>
                        </div>
                    </div>

                    <div className="text-stone-700 font-light space-y-2 mb-6">
                        <p><strong className="text-stone-800">spending type:</strong> {insights.label.toLowerCase()}</p>
                        <p><strong className="text-stone-800">spending trend:</strong> {insights.trend.toLowerCase()}</p>
                        <p><strong className="text-stone-800">most spent category:</strong> {insights.topCategory.toLowerCase()}</p>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-stone-800 mb-2">suggestions</h4>
                        <ul className="list-disc pl-5 text-stone-600 font-light text-sm">
                            {insights.suggestions.map((s, i) => <li key={i}>{s.toLowerCase()}</li>)}
                        </ul>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-stone-800 mb-2">anomalies</h4>
                        {insights.anomalies.length > 0 ? (
                            <ul className="list-disc pl-5 text-red-700 font-light text-sm">
                                {insights.anomalies.map((a, i) => (
                                    <li key={i}>
                                        spent ₹{a.amount} on {a.description.toLowerCase()} for {a.category.toLowerCase()} on -{" "}
                                        {new Date(a.expense_date).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        }).toLowerCase()}
                                    </li>

                                ))}
                            </ul>
                        ) : (
                            <p className="text-stone-500 italic">no anomalies detected</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {categoryChart && (
                        <div className="bg-white/80 border border-stone-300 p-6 shadow-sm">
                            <h4 className="font-light text-stone-700 mb-3 text-sm">category breakdown (pie)</h4>
                            <div className="h-64">
                                <Pie data={categoryChart} options={chartOptions}/>
                            </div>
                        </div>
                    )}

                    {monthlyChart && (
                        <div className="bg-white/80 border border-stone-300 p-6 shadow-sm">
                            <h4 className="font-light text-stone-700 mb-3 text-sm">monthly spending (line)</h4>
                            <div className="h-64">
                                <Line data={monthlyChart} options={chartOptions}/>
                            </div>
                        </div>
                    )}

                    {weeklyChart && (
                        <div className="bg-white/80 border border-stone-300 p-6 shadow-sm lg:col-span-2">
                            <h4 className="font-light text-stone-700 mb-3 text-sm">weekly averages (bar)</h4>
                            <div className="h-64">
                                <Bar data={weeklyChart} options={chartOptions}/>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

}

export default Analytics;

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: "#52525b",
                font: {
                    family: "monospace",
                    weight: "300",
                },
                boxWidth: 12,
                padding: 10,
            },
            position: "bottom",
        },
        tooltip: {
            titleFont: {
                family: "monospace",
                weight: "400",
            },
            bodyFont: {
                family: "monospace",
                weight: "300",
            },
            backgroundColor: "#fafaf9",
            titleColor: "#1c1917",
            bodyColor: "#292524",
            borderColor: "#e7e5e4",
            borderWidth: 1,
        },
    },
    scales: {
        x: {
            grid: {
                color: "#f5f5f4",
            },
            ticks: {
                color: "#78716c",
                font: {
                    family: "monospace",
                    weight: "300",
                },
            },
        },
        y: {
            grid: {
                color: "#f5f5f4",
            },
            ticks: {
                color: "#78716c",
                font: {
                    family: "monospace",
                    weight: "300",
                },
                beginAtZero: true,
            },
        },
    },
};

