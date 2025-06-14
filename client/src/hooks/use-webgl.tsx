import { useRef, useEffect, useCallback, useState } from 'react';
import { WebGLRenderer } from '@/lib/webgl-utils';

export interface WebGLHookReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  renderer: WebGLRenderer | null;
  render: (imageData: ImageData) => void;
  resize: (width: number, height: number) => void;
  isInitialized: boolean;
  error: string | null;
}

export function useWebGL(): WebGLHookReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize WebGL renderer
  const initializeRenderer = useCallback(() => {
    if (!canvasRef.current) return;
    
    try {
      const renderer = new WebGLRenderer(canvasRef.current);
      rendererRef.current = renderer;
      setIsInitialized(true);
      setError(null);
      console.log('WebGL renderer initialized');
    } catch (err) {
      console.error('Failed to initialize WebGL:', err);
      setError(err instanceof Error ? err.message : 'WebGL initialization failed');
      setIsInitialized(false);
    }
  }, []);

  // Render image data to canvas
  const render = useCallback((imageData: ImageData) => {
    if (!rendererRef.current || !isInitialized) {
      console.warn('WebGL renderer not initialized');
      return;
    }
    
    try {
      rendererRef.current.render(imageData);
    } catch (err) {
      console.error('WebGL render error:', err);
      setError(err instanceof Error ? err.message : 'WebGL render failed');
    }
  }, [isInitialized]);

  // Resize canvas and viewport
  const resize = useCallback((width: number, height: number) => {
    if (!rendererRef.current || !canvasRef.current) return;
    
    try {
      rendererRef.current.resize(width, height);
    } catch (err) {
      console.error('WebGL resize error:', err);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (canvasRef.current) {
      initializeRenderer();
    }
  }, [initializeRenderer]);

  // Handle canvas resize
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        resize(width, height);
      }
    });
    
    resizeObserver.observe(canvas);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [resize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, []);

  return {
    canvasRef,
    renderer: rendererRef.current,
    render,
    resize,
    isInitialized,
    error
  };
}
