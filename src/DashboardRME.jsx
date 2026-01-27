import { useEffect, useState } from "react";
import {
  Fingerprint,
  ScanFace,
  Loader2,
  X,
} from "lucide-react";

export default function DashboardRME() {
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
      setTimeout(() => setFadeIn(true), 100);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="flex items-center justify-between px-8 py-5 bg-white shadow-sm">
        <h1 className="text-xl font-semibold text-slate-800">
          Dashboard RME Puskesmas Sejahtera
        </h1>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Fingerprint className="w-5 h-5" />
          Mulai Identifikasi Pasien
        </button>
      </header>

      {/* MAIN FORM */}
      <main className="max-w-4xl mx-auto p-8">
        <div
          className={`bg-white rounded-xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-5 transition-opacity duration-700 ${
            fadeIn ? "opacity-100" : "opacity-90"
          }`}
        >
          {[
            { label: "Nama Pasien", name: "nama" },
            { label: "NIK", name: "nik" },
            { label: "Tempat, Tanggal Lahir", name: "ttl" },
            { label: "Alamat", name: "alamat" },
            { label: "No. Rekam Medis", name: "noRM" },
          ].map((item) => (
            <div key={item.name} className="flex flex-col gap-1">
              <label className="text-sm text-slate-600">{item.label}</label>
              <input
                name={item.name}
                value={form[item.name]}
                onChange={handleChange}
                placeholder={`Masukkan ${item.label}`}
                className="rounded-lg border border-slate-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          ))}
        </div>
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-4xl p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X />
            </button>

            <h2 className="text-lg font-semibold mb-6">
              Autentikasi Biometrik Pasien
            </h2>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-slate-600 text-sm">
                  Mencocokkan Biometrik dengan Database Dukcapil...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PANEL WAJAH */}
                <div className="border rounded-xl p-4 flex flex-col items-center gap-4 relative overflow-hidden">
                  <div className="w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center relative">
                    <ScanFace className="w-14 h-14 text-slate-400" />
                    <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 animate-scan" />
                  </div>

                  <button
                    onClick={simulateBiometricSuccess}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Simulasi Sukses Wajah
                  </button>
                </div>

                {/* PANEL SIDIK JARI */}
                <div className="border rounded-xl p-4 flex flex-col items-center gap-4">
                  <div className="w-32 h-48 flex items-center justify-center rounded-full bg-blue-50 animate-pulse">
                    <Fingerprint className="w-16 h-16 text-blue-600" />
                  </div>

                  <button
                    onClick={simulateBiometricSuccess}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Simulasi Sukses Sidik Jari
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ANIMATION STYLE */}
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
  );
}
