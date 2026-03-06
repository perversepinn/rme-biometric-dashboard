import { useState, useEffect } from "react";
import Page from "../components/Page";

export default function DummyFormPendaftaran({ patient }) {

  // === FORM STATE (SAMA PERSIS DENGAN PENDAFTARAN) ===
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

  // === DATA WILAYAH ===


  // =====================================================
  // 🔥 AUTOFILL OPSIONAL (INI KUNCI PERBAIKANNYA)
  // =====================================================
useEffect(() => {
  console.log("PATIENT DATA:", patient);
  if (patient) {
    setForm(prev => ({
      ...prev,
      noRM: patient.noRM || "",
      nama: patient.nama || "",
      tempatLahir: patient.tempatLahir || "",
      tanggalLahir: patient.tanggalLahir || "",
      nik: patient.nik || "",
      alamat: patient.alamat || "",
      telepon: patient.telepon || "",
      jenisKelamin: patient.jenisKelamin || "",
      agama: patient.agama || "",
      statusPerkawinan: patient.statusPerkawinan || "",
      pekerjaan: patient.pekerjaan || "",
      pendidikan: patient.pendidikan || "",
      namaIbu: patient.namaIbu || "",
      pekerjaanIbu: patient.pekerjaanIbu || "",
      namaAyah: patient.namaAyah || "",
      pekerjaanAyah: patient.pekerjaanAyah || "",
      namaKK: patient.namaKK || "",
      jkn: patient.jkn || "",
      catatan: patient.catatan || "",
      provinsi: patient.provinsi || "",
      kota: patient.kota || "",
      kecamatan: patient.kecamatan || "",
    }));
  }
}, [patient]);

  // === HITUNG UMUR (SAMA) ===
  useEffect(() => {
    if (form.tanggalLahir) {
      const birthDate = new Date(form.tanggalLahir);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      setForm(prev => ({ ...prev, umur: age }));
    }
  }, [form.tanggalLahir]);

  // === HANDLE CHANGE (SAMA) ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // =====================================================
  // ✅ RENDER FORM SELALU (STANDBY)
  // =====================================================
  return (
    <Page>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Form Pasien
          </h2>
          <p className="text-slate-500">
            Form dapat diisi manual atau otomatis dari biometrik.
          </p>
        </div>

        {/* === FORM GRID (SAMA PERSIS) === */}
        <div className="bg-white rounded-3xl shadow-sm border p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

          <Input label="No. Rekam Medis" name="noRM" value={form.noRM} onChange={handleChange} />
          <Input label="Nama Lengkap" name="nama" value={form.nama} onChange={handleChange} />
          <Input label="Tempat Lahir" name="tempatLahir" value={form.tempatLahir} onChange={handleChange} />
          <Input type="date" label="Tanggal Lahir" name="tanggalLahir" value={form.tanggalLahir} onChange={handleChange} />
          <Input label="Umur" name="umur" value={form.umur} disabled />
          <Input label="Jenis Kelamin" name="jenisKelamin" value={form.jenisKelamin} onChange={handleChange} />
          <Input label="Alamat" name="alamat" value={form.alamat} onChange={handleChange} />
          <Input label="NIK" name="nik" value={form.nik} onChange={handleChange} />
          <Input label="JKN" name="jkn" value={form.jkn} onChange={handleChange} />
          <Input label="Telepon" name="telepon" value={form.telepon} onChange={handleChange} />
<Input label="Provinsi" name="provinsi" value={form.provinsi} onChange={handleChange} />

<Input label="Kota / Kabupaten" name="kota" value={form.kota} onChange={handleChange} />

<Input label="Kecamatan" name="kecamatan" value={form.kecamatan} onChange={handleChange} />
   
<Input label="Agama" name="agama" value={form.agama} onChange={handleChange} />

<Input label="Status Perkawinan" name="statusPerkawinan" value={form.statusPerkawinan} onChange={handleChange} />

<Input label="Pekerjaan" name="pekerjaan" value={form.pekerjaan} onChange={handleChange} />

<Input label="Pendidikan" name="pendidikan" value={form.pendidikan} onChange={handleChange} />

<Input label="Nama Ibu" name="namaIbu" value={form.namaIbu} onChange={handleChange} />

<Input label="Pekerjaan Ibu" name="pekerjaanIbu" value={form.pekerjaanIbu} onChange={handleChange} />

<Input label="Nama Ayah" name="namaAyah" value={form.namaAyah} onChange={handleChange} />

<Input label="Pekerjaan Ayah" name="pekerjaanAyah" value={form.pekerjaanAyah} onChange={handleChange} />

<Input label="Nama Kepala Keluarga" name="namaKK" value={form.namaKK} onChange={handleChange} />
          <textarea
            label="Catatan"
            name="catatan"
            value={form.catatan}
            onChange={handleChange}
            className="md:col-span-2 rounded-xl border px-5 py-3.5"
            placeholder="Catatan"
          />

        </div>
      </div>
    </Page>
  );
}

// === KOMPONEN INPUT (SAMA) ===
function Input({ label, name, value, onChange, type = "text", disabled = false }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="rounded-xl border px-5 py-3.5"
      />
    </div>
  );
}
