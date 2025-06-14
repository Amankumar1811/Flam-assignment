import { useEffect, useRef } from 'react';
import { useCamera } from '@/hooks/use-camera';

interface CameraControllerProps {
  stream: MediaStream | null;
  onFrameCapture?: (canvas: HTMLCanvasElement, imageData: ImageData) => void;
  isActive?: boolean;
}

export function CameraController({ 
  stream, 
  onFrameCapture, 
  isActive = false 
}: CameraControllerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Setup video stream
  useEffect(() => {
    if (!videoRef.current || !stream) return;

    const video = videoRef.current;
    video.srcObject = stream;
    
    const handleLoadedMetadata = () => {
      video.play().catch(console.error);
    };
    
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      if (video.srcObject) {
        video.srcObject = null;
      }
    };
  }, [stream]);

  // Frame capture loop
  useEffect(() => {
    if (!isActive || !videoRef.current || !canvasRef.current || !onFrameCapture) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    const captureFrame = () => {
      if (video.readyState >= 2) { // HAVE_CURRENT_DATA
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Call callback with canvas and image data
        onFrameCapture(canvas, imageData);
      }
      
      if (isActive) {
        animationFrameRef.current = requestAnimationFrame(captureFrame);
      }
    };

    // Start capture loop
    animationFrameRef.current = requestAnimationFrame(captureFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, onFrameCapture]);

  return (
    <div className="hidden">
      <video
        ref={videoRef}
        muted
        playsInline
        className="hidden"
      />
      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </div>
  );
}
