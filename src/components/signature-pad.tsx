import { useEffect, useRef } from "react";

type Point = { x: number; y: number };

export function SignaturePad({ onChange }: { onChange: (value: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<Point | null>(null);
  const notify = useRef(onChange);
  notify.current = onChange;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const pointer = typeof window.PointerEvent === "function";

    function paint() {
      const current = ref.current;
      const ctx = current?.getContext("2d");
      if (!current || !ctx) return null;
      const rect = current.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width || current.clientWidth || 300));
      const height = Math.max(1, Math.round(rect.height || current.clientHeight || 128));
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      if (current.width !== Math.round(width * scale) || current.height !== Math.round(height * scale)) {
        current.width = Math.round(width * scale);
        current.height = Math.round(height * scale);
      }
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#17201c";
      return ctx;
    }

    function locate(source: { clientX: number; clientY: number }) {
      const current = ref.current;
      if (!current) return { x: 0, y: 0 };
      const rect = current.getBoundingClientRect();
      return { x: source.clientX - rect.left, y: source.clientY - rect.top };
    }

    function ink(from: Point, to: Point) {
      const ctx = paint();
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }

    function publish() {
      const current = ref.current;
      const ctx = current?.getContext("2d");
      if (!current || !ctx) return;
      try {
        const pixels = ctx.getImageData(0, 0, current.width, current.height).data;
        let marked = false;
        for (let index = 3; index < pixels.length; index += 16) {
          if (pixels[index] > 8) {
            marked = true;
            break;
          }
        }
        notify.current(marked ? current.toDataURL("image/png") : null);
      } catch {
        notify.current(null);
      }
    }

    function down(point: Point, event?: Event) {
      event?.preventDefault();
      paint();
      drawing.current = true;
      last.current = point;
      ink(point, { x: point.x + 0.01, y: point.y + 0.01 });
    }

    function move(point: Point, event?: Event) {
      if (!drawing.current || !last.current) return;
      event?.preventDefault();
      ink(last.current, point);
      last.current = point;
    }

    function up() {
      if (!drawing.current) return;
      drawing.current = false;
      last.current = null;
      publish();
    }

    function onPointerDown(event: PointerEvent) {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        /* some browsers reject capture and still deliver the later events */
      }
      down(locate(event), event);
    }
    function onPointerMove(event: PointerEvent) {
      move(locate(event), event);
    }
    function onMouseDown(event: MouseEvent) {
      if (event.button !== 0) return;
      down(locate(event), event);
    }
    function onMouseMove(event: MouseEvent) {
      move(locate(event), event);
    }
    function onTouchStart(event: TouchEvent) {
      const touch = event.changedTouches[0];
      if (!touch) return;
      down(locate(touch), event);
    }
    function onTouchMove(event: TouchEvent) {
      const touch = event.changedTouches[0];
      if (!touch) return;
      move(locate(touch), event);
    }

    paint();
    if (pointer) {
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);
    } else {
      canvas.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", up);
      canvas.addEventListener("touchstart", onTouchStart, { passive: false });
      canvas.addEventListener("touchmove", onTouchMove, { passive: false });
      canvas.addEventListener("touchend", up);
      canvas.addEventListener("touchcancel", up);
    }
    window.addEventListener("resize", paint);
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", up);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", up);
      canvas.removeEventListener("touchcancel", up);
      window.removeEventListener("resize", paint);
    };
  }, []);

  function clear() {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    notify.current(null);
  }

  return (
    <div className="mt-1">
      <canvas ref={ref} className="h-32 w-full rounded-md border border-border bg-white" style={{ touchAction: "none" }} />
      <button type="button" className="mt-1 text-sm font-semibold text-primary" onClick={clear}>
        Clear
      </button>
    </div>
  );
}
