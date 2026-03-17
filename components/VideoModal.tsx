"use client";

import { useEffect, useRef } from "react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({ isOpen, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-dark/80" />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl brutal-card bg-white p-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-10 brutal-btn w-10 h-10 bg-secondary text-white flex items-center justify-center text-lg"
          aria-label="Close video"
        >
          &times;
        </button>

        {/* Video */}
        <div className="brutal-border overflow-hidden bg-dark">
          <video
            ref={videoRef}
            src="/demo.mp4"
            controls
            playsInline
            className="w-full aspect-video"
            poster="/demo-poster.jpg"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Caption */}
        <div className="mt-3 text-center">
          <p className="text-sm font-bold uppercase tracking-wider">
            See RepurposeAI in Action
          </p>
          <p className="text-xs text-dark/50 mt-1">
            Turn one piece of content into 10 platform-optimized outputs
          </p>
        </div>
      </div>
    </div>
  );
}
