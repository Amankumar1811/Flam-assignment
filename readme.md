# Real-Time Edge Detection Viewer

## Overview

This is a full-stack web application featuring real-time computer vision capabilities with camera integration, edge detection, and WebGL rendering. The application provides live camera feed processing with various image filters and performance monitoring.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with dark theme support
- **State Management**: Custom hooks for camera, WebGL, image processing, and performance monitoring
- **Build Tool**: Vite with React plugin
- **Router**: Wouter for client-side routing

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Development**: tsx for development server
- **Build**: esbuild for production bundling
- **Module System**: ES modules throughout

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL support
- **Database**: PostgreSQL (via Neon Database connector)
- **Schema**: Simple user table with username/password fields
- **Memory Storage**: In-memory storage implementation for development

### Authentication & Authorization
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Schema**: Basic user authentication structure defined

## Key Components

### Computer Vision System
- **Core Library**: Custom ComputerVision class implementing image processing algorithms
- **Filters**: Canny edge detection, grayscale conversion, blur, and threshold filters
- **Real-time Processing**: Browser-based image processing with performance monitoring

### WebGL Rendering
- **Renderer**: Custom WebGL implementation for hardware-accelerated image rendering
- **Shaders**: Vertex and fragment shaders for efficient image display
- **Canvas Integration**: Direct canvas manipulation for real-time updates

### Camera Integration
- **Media API**: WebRTC getUserMedia for camera access
- **Device Management**: Enumeration and switching between multiple camera devices
- **Frame Capture**: Real-time video frame extraction and processing

### Performance Monitoring
- **Metrics**: FPS tracking, frame time measurement, processing time, and memory usage
- **History**: Rolling FPS history for performance analysis
- **Alerts**: Automatic performance warning detection

## Data Flow

1. **Camera Input**: Video stream captured via getUserMedia API
2. **Frame Extraction**: Video frames extracted to canvas for processing
3. **Image Processing**: Filters applied using custom computer vision algorithms
4. **WebGL Rendering**: Processed frames rendered using WebGL for smooth display
5. **Performance Tracking**: Real-time metrics collected and displayed
6. **User Controls**: Settings panel allows real-time filter adjustments

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Router via Wouter)
- Radix UI primitives for accessible components
- TanStack Query for data fetching
- Tailwind CSS for styling
- Lucide React for icons

### Backend Dependencies
- Express.js web framework
- Drizzle ORM for database operations
- Neon Database serverless connector
- Session management via connect-pg-simple

### Development Tools
- Vite for development and building
- TypeScript for type safety
- ESBuild for production bundling
- Replit-specific plugins for development environment

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with Replit modules
- **Database**: PostgreSQL 16 via Replit
- **Port Configuration**: Local port 5000, external port 80
- **Hot Reload**: Vite development server with HMR

### Production Build
- **Frontend**: Vite build output to `dist/public`
- **Backend**: ESBuild bundle to `dist/index.js`
- **Deployment**: Replit autoscale deployment target
- **Static Assets**: Served via Express static middleware

### Configuration Management
- Environment variables for database connection
- Replit-specific configuration via `.replit` file
- TypeScript configuration for monorepo structure

## Changelog

```
Changelog:
- June 14, 2025. Initial setup and debugging
- June 14, 2025. Fixed port conflicts and Select component errors
- June 14, 2025. Created downloadable project archive (real-time-edge-detection-viewer.tar.gz)
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```