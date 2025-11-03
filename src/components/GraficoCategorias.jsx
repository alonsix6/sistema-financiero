/**
 * Componente de gráfico de donas para gastos por categoría
 */

import React, { useRef, useEffect } from 'react';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { CATEGORIAS } from '../utils/constants.js';

// Registrar componentes de Chart.js
Chart.register(ArcElement, Tooltip, Legend);

const GraficoCategorias = ({ gastosPorCategoria }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');
    if (chartInstance.current) chartInstance.current.destroy();

    const categorias = Object.keys(gastosPorCategoria);
    const valores = Object.values(gastosPorCategoria);
    if (categorias.length === 0) return;

    const coloresMap = {};
    CATEGORIAS.forEach(cat => {
      coloresMap[cat.valor] = cat.color;
    });
    const colores = categorias.map(cat => coloresMap[cat] || '#6B7280');

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categorias,
        datasets: [{
          data: valores,
          backgroundColor: colores,
          borderWidth: 3,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: S/ ${value.toFixed(2)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [gastosPorCategoria]);

  return (
    <div className="h-80">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default GraficoCategorias;
