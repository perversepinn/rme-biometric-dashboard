import FaceScanner from "../components/FaceScanner";
import { useState, useEffect } from "react";
import Page from "../components/Page";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, ScanFace, Loader2, X, CheckCircle } from "lucide-react";
import wilayah from "../data/wilayah.json";

export default function Pendaftaran() {
  const [startFaceScan, setStartFaceScan] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [fingerVerified, setFingerVerified] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState(null);

  const [form, setForm] = useState({
    noRM: "",
    nama: "",
    tempatLahir: "",
    tanggalLahir: "",
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

  // ================= DATA WILAYAH =================
  const [provList] = useState(wilayah);
  const [kotaList, setKotaList] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);

  const getProvinsiName = (code) => {
    const prov = wilayah.find((p) => p.code === code);
    return prov ? prov.name : code;
  };

  const getKotaName = (provCode, kotaCode) => {
    const prov = wilayah.find((p) => p.code === provCode);
    if (!prov) return kotaCode;
    const kota = prov.regencies.find((k) => k.code === kotaCode);
    return kota ? kota.name : kotaCode;
  };

  const getKecamatanName = (provCode, kotaCode, kecCode) => {
    const prov = wilayah.find((p) => p.code === provCode);
    if (!prov) return kecCode;
    const kota = prov.regencies.find((k) => k.code === kotaCode);
    if (!kota) return kecCode;
    const kec = kota.districts.find((d) => d.code === kecCode);
    return kec ? kec.name : kecCode;
  };

  // ================= AUTO GENERATE NO RM =================
  useEffect(() => {
    const randomRM = "RM-" + Math.floor(100000 + Math.random() * 900000);
    setForm((prev) => ({ ...prev, noRM: randomRM }));
  }, []);

  // ================= HITUNG UMUR OTOMATIS =================
  useEffect(() => {
    if (form.tanggalLahir) {
      const birthDate = new Date(form.tanggalLahir);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      setForm((prev) => ({ ...prev, umur: age }));
    }
  }, [form.tanggalLahir]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "provinsi") {
      const selectedProv = provList.find((p) => p.code === value);
      setKotaList(selectedProv ? selectedProv.regencies : []);
      setKecamatanList([]);
      setForm((prev) => ({
        ...prev,
        provinsi: value,
        kota: "",
        kecamatan: "",
      }));
      return;
    }

    if (name === "kota") {
      const selectedKota = kotaList.find((k) => k.code === value);
      setKecamatanList(selectedKota ? selectedKota.districts : []);
      setForm((prev) => ({
        ...prev,
        kota: value,
        kecamatan: "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setForm({
      nama: "",
      tempatLahir: "",
      tanggalLahir: "",
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

    // 🔥 RESET STATUS BIOMETRIK
    setFingerVerified(false);
    setFaceVerified(false);
    setStartFaceScan(false); // 🔥 penting

    // Tutup semua modal kalau masih terbuka
    setShowConfirmModal(false);
    setShowModal(false);

    // Scroll ke atas biar kembali ke awal form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const simulateBiometricSuccess = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowModal(false);
      setFadeIn(true);
    }, 2000);
  };

  const dropdown = (name, label, options) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>
      <select
        name={name}
        value={form[name]}
        onChange={handleChange}
        className="rounded-xl border border-slate-200 px-5 py-3.5 bg-slate-50/30 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500"
      >
        <option value="">Pilih {label}</option>
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
        <option value="lainnya">Lainnya...</option>
      </select>
      {form[name] === "lainnya" && (
        <input
          type="text"
          name={name}
          placeholder={`Masukkan ${label}`}
          className="mt-2 rounded-xl border border-slate-200 px-5 py-3 bg-white"
          onChange={handleChange}
        />
      )}
    </div>
  );

  return (
    <Page>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Perekaman Pasien Baru
          </h2>
          <p className="text-slate-500">
            Lengkapi data pasien sebelum melakukan identifikasi biometrik.
          </p>
        </div>

        <main>
          <div
            className={`bg-white rounded-3xl shadow-sm border border-slate-100 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 ${fadeIn ? "opacity-100" : "opacity-90"}`}
          >
            {/* NO RM */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 ml-1">
                No. Rekam Medis
              </label>
              <input
                value={form.noRM}
                disabled
                className="rounded-xl border px-5 py-3.5 bg-slate-100"
              />
            </div>

            {/* NAMA */}
            <Input
              label="Nama Lengkap"
              name="nama"
              value={form.nama}
              onChange={handleChange}
            />

            {/* TEMPAT LAHIR */}
            <Input
              label="Tempat Lahir"
              name="tempatLahir"
              value={form.tempatLahir}
              onChange={handleChange}
            />

            {/* TANGGAL LAHIR */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 ml-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                name="tanggalLahir"
                value={form.tanggalLahir}
                onChange={handleChange}
                className="rounded-xl border px-5 py-3.5"
              />
            </div>

            {/* UMUR */}
            <Input label="Umur" name="umur" value={form.umur} disabled />

            {dropdown("jenisKelamin", "Jenis Kelamin", [
              "Laki-laki",
              "Perempuan",
            ])}

            <Input
              label="Alamat"
              name="alamat"
              value={form.alamat}
              onChange={handleChange}
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 ml-1">
                Provinsi
              </label>
              <select
                name="provinsi"
                value={form.provinsi}
                onChange={handleChange}
                className="rounded-xl border px-5 py-3.5"
              >
                <option value="">Pilih Provinsi</option>
                {provList.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 ml-1">
                Kota / Kabupaten
              </label>
              <select
                name="kota"
                value={form.kota}
                onChange={handleChange}
                disabled={!kotaList.length}
                className="rounded-xl border px-5 py-3.5"
              >
                <option value="">Pilih Kota/Kabupaten</option>
                {kotaList.map((k) => (
                  <option key={k.code} value={k.code}>
                    {k.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 ml-1">
                Kecamatan
              </label>
              <select
                name="kecamatan"
                value={form.kecamatan}
                onChange={handleChange}
                disabled={!kecamatanList.length}
                className="rounded-xl border px-5 py-3.5"
              >
                <option value="">Pilih Kecamatan</option>
                {kecamatanList.map((kec) => (
                  <option key={kec.code} value={kec.code}>
                    {kec.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="No. Telepon"
              name="telepon"
              type="number"
              value={form.telepon}
              onChange={handleChange}
            />
            {dropdown("agama", "Agama", [
              "Islam",
              "Kristen",
              "Katolik",
              "Hindu",
              "Buddha",
              "Konghucu",
            ])}
            {dropdown("statusPerkawinan", "Status Perkawinan", [
              "Belum Kawin",
              "Kawin",
              "Cerai",
            ])}
            {dropdown("pekerjaan", "Pekerjaan", [
              "PNS",
              "Swasta",
              "Wiraswasta",
              "Pelajar",
            ])}
            {dropdown("pendidikan", "Pendidikan", [
              "SD",
              "SMP",
              "SMA",
              "D3",
              "S1",
              "S2",
            ])}
            <Input
              label="Nama Ibu"
              name="namaIbu"
              value={form.namaIbu}
              onChange={handleChange}
            />

            {dropdown("pekerjaanIbu", "Pekerjaan Ibu", [
              "IRT",
              "Swasta",
              "PNS",
            ])}
            <Input
              label="Nama Ayah"
              name="namaAyah"
              value={form.namaAyah}
              onChange={handleChange}
            />

            {dropdown("pekerjaanAyah", "Pekerjaan Ayah", [
              "Swasta",
              "PNS",
              "Wiraswasta",
            ])}
            <Input
              label="Nama Kepala Keluarga"
              name="namaKK"
              value={form.namaKK}
              onChange={handleChange}
            />

            <Input
              label="No. NIK"
              name="nik"
              type="number"
              value={form.nik}
              onChange={handleChange}
            />

            <Input
              label="No. JKN"
              name="jkn"
              type="number"
              value={form.jkn}
              onChange={handleChange}
            />

            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 ml-1">
                Catatan
              </label>
              <textarea
                name="catatan"
                value={form.catatan}
                onChange={handleChange}
                className="rounded-xl border px-5 py-3.5"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-4 mt-4">
              <button
                onClick={handleReset}
                className="px-8 py-3 text-slate-500 font-bold hover:text-slate-800"
              >
                Reset
              </button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(true)}
                className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
              >
                <Fingerprint className="w-5 h-5" />
                Identifikasi Biometrik
              </motion.button>
            </div>
          </div>
        </main>

        {/* MODAL BIOMETRIK TETAP */}
        {/* --- TIDAK DIUBAH SESUAI PERMINTAAN --- */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 60 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 60 }}
                transition={{ type: "spring", damping: 22, stiffness: 260 }}
                className="bg-white rounded-[36px] w-full max-w-4xl p-12 relative shadow-2xl overflow-hidden"
              >
                {/* CLOSE BUTTON */}
                <button
                  onClick={() => {
                    setShowModal(false);
                    setStartFaceScan(false); // 🔥 reset kamera
                    setFaceVerified(false); // opsional: reset status wajah
                  }}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* HEADER */}
                <div className="mb-12 text-center">
                  <h2 className="text-3xl font-bold text-slate-800">
                    Otentikasi Biometrik
                  </h2>
                  <p className="text-slate-500 mt-3">
                    Pilih metode identifikasi pasien
                  </p>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-6">
                    <Loader2 className="w-14 h-14 animate-spin text-blue-600" />
                    <p className="text-slate-800 font-bold text-lg">
                      Memproses Data...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {/* SIDIK JARI */}
                      <motion.div
                        whileHover={{ y: -6 }}
                        className="border border-slate-200 rounded-3xl p-8 flex flex-col items-center gap-6 hover:border-blue-300 transition-all group bg-gradient-to-br from-white to-blue-50"
                      >
                        <div className="w-full h-44 bg-white rounded-2xl flex items-center justify-center relative overflow-hidden shadow-inner">
                          <Fingerprint className="w-20 h-20 text-blue-500 animate-pulse" />
                        </div>

                        <button
                          onClick={() => {
                            setLoading(true);
                            setTimeout(() => {
                              setLoading(false);
                              setFingerVerified(true);
                            }, 2000);
                          }}
                          className="w-full py-3 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          Scan Sidik Jari
                        </button>
                      </motion.div>

                      {/* ====== WAJAH ====== */}
                      <motion.div
                        whileHover={!faceVerified ? { y: -6 } : {}}
                        className="border border-slate-200 rounded-3xl p-8 flex flex-col items-center gap-6 bg-gradient-to-br from-white to-slate-50 hover:border-blue-300 transition-all"
                      >
                        {!faceVerified ? (
                          <>
                            {/* ===== PREVIEW (SEBELUM SCAN) ===== */}
                            <div className="relative w-full h-44 rounded-2xl bg-white shadow-inner overflow-hidden flex items-center justify-center">
                              <motion.div
                                className="absolute w-28 h-28 rounded-full border-2 border-blue-300"
                                animate={{
                                  scale: [1, 1.15, 1],
                                  opacity: [0.6, 0.2, 0.6],
                                }}
                                transition={{
                                  duration: 2.2,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                              />

                              <motion.div
                                className="absolute top-0 left-0 w-full h-1 bg-blue-400/70"
                                animate={{ y: [0, 176, 0] }}
                                transition={{
                                  duration: 2.5,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              />

                              <ScanFace className="w-20 h-20 text-blue-500 z-10 animate-pulse" />
                            </div>

                            {/* TOMBOL INTERAKTIF */}
                            <motion.button
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => {
                                setShowModal(false); // tutup modal biometrik utama
                                setShowFaceModal(true); // buka modal kamera
                              }}
                              className="w-full py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            >
                              Scan Wajah
                            </motion.button>

                            <p className="text-sm text-slate-500 text-center">
                              Gunakan kamera untuk verifikasi wajah pasien
                            </p>
                          </>
                        ) : (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center gap-2 text-green-600 font-semibold"
                          >
                            <CheckCircle className="w-6 h-6 animate-bounce" />
                            Wajah Terverifikasi
                          </motion.div>
                        )}
                      </motion.div>
                    </div>

                    {/* TOMBOL VERIFIKASI */}
                    {(fingerVerified || faceVerified) && (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setShowConfirmModal(true)}
                        className="w-full mt-10 py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg hover:bg-green-700 transition"
                      >
                        Verifikasi Pendaftaran
                      </motion.button>
                    )}
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/*modal proses scan  */}
        <AnimatePresence>
          {showFaceModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 50 }}
                transition={{ type: "spring", damping: 22, stiffness: 260 }}
                className="bg-white rounded-3xl w-full max-w-4xl p-6 sm:p-8 md:p-10 shadow-2xl relative"
              >
                {/* CLOSE BUTTON */}
                <button
                  onClick={() => {
                    setShowFaceModal(false);
                    setStartFaceScan(false);
                  }}
                  className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* HEADER */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">
                    Perekaman Wajah Pasien
                  </h2>
                  <p className="text-slate-500 mt-2">
                    Posisikan wajah di dalam kotak biru. Pastikan pencahayaan
                    cukup dan hindari gerakan cepat.
                  </p>
                </div>

                {/* CAMERA FULL AREA */}
                <div className="w-full">
                  <FaceScanner
                    onComplete={(descriptor) => {
                      setFaceDescriptor(descriptor); // ✅ BARU
                      setFaceVerified(true);
                      setShowFaceModal(false);
                      setShowModal(true);
                    }}
                  />
                </div>

                {/* FOOTER NOTE */}
                <p className="text-sm text-slate-500 text-center mt-5">
                  Sistem akan otomatis mengambil beberapa frame wajah untuk
                  verifikasi
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showConfirmModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 40 }}
                transition={{ type: "spring", damping: 20, stiffness: 260 }}
                className="
          bg-white rounded-3xl shadow-2xl w-full
          max-w-3xl
          max-h-[90vh]
          overflow-y-auto
          p-6 sm:p-8 md:p-10
        "
              >
                <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
                  Konfirmasi Pendaftaran Pasien
                </h2>

                {/* STATUS BIOMETRIK */}
                <div className="mb-6 text-center">
                  {fingerVerified && (
                    <p className="text-green-600 font-semibold">
                      ✔ Sidik Jari Terverifikasi
                    </p>
                  )}
                  {faceVerified && (
                    <p className="text-green-600 font-semibold">
                      ✔ Wajah Terverifikasi
                    </p>
                  )}
                </div>

                {/* DATA PASIEN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {Object.entries(form).map(([key, value]) => {
                    let displayValue = value || "-";

                    if (key === "provinsi") {
                      displayValue = getProvinsiName(form.provinsi);
                    }

                    if (key === "kota") {
                      displayValue = getKotaName(form.provinsi, form.kota);
                    }

                    if (key === "kecamatan") {
                      displayValue = getKecamatanName(
                        form.provinsi,
                        form.kota,
                        form.kecamatan,
                      );
                    }

                    return (
                      <div
                        key={key}
                        className="flex justify-between border-b py-2"
                      >
                        <span className="text-slate-500 capitalize">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                        <span className="font-semibold text-slate-700">
                          {displayValue}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-3 border rounded-xl font-semibold"
                  >
                    Batal
                  </button>

                  <button
                    onClick={async () => {
                      if (!faceDescriptor) {
                        alert("Wajah belum direkam");
                        return;
                      }

                      const dataUntukDB = {
                        ...form,
                        provinsi: getProvinsiName(form.provinsi),
                        kota: getKotaName(form.provinsi, form.kota),
                        kecamatan: getKecamatanName(
                          form.provinsi,
                          form.kota,
                          form.kecamatan,
                        ),
                      };

                      try {
                        const response = await fetch(
                          "http://127.0.0.1:5000/register",
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              ...dataUntukDB,
                              descriptor: faceDescriptor,
                            }),
                          },
                        );

                        const result = await response.json();

                        if (result.status === "success") {
                          setShowConfirmModal(false);
                          setShowSuccessModal(true);
                        } else {
                          alert("Gagal menyimpan: " + result.message);
                        }
                      } catch (err) {
                        console.error(err);
                        alert("Server tidak dapat dihubungi");
                      }
                    }}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                  >
                    Simpan & Daftarkan
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 40 }}
              transition={{ type: "spring", damping: 18, stiffness: 260 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center"
            >
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Pendaftaran Berhasil
              </h2>
              <p className="text-slate-500 mb-6">
                Data pasien berhasil disimpan ke sistem.
              </p>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  handleReset(); // reset setelah tutup modal
                }}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  );
}

function Input({
  label,
  name,
  type = "text",
  disabled = false,
  value,
  onChange,
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="rounded-xl border border-slate-200 px-5 py-3.5 bg-slate-50/30 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500"
      />
    </div>
  );
}
