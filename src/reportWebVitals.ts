import { ReportHandler } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Enhanced performance monitoring with console logging in development
      const enhancedHandler: ReportHandler = (metric) => {
        if (process.env.NODE_ENV === 'development') {
          console.group(`📊 Web Vital: ${metric.name}`);
          console.log(`Value: ${metric.value}`);
          console.log(`Rating: ${metric.rating}`);
          console.log(`Delta: ${metric.delta}`);
          console.groupEnd();
        }
        onPerfEntry(metric);
      };

      getCLS(enhancedHandler);
      getFID(enhancedHandler);
      getFCP(enhancedHandler);
      getLCP(enhancedHandler);
      getTTFB(enhancedHandler);
    });
  }
};

export default reportWebVitals; 