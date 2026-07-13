import { useEffect, useRef, useState } from 'react';
import { X, Camera } from 'lucide-react';

interface Props {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

/** Webcam photo booth for desktop — live preview, one click to capture. */
export default function WebcamCapture({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
          setReady(true);
        }
      } catch {
        setError('Camera unavailable. Allow camera access for this site and try again.');
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    // Same downscale policy as uploaded photos: max 1024px, JPEG 0.85
    const max = 1024;
    const scale = Math.min(1, max / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL('image/jpeg', 0.85));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-white w-full h-full rounded-none md:w-[520px] md:h-auto md:rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ backgroundColor: '#002855', paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
        >
          <span className="text-white font-semibold text-sm">Take Photo</span>
          <button onClick={onClose} className="text-white hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative bg-black flex-1 md:flex-none md:h-[380px] flex items-center justify-center">
          {error ? (
            <p className="text-white/80 text-sm text-center px-8">{error}</p>
          ) : (
            <video ref={videoRef} playsInline muted className="w-full h-full object-contain" />
          )}
        </div>

        <div className="flex items-center justify-center p-4 shrink-0" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}>
          <button
            onClick={capture}
            disabled={!ready}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-[#002855] disabled:opacity-40"
            style={{ backgroundColor: '#FFD200' }}
          >
            <Camera className="w-4 h-4" /> Capture
          </button>
        </div>
      </div>
    </div>
  );
}
