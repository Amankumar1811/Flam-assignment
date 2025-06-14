import { useState, useCallback, useRef, useEffect } from 'react';

export interface CameraDevice {
  deviceId: string;
  label: string;
  resolution: string;
}

export interface CameraHookReturn {
  stream: MediaStream | null;
  isActive: boolean;
  error: string | null;
  devices: CameraDevice[];
  startCamera: (deviceId?: string, constraints?: MediaStreamConstraints) => Promise<void>;
  stopCamera: () => void;
  switchCamera: (deviceId: string) => Promise<void>;
  captureFrame: () => string | null;
}

export function useCamera(): CameraHookReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Enumerate available camera devices
  const enumerateDevices = useCallback(async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = deviceList
        .filter(device => device.kind === 'videoinput' && device.deviceId && device.deviceId.trim() !== '')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
          resolution: '1280x720' // Default resolution, could be detected
        }));
      
      setDevices(videoDevices);
    } catch (err) {
      console.error('Failed to enumerate devices:', err);
      setError('Failed to enumerate camera devices');
    }
  }, []);

  // Start camera with specified constraints
  const startCamera = useCallback(async (
    deviceId?: string,
    constraints: MediaStreamConstraints = {}
  ) => {
    try {
      setError(null);
      
      const defaultConstraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
          ...(deviceId && { deviceId: { exact: deviceId } })
        },
        audio: false,
        ...constraints
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(defaultConstraints);
      
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      setStream(mediaStream);
      setIsActive(true);
      
      console.log('Camera started successfully');
    } catch (err) {
      console.error('Failed to start camera:', err);
      
      let errorMessage = 'Failed to access camera';
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Camera access denied. Please allow camera permissions and try again.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please connect a camera and try again.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application.';
        } else {
          errorMessage = `Camera error: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      setIsActive(false);
    }
  }, [stream]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
    setError(null);
    console.log('Camera stopped');
  }, [stream]);

  // Switch to different camera
  const switchCamera = useCallback(async (deviceId: string) => {
    if (isActive) {
      await startCamera(deviceId);
    }
  }, [isActive, startCamera]);

  // Capture current frame as data URL
  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !stream) {
      return null;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    return canvas.toDataURL('image/png');
  }, [stream]);

  // Initialize devices on mount
  useEffect(() => {
    enumerateDevices();
    
    // Listen for device changes
    const handleDeviceChange = () => {
      enumerateDevices();
    };
    
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [enumerateDevices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return {
    stream,
    isActive,
    error,
    devices,
    startCamera,
    stopCamera,
    switchCamera,
    captureFrame
  };
}
