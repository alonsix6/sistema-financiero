/**
 * Componente de gráfico de stock estilo Apple Stocks
 * Diseño minimalista y elegante
 */

import React, { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
);

const StockChart = ({ data, darkMode, symbol }) => {
  const chartRef = useRef(null);

  if (!data || !data.c || data.c.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <p className="text-sm">No hay datos históricos disponibles</p>
      </div>
    );
  }

  // Determinar si el precio subió o bajó
  const firstPrice = data.c[0];
  const lastPrice = data.c[data.c.length - 1];
  const isPositive = lastPrice >= firstPrice;

  // Colores según si subió o bajó
  const lineColor = isPositive
    ? 'rgb(52, 199, 89)'  // Verde Apple
    : 'rgb(255, 69, 58)';  // Rojo Apple

  const gradientColor = isPositive
    ? 'rgba(52, 199, 89, 0.1)'
    : 'rgba(255, 69, 58, 0.1)';

  // Formatear fechas
  const labels = data.t.map(timestamp => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('es-PE', { month: 'short', day: 'numeric' });
  });

  const chartData = {
    labels,
    datasets: [
      {
        data: data.c,
        borderColor: lineColor,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            return null;
          }

          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, gradientColor);
          gradient.addColorStop(1, darkMode ? 'rgba(0, 0, 0, 0)' : 'rgba(255, 255, 255, 0)');

          return gradient;
        },
        fill: true,
        borderWidth: 2,
        tension: 0.4,  // Curva suave
        pointRadius: 0,  // Sin puntos
        pointHoverRadius: 4,
        pointHoverBackgroundColor: lineColor,
        pointHoverBorderColor: darkMode ? '#1f2937' : '#ffffff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: darkMode ? '#ffffff' : '#1f2937',
        bodyColor: darkMode ? '#d1d5db' : '#4b5563',
        borderColor: darkMode ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (context) => {
            return context[0].label;
          },
          label: (context) => {
            return `$${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: false,  // Ocultar eje X para estilo minimalista
      },
      y: {
        display: false,  // Ocultar eje Y para estilo minimalista
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="w-full h-64">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default StockChart;
