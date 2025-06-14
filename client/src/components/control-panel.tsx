import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Play, Square, Camera, Settings } from "lucide-react";
import { CameraDevice } from "@/hooks/use-camera";
import { ProcessingSettings, FilterType } from "@/hooks/use-image-processor";
import { PerformanceMetrics } from "@/hooks/use-performance";

interface ControlPanelProps {
  // Camera controls
  isActive: boolean;
  devices: CameraDevice[];
  onStartCamera: () => void;
  onStopCamera: () => void;
  onDeviceChange: (deviceId: string) => void;
  
  // Processing controls
  settings: ProcessingSettings;
  onSettingsChange: (settings: Partial<ProcessingSettings>) => void;
  
  // Performance metrics
  metrics: PerformanceMetrics;
  
  // Debug info
  debugMessages: string[];
  onClearDebug: () => void;
}

export function ControlPanel({
  isActive,
  devices,
  onStartCamera,
  onStopCamera,
  onDeviceChange,
  settings,
  onSettingsChange,
  metrics,
  debugMessages,
  onClearDebug
}: ControlPanelProps) {
  const handleFilterChange = (value: string) => {
    onSettingsChange({ filterType: value as FilterType });
  };

  const handleThresholdChange = (type: 'low' | 'high', value: number[]) => {
    if (type === 'low') {
      onSettingsChange({ lowThreshold: value[0] });
    } else {
      onSettingsChange({ highThreshold: value[0] });
    }
  };

  return (
    <aside className="w-80 surface border-r border-border p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Camera Controls */}
        <Card className="p-4">
          <h2 className="text-lg font-medium text-foreground mb-4">Camera Controls</h2>
          
          <div className="space-y-3">
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={isActive ? onStopCamera : onStartCamera}
            >
              {isActive ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Camera
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Camera
                </>
              )}
            </Button>
          </div>

          {/* Camera Selection */}
          {devices.length > 0 && (
            <div className="space-y-2 mt-4">
              <Label className="text-sm font-medium text-muted-foreground">Camera Device</Label>
              <Select onValueChange={onDeviceChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select camera..." />
                </SelectTrigger>
                <SelectContent>
                  {devices.filter(device => device.deviceId && device.deviceId.trim() !== '').map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label} ({device.resolution})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Resolution Selection */}
          <div className="space-y-2 mt-4">
            <Label className="text-sm font-medium text-muted-foreground">Resolution</Label>
            <Select defaultValue="1280x720">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="640x480">640x480</SelectItem>
                <SelectItem value="1280x720">1280x720</SelectItem>
                <SelectItem value="1920x1080">1920x1080</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Processing Controls */}
        <Card className="p-4">
          <h2 className="text-lg font-medium text-foreground mb-4">Image Processing</h2>
          
          {/* Filter Toggle */}
          <div className="flex items-center justify-between mb-4">
            <Label className="text-sm font-medium text-muted-foreground">Enable Processing</Label>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => onSettingsChange({ enabled })}
            />
          </div>

          {/* Filter Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">Filter Type</Label>
            <RadioGroup value={settings.filterType} onValueChange={handleFilterChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="edge" id="edge" />
                <Label htmlFor="edge" className="text-sm">Edge Detection</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="grayscale" id="grayscale" />
                <Label htmlFor="grayscale" className="text-sm">Grayscale</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="blur" id="blur" />
                <Label htmlFor="blur" className="text-sm">Gaussian Blur</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="threshold" id="threshold" />
                <Label htmlFor="threshold" className="text-sm">Binary Threshold</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Edge Detection Parameters */}
          {settings.filterType === 'edge' && (
            <Card className="p-3 mt-4 bg-muted/50">
              <h3 className="text-sm font-medium text-foreground mb-3">Edge Detection Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-xs text-muted-foreground">Low Threshold</Label>
                    <span className="text-xs font-mono text-foreground">{settings.lowThreshold}</span>
                  </div>
                  <Slider
                    value={[settings.lowThreshold || 50]}
                    onValueChange={(value) => handleThresholdChange('low', value)}
                    max={255}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-xs text-muted-foreground">High Threshold</Label>
                    <span className="text-xs font-mono text-foreground">{settings.highThreshold}</span>
                  </div>
                  <Slider
                    value={[settings.highThreshold || 150]}
                    onValueChange={(value) => handleThresholdChange('high', value)}
                    max={255}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          )}
        </Card>

        {/* Performance Metrics */}
        <Card className="p-4">
          <h2 className="text-lg font-medium text-foreground mb-4">Performance</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">FPS</div>
              <div className="text-xl font-mono font-bold text-accent">{metrics.fps}</div>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Frame Time</div>
              <div className="text-xl font-mono font-bold text-blue-400">{metrics.frameTime}ms</div>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Processing</div>
              <div className="text-xl font-mono font-bold text-yellow-400">{metrics.processingTime}ms</div>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Memory</div>
              <div className="text-xl font-mono font-bold text-purple-400">{metrics.memoryUsage}MB</div>
            </div>
          </div>
          
          {/* Performance Graph */}
          <div className="bg-muted/30 p-3 rounded-lg">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">FPS History</div>
            <div className="h-16 bg-muted/50 rounded flex items-end justify-end space-x-1 p-2">
              {metrics.fpsHistory.slice(-20).map((fps, index) => {
                const height = Math.max((fps / 60) * 100, 5); // Normalize to 60 FPS max
                return (
                  <div
                    key={index}
                    className="w-1 bg-accent rounded-t opacity-80"
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
          </div>
        </Card>

        {/* Debug Information */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-foreground">Debug Info</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearDebug}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          </div>
          
          <div className="bg-muted/20 p-3 rounded-lg h-32 overflow-y-auto">
            <div className="text-xs font-mono text-muted-foreground space-y-1">
              {debugMessages.length === 0 ? (
                <div>No debug messages</div>
              ) : (
                debugMessages.slice(-10).map((message, index) => (
                  <div key={index}>{message}</div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>
    </aside>
  );
}
