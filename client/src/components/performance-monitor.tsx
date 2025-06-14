import { useEffect } from 'react';
import { PerformanceMetrics } from '@/hooks/use-performance';

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics;
  onDebugMessage: (message: string) => void;
}

export function PerformanceMonitor({ metrics, onDebugMessage }: PerformanceMonitorProps) {
  // Log performance warnings
  useEffect(() => {
    if (metrics.fps > 0 && metrics.fps < 10) {
      onDebugMessage(`[${new Date().toLocaleTimeString()}] Low FPS detected: ${metrics.fps}`);
    }
    
    if (metrics.processingTime > 50) {
      onDebugMessage(`[${new Date().toLocaleTimeString()}] High processing time: ${metrics.processingTime}ms`);
    }
    
    if (metrics.memoryUsage > 100) {
      onDebugMessage(`[${new Date().toLocaleTimeString()}] High memory usage: ${metrics.memoryUsage}MB`);
    }
  }, [metrics.fps, metrics.processingTime, metrics.memoryUsage, onDebugMessage]);

  return null; // This is a monitoring component without UI
}
