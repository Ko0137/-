import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Flashlight } from 'lucide-react';
import { triggerVibration } from '../utils/sound';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  isTorchOn: boolean;
  onToggleTorch: () => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  isTorchOn,
  onToggleTorch,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setCapturedImage(null);
      setErrorMsg(null);
      return;
    }

    // Attempt to start camera stream
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
      .then(mediaStream => {
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch(() => {
        // Try user facing
        navigator.mediaDevices?.getUserMedia({ video: true })
          .then(mediaStream => {
            setStream(mediaStream);
            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
            }
          })
          .catch(err => {
            setErrorMsg('Камера недоступна или доступ запрещен в браузере.');
          });
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCapture = () => {
    triggerVibration(40);
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      setCapturedImage(canvas.toDataURL('image/jpeg'));
    }
  };

  return (
    <div
      id="modal_camera_backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in"
    >
      <div className="w-full max-w-md bg-[#121212] rounded-2xl overflow-hidden border border-white/20 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-3 bg-[#1B4D3E] flex items-center justify-between text-white">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Camera className="w-4 h-4 text-[#00E676]" />
            <span>Камера L.I.R.A.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder */}
        <div className="relative aspect-3/4 bg-black flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            <img src={capturedImage} alt="Снимок" className="w-full h-full object-cover" />
          ) : stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : errorMsg ? (
            <div className="p-6 text-center text-white/70 text-xs">
              <Camera className="w-12 h-12 text-white/20 mx-auto mb-2" />
              <p>{errorMsg}</p>
              <p className="mt-2 text-[10px] text-white/40">
                (Система эмулирует работу видоискателя на мобильном устройстве)
              </p>
            </div>
          ) : (
            <div className="text-white/60 text-xs animate-pulse">Запуск видоискателя...</div>
          )}

          {/* Simulated Torch Overlay */}
          {isTorchOn && (
            <div className="absolute inset-0 bg-white/25 pointer-events-none mix-blend-screen animate-pulse" />
          )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-[#181818] flex items-center justify-around">
          <button
            type="button"
            onClick={() => {
              triggerVibration(20);
              onToggleTorch();
            }}
            className={`p-3 rounded-full border transition-colors ${
              isTorchOn ? 'bg-[#00E676] text-black border-[#00E676]' : 'bg-[#2A2A2A] text-white border-white/10'
            }`}
            title="Вспышка / Фонарик"
          >
            <Flashlight className="w-5 h-5" />
          </button>

          {capturedImage ? (
            <button
              type="button"
              onClick={() => setCapturedImage(null)}
              className="px-4 py-2 bg-[#2A2A2A] hover:bg-[#333] text-white rounded-full text-xs font-medium flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Еще снимок
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCapture}
              className="w-16 h-16 rounded-full border-4 border-white bg-white/30 hover:bg-white/50 active:scale-90 transition-all flex items-center justify-center cursor-pointer shadow-lg"
            >
              <div className="w-12 h-12 rounded-full bg-white"></div>
            </button>
          )}

          <div className="w-11" />
        </div>
      </div>
    </div>
  );
};
