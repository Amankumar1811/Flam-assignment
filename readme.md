# Real-Time Edge Detection Viewer

A web-based real-time computer vision application featuring camera integration, edge detection, and WebGL rendering. This application processes live camera feeds with various image filters including Canny edge detection, all running directly in the browser.

## ✅ Features Implemented

### Core Features
- **Live Camera Integration**: Real-time video capture from webcam or external cameras
- **Multiple Image Filters**:
  - Canny Edge Detection with adjustable thresholds
  - Grayscale conversion
  - Gaussian Blur with configurable radius
  - Binary Threshold filtering
- **WebGL Hardware Acceleration**: High-performance rendering using WebGL shaders
- **Multi-Device Support**: Automatic camera device enumeration and switching
- **Real-Time Performance Monitoring**: FPS tracking, frame time, processing time, and memory usage

### Advanced Features
- **Interactive Controls**: Live parameter adjustment for all filters
- **Performance Analytics**: Visual FPS history graph and detailed metrics
- **Frame Capture**: Download processed frames as PNG images
- **Responsive Design**: Dark theme with modern UI components
- **Error Handling**: Comprehensive error reporting and recovery
- **Cross-Platform Compatibility**: Works on Windows, Mac, and Linux

### Technical Features
- **Pure JavaScript Computer Vision**: Custom implementation of image processing algorithms
- **WebRTC Integration**: Advanced camera access and stream management
- **TypeScript**: Full type safety throughout the application
- **Modern React**: Hooks-based architecture with performance optimization
- **Real-Time Processing Pipeline**: Efficient frame processing and rendering loop

## 📷 Screenshots

### Main Interface
![Main Interface](docs/screenshot-main.png)
*Real-time edge detection with live camera feed and control panel*

### Filter Comparison
![Filter Comparison](docs/screenshot-filters.png)
*Various image filters applied to live video stream*

### Performance Monitoring
![Performance Monitoring](docs/screenshot-performance.png)
*Real-time performance metrics and FPS tracking*

## ⚙️ Setup Instructions

### Prerequisites
- **Node.js** 18+ and npm
- **Modern Web Browser** with WebRTC support (Chrome, Firefox, Safari, Edge)
- **Camera Access**: Webcam or external camera device

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/real-time-edge-detection-viewer.git
   cd real-time-edge-detection-viewer
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Open your browser to `http://localhost:5000`
   - Allow camera permissions when prompted
   - Click "Start Camera" to begin processing

### Production Build
```bash
npm run build
npm start
```

## 🧠 Architecture Overview

### Frontend Architecture
- **React + TypeScript**: Component-based UI with full type safety
- **Custom Hooks**: Modular state management for camera, WebGL, and image processing
- **Tailwind CSS + Shadcn/ui**: Modern styling with accessible components
- **Vite**: Fast development server with hot module replacement

### Computer Vision Pipeline

```
Camera Input → Frame Extraction → Image Processing → WebGL Rendering → Display
     ↓              ↓                    ↓               ↓            ↓
WebRTC API    Canvas ImageData    Custom Algorithms   GPU Shaders   Screen
```

### Core Processing Flow

1. **Camera Capture**: WebRTC `getUserMedia` API captures live video stream
2. **Frame Extraction**: Video frames extracted to HTML5 Canvas as ImageData
3. **Image Processing**: Custom JavaScript algorithms process pixel data:
   - Gaussian blur for noise reduction
   - Sobel operator for gradient calculation
   - Non-maximum suppression for edge thinning
   - Double threshold and edge tracking for Canny detection
4. **WebGL Rendering**: Processed frames rendered using custom shaders
5. **Performance Monitoring**: Real-time metrics collection and display

### Backend Architecture
- **Express.js**: RESTful API server with TypeScript
- **In-Memory Storage**: Development-ready data persistence
- **WebSocket Support**: Real-time communication capabilities
- **Vite Integration**: Seamless development experience

### Key Technical Decisions

- **Browser-Based Processing**: No server-side dependencies, runs entirely in browser
- **WebGL Acceleration**: Hardware-accelerated rendering for smooth performance
- **Custom Algorithms**: Pure JavaScript implementation for educational transparency
- **TypeScript Throughout**: Type safety from frontend to backend
- **Modern Web APIs**: WebRTC, WebGL, Canvas API integration

## 🚀 Usage

1. **Start Camera**: Click the "Start Camera" button to access your webcam
2. **Select Device**: Choose from available camera devices in the dropdown
3. **Enable Processing**: Toggle image processing on/off
4. **Choose Filter**: Select from edge detection, grayscale, blur, or threshold
5. **Adjust Parameters**: Fine-tune filter settings using the sliders
6. **Monitor Performance**: View real-time FPS and processing metrics
7. **Capture Frames**: Download processed images as PNG files

## 🛠️ Development

### Project Structure
```
├── client/src/          # React frontend application
│   ├── components/      # UI components and controls
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Computer vision and WebGL utilities
│   └── pages/          # Application pages
├── server/             # Express backend
└── shared/             # Shared types and schemas
```

### Key Files
- `lib/computer-vision.ts`: Image processing algorithms
- `lib/webgl-utils.ts`: WebGL rendering engine
- `hooks/use-camera.tsx`: Camera access and management
- `hooks/use-image-processor.tsx`: Real-time filter application
- `components/control-panel.tsx`: User interface controls

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🔗 Demo

[Live Demo](https://your-deployment-url.com) - Try the application online

---

**Built with modern web technologies for real-time computer vision in the browser**
