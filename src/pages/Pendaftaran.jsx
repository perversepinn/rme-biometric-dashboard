import { useState } from "react";
import Page from "../components/Page";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, ScanFace, Loader2, X } from "lucide-react";

export default function Pendaftaran() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  const [form, setForm] = useState({
    noRM: "",
    nama: "",
    ttl: "",
    umur: "",
    jenisKelamin: "",
    alamat: "",
    kecamatan: "",
    kota: "",
    provinsi: "",
    telepon: "",
    agama: "",
    statusPerkawinan: "",
    pekerjaan: "",
    pendidikan: "",
    namaIbu: "",
    pekerjaanIbu: "",
    namaAyah: "",
    pekerjaanAyah: "",
    namaKK: "",
    nik: "",
    jkn: "",
    catatan: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const simulateBiometricSuccess = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowModal(false);
      setFadeIn(true);
    }, 2000);
  };

  const fields = [
    ["No. Rekam Medis", "noRM", "Masukkan nomor RM pasien"],
    ["Nama Lengkap", "nama", "Nama lengkap sesuai KTP"],
    ["Tempat, Tanggal Lahir", "ttl", "Contoh: Bandung, 12-05-1990"],
    ["Umur", "umur", "Umur pasien"],
    ["Jenis Kelamin", "jenisKelamin", "Laki-laki / Perempuan"],
    ["Alamat", "alamat", "Alamat lengkap domisili"],
    ["Kecamatan", "kecamatan", "Nama kecamatan"],
    ["Kota", "kota", "Nama kota/kabupaten"],
    ["Provinsi", "provinsi", "Nama provinsi"],
    ["No. Telepon", "telepon", "Nomor HP aktif"],
    ["Agama", "agama", "Islam, Kristen, dll"],
    ["Status Perkawinan", "statusPerkawinan", "Belum Kawin / Kawin"],
    ["Pekerjaan", "pekerjaan", "Pekerjaan pasien"],
    ["Pendidikan", "pendidikan", "Pendidikan terakhir"],
    ["Nama Ibu", "namaIbu", "Nama ibu kandung"],
    ["Pekerjaan Ibu", "pekerjaanIbu", "Pekerjaan ibu"],
    ["Nama Ayah", "namaAyah", "Nama ayah kandung"],
    ["Pekerjaan Ayah", "pekerjaanAyah", "Pekerjaan ayah"],
    ["Nama Kepala Keluarga", "namaKK", "Nama kepala keluarga"],
    ["No. NIK", "nik", "16 digit NIK"],
    ["No. JKN", "jkn", "Nomor BPJS/JKN"],
    ["Catatan", "catatan", "Catatan tambahan pasien"],
  ];

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

        <main>
          <div className={`bg-white rounded-3xl shadow-sm border border-slate-100 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-700 ${fadeIn ? "opacity-100" : "opacity-90"}`}>
            {fields.map(([label, name, placeholder]) => (
              <div key={name} className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>
                <input
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="rounded-xl border border-slate-200 px-5 py-3.5 bg-slate-50/30 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
                />
              </div>
            ))}

            <div className="md:col-span-2 flex justify-end gap-4 mt-4">
              <button className="px-8 py-3.5 text-slate-500 font-bold hover:text-slate-800 transition-colors">Batal</button>
              <button className="px-10 py-3.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-200">Simpan Data Pasien</button>
            </div>
          </div>
        </main>

        {/* ===== MODAL BIOMETRIK (TETAP SAMA) ===== */}
        <AnimatePresence>
          {showModal && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="bg-white rounded-[32px] w-full max-w-2xl p-10 relative shadow-2xl overflow-hidden">
                <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
                  <X className="w-6 h-6" />
                </button>

                <div className="mb-10 text-center">
                  <h2 className="text-2xl font-bold text-slate-800">Otentikasi Biometrik</h2>
                  <p className="text-slate-500 mt-2">Pilih metode identifikasi pasien di bawah ini</p>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                    <p className="text-slate-800 font-bold">Memproses Data...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <motion.div whileHover={{ y: -5 }} className="border-2 border-slate-100 rounded-3xl p-6 flex flex-col items-center gap-6 hover:border-blue-200 transition-all group">
                      <div className="w-full h-40 bg-slate-50 rounded-2xl flex items-center justify-center relative overflow-hidden">
                        <ScanFace className="w-16 h-16 text-slate-300 group-hover:text-blue-400 transition-colors" />
                        <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 animate-scan" />
                      </div>
                      <button onClick={simulateBiometricSuccess} className="w-full py-3 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">Scan Wajah</button>
                    </motion.div>

                    <motion.div whileHover={{ y: -5 }} className="border-2 border-slate-100 rounded-3xl p-6 flex flex-col items-center gap-6 hover:border-blue-200 transition-all group">
                      <div className="w-full h-40 bg-slate-50 rounded-2xl flex items-center justify-center relative overflow-hidden">
                        <Fingerprint className="w-16 h-16 text-slate-300 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <button onClick={simulateBiometricSuccess} className="w-full py-3 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">Scan Sidik Jari</button>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          @keyframes scan {
            0% { top: 0%; }
            50% { top: 90%; }
            100% { top: 0%; }
          }
          .animate-scan {
            animation: scan 2s linear infinite;
          }
        `}</style>
      </div>
    </Page>
  );
}
