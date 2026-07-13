import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import jsQR from 'jsqr';

interface Props {
  onScan: (text: string) => void;
  onClose: () => void;
}

/** Full-screen camera view that decodes the first QR code it sees. */
export default function QrScanner({ onScan, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  const [error, setError] = useState('');

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let done = false;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    function tick() {
      const video = videoRef.current;
      if (!done && video && ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
        if (code && code.data) {
          done = true;
          onScanRef.current(code.data);
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    }

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        tick();
      } catch {
        setError('Camera unavailable. Allow camera access for this site and try again.');
      }
    })();

    return () => {
      done = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[90] bg-black flex flex-col">
      <div
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)', backgroundColor: '#002855' }}
      >
        <span className="text-white font-semibold text-sm">Scan QR Label</span>
        <button onClick={onClose} className="text-white hover:opacity-70 p-1 -m-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <p className="text-white/80 text-sm text-center">{error}</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" />
            {/* Targeting frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 rounded-2xl border-2 border-[#FFD200]" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)' }} />
            </div>
            <p className="absolute bottom-10 inset-x-0 text-center text-white/80 text-xs px-8" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
              Point the camera at an item's QR label
            </p>
          </>
        )}
      </div>
    </div>
  );
}
