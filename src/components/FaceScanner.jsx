import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export default function FaceScanner({ onComplete }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const cooldownRef = useRef(false);

  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);

  // ================= LOAD MODEL =================
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setReady(true);
    };
    loadModels();
  }, []);

  // ================= AKTIFKAN KAMERA =================
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  // ================= DETEKSI WAJAH (5x) =================
  useEffect(() => {
    if (!ready || !cameraOn) return;

    const interval = setInterval(async () => {
      if (!videoRef.current || cooldownRef.current) return;

      const detection = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })
      );

      if (detection) {
        cooldownRef.current = true;
        setCount((prev) => (prev < 5 ? prev + 1 : prev));

        setTimeout(() => {
          cooldownRef.current = false;
        }, 1200);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [ready, cameraOn]);

  // ================= SELESAI =================
  useEffect(() => {
    if (count === 5) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      onComplete();
    }
  }, [count, onComplete]);

  // ================= UI =================
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* VIDEO */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-56 object-cover rounded-xl bg-black"
      />

      {/* INFO */}
      <p className="font-bold text-slate-700 text-center">
        Scan wajah: {count} / 5
      </p>

      {/* BUTTON (DI BAWAH, STYLE SAMA SIDIK JARI) */}
      {!cameraOn && (
        <button
          onClick={startCamera}
          className="
            w-full py-3
            bg-white
            border-2 border-blue-600
            text-blue-600 font-bold
            rounded-xl
            hover:bg-blue-600 hover:text-white
            transition-all shadow-sm
          "
        >
          Aktifkan Kamera
        </button>
      )}
    </div>
  );
}
