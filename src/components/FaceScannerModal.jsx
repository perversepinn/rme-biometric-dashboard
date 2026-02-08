import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { motion, AnimatePresence } from "framer-motion";

export default function FaceScannerModal({ open, onComplete, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const cooldownRef = useRef(false);
  const basePitchRef = useRef(null);

  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [faceCentered, setFaceCentered] = useState(false);
  const [faceStable, setFaceStable] = useState(false);
  const [scanning, setScanning] = useState(false);

  const poseList = [
    "Hadap lurus ke kamera",
    "Hadap sedikit ke kanan",
    "Hadap sedikit ke kiri",
    "Hadap sedikit ke atas",
    "Hadap sedikit ke bawah",
  ];

  // LOAD MODEL
  useEffect(() => {
    if (!open) return;
    const load = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);
      setReady(true);
    };
    load();
  }, [open]);

  // CAMERA
  useEffect(() => {
    if (!ready) return;
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
    });
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, [ready]);

  // DETECTION (SAMA PERSIS)
  useEffect(() => {
    if (!ready) return;

    let stableStart = null;
    let confidence = 0;

    const loop = setInterval(async () => {
      if (!videoRef.current || cooldownRef.current) return;

      const det = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks();

      if (!det) {
        confidence = 0;
        setFaceCentered(false);
        setFaceStable(false);
        return;
      }

      const { box } = det.detection;
      const vw = videoRef.current.videoWidth;
      const vh = videoRef.current.videoHeight;

      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;

      const inCenter =
        cx > vw * 0.35 && cx < vw * 0.65 &&
        cy > vh * 0.35 && cy < vh * 0.65;

      if (!inCenter) {
        confidence = 0;
        setFaceCentered(false);
        setFaceStable(false);
        return;
      }

      setFaceCentered(true);

      const lm = det.landmarks;
      const nose = lm.getNose()[3];
      const jaw = lm.getJawOutline();
      const leftJaw = jaw[0];
      const rightJaw = jaw[16];
      const leftEye = lm.getLeftEye()[3];
      const rightEye = lm.getRightEye()[3];

      const faceWidth = rightJaw.x - leftJaw.x;
      const faceCenterX = (leftJaw.x + rightJaw.x) / 2;
      const yaw = (nose.x - faceCenterX) / faceWidth;

      const eyeCenterY = (leftEye.y + rightEye.y) / 2;
      const pitchEye = nose.y - eyeCenterY;

      if (count === 0 && basePitchRef.current === null) {
        basePitchRef.current = pitchEye;
      }

      const YAW_TH = 0.12;
      const PITCH_TH = 6;

      let poseCorrect = false;
      switch (count) {
        case 0: poseCorrect = Math.abs(yaw) < 0.2; break;
        case 1: poseCorrect = yaw > YAW_TH; break;
        case 2: poseCorrect = yaw < -YAW_TH; break;
        case 3: poseCorrect = pitchEye < basePitchRef.current - PITCH_TH; break;
        case 4: poseCorrect = pitchEye > basePitchRef.current + PITCH_TH; break;
      }

      confidence = poseCorrect
        ? Math.min(confidence + 0.12, 1)
        : Math.max(confidence - 0.05, 0);

      if (confidence < 0.75) {
        setFaceStable(false);
        stableStart = null;
        return;
      }

      if (!stableStart) stableStart = Date.now();

      if (Date.now() - stableStart > 1200) {
        cooldownRef.current = true;
        setScanning(true);
        setFaceStable(true);
        setCount(c => c + 1);

        confidence = 0;
        stableStart = null;

        setTimeout(() => {
          cooldownRef.current = false;
          setScanning(false);
        }, 1000);
      }
    }, 300);

    return () => clearInterval(loop);
  }, [ready, count]);

  useEffect(() => {
    if (count === 5) {
      streamRef.current?.getTracks().forEach(t => t.stop());
      onComplete();
    }
  }, [count, onComplete]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="bg-white rounded-3xl w-full max-w-5xl p-6">
            <div className="flex justify-between mb-3">
              <h2 className="font-bold text-xl">Perekaman Wajah Pasien</h2>
              <button onClick={onClose}>✕</button>
            </div>

            <div className="relative w-full h-[65vh] bg-black rounded-2xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />

              <motion.div
                className="absolute border-2 rounded-2xl w-72 h-72"
                style={{ inset: 0, margin: "auto" }}
                animate={{
                  borderColor: faceStable
                    ? "#22c55e"
                    : faceCentered
                    ? "#3b82f6"
                    : "#64748b",
                }}
              />

              {scanning && (
                <motion.div
                  className="absolute left-0 right-0 h-[2px] bg-cyan-400"
                  animate={{ top: ["20%", "80%", "20%"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 px-4 py-2 rounded-full text-white text-sm">
                Scan wajah: {count} / 5
              </div>

              <p className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xs text-white/80 bg-black/40 px-3 py-1 rounded-full">
                {poseList[count]}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
