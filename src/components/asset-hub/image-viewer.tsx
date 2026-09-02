"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageViewerProps {
  src: string;
  alt: string;
}

export function ImageViewer({ src, alt }: ImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const clampScale = (s: number) => Math.min(Math.max(s, 0.25), 8);

  const zoomBy = useCallback((delta: number, cx?: number, cy?: number) => {
    setScale((prev) => {
      const next = clampScale(prev + delta);
      const ratio = next / prev;
      if (cx !== undefined && cy !== undefined) {
        setTx((t) => cx - (cx - t) * ratio);
        setTy((t) => cy - (cy - t) * ratio);
      }
      return next;
    });
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      const cx = e.clientX - (rect?.left ?? 0);
      const cy = e.clientY - (rect?.top ?? 0);
      const delta = -e.deltaY * 0.0015;
      zoomBy(delta, cx, cy);
    },
    [zoomBy],
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY, tx, ty };
    },
    [tx, ty],
  );

  useEffect(() => {
    if (!dragging) return;
    const move = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setTx(dragStart.current.tx + dx);
      setTy(dragStart.current.ty + dy);
    };
    const up = () => setDragging(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [dragging]);

  const reset = useCallback(() => {
    setScale(1);
    setTx(0);
    setTy(0);
  }, []);

  const fit = useCallback(() => {
    setScale(1);
    setTx(0);
    setTy(0);
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col">
      <div
        ref={containerRef}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        className={`relative flex flex-1 select-none items-center justify-center overflow-hidden bg-[repeating-conic-gradient(oklch(0.22_0.008_264)_0%_25%,oklch(0.19_0.008_264)_0%_50%)] bg-[length:24px_24px] ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="max-h-full max-w-full object-contain shadow-2xl"
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            transition: dragging ? "none" : "transform 0.08s ease-out",
          }}
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border/60 bg-card/90 p-1 shadow-lg backdrop-blur">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 rounded-full p-0"
          onClick={() => zoomBy(-0.25)}
          aria-label="Zoom out"
        >
          <ZoomOut className="size-4" />
        </Button>
        <span className="min-w-[44px] text-center text-xs font-medium tabular-nums text-muted-foreground">
          {Math.round(scale * 100)}%
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 rounded-full p-0"
          onClick={() => zoomBy(0.25)}
          aria-label="Zoom in"
        >
          <ZoomIn className="size-4" />
        </Button>
        <div className="mx-0.5 h-5 w-px bg-border/60" />
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 rounded-full p-0"
          onClick={fit}
          aria-label="Fit to screen"
        >
          <Maximize2 className="size-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 rounded-full p-0"
          onClick={reset}
          aria-label="Reset view"
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
    </div>
  );
}
