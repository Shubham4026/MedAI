import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import Header from "@/components/common/Header";
import HealthMetrics from "@/components/dashboard/HealthMetrics";

interface HealthMetric {
  id: number;
  userId: number;
  type: string;
  value: string;
  createdAt: string;
}

import { useAuth } from "@/hooks/use-auth";

export default function HealthMetricsPage() {
  const { user } = useAuth();
  const isGoogleUser = user && !user.password;

  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWithAuth("/api/health-metrics")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load health metrics");
        return res.json();
      })
      .then(setMetrics)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto py-10 px-4">
        {isGoogleUser && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded">
            You are logged in with Google.
          </div>
        )}
        {/* Google Fit Integration */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <HealthMetrics className="mb-8" />
        </div>

        {/* Historical Health Metrics */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m4 0h-1v4h-1m-4 0h-1v-4h-1m4 0h-1v4h-1" /></svg>
            Your Metrics
          </h2>
          {loading && <div className="text-gray-500">Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-lg overflow-hidden">
                <thead className="bg-teal-50">
                  <tr>
                    <th className="border px-4 py-2 text-left font-semibold text-teal-700">Type</th>
                    <th className="border px-4 py-2 text-left font-semibold text-teal-700">Value</th>
                    <th className="border px-4 py-2 text-left font-semibold text-teal-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-6 text-gray-400">No metrics found.</td></tr>
                  ) : (
                    metrics.map((m, idx) => (
                      <tr key={m.id} className={idx % 2 === 0 ? "bg-white" : "bg-teal-50/50"}>
                        <td className="border px-4 py-2 capitalize">{m.type}</td>
                        <td className="border px-4 py-2">{m.value}</td>
                        <td className="border px-4 py-2">{new Date(m.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
