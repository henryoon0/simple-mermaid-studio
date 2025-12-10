export const downloadSVG = (svgContent: string) => {
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, 'diagram.svg');
};

export const downloadPNG = (svgElement: SVGSVGElement, backgroundColor: string, isDotPattern: boolean) => {
  // 1. Prepare a clean clone of the SVG
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  
  // Reset styles and transforms that pan-zoom might have added
  clone.removeAttribute('style');
  clone.removeAttribute('transform');
  clone.style.backgroundColor = 'transparent'; // Ensure SVG itself is transparent
  
  // Reset the viewport group transform (critical for full-size export)
  const viewport = clone.querySelector('.svg-pan-zoom_viewport') as SVGGElement;
  if (viewport) {
      viewport.removeAttribute('style');
      viewport.removeAttribute('transform');
  }

  // 2. CRITICAL FIX: Inject Font Styles with Emoji Support and Tightening
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = `
    @font-face {
        font-family: 'Pretendard';
        src: local('Pretendard'), local('sans-serif');
    }
    .label, .node text, .edgeLabel, .cluster-label, tspan, p, div, foreignObject, span { 
      font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif !important;
      letter-spacing: -0.3px !important; 
    }
  `;
  clone.insertBefore(style, clone.firstChild);

  // 3. FIX: Calculate ViewBox based on the content's REAL bounding box
  // We cannot rely on the root SVG's viewBox attribute alone as it might be set for the specific window size
  // or manipulated by pan-zoom. We need to measure the actual content.
  
  let x, y, width, height;
  
  // Use the original element to measure (since clone is not rendered)
  // Try to find the inner group that holds the diagram content.
  const originalViewport = svgElement.querySelector('.svg-pan-zoom_viewport') as SVGGElement;
  
  if (originalViewport && typeof originalViewport.getBBox === 'function') {
      // If svg-pan-zoom is active, getting the BBox of the viewport group gives us the 
      // full dimensions of the graph in the user coordinate system (invariant to zoom).
      const bbox = originalViewport.getBBox();
      x = bbox.x;
      y = bbox.y;
      width = bbox.width;
      height = bbox.height;
  } else {
      // Fallback: Use the root SVG's BBox or viewBox
      try {
          const bbox = svgElement.getBBox();
          x = bbox.x;
          y = bbox.y;
          width = bbox.width;
          height = bbox.height;
      } catch (e) {
          const vb = svgElement.viewBox.baseVal;
          x = vb.x;
          y = vb.y;
          width = vb.width;
          height = vb.height;
      }
  }

  // 4. Add Padding (Generous padding to prevent edge clipping)
  const padding = 50;
  x -= padding;
  y -= padding;
  width += padding * 2;
  height += padding * 2;

  clone.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
  clone.setAttribute('width', `${width}`);
  clone.setAttribute('height', `${height}`);

  // 5. Serialize and Render
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(clone);
  
  const img = new Image();
  const svgBase64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(source)));

  img.onload = function () {
    const canvas = document.createElement('canvas');
    
    // Determine dimensions (High-Res 4x)
    const scale = 4;

    canvas.width = width * scale;
    canvas.height = height * scale;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw Background
    if (backgroundColor === 'transparent') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (isDotPattern) {
           drawDotPattern(ctx, canvas.width, canvas.height, scale);
        }
    }

    // Draw Image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Download
    const imgURI = canvas.toDataURL('image/png');
    triggerDownload(imgURI, 'diagram.png');
  };

  img.onerror = function(e) {
      console.error("Failed to load SVG for PNG export", e);
      alert("PNG 변환 중 오류가 발생했습니다. (이미지 로드 실패)");
  };

  img.src = svgBase64;
};

const drawDotPattern = (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) => {
    const dotSize = 1.5 * scale;
    const gap = 20 * scale;
    ctx.fillStyle = '#e5e7eb'; // dot color
    
    for (let x = 0; x < width; x += gap) {
        for (let y = 0; y < height; y += gap) {
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

const triggerDownload = (url: string, filename: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
