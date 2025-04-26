import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

interface FitnessChartsProps {
  data: FitnessData;
}

const FitnessCharts: React.FC<FitnessChartsProps> = ({ data }) => {
  const heartRateData: ChartData<'line'> = {
    labels: ['Min', 'Average', 'Max'],
    datasets: [
      {
        label: 'Heart Rate (BPM)',
        data: [data.heartRate.min, data.heartRate.average, data.heartRate.max],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const activityData: ChartData<'line'> = {
    labels: ['Steps', 'Calories', 'Active Minutes'],
    datasets: [
      {
        label: 'Activity Metrics',
        data: [data.steps / 100, data.calories / 10, data.activeMinutes],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium mb-4">Heart Rate Trends</h3>
        <Line data={heartRateData} options={options} />
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium mb-4">Activity Overview</h3>
        <Line data={activityData} options={options} />
      </div>
    </div>
  );
};

export default FitnessCharts;
