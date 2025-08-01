"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#34d399", "#fbbf24", "#f87171"]; // green, yellow, red

const DashboardChart = ({ stats }: { stats: any }) => {
  const pieData = [
    { name: "Completed", value: stats.completedCount || 0 },
    { name: "Pending", value: stats.pendingCount || 0 },
    { name: "Assigned", value: stats.assignedCount || 0 },
  ];

  const barData = [
    { name: "Created", count: stats.createdCount || 0 },
    { name: "Assigned", count: stats.assignedCount || 0 },
    { name: "Completed", count: stats.completedCount || 0 },
    { name: "Pending", count: stats.pendingCount || 0 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
      {/* Pie Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 className="text-center text-lg font-semibold text-gray-700 dark:text-white mb-4">
          Task Overview
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
              dataKey="value"
            >
              {pieData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 className="text-center text-lg font-semibold text-gray-700 dark:text-white mb-4">
          Task Stats
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <XAxis dataKey="name" stroke="#8884d8" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardChart;
