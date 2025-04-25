import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Header } from "@/components/layout/header";

interface HealthMetric {
  id: number;
  userId: number;
  type: string;
  value: string;
  createdAt: string;
}

import { useAuth } from "@/hooks/use-auth";

export default function HealthMetricsPage() {
  // Dummy handlers for Header (not used on this page)
  const noop = () => {};
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
      <Header onNewChat={noop} onMenuToggle={noop} />
      <div className="max-w-2xl mx-auto py-8 px-4">
        {isGoogleUser && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded">
            You are logged in with Google.
          </div>
        )}
        <h1 className="text-2xl font-bold mb-4">Health Metrics</h1>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && (
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border px-2 py-1">Type</th>
                <th className="border px-2 py-1">Value</th>
                <th className="border px-2 py-1">Date</th>
              </tr>
            </thead>
            <tbody>
              {metrics.length === 0 ? (
                <tr><td colSpan={3} className="text-center">No metrics found.</td></tr>
              ) : (
                metrics.map((m) => (
                  <tr key={m.id}>
                    <td className="border px-2 py-1">{m.type}</td>
                    <td className="border px-2 py-1">{m.value}</td>
                    <td className="border px-2 py-1">{new Date(m.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
