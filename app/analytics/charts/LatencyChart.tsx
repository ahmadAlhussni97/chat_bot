"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LatencyChartProps {
  data: any; // expected from server: array with avgLatency, latency95, avgTTFT
}

export default function LatencyChart({ data }: LatencyChartProps) {
  if (!data || data.length === 0) return <div>No latency data</div>;

  const chartData = {
    labels: data.map((_, i) => `Message ${i + 1}`),
    datasets: [
      {
        label: "Average Latency (ms)",
        data: data.map((d: any) => d.avgLatency),
        borderColor: "#004a9e",
        backgroundColor: "#004a9e33",
      },
      {
        label: "95th Percentile Latency (ms)",
        data: data.map((d: any) => d.latency95),
        borderColor: "#e63946",
        backgroundColor: "#e6394633",
      },
      {
        label: "Time to First Token (TTFT) (ms)",
        data: data.map((d: any) => d.avgTTFT),
        borderColor: "#f4a261",
        backgroundColor: "#f4a26133",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Latency Metrics" },
    },
  };

  return <Line data={chartData} options={options} />;
}
