"use client";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function VolumeChart({ data }: any) {
  const chartData = {
    labels: data.map((d: any) => d._id),
    datasets: [
      {
        label: "# Messages",
        data: data.map((d: any) => d.messages),
        backgroundColor: "#004a9e",
      },
    ],
  };

  return <Bar data={chartData} />;
}
