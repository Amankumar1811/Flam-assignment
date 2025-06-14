export interface ImageProcessingOptions {
  lowThreshold?: number;
  highThreshold?: number;
  blurRadius?: number;
  thresholdValue?: number;
}

export class ComputerVision {
  static applyCannyEdgeDetection(
    imageData: ImageData,
    options: ImageProcessingOptions = {}
  ): ImageData {
    const { lowThreshold = 50, highThreshold = 150 } = options;
    const { data, width, height } = imageData;
    const output = new Uint8ClampedArray(data.length);
    
    // Convert to grayscale first
    const grayscale = new Uint8ClampedArray(width * height);
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      grayscale[i / 4] = gray;
    }
    
    // Apply Gaussian blur to reduce noise
    const blurred = this.gaussianBlur(grayscale, width, height, 1.0);
    
    // Calculate gradients using Sobel operators
    const { magnitude, direction } = this.sobelOperator(blurred, width, height);
    
    // Non-maximum suppression
    const suppressed = this.nonMaximumSuppression(magnitude, direction, width, height);
    
    // Double threshold
    const edges = this.doubleThreshold(suppressed, width, height, lowThreshold, highThreshold);
    
    // Convert back to RGBA
    for (let i = 0; i < edges.length; i++) {
      const pixelIndex = i * 4;
      const edgeValue = edges[i];
      output[pixelIndex] = edgeValue;
      output[pixelIndex + 1] = edgeValue;
      output[pixelIndex + 2] = edgeValue;
      output[pixelIndex + 3] = 255;
    }
    
    return new ImageData(output, width, height);
  }
  
  static applyGrayscale(imageData: ImageData): ImageData {
    const { data, width, height } = imageData;
    const output = new Uint8ClampedArray(data.length);
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      output[i] = gray;
      output[i + 1] = gray;
      output[i + 2] = gray;
      output[i + 3] = data[i + 3];
    }
    
    return new ImageData(output, width, height);
  }
  
  static applyGaussianBlur(imageData: ImageData, options: ImageProcessingOptions = {}): ImageData {
    const { blurRadius = 2 } = options;
    const { data, width, height } = imageData;
    const output = new Uint8ClampedArray(data.length);
    
    // Create Gaussian kernel
    const kernel = this.createGaussianKernel(blurRadius);
    const kernelSize = kernel.length;
    const halfKernel = Math.floor(kernelSize / 2);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0;
        
        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const px = Math.min(Math.max(x + kx - halfKernel, 0), width - 1);
            const py = Math.min(Math.max(y + ky - halfKernel, 0), height - 1);
            const pixelIndex = (py * width + px) * 4;
            const weight = kernel[ky][kx];
            
            r += data[pixelIndex] * weight;
            g += data[pixelIndex + 1] * weight;
            b += data[pixelIndex + 2] * weight;
            a += data[pixelIndex + 3] * weight;
          }
        }
        
        const outputIndex = (y * width + x) * 4;
        output[outputIndex] = Math.round(r);
        output[outputIndex + 1] = Math.round(g);
        output[outputIndex + 2] = Math.round(b);
        output[outputIndex + 3] = Math.round(a);
      }
    }
    
    return new ImageData(output, width, height);
  }
  
  static applyBinaryThreshold(imageData: ImageData, options: ImageProcessingOptions = {}): ImageData {
    const { thresholdValue = 128 } = options;
    const { data, width, height } = imageData;
    const output = new Uint8ClampedArray(data.length);
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      const binary = gray > thresholdValue ? 255 : 0;
      
      output[i] = binary;
      output[i + 1] = binary;
      output[i + 2] = binary;
      output[i + 3] = data[i + 3];
    }
    
    return new ImageData(output, width, height);
  }
  
  private static gaussianBlur(data: Uint8ClampedArray, width: number, height: number, sigma: number): Uint8ClampedArray {
    const kernel = this.createGaussianKernel1D(sigma);
    const halfKernel = Math.floor(kernel.length / 2);
    const temp = new Uint8ClampedArray(data.length);
    const output = new Uint8ClampedArray(data.length);
    
    // Horizontal pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        for (let i = 0; i < kernel.length; i++) {
          const px = Math.min(Math.max(x + i - halfKernel, 0), width - 1);
          sum += data[y * width + px] * kernel[i];
        }
        temp[y * width + x] = sum;
      }
    }
    
    // Vertical pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        for (let i = 0; i < kernel.length; i++) {
          const py = Math.min(Math.max(y + i - halfKernel, 0), height - 1);
          sum += temp[py * width + x] * kernel[i];
        }
        output[y * width + x] = sum;
      }
    }
    
    return output;
  }
  
  private static sobelOperator(data: Uint8ClampedArray, width: number, height: number) {
    const magnitude = new Uint8ClampedArray(data.length);
    const direction = new Float32Array(data.length);
    
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const pixel = data[(y + i) * width + (x + j)];
            const kernelIndex = (i + 1) * 3 + (j + 1);
            gx += pixel * sobelX[kernelIndex];
            gy += pixel * sobelY[kernelIndex];
          }
        }
        
        const index = y * width + x;
        magnitude[index] = Math.sqrt(gx * gx + gy * gy);
        direction[index] = Math.atan2(gy, gx);
      }
    }
    
    return { magnitude, direction };
  }
  
  private static nonMaximumSuppression(
    magnitude: Uint8ClampedArray,
    direction: Float32Array,
    width: number,
    height: number
  ): Uint8ClampedArray {
    const output = new Uint8ClampedArray(magnitude.length);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const index = y * width + x;
        const angle = direction[index];
        const mag = magnitude[index];
        
        // Determine gradient direction
        let neighbor1, neighbor2;
        const angleRad = Math.abs(angle);
        
        if (angleRad < Math.PI / 8 || angleRad > 7 * Math.PI / 8) {
          neighbor1 = magnitude[index - 1];
          neighbor2 = magnitude[index + 1];
        } else if (angleRad < 3 * Math.PI / 8) {
          neighbor1 = magnitude[(y - 1) * width + (x + 1)];
          neighbor2 = magnitude[(y + 1) * width + (x - 1)];
        } else if (angleRad < 5 * Math.PI / 8) {
          neighbor1 = magnitude[(y - 1) * width + x];
          neighbor2 = magnitude[(y + 1) * width + x];
        } else {
          neighbor1 = magnitude[(y - 1) * width + (x - 1)];
          neighbor2 = magnitude[(y + 1) * width + (x + 1)];
        }
        
        if (mag >= neighbor1 && mag >= neighbor2) {
          output[index] = mag;
        }
      }
    }
    
    return output;
  }
  
  private static doubleThreshold(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    lowThreshold: number,
    highThreshold: number
  ): Uint8ClampedArray {
    const output = new Uint8ClampedArray(data.length);
    
    for (let i = 0; i < data.length; i++) {
      if (data[i] >= highThreshold) {
        output[i] = 255;
      } else if (data[i] >= lowThreshold) {
        output[i] = 128;
      }
    }
    
    // Edge tracking by hysteresis
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const index = y * width + x;
        if (output[index] === 128) {
          let hasStrongNeighbor = false;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (output[(y + dy) * width + (x + dx)] === 255) {
                hasStrongNeighbor = true;
                break;
              }
            }
            if (hasStrongNeighbor) break;
          }
          output[index] = hasStrongNeighbor ? 255 : 0;
        }
      }
    }
    
    return output;
  }
  
  private static createGaussianKernel(radius: number): number[][] {
    const size = radius * 2 + 1;
    const kernel: number[][] = [];
    const sigma = radius / 3;
    let sum = 0;
    
    for (let y = 0; y < size; y++) {
      kernel[y] = [];
      for (let x = 0; x < size; x++) {
        const dx = x - radius;
        const dy = y - radius;
        const value = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
        kernel[y][x] = value;
        sum += value;
      }
    }
    
    // Normalize
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        kernel[y][x] /= sum;
      }
    }
    
    return kernel;
  }
  
  private static createGaussianKernel1D(sigma: number): number[] {
    const radius = Math.ceil(sigma * 3);
    const size = radius * 2 + 1;
    const kernel: number[] = [];
    let sum = 0;
    
    for (let i = 0; i < size; i++) {
      const x = i - radius;
      const value = Math.exp(-(x * x) / (2 * sigma * sigma));
      kernel[i] = value;
      sum += value;
    }
    
    // Normalize
    for (let i = 0; i < size; i++) {
      kernel[i] /= sum;
    }
    
    return kernel;
  }
}
