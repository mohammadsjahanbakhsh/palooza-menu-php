import { useRef, useEffect, useState } from 'react';
import { Table, TableStatus } from '@/types/cafe';

const statusConfig: Record<TableStatus, { label: string; color: string; hoverColor: string; textColor: string }> = {
  free: { label: "خالی", color: "#10B981", hoverColor: "#34D399", textColor: "#FFFFFF" },
  serving: { label: "در حال سرویس", color: "#EF4444", hoverColor: "#F87171", textColor: "#FFFFFF" },
  reserved: { label: "رزرو", color: "#F59E0B", hoverColor: "#FBBF24", textColor: "#FFFFFF" },
  paid: { label: "تسویه شده", color: "#3B82F6", hoverColor: "#60A5FA", textColor: "#FFFFFF" },
};

interface CanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  tables: Table[];
  onTableClick: (table: Table) => void;
  isMobile: boolean;
}

export const useTableCanvas = ({ canvasRef, tables, onTableClick, isMobile }: CanvasProps) => {
  const tableRects = useRef<Map<string, { x: number, y: number, width: number, height: number, table: Table }>>(new Map());
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null);
  const [pressedTableId, setPressedTableId] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const padding = 10;
      const gap = 15;
      const numCols = isMobile ? 2 : (rect.width < 1024 ? 3 : 4);
      const tableWidth = (rect.width - padding * 2 - gap * (numCols - 1)) / numCols;
      const tableHeight = 100;

      tableRects.current.clear();

      tables.forEach((table, index) => {
        const row = Math.floor(index / numCols);
        const col = index % numCols;
        const x = padding + col * (tableWidth + gap);
        const y = padding + row * (tableHeight + gap);
        
        tableRects.current.set(table.id, { x, y, width: tableWidth, height: tableHeight, table });
        const isHovered = table.id === hoveredTableId || table.id === pressedTableId;
        drawTable(ctx, table, x, y, tableWidth, tableHeight, isHovered);
      });

      const totalRows = Math.ceil(tables.length / numCols);
      const requiredHeight = padding * 2 + totalRows * tableHeight + (totalRows > 0 ? (totalRows - 1) * gap : 0);
      
      // ✅ رفع باگ اصلی: ارتفاع canvas همیشه و بدون شرط تنظیم می‌شود
      // این کار تضمین می‌کند که حتی اگر canvas با ارتفاع صفر شروع شود، اندازه صحیح را بگیرد.
      canvas.style.height = `${requiredHeight}px`;

      animationFrameId = requestAnimationFrame(draw);
    };
    
    draw();

    const getTableFromCoordinates = (clientX: number, clientY: number): Table | null => {
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        for (const [, rectData] of tableRects.current.entries()) {
            if (x > rectData.x && x < rectData.x + rectData.width && y > rectData.y && y < rectData.y + rectData.height) {
                return rectData.table;
            }
        }
        return null;
    };

    const handleMouseMove = (event: MouseEvent) => {
        const table = getTableFromCoordinates(event.clientX, event.clientY);
        setHoveredTableId(table ? table.id : null);
    };

    const handleMouseLeave = () => setHoveredTableId(null);

    const handleInteractionStart = (clientX: number, clientY: number) => {
        const table = getTableFromCoordinates(clientX, clientY);
        setPressedTableId(table ? table.id : null);
    };
    
    const handleInteractionEnd = (clientX: number, clientY: number) => {
        const table = getTableFromCoordinates(clientX, clientY);
        if (table && table.id === pressedTableId) {
            onTableClick(table);
        }
        setPressedTableId(null);
    };

    const handleMouseDown = (e: MouseEvent) => handleInteractionStart(e.clientX, e.clientY);
    const handleMouseUp = (e: MouseEvent) => handleInteractionEnd(e.clientX, e.clientY);
    const handleTouchStart = (e: TouchEvent) => { e.preventDefault(); handleInteractionStart(e.touches[0].clientX, e.touches[0].clientY); };
    const handleTouchEnd = (e: TouchEvent) => { e.preventDefault(); handleInteractionEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY); };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [tables, onTableClick, canvasRef, isMobile, hoveredTableId, pressedTableId]);
};


function drawTable(ctx: CanvasRenderingContext2D, table: Table, x: number, y: number, width: number, height: number, isHovered: boolean) {
  const config = statusConfig[table.status];
  const cornerRadius = 16;
  
  ctx.globalAlpha = 1;
  if (table.status === 'free') {
    const alpha = 0.8 + 0.2 * Math.sin(Date.now() / 200);
    ctx.globalAlpha = alpha;
  }
  
  ctx.fillStyle = isHovered ? config.hoverColor : config.color;
  ctx.beginPath();
  ctx.moveTo(x + cornerRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, cornerRadius);
  ctx.arcTo(x + width, y + height, x, y + height, cornerRadius);
  ctx.arcTo(x, y + height, x, y, cornerRadius);
  ctx.arcTo(x, y, x + width, y, cornerRadius);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = config.textColor;
  ctx.font = 'bold 24px Vazirmatn';
  ctx.fillText(table.name, x + 15, y + 35);

  drawBadge(ctx, config.label, x + width - 55, y + 15, 40, 20);

  ctx.font = '14px Vazirmatn';
  ctx.fillText(`👥 نفره ${table.capacity}`, x + 15, y + 65);

  if (table.status === 'free') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      roundRect(ctx, x + 15, y + height - 35, width - 30, 25, 8);
      ctx.fillStyle = config.textColor;
      ctx.font = 'bold 12px Vazirmatn';
      ctx.textAlign = 'center';
      ctx.fillText('آماده پذیرایی', x + width / 2, y + height - 18);
      ctx.textAlign = 'left';
  }
}

function drawBadge(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, height: number) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  roundRect(ctx, x, y, width, height, 8);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '10px Vazirmatn';
  ctx.textAlign = 'center';
  ctx.fillText(text, x + width / 2, y + height / 2 + 4);
  ctx.textAlign = 'left';
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

