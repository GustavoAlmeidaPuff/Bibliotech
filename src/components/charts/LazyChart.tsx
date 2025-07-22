import React, { Suspense } from 'react';

// Lazy load different chart types to optimize bundle size
const LazyBarChart = React.lazy(() => 
  import('react-chartjs-2').then(module => ({ default: module.Bar }))
);

const LazyPieChart = React.lazy(() => 
  import('react-chartjs-2').then(module => ({ default: module.Pie }))
);

const LazyLineChart = React.lazy(() => 
  import('react-chartjs-2').then(module => ({ default: module.Line }))
);

// Chart.js registration - only load when needed
const chartJsLoader = import('chart.js').then(ChartJS => {
  const {
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
  } = ChartJS;

  ChartJS.Chart.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
  );
  
  return ChartJS;
});

interface ChartProps {
  type: 'bar' | 'pie' | 'line';
  data: any;
  options?: any;
  className?: string;
}

const ChartLoadingSpinner: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    background: '#f5f5f5',
    borderRadius: '8px'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #e3e3e3',
      borderTop: '4px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

const LazyChart: React.FC<ChartProps> = ({ type, data, options, className }) => {
  // Ensure Chart.js is loaded before rendering
  React.useEffect(() => {
    chartJsLoader.catch(console.error);
  }, []);

  const ChartComponent = React.useMemo(() => {
    switch (type) {
      case 'bar':
        return LazyBarChart;
      case 'pie':
        return LazyPieChart;
      case 'line':
        return LazyLineChart;
      default:
        return LazyBarChart;
    }
  }, [type]);

  return (
    <Suspense fallback={<ChartLoadingSpinner />}>
      <ChartComponent data={data} options={options} className={className} />
    </Suspense>
  );
};

export default LazyChart;
