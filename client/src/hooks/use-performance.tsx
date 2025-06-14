import { useState, useCallback, useRef, useEffect } from 'react';

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  processingTime: number;
  memoryUsage: number;
  fpsHistory: number[];
}

export interface PerformanceHookReturn {
  metrics: PerformanceMetrics;
  startFrame: () => void;
  endFrame: (processingTime?: number) => void;
  reset: () => void;
}

export function usePerformance(): PerformanceHookReturn {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    processingTime: 0,
    memoryUsage: 0,
    fpsHistory: []
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const frameStartTimeRef = useRef(0);
  const fpsHistoryRef = useRef<number[]>([]);

  // Start timing a frame
  const startFrame = useCallback(() => {
    frameStartTimeRef.current = performance.now();
  }, []);

  // End timing a frame and update metrics
  const endFrame = useCallback((processingTime = 0) => {
    const now = performance.now();
    const frameTime = now - frameStartTimeRef.current;
    frameCountRef.current++;

    // Update FPS every second
    if (now - lastTimeRef.current >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
      
      // Update FPS history (keep last 60 values)
      fpsHistoryRef.current.push(fps);
      if (fpsHistoryRef.current.length > 60) {
        fpsHistoryRef.current.shift();
      }

      // Get memory usage if available
      let memoryUsage = 0;
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
      }

      setMetrics(current => ({
        ...current,
        fps,
        frameTime: Math.round(frameTime * 100) / 100,
        processingTime: Math.round(processingTime * 100) / 100,
        memoryUsage,
        fpsHistory: [...fpsHistoryRef.current]
      }));

      frameCountRef.current = 0;
      lastTimeRef.current = now;
    } else {
      // Update frame time and processing time immediately
      setMetrics(current => ({
        ...current,
        frameTime: Math.round(frameTime * 100) / 100,
        processingTime: Math.round(processingTime * 100) / 100
      }));
    }
  }, []);

  // Reset all metrics
  const reset = useCallback(() => {
    frameCountRef.current = 0;
    lastTimeRef.current = performance.now();
    fpsHistoryRef.current = [];
    
    setMetrics({
      fps: 0,
      frameTime: 0,
      processingTime: 0,
      memoryUsage: 0,
      fpsHistory: []
    });
  }, []);

  // Monitor memory usage periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        
        setMetrics(current => ({
          ...current,
          memoryUsage
        }));
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    startFrame,
    endFrame,
    reset
  };
}
