import React from 'react';
import styles from './DashboardSkeleton.module.css';

const SkeletonCard: React.FC = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonTitle}></div>
    <div className={styles.skeletonValue}></div>
    <div className={styles.skeletonDescription}></div>
  </div>
);

const SkeletonChart: React.FC = () => (
  <div className={styles.skeletonChart}>
    <div className={styles.skeletonChartTitle}></div>
    <div className={styles.skeletonChartContent}></div>
  </div>
);

const SkeletonTable: React.FC = () => (
  <div className={styles.skeletonChart}>
    <div className={styles.skeletonChartTitle}></div>
    <div className={styles.skeletonTable}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={styles.skeletonTableRow}>
          <div className={styles.skeletonTableCell}></div>
          <div className={styles.skeletonTableCell}></div>
        </div>
      ))}
    </div>
  </div>
);

interface DashboardSkeletonProps {
  showCacheIndicator?: boolean;
}

const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ showCacheIndicator = false }) => {
  return (
    <div className={styles.dashboard}>
      {showCacheIndicator && (
        <div className={styles.cacheIndicator}>
          <div className={styles.cacheIcon}></div>
          <span>Carregando dados atualizados...</span>
        </div>
      )}
      
      <h2>Dashboard</h2>
      
      {/* Stats Grid Skeleton */}
      <div className={styles.statsGrid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      
      {/* Charts Section */}
      <div className={styles.charts}>
        <SkeletonChart />
        <SkeletonTable />
      </div>
      
      <h2 className={styles.sectionTitle}>Métricas de Desempenho</h2>
      
      <div className={styles.charts}>
        <SkeletonChart />
        <SkeletonChart />
      </div>
      
      <div className={styles.charts}>
        <SkeletonTable />
        <SkeletonChart />
      </div>
    </div>
  );
};

export default DashboardSkeleton;
