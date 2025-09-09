// components/results/EnhancedImageViewer.jsx

import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Maximize, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MapPin,
  Info
} from 'lucide-react';
import Button from '../common/Button.jsx';

const EnhancedImageViewer = ({ images = [], title = '', onClose, isOpen = false }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState(false);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Reset view when image changes
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setPanOffset({ x: 0, y: 0 });
  }, [currentImageIndex]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentImageIndex];
  
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.5, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.5, 0.1));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImage.proxy_url || currentImage.url;
    link.download = `${title}_${currentImage.period || currentImageIndex}.gif`;
    link.click();
  };

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        prevImage();
        break;
      case 'ArrowRight':
        nextImage();
        break;
      case '+':
      case '=':
        handleZoomIn();
        break;
      case '-':
        handleZoomOut();
        break;
      case 'r':
      case 'R':
        handleRotate();
        break;
      case '0':
        handleReset();
        break;
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isDragging, dragStart, zoom]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">{title}</h2>
          {currentImage.period && (
            <div className="flex items-center gap-2 bg-blue-600 px-3 py-1 rounded-full text-sm">
              <Clock className="w-4 h-4" />
              T+{currentImage.period}h
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Timeline Navigation for multiple images */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
              <Button
                onClick={prevImage}
                size="sm"
                variant="secondary"
                icon={ChevronLeft}
                className="p-1"
              />
              <span className="text-sm px-2">
                {currentImageIndex + 1} / {images.length}
              </span>
              <Button
                onClick={nextImage}
                size="sm"
                variant="secondary"
                icon={ChevronRight}
                className="p-1"
              />
            </div>
          )}
          
          <Button
            onClick={() => setShowInfo(!showInfo)}
            size="sm"
            variant="secondary"
            icon={Info}
          />
          
          <Button
            onClick={onClose}
            size="sm"
            variant="danger"
            icon={X}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 text-white p-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleZoomOut}
            size="sm"
            variant="secondary"
            icon={ZoomOut}
            disabled={zoom <= 0.1}
          />
          <span className="text-sm px-3 min-w-[80px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            onClick={handleZoomIn}
            size="sm"
            variant="secondary"
            icon={ZoomIn}
            disabled={zoom >= 5}
          />
          
          <div className="h-6 w-px bg-gray-600 mx-2" />
          
          <Button
            onClick={handleRotate}
            size="sm"
            variant="secondary"
            icon={RotateCw}
          />
          
          <Button
            onClick={handleReset}
            size="sm"
            variant="secondary"
          >
            Reset
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleDownload}
            size="sm"
            variant="success"
            icon={Download}
          >
            Download
          </Button>
        </div>
      </div>

      {/* Timeline Thumbnails for multiple images */}
      {images.length > 1 && (
        <div className="bg-gray-800 p-3 border-b border-gray-700">
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative flex-shrink-0 w-16 h-12 rounded border-2 overflow-hidden ${
                  index === currentImageIndex 
                    ? 'border-blue-500' 
                    : 'border-gray-600 hover:border-gray-400'
                }`}
              >
                <img
                  src={img.proxy_url || img.url}
                  alt={`T+${img.period}h`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.background = '#374151';
                    e.target.alt = 'Error';
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs text-center py-1">
                  T+{img.period}h
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative bg-gray-900 flex items-center justify-center"
        onMouseDown={handleMouseDown}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          ref={imageRef}
          src={currentImage.proxy_url || currentImage.url}
          alt={`${title} T+${currentImage.period}h`}
          className="max-w-none transition-transform duration-200"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
            transformOrigin: 'center'
          }}
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEZhaWxlZCB0byBMb2FkPC90ZXh0Pjwvc3ZnPg==';
          }}
          draggable={false}
          onLoad={() => {
            // Auto-fit image if it's larger than container
            if (containerRef.current && imageRef.current) {
              const containerRect = containerRef.current.getBoundingClientRect();
              const imageRect = imageRef.current.getBoundingClientRect();
              
              if (imageRect.width > containerRect.width || imageRect.height > containerRect.height) {
                const scaleX = containerRect.width / imageRect.width;
                const scaleY = containerRect.height / imageRect.height;
                const autoFitZoom = Math.min(scaleX, scaleY, 1) * 0.9; // 90% to add some padding
                setZoom(autoFitZoom);
              }
            }
          }}
        />
        
        {/* Loading indicator */}
        {!imageRef.current?.complete && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-gray-800 text-white px-4 py-2 rounded-lg">
              Loading image...
            </div>
          </div>
        )}
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="absolute top-20 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <h3 className="font-bold mb-2">Image Information</h3>
          <div className="space-y-1 text-sm">
            <div><strong>Period:</strong> T+{currentImage.period}h</div>
            <div><strong>Type:</strong> {currentImage.content_type || 'image'}</div>
            <div><strong>Resolution:</strong> {imageRef.current?.naturalWidth}×{imageRef.current?.naturalHeight}</div>
            <div><strong>Zoom:</strong> {Math.round(zoom * 100)}%</div>
            <div><strong>Rotation:</strong> {rotation}°</div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-600">
            <h4 className="font-semibold mb-1">Keyboard Shortcuts</h4>
            <div className="text-xs space-y-1">
              <div>← → : Navigate images</div>
              <div>+ - : Zoom in/out</div>
              <div>R : Rotate</div>
              <div>0 : Reset view</div>
              <div>ESC : Close viewer</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedImageViewer;
