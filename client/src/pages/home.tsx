import { useState, useCallback, useEffect } from 'react';
import { Camera, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useCamera } from '@/hooks/use-camera';
import { useWebGL } from '@/hooks/use-webgl';
import { useImageProcessor } from '@/hooks/use-image-processor';
import { usePerformance } from '@/hooks/use-performance';
import { CameraController } from '@/components/camera-controller';
import { ControlPanel } from '@/components/control-panel';
import { MainViewport } from '@/components/main-viewport';
import { PerformanceMonitor } from '@/components/performance-monitor';
import { ErrorModal } from '@/components/error-modal';

export default function Home() {
  const [showProcessed, setShowProcessed] = useState(true);
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  // Custom hooks
  const camera = useCamera();
  const webgl = useWebGL();
  const processor = useImageProcessor();
  const performance = usePerformance();

  // Add debug message
  const addDebugMessage = useCallback((message: string) => {
    setDebugMessages(prev => [...prev.slice(-20), message]); // Keep last 20 messages
  }, []);

  // Clear debug messages
  const clearDebugMessages = useCallback(() => {
    setDebugMessages([]);
  }, []);

  // Handle camera start
  const handleStartCamera = useCallback(async () => {
    try {
      await camera.startCamera();
      addDebugMessage(`[${new Date().toLocaleTimeString()}] Camera started successfully`);
    } catch (error) {
      console.error('Failed to start camera:', error);
    }
  }, [camera, addDebugMessage]);

  // Handle camera stop
  const handleStopCamera = useCallback(() => {
    camera.stopCamera();
    performance.reset();
    addDebugMessage(`[${new Date().toLocaleTimeString()}] Camera stopped`);
  }, [camera, performance, addDebugMessage]);

  // Handle device change
  const handleDeviceChange = useCallback(async (deviceId: string) => {
    try {
      await camera.switchCamera(deviceId);
      addDebugMessage(`[${new Date().toLocaleTimeString()}] Switched to camera: ${deviceId.slice(0, 8)}`);
    } catch (error) {
      console.error('Failed to switch camera:', error);
    }
  }, [camera, addDebugMessage]);

  // Handle frame capture from camera
  const handleFrameCapture = useCallback((canvas: HTMLCanvasElement, imageData: ImageData) => {
    if (!webgl.isInitialized) {
      return;
    }

    performance.startFrame();

    try {
      // Process image if enabled
      const processedData = showProcessed ? processor.processImage(imageData) : imageData;
      
      // Render to WebGL canvas
      webgl.render(processedData);
      
      performance.endFrame(processor.processingTime);
    } catch (error) {
      console.error('Frame processing error:', error);
      addDebugMessage(`[${new Date().toLocaleTimeString()}] Frame processing error: ${error}`);
    }
  }, [webgl, processor, performance, showProcessed, addDebugMessage]);

  // Handle frame capture button
  const handleCaptureFrame = useCallback(() => {
    const dataUrl = camera.captureFrame();
    if (dataUrl) {
      // Create download link
      const link = document.createElement('a');
      link.download = `frame-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      addDebugMessage(`[${new Date().toLocaleTimeString()}] Frame captured`);
    }
  }, [camera, addDebugMessage]);

  // Handle fullscreen toggle
  const handleToggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      webgl.canvasRef.current?.requestFullscreen();
    }
  }, [webgl.canvasRef]);

  // Handle camera errors
  useEffect(() => {
    if (camera.error) {
      setErrorModal({
        isOpen: true,
        title: 'Camera Access Error',
        message: camera.error
      });
    }
  }, [camera.error]);

  // Handle WebGL errors
  useEffect(() => {
    if (webgl.error) {
      setErrorModal({
        isOpen: true,
        title: 'WebGL Error',
        message: webgl.error
      });
    }
  }, [webgl.error]);

  // Initialize debug messages
  useEffect(() => {
    addDebugMessage(`[${new Date().toLocaleTimeString()}] Application initialized`);
    if (webgl.isInitialized) {
      addDebugMessage(`[${new Date().toLocaleTimeString()}] WebGL context created`);
    }
  }, [webgl.isInitialized, addDebugMessage]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="surface border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Camera className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold">Real-Time Edge Detection Viewer</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                camera.isActive ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-muted-foreground">
                Camera {camera.isActive ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Control Panel */}
        <ControlPanel
          isActive={camera.isActive}
          devices={camera.devices}
          onStartCamera={handleStartCamera}
          onStopCamera={handleStopCamera}
          onDeviceChange={handleDeviceChange}
          settings={processor.settings}
          onSettingsChange={processor.updateSettings}
          metrics={performance.metrics}
          debugMessages={debugMessages}
          onClearDebug={clearDebugMessages}
        />

        {/* Main Viewport */}
        <MainViewport
          canvasRef={webgl.canvasRef}
          isActive={camera.isActive}
          currentResolution="1280x720"
          processingEnabled={processor.settings.enabled}
          filterType={processor.settings.filterType}
          onToggleFullscreen={handleToggleFullscreen}
          onCaptureFrame={handleCaptureFrame}
          onToggleSplitView={() => {}}
          onShowProcessed={() => setShowProcessed(true)}
          onShowOriginal={() => setShowProcessed(false)}
          showProcessed={showProcessed}
        />
      </div>

      {/* Hidden Camera Controller */}
      <CameraController
        stream={camera.stream}
        onFrameCapture={handleFrameCapture}
        isActive={camera.isActive}
      />

      {/* Performance Monitor */}
      <PerformanceMonitor
        metrics={performance.metrics}
        onDebugMessage={addDebugMessage}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        title={errorModal.title}
        message={errorModal.message}
        onRetry={() => {
          setErrorModal({ ...errorModal, isOpen: false });
          if (errorModal.title.includes('Camera')) {
            handleStartCamera();
          }
        }}
        onDismiss={() => setErrorModal({ ...errorModal, isOpen: false })}
      />
    </div>
  );
}
