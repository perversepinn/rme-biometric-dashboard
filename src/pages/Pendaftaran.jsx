import { useState } from "react";
import Page from "../components/Page";
import { motion, AnimatePresence } from "framer-motion";
import {
  Fingerprint,
  ScanFace,
  Loader2,
  X,
} from "lucide-react";

export default function Pendaftaran() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  const [form, setForm] = useState({
    nama: "",
    nik: "",
    ttl: "",
    alamat: "",
    noRM: "",
  });

  const dummyPatient = {
    nama: "Siti Aminah",
    nik: "3204123409870001",
    ttl: "Garut, 12 Mei 1995",
    alamat: "Jl. Raya Puskesmas No. 12",
    noRM: "RM-2025-000123",
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const simulateBiometricSuccess = () => {
    setLoading(true);
    setFadeIn(false);

    setTimeout(() => {
      setForm(dummyPatient);
      setLoading(false);
      setShowModal(false);
      setTimeout(() => setFadeIn(true), 150);
    }, 2000);
  };

  return (
    <Page>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Pendaftaran Pasien</h2>
            <p className="text-slate-500">Gunakan fitur biometrik untuk pendaftaran yang lebih cepat.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            <Fingerprint className="w-5 h-5" />
            Identifikasi Biometrik
          </motion.button>
        </div>

        {/* FORM */}
        <main className="">
          <div
            className={`bg-white rounded-3xl shadow-sm border border-slate-100 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-700 ${fadeIn ? "opacity-100" : "opacity-90"
              }`}
          >
            {[
              { label: "Nama Lengkap Pasien", name: "nama", placeholder: "Contoh: Siti Aminah" },
              { label: "Nomor Induk Kependudukan (NIK)", name: "nik", placeholder: "16 digit NIK" },
              { label: "Tempat, Tanggal Lahir", name: "ttl", placeholder: "Kota, DD-MM-YYYY" },
              { label: "Alamat Lengkap", name: "alamat", placeholder: "Jl. Nama Jalan No. XX" },
              { label: "Nomor Rekam Medis", name: "noRM", placeholder: "Otomatis atau manual" },
            ].map((item) => (
              <div key={item.name} className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  {item.label}
                </label>
                <input
                  name={item.name}
                  value={form[item.name]}
                  onChange={handleChange}
                  placeholder={item.placeholder}
                  className="rounded-xl border border-slate-200 px-5 py-3.5 bg-slate-50/30
                             focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
                />
              </div>
            ))}

            <div className="md:col-span-2 flex justify-end gap-4 mt-4">
              <button className="px-8 py-3.5 text-slate-500 font-bold hover:text-slate-800 transition-colors">Batal</button>
              <button className="px-10 py-3.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-200">Simpan Data Pasien</button>
            </div>
          </div>
        </main>

        {/* ===== MODAL WITH ANIMATION ===== */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-[32px] w-full max-w-2xl p-10 relative shadow-2xl overflow-hidden"
              >
                {/* CLOSE */}
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="mb-10 text-center">
                  <h2 className="text-2xl font-bold text-slate-800">
                    Otentikasi Biometrik
                  </h2>
                  <p className="text-slate-500 mt-2">Pilih metode identifikasi pasien di bawah ini</p>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <div className="relative">
                      <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                      <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-blue-50 border-t-transparent animate-pulse"></div>
                    </div>
                    <p className="text-slate-800 font-bold">
                      Memproses Data...
                    </p>
                    <p className="text-slate-400 text-sm -mt-4">Jangan tutup aplikasi saat proses berlangsung</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {/* FACE */}
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="border-2 border-slate-100 rounded-3xl p-6 flex flex-col items-center gap-6 hover:border-blue-200 transition-all group"
                    >
                      <div className="w-full h-40 bg-slate-50 rounded-2xl flex items-center justify-center relative overflow-hidden">
                        <ScanFace className="w-16 h-16 text-slate-300 group-hover:text-blue-400 transition-colors" />
                        <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-scan" />
                      </div>

                      <button
                        onClick={simulateBiometricSuccess}
                        className="w-full py-3 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        Scan Wajah
                      </button>
                    </motion.div>

                    {/* FINGERPRINT */}
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="border-2 border-slate-100 rounded-3xl p-6 flex flex-col items-center gap-6 hover:border-blue-200 transition-all group"
                    >
                      <div className="w-full h-40 bg-slate-50 rounded-2xl flex items-center justify-center relative overflow-hidden">
                        <Fingerprint className="w-16 h-16 text-slate-300 group-hover:text-blue-400 transition-colors" />
                      </div>

<button
  onClick={simulateBiometricSuccess}
  className="w-full py-3 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
>
                        Scan Sidik Jari
                      </button>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SCAN LINE ANIMATION */}
        <style>
          {`
            @keyframes scan {
              0% { top: 0%; }
              50% { top: 90%; }
              100% { top: 0%; }
            }
            .animate-scan {
              animation: scan 2s linear infinite;
            }
          `}
        </style>
      </div>
    </Page>
  );
}
