import { useRef, type PointerEvent as ReactPointerEvent } from "react";

export function SignaturePad({ onChange }: { onChange: (value: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  function context() {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return null;
    if (canvas.width === 0) {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#17201c";
    }
    return { canvas, ctx };
  }

  function point(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = ref.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function start(event: ReactPointerEvent<HTMLCanvasElement>) {
    const pair = context();
    if (!pair) return;
    drawing.current = true;
    const next = point(event);
    pair.ctx.beginPath();
    pair.ctx.moveTo(next.x, next.y);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const pair = context();
    if (!pair) return;
    const next = point(event);
    pair.ctx.lineTo(next.x, next.y);
    pair.ctx.stroke();
  }

  function finish() {
    drawing.current = false;
    const pair = context();
    if (!pair) return;
    const pixels = pair.ctx.getImageData(0, 0, pair.canvas.width, pair.canvas.height).data;
    let ink = false;
    for (let index = 3; index < pixels.length; index += 4) {
      if (pixels[index] > 0) {
        ink = true;
        break;
      }
    }
    onChange(ink ? pair.canvas.toDataURL("image/png") : null);
  }

  function clear() {
    const pair = context();
    if (!pair) return;
    pair.ctx.setTransform(1, 0, 0, 1, 0, 0);
    pair.ctx.clearRect(0, 0, pair.canvas.width, pair.canvas.height);
    pair.ctx.scale(2, 2);
    onChange(null);
  }

  return (
    <div className="mt-1">
      <canvas
        ref={ref}
        className="h-32 w-full touch-none rounded-md border border-border bg-white"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={finish}
        onPointerLeave={finish}
      />
      <button type="button" className="mt-1 text-sm font-semibold text-primary" onClick={clear}>
        Clear
      </button>
    </div>
  );
}
