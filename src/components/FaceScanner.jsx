import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { motion } from "framer-motion";

export default function FaceScanner({ onComplete, mode = "register" }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const cooldownRef = useRef(false);
  
const maxPose = mode === "verify" ? 1 : 5;

  const [faceDetected, setFaceDetected] = useState(false);
  const [faceCentered, setFaceCentered] = useState(false);
  const [faceStable, setFaceStable] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);

  // ✅ POSE BARU (LEBIH NATURAL)
  const poseList = [
    "Hadap lurus ke kamera",
    "Hadap sedikit ke kanan",
    "Hadap sedikit ke kiri",
    "Hadap sedikit ke atas",
    "Hadap sedikit ke bawah",
  ];

  // ================= LOAD MODELS =================
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
  faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
]);

      setReady(true);
    };
    loadModels();
  }, []);

  // ================= START CAMERA =================
  useEffect(() => {
    if (!ready) return;

    const startCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    width: 640,
    height: 480,
    facingMode: "user",
  }
});
      videoRef.current.style.filter = "brightness(1.25) contrast(1.15)";
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
    };

    startCamera();
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, [ready]);

  // ================= DETECTION LOOP =================
  useEffect(() => {
    if (!ready) return;

    let stableStartTime = null;
    let lastBox = null;

    const interval = setInterval(async () => {
      if (!videoRef.current || cooldownRef.current) return;

const detections = await faceapi
  .detectAllFaces(videoRef.current)
  .withFaceLandmarks();

if (!detections.length) {
  setFaceDetected(false);
  setFaceCentered(false);
  setFaceStable(false);
  setScanning(false);
  stableStartTime = null;
  lastBox = null;
  return;
}

setFaceDetected(true);

// 🔥 pilih wajah paling besar (paling dekat kamera)
const mainFace = detections.sort((a, b) => {
  const areaA = a.detection.box.width * a.detection.box.height;
  const areaB = b.detection.box.width * b.detection.box.height;
  return areaB - areaA;
})[0];

const detection = mainFace;


      const { x, y, width, height } = detection.detection.box;
      const vw = videoRef.current.videoWidth;
      const vh = videoRef.current.videoHeight;

      const cx = x + width / 2;
      const cy = y + height / 2;

const inCenter =
  cx > vw * 0.25 &&
  cx < vw * 0.75 &&
  cy > vh * 0.25 &&
  cy < vh * 0.75;


      if (!inCenter) {
        setFaceCentered(false);
        setFaceStable(false);
        stableStartTime = null;
        lastBox = null;
        return;
      }

      setFaceCentered(true);

      // ================= POSE VALIDATION (FIXED) =================
      const landmarks = detection.landmarks;
      const nose = landmarks.getNose()[3];
      const jaw = landmarks.getJawOutline();
      const leftJaw = jaw[0];
      const rightJaw = jaw[16];
      const chin = jaw[8];
      const leftEye = landmarks.getLeftEye()[0];

      const faceWidth = rightJaw.x - leftJaw.x;
      const yaw = (nose.x - (leftJaw.x + rightJaw.x) / 2) / faceWidth;

      const eyeToNose = nose.y - leftEye.y;
      const noseToChin = chin.y - nose.y;
      const pitch = noseToChin / eyeToNose;

      let poseCorrect = true;

if (mode === "register") {
  switch (count) {
    case 0:
      poseCorrect = Math.abs(yaw) < 0.35 && pitch > 0.6 && pitch < 1.8;
      break;
    case 1:
      poseCorrect = yaw < -0.12;
      break;
    case 2:
      poseCorrect = yaw > 0.12;
      break;
    case 3:
    poseCorrect =
      pitch > 1.4 &&
      pitch < 2.2 &&
      Math.abs(yaw) < 0.15;
    break;
    case 4:
      poseCorrect = pitch < 1.05;
      break;
    default:
      break;
  }
}


      if (!poseCorrect) {
        setFaceStable(false);
        stableStartTime = null;
        return;
      }

      // ================= STABILITY CHECK =================
      if (lastBox) {
        const movement = Math.abs(lastBox.x - x) + Math.abs(lastBox.y - y);
        if (movement > 70) {
          setFaceStable(false);
          stableStartTime = null;
          lastBox = detection.detection.box;
          return;
        }
      }

      lastBox = detection.detection.box;

      if (!stableStartTime) stableStartTime = Date.now();
      const stableDuration = Date.now() - stableStartTime;

      const requiredStableTime = mode === "verify" ? 700 : 1500;

if (stableDuration >= requiredStableTime)
 {
        setFaceStable(true);
        setScanning(true);

        cooldownRef.current = true;
        setCount((prev) => prev + 1);

        stableStartTime = null;

        setTimeout(() => {
          cooldownRef.current = false;
          setScanning(false);
        }, 1200);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [ready, count]);

  // ================= COMPLETE =================
useEffect(() => {
  const finalize = async () => {
    if (count === maxPose && videoRef.current) {
     const detections = await faceapi
  .detectAllFaces(
    videoRef.current,
    new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 })
  )
  .withFaceLandmarks()
  .withFaceDescriptors();


if (!detections.length) return;

const mainFace = detections.sort((a, b) => {
  const areaA = a.detection.box.width * a.detection.box.height;
  const areaB = b.detection.box.width * b.detection.box.height;
  return areaB - areaA;
})[0];

const descriptor = Array.from(mainFace.descriptor);

      streamRef.current?.getTracks().forEach((t) => t.stop());

      onComplete(descriptor);
    }
  };

  finalize();
}, [count, onComplete]);

const activePoseList =
  mode === "verify"
    ? ["Hadap lurus ke kamera"]
    : poseList;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full h-[65vh] bg-black rounded-2xl overflow-hidden shadow-xl">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        <motion.div
          className="absolute border-2 rounded-2xl w-64 h-64 md:w-72 md:h-72"
          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
          animate={{
            boxShadow: faceStable
              ? "0 0 30px rgba(34,197,94,1)"
              : faceCentered
              ? "0 0 25px rgba(59,130,246,0.9)"
              : "0 0 15px rgba(255,255,255,0.2)",
            borderColor: faceStable
              ? "#22c55e"
              : faceCentered
              ? "#3b82f6"
              : "#64748b",
          }}
          transition={{ duration: 0.3 }}
        />

        {scanning && (
          <motion.div
            className="absolute left-0 right-0 h-[2px] bg-cyan-400/80"
            animate={{ top: ["20%", "80%", "20%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
            style={{ boxShadow: "0 0 12px rgba(34,211,238,0.9)" }}
          />
        )}

        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 px-4 py-2 rounded-full text-white text-sm backdrop-blur-sm">
          Scan wajah: {count} / {maxPose}
        </div>

        <p className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xs text-white/80 bg-black/40 px-3 py-1 rounded-full">
  {count < maxPose
    ? activePoseList[count]
    : "Selesai"}
</p>

      </div>
    </div>
  );
}