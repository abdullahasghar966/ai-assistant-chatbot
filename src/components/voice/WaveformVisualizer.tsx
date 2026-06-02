"use client";

import { useEffect, useRef } from "react";

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

/** Live coral bar visualiser driven by the recording MediaStream. */
export function WaveformVisualizer({ stream }: { stream: MediaStream | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!stream) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!Ctor) return;

    const audioCtx = new Ctor();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    let raf = 0;
    const accent =
      getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim() ||
      "#e8552a";
    const bars = 7;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(data);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = 2.5;
      const gap = (canvas.width - bars * barWidth) / (bars - 1);
      for (let i = 0; i < bars; i++) {
        const value = data[Math.floor((i / bars) * data.length)] ?? 0;
        const height = Math.max(2, (value / 255) * canvas.height);
        const x = i * (barWidth + gap);
        const y = (canvas.height - height) / 2;
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, height, 2);
        ctx.fill();
      }
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      source.disconnect();
      void audioCtx.close();
    };
  }, [stream]);

  return <canvas ref={canvasRef} width={42} height={20} className="mr-0.5" aria-hidden />;
}
