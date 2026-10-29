import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraStatus = 'idle' | 'starting' | 'ready' | 'error';

const explain = (e: any): string => {
  switch (e?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Izin kamera ditolak. Klik ikon gembok di sebelah alamat situs, izinkan "Kamera", lalu coba lagi.';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'Kamera tidak ditemukan di perangkat ini.';
    case 'NotReadableError':
    case 'TrackStartError':
      return 'Kamera sedang dipakai aplikasi lain. Tutup aplikasi itu lalu coba lagi.';
    default:
      return 'Kamera tidak dapat dinyalakan. Pastikan situs dibuka lewat HTTPS dan izin kamera aktif.';
  }
};

/**
 * Menyalakan kamera asli lewat getUserMedia.
 * facing: 'user' = kamera depan (selfie), 'environment' = kamera belakang (dokumen).
 * Letakkan <video ref={videoRef} playsInline muted autoPlay /> di JSX, lalu panggil start().
 */
export function useCamera(facing: 'user' | 'environment') {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const attemptRef = useRef(0);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [error, setError] = useState('');

  const stop = useCallback(() => {
    attemptRef.current += 1; // batalkan permintaan kamera yang masih menunggu izin
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus('idle');
  }, []);

  const start = useCallback(async () => {
    const attempt = ++attemptRef.current;
    setError('');
    setStatus('starting');
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Browser ini tidak mendukung kamera, atau situs tidak dibuka lewat HTTPS.');
      setStatus('error');
      return;
    }
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
      } catch (e: any) {
        if (e?.name !== 'OverconstrainedError') throw e;
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); // perangkat tanpa pilihan kamera
      }
      if (attempt !== attemptRef.current) { // sudah dibatalkan / komponen ditutup
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play().catch(() => undefined);
      }
      setStatus('ready');
    } catch (e: any) {
      if (attempt !== attemptRef.current) return;
      setError(explain(e));
      setStatus('error');
    }
  }, [facing]);

  /** Ambil gambar dari tampilan kamera saat ini (data URL JPEG), atau null jika kamera belum siap. */
  const capture = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.85);
  }, []);

  // matikan kamera saat komponen ditutup
  useEffect(() => stop, [stop]);

  return { videoRef, status, error, start, stop, capture };
}
