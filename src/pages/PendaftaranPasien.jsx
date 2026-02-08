import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, ScanFace, CheckCircle } from "lucide-react";
import FaceScannerModal from "../components/FaceScannerModal";

export default function PendaftaranPasien({ setActive }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFaceScanner, setShowFaceScanner] = useState(false);

  const dummyPatient = {
    nama: "Siti Aminah",
    nik: "3204123409870001",
    ttl: "Garut, 12 Mei 1995",
    alamat: "Jl. Raya Puskesmas No. 12",
    noRM: "RM-2025-000123",
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800">
          Pendaftaran Pasien
        </h2>
        <p className="text-slate-500">
          Identifikasi biometrik untuk validasi data pasien.
        </p>
      </div>

      {/* KONTEN UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-blue-100 h-[72vh] rounded-[2rem] overflow-hidden shadow-xl bg-white">
        {/* ================= SIDIK JARI ================= */}
        <div className="flex flex-col items-center text-center px-14 pt-20 relative">
          {/* BREATHING GLOW */}
          <div className="absolute inset-0 flex justify-center items-start pointer-events-none">
            <div className="w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          </div>

          <div className="relative w-40 h-40 flex items-center justify-center mb-8">
            <div className="fingerprint-glow"></div>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Fingerprint className="w-24 h-24 fingerprint-icon relative z-10" />
            </motion.div>
          </div>

          <h3 className="text-2xl font-bold text-blue-700">Scan Sidik Jari</h3>

          <p className="text-slate-500 max-w-sm leading-relaxed mt-4">
            Tempelkan sidik jari pasien pada alat pemindai. Sistem akan
            mendeteksi secara otomatis.
          </p>

          <span className="mt-6 inline-flex items-center gap-2 text-blue-600 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            Scanner Aktif
          </span>
        </div>

        {/* ================= SCAN WAJAH ================= */}
        <div className="flex flex-col items-center text-center px-14 pt-20 relative">
          {/* BREATHING GLOW */}
          <div className="absolute inset-0 flex justify-center items-start pointer-events-none">
            <div className="w-72 h-72 bg-slate-400/10 rounded-full blur-3xl animate-pulse" />
          </div>

          <div className="relative w-36 h-36 mb-8 flex items-center justify-center">
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ScanFace className="w-24 h-24 text-slate-400 relative z-10" />
            </motion.div>

            {/* SCAN LINE */}
            <div className="scan-line"></div>

            {/* RADAR */}
            <motion.div
              className="radar-ring"
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <h3 className="text-2xl font-bold text-slate-700">Scan Wajah</h3>

          <p className="text-slate-500 max-w-sm leading-relaxed mt-4">
            Digunakan jika sidik jari gagal atau data perlu diverifikasi ulang.
          </p>

          <motion.button
            onClick={() => setShowFaceScanner(true)}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-10 px-10 py-4 bg-blue-600 text-white rounded-2xl font-semibold shadow-xl hover:bg-blue-700"
          >
            Mulai Scan Wajah
          </motion.button>
        </div>
      </div>

      {/* FACE SCANNER MODAL */}
      <FaceScannerModal
        open={showFaceScanner}
        onClose={() => setShowFaceScanner(false)}
        onComplete={() => {
          setShowFaceScanner(false);
          setShowConfirm(true);
        }}
      />

      {/* ================= MODAL KONFIRMASI ================= */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-10 w-full max-w-lg shadow-2xl"
            >
              <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
                Konfirmasi Data Pasien
              </h2>

              <div className="space-y-3 text-sm">
                {Object.entries(dummyPatient).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b pb-2">
                    <span className="text-slate-500 capitalize">{k}</span>
                    <span className="font-semibold text-slate-700">{v}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 border rounded-xl font-semibold hover:bg-slate-50"
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

      {/* ================= MODAL SUKSES ================= */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
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
                  setActive("pasien");
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
