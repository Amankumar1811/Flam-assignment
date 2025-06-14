import { useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Expand, Columns } from "lucide-react";

interface MainViewportProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isActive: boolean;
  currentResolution: string;
  processingEnabled: boolean;
  filterType: string;
  onToggleFullscreen: () => void;
  onCaptureFrame: () => void;
  onToggleSplitView: () => void;
  onShowProcessed: () => void;
  onShowOriginal: () => void;
  showProcessed: boolean;
}

export function MainViewport({
  canvasRef,
  isActive,
  currentResolution,
  processingEnabled,
  filterType,
  onToggleFullscreen,
  onCaptureFrame,
  onToggleSplitView,
  onShowProcessed,
  onShowOriginal,
  showProcessed
}: MainViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-resize canvas to fit container
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const resizeCanvas = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const aspectRatio = 16 / 9; // Default aspect ratio
      
      let width = rect.width - 32; // Account for padding
      let height = width / aspectRatio;
      
      if (height > rect.height - 32) {
        height = rect.height - 32;
        width = height * aspectRatio;
      }
      
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(containerRef.current);
    
    // Initial resize
    resizeCanvas();

    return () => {
      resizeObserver.disconnect();
    };
  }, [canvasRef]);

  return (
    <main className="flex-1 p-6">
      <div className="h-full flex flex-col space-y-6">
        {/* Video Display Area */}
        <Card className="flex-1 surface overflow-hidden border border-border">
          <div ref={containerRef} className="h-full flex items-center justify-center relative">
            {/* Canvas Element */}
            <canvas
              ref={canvasRef}
              className={`rounded-lg ${!isActive ? 'hidden' : ''}`}
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%',
                backgroundColor: '#000' 
              }}
            />
            
            {/* Placeholder when camera is not active */}
            {!isActive && (
              <div className="text-center">
                <Camera className="w-16 h-16 text-muted-foreground mb-4 mx-auto" />
                <h3 className="text-xl font-medium text-muted-foreground mb-2">Camera Feed</h3>
                <p className="text-muted-foreground">Click "Start Camera" to begin video capture</p>
              </div>
            )}
            
            {/* Video Overlay Controls */}
            {isActive && (
              <>
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                    LIVE
                  </span>
                  <span className="bg-black/75 text-white px-2 py-1 rounded text-xs font-mono">
                    {currentResolution}
                  </span>
                </div>
                
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onToggleFullscreen}
                    className="bg-black/75 hover:bg-black/90 text-white p-2"
                  >
                    <Expand className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onCaptureFrame}
                    className="bg-black/75 hover:bg-black/90 text-white p-2"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Processing Status Overlay */}
                {processingEnabled && (
                  <div className="absolute bottom-4 left-4 bg-black/75 text-white px-3 py-2 rounded-lg flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    <span className="text-sm">
                      Processing: {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Split View Toggle */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="secondary" 
            onClick={onToggleSplitView}
            className="surface hover:bg-muted/50 text-foreground"
          >
            <Columns className="w-4 h-4 mr-2" />
            Split View
          </Button>
          
          <div className="flex surface rounded-lg p-1">
            <Button
              variant={showProcessed ? "default" : "ghost"}
              size="sm"
              onClick={onShowProcessed}
              className={showProcessed ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}
            >
              Processed
            </Button>
            <Button
              variant={!showProcessed ? "default" : "ghost"}
              size="sm"
              onClick={onShowOriginal}
              className={!showProcessed ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}
            >
              Original
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
