import { useCallback, useRef, useState } from 'react';
import { ComputerVision, ImageProcessingOptions } from '@/lib/computer-vision';

export type FilterType = 'none' | 'edge' | 'grayscale' | 'blur' | 'threshold';

export interface ProcessingSettings extends ImageProcessingOptions {
  filterType: FilterType;
  enabled: boolean;
}

export interface ImageProcessorHookReturn {
  processImage: (imageData: ImageData) => ImageData;
  settings: ProcessingSettings;
  updateSettings: (newSettings: Partial<ProcessingSettings>) => void;
  processingTime: number;
}

export function useImageProcessor(): ImageProcessorHookReturn {
  const [settings, setSettings] = useState<ProcessingSettings>({
    filterType: 'edge',
    enabled: true,
    lowThreshold: 50,
    highThreshold: 150,
    blurRadius: 2,
    thresholdValue: 128
  });
  
  const [processingTime, setProcessingTime] = useState(0);
  const workerRef = useRef<Worker | null>(null);

  // Process image data based on current settings
  const processImage = useCallback((imageData: ImageData): ImageData => {
    if (!settings.enabled || settings.filterType === 'none') {
      return imageData;
    }

    const startTime = performance.now();
    let processedData: ImageData;

    try {
      switch (settings.filterType) {
        case 'edge':
          processedData = ComputerVision.applyCannyEdgeDetection(imageData, {
            lowThreshold: settings.lowThreshold,
            highThreshold: settings.highThreshold
          });
          break;
          
        case 'grayscale':
          processedData = ComputerVision.applyGrayscale(imageData);
          break;
          
        case 'blur':
          processedData = ComputerVision.applyGaussianBlur(imageData, {
            blurRadius: settings.blurRadius
          });
          break;
          
        case 'threshold':
          processedData = ComputerVision.applyBinaryThreshold(imageData, {
            thresholdValue: settings.thresholdValue
          });
          break;
          
        default:
          processedData = imageData;
      }
      
      const endTime = performance.now();
      setProcessingTime(endTime - startTime);
      
      return processedData;
    } catch (error) {
      console.error('Image processing error:', error);
      const endTime = performance.now();
      setProcessingTime(endTime - startTime);
      return imageData; // Return original on error
    }
  }, [settings]);

  // Update processing settings
  const updateSettings = useCallback((newSettings: Partial<ProcessingSettings>) => {
    setSettings(current => ({
      ...current,
      ...newSettings
    }));
  }, []);

  return {
    processImage,
    settings,
    updateSettings,
    processingTime
  };
}
