import React, { useState, useEffect, useRef } from 'react';
import { Command, Image as ImageIcon, Code2 } from 'lucide-react';
import EditorPanel from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import { DEFAULT_CODE } from './constants';
import { ThemeKey, ViewMode } from './types';

function App() {
  const [code, setCode] = useState<string>(() => localStorage.getItem('mermaid-code') || DEFAULT_CODE);
  const [theme, setTheme] = useState<ThemeKey>(() => (localStorage.getItem('mermaid-theme') as ThemeKey) || 'default');
  const [backgroundColor, setBackgroundColor] = useState<string>('dots');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  
  // Resizable logic
  const [sidebarWidth, setSidebarWidth] = useState(450); 
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Export handlers
  const exportFuncsRef = useRef<{ exportSVG: () => void; exportPNG: () => void } | null>(null);

  useEffect(() => {
    localStorage.setItem('mermaid-code', code);
  }, [code]);

  useEffect(() => {
    localStorage.setItem('mermaid-theme', theme);
  }, [theme]);

  // Resize Handlers
  const startResizing = React.useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = React.useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        const newWidth = Math.min(Math.max(mouseMoveEvent.clientX, 300), window.innerWidth * 0.8);
        setSidebarWidth(newWidth);
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const toggleFullScreen = () => {
      setViewMode(prev => prev === 'split' ? 'preview' : 'split');
  };

  const isPreviewFullScreen = viewMode === 'preview';

  return (
    <div className="flex flex-col h-full bg-white text-neutral-900 overflow-hidden">
      {/* Header */}
      {!isPreviewFullScreen && (
        <header className="h-14 border-b border-neutral-200 flex items-center justify-between px-5 bg-white shrink-0 z-20 relative">
            <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                <Command className="w-4 h-4" />
            </div>
            <h1 className="font-semibold text-lg tracking-tight text-neutral-900">AICC Mermaid Studio</h1>
            <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 text-xs font-medium border border-neutral-200">
                Beta
            </span>
            </div>

            <div className="flex items-center gap-2">
            <button 
                onClick={() => exportFuncsRef.current?.exportPNG()}
                className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:text-neutral-900 transition-all shadow-sm"
            >
                <ImageIcon className="w-4 h-4 text-neutral-400 group-hover:text-blue-500 transition-colors" />
                PNG 저장
            </button>
            <button 
                onClick={() => exportFuncsRef.current?.exportSVG()}
                className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:text-neutral-900 transition-all shadow-sm"
            >
                <Code2 className="w-4 h-4 text-neutral-400 group-hover:text-orange-500 transition-colors" />
                SVG 저장
            </button>
            </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Editor Side */}
        <div 
            ref={sidebarRef} 
            className={`flex flex-col h-full shrink-0 transition-all duration-300 ${isPreviewFullScreen ? 'w-0 overflow-hidden border-0' : ''}`} 
            style={{ width: isPreviewFullScreen ? 0 : sidebarWidth }}
        >
             <EditorPanel 
                code={code} 
                onChange={setCode} 
                currentTheme={theme} 
                onThemeChange={setTheme}
                width={isPreviewFullScreen ? 0 : sidebarWidth}
            />
        </div>
       
        {/* Resize Handle (only show in split mode) */}
        {!isPreviewFullScreen && (
            <div
                className={`w-1 cursor-col-resize hover:bg-blue-400 transition-colors z-20 relative -ml-[2px] ${isResizing ? 'bg-blue-500' : 'bg-transparent'}`}
                onMouseDown={startResizing}
            />
        )}
        
        {/* Preview Panel */}
        <PreviewPanel 
            code={code} 
            themeKey={theme}
            backgroundColor={backgroundColor}
            onBackgroundChange={setBackgroundColor}
            onExportRef={(funcs) => { exportFuncsRef.current = funcs; }}
            isFullScreen={isPreviewFullScreen}
            onToggleFullScreen={toggleFullScreen}
        />
        
        {/* Overlay while resizing to prevent iframe/selection issues */}
        {isResizing && (
            <div className="absolute inset-0 z-50 cursor-col-resize" />
        )}
      </main>
    </div>
  );
}

export default App;