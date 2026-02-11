import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, ScanFace, CheckCircle } from "lucide-react";
import FaceScanner from "../components/FaceScanner";

export default function PendaftaranPasien({ setActive }) {
  const [showScanning, setShowScanning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [detectedPatient, setDetectedPatient] = useState(null);

  /* =========================
     TRIGGER SCAN (TIDAK DIUBAH)
     ========================= */
  const startFaceScan = () => {
    setShowScanning(true);
  };

  /* =========================
     CALLBACK SCANNER
     ========================= */
  const handleScanComplete = async (descriptor) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/verify-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptor }),
      });

      const result = await res.json();

      if (result.status === "success") {
        setDetectedPatient({
          nama: result.patient.nama,
          nik: result.patient.nik,
          ttl: `${result.patient.tempatLahir}, ${result.patient.tanggalLahir}`,
          alamat: result.patient.alamat,
          noRM: result.patient.noRM,
        });

        setShowConfirm(true);
      } else {
        alert("Wajah belum terdaftar");
      }
    } catch (err) {
      alert("Server tidak dapat dihubungi");
    }
  };

return (
  <div className="space-y-8">
    {/* HEADER */}
    <div>
      <h2 className="text-2xl font-bold text-slate-800">Pendaftaran Pasien</h2>
      <p className="text-slate-500">
        Silakan lakukan identifikasi biometrik pasien.
      </p>
    </div>

    {/* KARTU BIOMETRIK */}
    <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-blue-100 h-[70vh] rounded-3xl overflow-hidden shadow-lg bg-white">
      {/* ================= SIDIK JARI ================= */}
      <div className="flex flex-col items-center text-center px-12 pt-16">
        <div className="relative w-36 h-36 flex items-center justify-center mb-6">
          <div className="fingerprint-glow"></div>
          <Fingerprint className="w-20 h-20 fingerprint-icon relative z-10" />
        </div>

        <h3 className="text-2xl font-bold text-blue-700 mt-4">
          Scan Sidik Jari
        </h3>

        <p className="text-slate-500 max-w-sm leading-relaxed mt-4">
          Silakan tempelkan sidik jari pasien pada alat pemindai. Sistem akan
          otomatis mendeteksi dan menampilkan data pasien.
        </p>

        <p className="text-blue-500 text-sm mt-4 animate-pulse">
          ● Scanner Aktif
        </p>
      </div>

      {/* ================= WAJAH ================= */}
      <div className="flex flex-col items-center text-center px-12 pt-16">
        <div className="relative flex items-center justify-center w-32 h-32 mb-6">
          <ScanFace className="w-20 h-20 text-slate-400 relative z-10" />
          <div className="scan-line"></div>
          <div className="radar-ring"></div>
        </div>

        <h3 className="text-2xl font-bold text-slate-700 mt-6">Scan Wajah</h3>

        <p className="text-slate-500 max-w-sm leading-relaxed mt-4">
          Gunakan pemindaian wajah jika sidik jari gagal dikenali atau data
          tidak sesuai.
        </p>

        <button
          onClick={startFaceScan}
          className="mt-10 px-8 py-4 bg-blue-600 text-white rounded-2xl font-semibold shadow-lg hover:bg-blue-700 transition"
        >
          Mulai Scan Wajah
        </button>
      </div>
    </div>

    {/* ================= FACE SCANNER ================= */}
<AnimatePresence>
  {showScanning && (
    <motion.div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white rounded-3xl w-full max-w-4xl p-6 relative"
      >
        <button
          onClick={() => setShowScanning(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
        >
          ✕
        </button>

        <FaceScanner
          mode="verify"
          onComplete={(descriptor) => {
            setShowScanning(false);
            handleScanComplete(descriptor);
          }}
        />
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    {/* ================= KONFIRMASI ================= */}
    <AnimatePresence>
      {showConfirm && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            className="bg-white rounded-3xl p-10 w-full max-w-lg shadow-2xl"
          >
            <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
              Konfirmasi Data Pasien
            </h2>

            <div className="space-y-3 text-sm">
              {detectedPatient &&
                Object.entries(detectedPatient).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b pb-2">
                    <span className="text-slate-500 capitalize">{key}</span>
                    <span className="font-semibold text-slate-700">
                      {value}
                    </span>
                  </div>
                ))}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 border rounded-xl font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setShowSuccess(true);
                }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
              >
                Data Benar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* ================= SUKSES ================= */}
    <AnimatePresence>
      {showSuccess && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            className="bg-white rounded-3xl p-10 text-center shadow-2xl max-w-md w-full"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Pasien Berhasil Ditambahkan
            </h2>
            <p className="text-slate-500 mb-6">
              Data pasien telah tersimpan ke sistem RME.
            </p>

            <button
              onClick={() => {
                setShowSuccess(false);
                setTimeout(() => {
                  setActive("pasien");
                }, 300);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
            >
              Tutup
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* ================= CSS ANIMASI (TIDAK DIUBAH) ================= */}
    <style>{`
        @keyframes scanFace {
          0% { top: 5%; opacity: 0.3; }
          50% { top: 85%; opacity: 1; }
          100% { top: 5%; opacity: 0.3; }
        }
        .scan-line {
          position: absolute;
          left: 15%;
          right: 15%;
          height: 3px;
          background: linear-gradient(90deg, transparent, #3b82f6, transparent);
          animation: scanFace 2s linear infinite;
        }

        @keyframes radarSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .radar-ring {
          position: absolute;
          width: 120px;
          height: 120px;
          border: 2px dashed rgba(59,130,246,0.4);
          border-radius: 50%;
          animation: radarSpin 6s linear infinite;
        }

        @keyframes glowPulse {
          0% { opacity: 0.45; }
          50% { opacity: 0.2; }
          100% { opacity: 0.45; }
        }

        .fingerprint-glow {
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 2px solid rgba(59,130,246,0.35);
          background: radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%);
          animation: glowPulse 2s ease-in-out infinite;
        }

        @keyframes fingerprintColorPulse {
          0% { color: #2563eb; }
          50% { color: #60a5fa; }
          100% { color: #2563eb; }
        }

        .fingerprint-icon {
          animation: fingerprintColorPulse 1.6s ease-in-out infinite;
        }
      `}</style>
  </div>
); }
