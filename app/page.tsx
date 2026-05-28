"use client";

import React, { useEffect, useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      stopCamera();

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 720 },
          height: { ideal: 1280 },
        },
        audio: false,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("카메라 오류:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const switchCamera = () => {
    setFacingMode((prev) =>
      prev === "environment" ? "user" : "environment"
    );
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const width = video.videoWidth;
    const height = video.videoHeight;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    drawGrid(ctx, width, height);

    const imageData = canvas.toDataURL("image/png");
    setCapturedImage(imageData);
  };

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 1;

    const lines = 10;

    for (let i = 1; i < lines; i++) {
      const x = (width / lines) * i;
      const y = (height / lines) * i;

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(255,0,0,0.9)";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
  };

  const downloadPhoto = () => {
    if (!capturedImage) return;

    const link = document.createElement("a");
    link.href = capturedImage;
    link.download = "posture-photo.png";
    link.click();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">
        Posture Camera
      </h1>

      <div className="relative w-full max-w-sm aspect-[9/16] bg-black overflow-hidden rounded-2xl border border-zinc-700">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-contain"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 pointer-events-none">
              <GridOverlay />
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3 mt-5 flex-wrap justify-center">
        <button
          onClick={switchCamera}
          className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-xl"
        >
          카메라 전환
        </button>

        <button
          onClick={capturePhoto}
          className="bg-red-600 hover:bg-red-500 px-5 py-3 rounded-xl"
        >
          사진 촬영
        </button>

        <button
          onClick={downloadPhoto}
          className="bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-xl"
        >
          사진 저장
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

function GridOverlay() {
  const lines = Array.from({ length: 9 }, (_, i) => i + 1);

  return (
    <>
      {lines.map((line) => (
        <div
          key={`v-${line}`}
          className="absolute top-0 bottom-0 border-l border-white/40"
          style={{ left: `${(line / 10) * 100}%` }}
        />
      ))}

      {lines.map((line) => (
        <div
          key={`h-${line}`}
          className="absolute left-0 right-0 border-t border-white/40"
          style={{ top: `${(line / 10) * 100}%` }}
        />
      ))}

      <HumanGuideOverlay />
    </>
  );
}
function HumanGuideOverlay() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 160"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="yellowGlow">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 기준 점선 */}
      <line x1="5" y1="22" x2="95" y2="22" stroke="#facc15" strokeWidth="0.45" strokeDasharray="2 2" />
      <line x1="5" y1="48" x2="95" y2="48" stroke="#facc15" strokeWidth="0.45" strokeDasharray="2 2" />
      <line x1="5" y1="92" x2="95" y2="92" stroke="#facc15" strokeWidth="0.45" strokeDasharray="2 2" />
      <line x1="5" y1="147" x2="95" y2="147" stroke="#facc15" strokeWidth="0.45" strokeDasharray="2 2" />

      {/* 라벨 */}
      <text x="7" y="21" fill="#facc15" fontSize="4">머리선</text>
      <text x="7" y="47" fill="#facc15" fontSize="4">어깨선</text>
      <text x="7" y="91" fill="#facc15" fontSize="4">골반선</text>
      <text x="7" y="146" fill="#facc15" fontSize="4">발 기준선</text>

      {/* 머리 원 */}
      <circle
        cx="50"
        cy="22"
        r="8"
        fill="rgba(250,204,21,0.05)"
        stroke="#facc15"
        strokeWidth="0.9"
        filter="url(#yellowGlow)"
      />

      {/* 막대사탕 중심축 */}
      <line
        x1="50"
        y1="30"
        x2="50"
        y2="147"
        stroke="#facc15"
        strokeWidth="0.8"
        filter="url(#yellowGlow)"
      />

      {/* 기존 중앙 기준선 */}
      <line
        x1="50"
        y1="0"
        x2="50"
        y2="160"
        stroke="#ef4444"
        strokeWidth="0.45"
      />
    </svg>
  );
}