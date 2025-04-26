import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Heart, Flame, Timer, RefreshCw } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import FitnessCharts from './FitnessCharts';

interface FitnessData {
  steps: number;
  heartRate: {
    average: number;
    min: number;
    max: number;
  };
  calories: number;
  activeMinutes: number;
}

interface HealthMetricsProps {
  className?: string;
}

const HealthMetrics: React.FC<HealthMetricsProps> = ({ className }) => {
  const [fitnessData, setFitnessData] = useState<FitnessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFitnessData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/fitness-data');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch fitness data');
      }
      const data = await response.json();
      setFitnessData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch fitness data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFitnessData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchFitnessData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchFitnessData]);

  const handleRefresh = () => {
    fetchFitnessData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!fitnessData) {
    return (
      <div className="text-center p-4">
        <p>No fitness data available. Please connect your Google Fit account.</p>
      </div>
    );
  }

  const { steps, heartRate, calories, activeMinutes } = fitnessData;
  const stepsGoal = 10000; // Default daily step goal
  const stepsProgress = Math.min((steps / stepsGoal) * 100, 100);

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Fitness Overview</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Steps Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily Steps</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{steps.toLocaleString()}</p>
            <Progress value={stepsProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {stepsProgress.toFixed(1)}% of daily goal
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Heart Rate Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{heartRate.average} BPM</p>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: {heartRate.min} BPM</span>
              <span>Max: {heartRate.max} BPM</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calories Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{calories.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              Daily calorie burn
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active Minutes Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Time</CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{activeMinutes} min</p>
            <p className="text-xs text-muted-foreground">
              Minutes of activity today
            </p>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Charts Section */}
      {fitnessData && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Fitness Analytics</h3>
          <FitnessCharts data={fitnessData} />
        </div>
      )}
    </div>
  );
};

export default HealthMetrics;
