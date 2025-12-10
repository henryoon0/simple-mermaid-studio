import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import svgPanZoom from 'svg-pan-zoom';
import { THEMES, BACKGROUNDS } from '../constants';
import { PanZoomInstance, ThemeKey } from '../types';
import { AlertCircle, Plus, Minus, Maximize, Maximize2, Minimize2 } from 'lucide-react';
import { downloadPNG, downloadSVG } from '../utils/exportUtils';

interface PreviewPanelProps {
  code: string;
  themeKey: ThemeKey;
  backgroundColor: string;
  onBackgroundChange: (color: string) => void;
  onExportRef?: (funcs: { exportSVG: () => void; exportPNG: () => void }) => void;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
    code, 
    themeKey, 
    backgroundColor, 
    onBackgroundChange, 
    onExportRef,
    isFullScreen,
    onToggleFullScreen
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const panZoomRef = useRef<PanZoomInstance | null>(null);
  const [debouncedCode, setDebouncedCode] = useState(code);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCode(code);
    }, 500);
    return () => clearTimeout(timer);
  }, [code]);

  const renderMermaid = useCallback(async () => {
    try {
      mermaid.initialize({
        startOnLoad: false,
        ...THEMES[themeKey],
        securityLevel: 'loose',
      });

      const id = `mermaid-${Date.now()}`;
      const { svg } = await mermaid.render(id, debouncedCode);
      setSvgContent(svg);
      setError(null);
    } catch (err) {
      console.error("Mermaid Render Error:", err);
      setError("Syntax Error: 코드를 확인해주세요.");
    }
  }, [debouncedCode, themeKey]);

  useEffect(() => {
    renderMermaid();
  }, [renderMermaid]);

  // PanZoom Init
  useEffect(() => {
    if (containerRef.current && svgContent) {
      const svgElement = containerRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.style.width = '100%';
        svgElement.style.height = '100%';

        if (panZoomRef.current) {
          panZoomRef.current.destroy();
          panZoomRef.current = null;
        }

        try {
          const instance = svgPanZoom(svgElement, {
            zoomEnabled: true,
            controlIconsEnabled: false,
            fit: true,
            center: true,
            minZoom: 0.1,
            maxZoom: 10,
            onZoom: () => {}, // placeholder to ensure events attached
            onPan: () => {}
          });
          panZoomRef.current = instance as unknown as PanZoomInstance;
        } catch (e) {
          console.error("PanZoom Init Error", e);
        }
      }
    }
    return () => {
        if (panZoomRef.current) {
            panZoomRef.current.destroy();
            panZoomRef.current = null;
        }
    }
  }, [svgContent]);

  // Export Logic
  useEffect(() => {
    if (onExportRef) {
      onExportRef({
        exportSVG: () => {
          if (svgContent) downloadSVG(svgContent);
        },
        exportPNG: () => {
            const svgEl = containerRef.current?.querySelector('svg');
            if (svgEl) {
                // Determine actual color for canvas fill
                const bgOpt = BACKGROUNDS.find(b => b.id === backgroundColor);
                let colorToExport = '#ffffff';
                let isDot = false;

                if (bgOpt) {
                    if (bgOpt.color === 'dots') {
                         colorToExport = '#ffffff'; 
                         isDot = true;
                    } else {
                        colorToExport = bgOpt.color;
                    }
                }
                
                downloadPNG(svgEl, colorToExport, isDot);
            }
        }
      });
    }
  }, [onExportRef, svgContent, backgroundColor]);

  // Handle Zoom Button Clicks
  const handleZoomIn = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (panZoomRef.current) {
          panZoomRef.current.zoomIn();
      }
  };

  const handleZoomOut = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (panZoomRef.current) {
          panZoomRef.current.zoomOut();
      }
  };

  const handleReset = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (panZoomRef.current) {
          panZoomRef.current.resetZoom();
          panZoomRef.current.center();
      }
  };

  // Resolve background style
  const getBackgroundStyle = () => {
      const bgOpt = BACKGROUNDS.find(b => b.id === backgroundColor);
      if (!bgOpt) return {};
      if (bgOpt.color === 'dots') return undefined; // Handled by class
      if (bgOpt.color === 'transparent') return { backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '20px 20px', backgroundColor: '#fff' }; 
      return { backgroundColor: bgOpt.color };
  };

  return (
    <div 
        className={`relative flex-1 flex flex-col overflow-hidden ${backgroundColor === 'dots' ? 'bg-grid-pattern' : ''}`}
        style={getBackgroundStyle()}
    >
      
      {/* Background Picker */}
      <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur border border-neutral-200 p-1.5 rounded-full shadow-sm flex items-center gap-1">
        {BACKGROUNDS.map((bg) => (
            <button
                key={bg.id}
                onClick={() => onBackgroundChange(bg.id)}
                title={bg.label}
                className={`w-5 h-5 rounded-full border border-neutral-200 transition-all ${backgroundColor === bg.id ? 'ring-2 ring-blue-500 ring-offset-1' : 'hover:scale-110'}`}
                style={{ 
                    backgroundColor: bg.color === 'dots' || bg.color === 'transparent' ? '#fff' : bg.color,
                    backgroundImage: bg.color === 'dots' 
                        ? 'radial-gradient(#ccc 1px, transparent 1px)' 
                        : bg.color === 'transparent' 
                            ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%)'
                            : 'none',
                    backgroundSize: bg.color === 'transparent' ? '6px 6px' : bg.color === 'dots' ? '4px 4px' : 'auto'
                }}
            />
        ))}
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef} 
        className="w-full h-full flex items-center justify-center overflow-hidden"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />

      {/* Error Toast */}
      <div 
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 ${error ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
      >
        <AlertCircle className="w-4 h-4" />
        <span>{error}</span>
      </div>

      {/* Control Buttons (Zoom & Full Screen) */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-3">
        {/* Zoom Controls */}
        <div className="bg-white border border-neutral-200 rounded-lg shadow-lg p-2 flex flex-col gap-2">
            <button onClick={handleZoomIn} className="p-1.5 hover:bg-neutral-100 rounded text-neutral-500 transition-colors" title="Zoom In">
                <Plus className="w-4 h-4" />
            </button>
            <button onClick={handleZoomOut} className="p-1.5 hover:bg-neutral-100 rounded text-neutral-500 transition-colors" title="Zoom Out">
                <Minus className="w-4 h-4" />
            </button>
            <button onClick={handleReset} className="p-1.5 hover:bg-neutral-100 rounded text-neutral-500 transition-colors" title="Reset View">
                <Maximize className="w-4 h-4" />
            </button>
        </div>

        {/* Full Screen Toggle */}
        <button 
            onClick={onToggleFullScreen}
            className="bg-neutral-900 text-white p-3 rounded-full shadow-lg hover:bg-neutral-800 transition-transform hover:scale-105 flex items-center justify-center"
            title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
        >
            {isFullScreen ? (
                <Minimize2 className="w-5 h-5" />
            ) : (
                <Maximize2 className="w-5 h-5" />
            )}
        </button>
      </div>
    </div>
  );
};

export default PreviewPanel;
