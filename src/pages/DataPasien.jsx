import { useMemo, useState, useEffect } from "react";
import {
  Eye,
  Edit,
  Trash2,
  X,
  Search,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Page from "../components/Page";
import FaceScanner from "../components/FaceScanner";
import { Fingerprint, Save, ArrowUp, ArrowDown, ScanFace } from "lucide-react";
import wilayah from "../data/wilayah.json";
import { toast } from "react-hot-toast";

export default function DataPasien({ auditLogs, setAuditLogs, user }) {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [editData, setEditData] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

const [sortKey, setSortKey] = useState("noRM");
const [sortOrder, setSortOrder] = useState("asc");

const [provList] = useState(wilayah);
const [kotaList, setKotaList] = useState([]);
const [kecamatanList, setKecamatanList] = useState([]);
const getProvinsiCode = (name) => {
  const prov = provList.find((p) => p.name === name);
  return prov ? prov.code : "";
};

const getKotaCode = (provCode, name) => {
  const prov = provList.find((p) => p.code === provCode);
  if (!prov) return "";

  const kota = prov.regencies.find((k) => k.name === name);
  return kota ? kota.code : "";
};

const getKecamatanCode = (provCode, kotaCode, name) => {
  const prov = provList.find((p) => p.code === provCode);
  if (!prov) return "";

  const kota = prov.regencies.find((k) => k.code === kotaCode);
  if (!kota) return "";

  const kec = kota.districts.find((d) => d.name === name);
  return kec ? kec.code : "";
};
  // 🔥 AMBIL DATA DARI DATABASE
  useEffect(() => {
    fetch("http://127.0.0.1:5000/patients")
      .then((res) => res.json())
      .then((data) => setRows(data))
      .catch((err) => console.error("Gagal ambil data pasien", err));
  }, []);

const filtered = useMemo(() => {
  const result = rows.filter(
    (p) =>
      (p.nama || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.nik || "").includes(search)
  );

  result.sort((a, b) => {
    const valA = a[sortKey] || "";
    const valB = b[sortKey] || "";

    if (sortOrder === "asc") {
      return valA.toString().localeCompare(valB.toString());
    } else {
      return valB.toString().localeCompare(valA.toString());
    }
  });

  return result;
}, [rows, search, sortKey, sortOrder]);

const getProvinsiName = (code) => {
  const prov = provList.find((p) => p.code === code);
  return prov ? prov.name : code;
};

const getKotaName = (provCode, kotaCode) => {
  const prov = provList.find((p) => p.code === provCode);
  if (!prov) return kotaCode;

  const kota = prov.regencies.find((k) => k.code === kotaCode);
  return kota ? kota.name : kotaCode;
};

const getKecamatanName = (provCode, kotaCode, kecCode) => {
  const prov = provList.find((p) => p.code === provCode);
  if (!prov) return kecCode;

  const kota = prov.regencies.find((k) => k.code === kotaCode);
  if (!kota) return kecCode;

  const kec = kota.districts.find((d) => d.code === kecCode);
  return kec ? kec.name : kecCode;
};

  /* ===== AUDIT ===== */
const saveEdit = async () => {
  try {

    const dataToSend = {
      nama: editData.nama,
      nik: editData.nik,
      tempatLahir: editData.tempatLahir,
      tanggalLahir: editData.tanggalLahir,
      umur: editData.umur,
      jenisKelamin: editData.jenisKelamin,
      alamat: editData.alamat,
      kecamatan: getKecamatanName(editData.provinsi, editData.kota, editData.kecamatan),
      kota: getKotaName(editData.provinsi, editData.kota),
      provinsi: getProvinsiName(editData.provinsi),
      telepon: editData.telepon,
      agama: editData.agama,
      statusPerkawinan: editData.statusPerkawinan,
      pekerjaan: editData.pekerjaan,
      pendidikan: editData.pendidikan,
      namaIbu: editData.namaIbu,
      pekerjaanIbu: editData.pekerjaanIbu,
      namaAyah: editData.namaAyah,
      pekerjaanAyah: editData.pekerjaanAyah,
      namaKK: editData.namaKK,
      jkn: editData.jkn,
      catatan: editData.catatan
    }

    const res = await fetch(
      `http://127.0.0.1:5000/update-patient/${editData.noRM}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
      }
    )

    const result = await res.json()

    if (result.status === "success") {
      setRows(prev =>
        prev.map(p =>
          p.noRM === editData.noRM ? { ...p, ...dataToSend } : p
        )
      )

      setEditData(null)
      toast.success("Data pasien berhasil diperbarui")
    }

  } catch (err) {
    console.error(err)
    alert("Gagal update")
  }
}

const deleteRow = async () => {
  try {
    await fetch(
      `http://127.0.0.1:5000/delete-patient/${confirmDelete.noRM}`,
      { method: "DELETE" }
    );

    setRows((prev) =>
      prev.filter((p) => p.noRM !== confirmDelete.noRM)
    );

    setConfirmDelete(null);
  } catch (err) {
    alert("Gagal hapus");
  }
};


  /* ===== EXPORT ===== */
const exportPDF = () => {
  const doc = new jsPDF("landscape");

  doc.setFontSize(16);
  doc.text("Laporan Data Pasien Puskesmas", 14, 16);

  autoTable(doc, {
    startY: 22,
    head: [[
      "No RM",
      "Nama",
      "NIK",
      "Jenis Kelamin",
      "Tanggal Lahir",
      "Umur",
      "Telepon",
      "Alamat",
      "Kecamatan",
      "Kota"
    ]],

    body: filtered.map((p) => [
      p.noRM,
      p.nama,
      p.nik,
      p.jenisKelamin,
      p.tanggalLahir
        ? new Date(p.tanggalLahir).toLocaleDateString("id-ID")
        : "-",
      p.umur,
      p.telepon,
      p.alamat,
      p.kecamatan,
      p.kota
    ]),

    styles: {
      fontSize: 9,
      cellPadding: 3,
    },

    headStyles: {
      fillColor: [59, 130, 246],
    }
  });

  doc.save("data-pasien.pdf");
};

const exportExcel = () => {

  const data = filtered.map((p) => ({
    "No RM": p.noRM,
    "Nama": p.nama,
    "NIK": p.nik,
    "Jenis Kelamin": p.jenisKelamin,
    "Tanggal Lahir": p.tanggalLahir
      ? new Date(p.tanggalLahir).toLocaleDateString("id-ID")
      : "-",
    "Tempat Lahir": p.tempatLahir,
    "Umur": p.umur,
    "Telepon": p.telepon,
    "Alamat": p.alamat,
    "Kecamatan": p.kecamatan,
    "Kota": p.kota,
    "Provinsi": p.provinsi,
    "Status Perkawinan": p.statusPerkawinan,
    "Pekerjaan": p.pekerjaan,
    "Pendidikan": p.pendidikan,
    "Nama Ayah": p.namaAyah,
    "Pekerjaan Ayah": p.pekerjaanAyah,
    "Nama Ibu": p.namaIbu,
    "Pekerjaan Ibu": p.pekerjaanIbu,
    "Nama KK": p.namaKK,
    "Catatan": p.catatan
  }));

  const ws = XLSX.utils.json_to_sheet(data);
ws["!autofilter"] = { ref: "A1:U1" };
  // auto width kolom
  ws["!cols"] = [
    { wch: 10 }, // noRM
    { wch: 18 }, // nama
    { wch: 18 }, // nik
    { wch: 15 },
    { wch: 14 },
    { wch: 15 },
    { wch: 6 },
    { wch: 14 },
    { wch: 35 }, // alamat
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 25 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data Pasien");

  XLSX.writeFile(wb, "data-pasien.xlsx");
};


const [showBiometricModal, setShowBiometricModal] = useState(null);
const [showFaceScan, setShowFaceScan] = useState(false);


  const fieldOrder = [
  "noRM",
  "nama",
  "nik",
  "jenisKelamin",
  "tanggalLahir",
  "tempatLahir",
  "umur",
  "telepon",
  "alamat",
  "kecamatan",
  "kota",
  "provinsi",
  "statusPerkawinan",
  "pekerjaan",
  "pendidikan",
  "namaAyah",
  "pekerjaanAyah",
  "namaIbu",
  "pekerjaanIbu",
  "namaKK",
  "catatan",
];

const handleEditChange = (e) => {
  const { name, value } = e.target;

  if (name === "provinsi") {
    const selectedProv = provList.find((p) => p.code === value);

    setKotaList(selectedProv ? selectedProv.regencies : []);
    setKecamatanList([]);

    setEditData((prev) => ({
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

    setEditData((prev) => ({
      ...prev,
      kota: value,
      kecamatan: "",
    }));

    return;
  }

  setEditData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

useEffect(() => {
  if (!editData) return;

  const prov = provList.find((p) => p.code === editData.provinsi);

  if (prov) {
    setKotaList(prov.regencies);

    const kota = prov.regencies.find(
      (k) => k.code === editData.kota
    );

    if (kota) {
      setKecamatanList(kota.districts);
    }
  }
}, [editData]);

useEffect(() => {
  if (!editData?.tanggalLahir) return;

  const birthDate = new Date(editData.tanggalLahir);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  setEditData((prev) => ({
    ...prev,
    umur: age
  }));

}, [editData?.tanggalLahir]);

const handleSort = (key) => {
  if (sortKey === key) {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  } else {
    setSortKey(key);
    setSortOrder("asc");
  }
};

const renderSortIcon = (key) => {
  const isActive = sortKey === key;

  return (
    <span className="inline-flex flex-col ml-1">
      <ArrowUp
        size={12}
        className={
          isActive && sortOrder === "asc"
            ? "text-blue-600"
            : "text-slate-300"
        }
      />
      <ArrowDown
        size={12}
        className={
          isActive && sortOrder === "desc"
            ? "text-blue-600"
            : "text-slate-300 -mt-1"
        }
      />
    </span>
  );
};

  return (
    <Page>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-semibold">Data Pasien</h1>

          <div className="flex items-center gap-2">
            <IconButton title="Export PDF" onClick={exportPDF}>
              <FileText className="text-red-600" />
            </IconButton>

            <IconButton title="Export Excel" onClick={exportExcel}>
              <FileSpreadsheet className="text-green-600" />
            </IconButton>

            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari pasien"
                className="w-full pl-9 pr-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

{/* TABLE */}
<div className="bg-white rounded-xl shadow-sm w-full overflow-x-auto max-h-[420px] overflow-y-auto">
  <table className="w-full text-sm table-auto">
    <thead className="bg-slate-100 sticky top-0 z-10">
      <tr>
        <th onClick={() => handleSort("noRM")} className="px-4 py-3 cursor-pointer select-none hover:text-blue-600 transition">
  <div className="flex items-center justify-center">
    No RM
    {renderSortIcon("noRM")}
  </div>
</th>

<th onClick={() => handleSort("nama")} className="px-4 py-3 cursor-pointer select-none hover:text-blue-600 transition">
  <div className="flex items-center">
    Nama
    {renderSortIcon("nama")}
  </div>
</th>

<th onClick={() => handleSort("nik")} className="px-4 py-3 cursor-pointer select-none hover:text-blue-600 transition">
  <div className="flex items-center justify-center">
    NIK
    {renderSortIcon("nik")}
  </div>
</th>

<th className="px-4 py-3 text-left">
  Alamat
</th>

<th className="px-4 py-3 text-center">
  Tgl Lahir
</th>

<th onClick={() => handleSort("umur")} className="px-4 py-3 cursor-pointer select-none hover:text-blue-600 transition" >
  <div className="flex items-center justify-center">
    Umur
    {renderSortIcon("umur")}
  </div>
</th>

<th className="px-1 py-3 text-center">
  Biometrik
</th>

<th className="px-4 py-3 text-center">
  Aksi
</th>
      </tr>
    </thead>

    <tbody>
      {filtered.map((p) => (
        <tr key={p.noRM} className="border-t hover:bg-slate-50 transition">
          <td className="px-4 py-3 text-center">{p.noRM}</td>
          <td className="px-4 py-3 text-left">{p.nama}</td>
          <td className="px-4 py-3 text-center">{p.nik}</td>
          <td className="px-4 py-3 text-left max-w-[200px] truncate" title={p.alamat}>
  {p.alamat}
</td>
          <td className="px-4 py-3 text-center">
  {p.tanggalLahir
    ? new Date(p.tanggalLahir).toLocaleDateString("id-ID")
    : "-"}
</td>

<td className="px-4 py-3 text-center">{p.umur || "-"}</td>

<td className="px-4 py-3 text-center">
  <div className="flex justify-center">
    {p.descriptor ? (
      <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.7)]"></span>
    ) : (
      <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)]"></span>
    )}
  </div>
</td>

          <td className="px-4 py-3 flex justify-center gap-2">
            <IconButton title="Detail" onClick={() => setDetail(p)}>
              <Eye />
            </IconButton>

<IconButton
  title="Edit"
  primary
  onClick={() => {
    const provCode = getProvinsiCode(p.provinsi);
    const kotaCode = getKotaCode(provCode, p.kota);
    const kecCode = getKecamatanCode(provCode, kotaCode, p.kecamatan);

    const prov = provList.find((pr) => pr.code === provCode);

    if (prov) {
      setKotaList(prov.regencies);

      const kota = prov.regencies.find((k) => k.code === kotaCode);

      if (kota) {
        setKecamatanList(kota.districts);
      }
    }

    const patientData = {
      ...p,
      tanggalLahir: p.tanggalLahir
        ? new Date(p.tanggalLahir).toISOString().split("T")[0]
        : "",
      provinsi: provCode,
      kota: kotaCode,
      kecamatan: kecCode
    };

    setEditData(patientData);
  }}
>
  <Edit />
</IconButton>

            <IconButton
              title="Delete"
              danger
              onClick={() => setConfirmDelete(p)}
            >
              <Trash2 />
            </IconButton>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


        {/* ===== MODALS WITH ANIMATION ===== */}
        <AnimatePresence>
{detail && (
  <Modal title="Detail Pasien" onClose={() => setDetail(null)}>
    {/* STATUS BIOMETRIK */}
<div className="grid grid-cols-2 gap-4 mb-6">

  {/* WAJAH */}
  <div className="flex items-center justify-between border rounded-lg p-3 bg-slate-50">
    <span className="text-slate-500">Biometrik Wajah</span>

    {detail?.descriptor ? (
      <span className="flex items-center gap-2 text-green-600 font-semibold">
        <ScanFace size={16}/>
        Tersedia
      </span>
    ) : (
      <span className="flex items-center gap-2 text-red-500 font-semibold">
        <ScanFace size={16}/>
        Belum Ada
      </span>
    )}

  </div>

  {/* SIDIK JARI */}
  <div className="flex items-center justify-between border rounded-lg p-3 bg-slate-50">
    <span className="text-slate-500">Sidik Jari</span>

    {detail?.fingerprint ? (
      <span className="flex items-center gap-2 text-green-600 font-semibold">
        <Fingerprint size={16}/>
        Tersedia
      </span>
    ) : (
      <span className="flex items-center gap-2 text-red-500 font-semibold">
        <Fingerprint size={16}/>
        Belum Ada
      </span>
    )}

  </div>

</div>
   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2">
      {fieldOrder.map((key) => {
  const value = detail?.[key];
  if (key === "id") return null;

  return (
    <div
  key={key}
  className={`flex justify-between text-sm border rounded-lg p-3 bg-slate-50
  ${key === "catatan" ? "col-span-full flex-col items-start" : ""}`}
>
      <span className="text-slate-500 capitalize">
        {key.replace(/([A-Z])/g, " $1")}
      </span>

      <span className="font-medium text-slate-800 text-right max-w-[60%] break-words">
        {value || "-"}
      </span>
    </div>
  );
})}
    </div>
  </Modal>
)}


{editData && (
  <Modal title="Edit Pasien" onClose={() => setEditData(null)}>


<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[65vh] overflow-y-auto pr-2">

  {/* NO RM */}
  <div className="flex flex-col gap-2">
    <label className="text-sm font-bold text-slate-700 ml-1">
      No. Rekam Medis
    </label>
    <input
      value={editData.noRM || ""}
      disabled
      className="rounded-xl border px-5 py-3.5 bg-slate-100"
    />
  </div>

  {/* NAMA */}
  <Input
    label="Nama Lengkap"
    name="nama"
    value={editData.nama || ""}
    onChange={handleEditChange}
  />

  {/* TEMPAT LAHIR */}
  <Input
    label="Tempat Lahir"
    name="tempatLahir"
    value={editData.tempatLahir || ""}
    onChange={handleEditChange}
  />

  {/* TANGGAL LAHIR */}
  <div className="flex flex-col gap-2">
    <label className="text-sm font-bold text-slate-700 ml-1">
      Tanggal Lahir
    </label>
    <input
      type="date"
      name="tanggalLahir"
      value={editData.tanggalLahir || ""}
      onChange={handleEditChange}
      className="rounded-xl border px-5 py-3.5"
    />
  </div>

  {/* UMUR */}
  <Input
    label="Umur"
    name="umur"
    value={editData.umur || ""}
    disabled
    className="rounded-xl border px-5 py-3.5 bg-slate-100"
  />

  {/* JENIS KELAMIN */}
  <Select
    label="Jenis Kelamin"
    name="jenisKelamin"
    value={editData.jenisKelamin || ""}
    options={["Laki-laki", "Perempuan"]}
    onChange={handleEditChange}
  />

  {/* ALAMAT */}
  <Input
    label="Alamat"
    name="alamat"
    value={editData.alamat || ""}
    onChange={handleEditChange}
  />

  {/* PROVINSI */}
<div className="flex flex-col gap-2">
  <label className="text-sm font-bold text-slate-700 ml-1">
    Provinsi
  </label>

  <select
    name="provinsi"
    value={editData.provinsi || ""}
    onChange={handleEditChange}
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

  {/* KOTA */}
<div className="flex flex-col gap-2">
  <label className="text-sm font-bold text-slate-700 ml-1">
    Kota / Kabupaten
  </label>

  <select
    name="kota"
    value={editData.kota || ""}
    onChange={handleEditChange}
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

  {/* KECAMATAN */}
<div className="flex flex-col gap-2">
  <label className="text-sm font-bold text-slate-700 ml-1">
    Kecamatan
  </label>

  <select
    name="kecamatan"
    value={editData.kecamatan || ""}
    onChange={handleEditChange}
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

  {/* TELEPON */}
  <Input
    label="No Telepon"
    name="telepon"
    value={editData.telepon || ""}
    onChange={handleEditChange}
  />

  {/* AGAMA */}
  <Select
    label="Agama"
    name="agama"
    value={editData.agama || ""}
    options={[
      "Islam",
      "Kristen",
      "Katolik",
      "Hindu",
      "Buddha",
      "Konghucu",
    ]}
    onChange={handleEditChange}
  />

  {/* STATUS PERKAWINAN */}
  <Select
    label="Status Perkawinan"
    name="statusPerkawinan"
    value={editData.statusPerkawinan || ""}
    options={[
      "Belum Kawin",
      "Kawin",
      "Cerai",
    ]}
    onChange={handleEditChange}
  />

  {/* PEKERJAAN */}
<Select
  label="Pekerjaan"
  name="pekerjaan"
  value={editData.pekerjaan || ""}
  options={[
    "PNS",
    "Swasta",
    "Wiraswasta",
    "Pelajar"
  ]}
  onChange={handleEditChange}
/>

  {/* PENDIDIKAN */}
<Select
  label="Pendidikan"
  name="pendidikan"
  value={editData.pendidikan || ""}
  options={[
    "SD",
    "SMP",
    "SMA",
    "D3",
    "S1",
    "S2"
  ]}
  onChange={handleEditChange}
/>

  {/* NAMA IBU */}
  <Input
    label="Nama Ibu"
    name="namaIbu"
    value={editData.namaIbu || ""}
    onChange={handleEditChange}
  />

  {/* PEKERJAAN IBU */}
<Select
  label="Pekerjaan Ibu"
  name="pekerjaanIbu"
  value={editData.pekerjaanIbu || ""}
  options={[
    "IRT",
    "Swasta",
    "PNS"
  ]}
  onChange={handleEditChange}
/>

  {/* NAMA AYAH */}
  <Input
    label="Nama Ayah"
    name="namaAyah"
    value={editData.namaAyah || ""}
    onChange={handleEditChange}
  />

  {/* PEKERJAAN AYAH */}
<Select
  label="Pekerjaan Ayah"
  name="pekerjaanAyah"
  value={editData.pekerjaanAyah || ""}
  options={[
    "Swasta",
    "PNS",
    "Wiraswasta"
  ]}
  onChange={handleEditChange}
/>

  {/* NAMA KK */}
  <Input
    label="Nama Kepala Keluarga"
    name="namaKK"
    value={editData.namaKK || ""}
    onChange={handleEditChange}
  />

  {/* NIK */}
  <Input
    label="NIK"
    name="nik"
    value={editData.nik || ""}
    onChange={handleEditChange}
  />

  {/* JKN */}
  <Input
    label="JKN"
    name="jkn"
    value={editData.jkn || ""}
    onChange={handleEditChange}
  />

  {/* CATATAN FULL */}
  <div className="md:col-span-2 flex flex-col gap-2">
    <label className="text-sm font-bold text-slate-700 ml-1">
      Catatan
    </label>

    <textarea
      name="catatan"
      value={editData.catatan || ""}
      onChange={handleEditChange}
      className="rounded-xl border px-5 py-3.5"
    />
  </div>

</div>
{showBiometricModal && (
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

<button
onClick={() => setShowBiometricModal(null)}
className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
>
<X className="w-6 h-6"/>
</button>

<div className="mb-12 text-center">
<h2 className="text-3xl font-bold text-slate-800">
Otentikasi Biometrik
</h2>
<p className="text-slate-500 mt-3">
Pilih metode identifikasi pasien
</p>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-10">

{/* SIDIK JARI */}
<motion.div
whileHover={{ y: -6 }}
className="border border-slate-200 rounded-3xl p-8 flex flex-col items-center gap-6 hover:border-blue-300 transition-all group bg-gradient-to-br from-white to-blue-50"
>

<div className="w-full h-44 bg-white rounded-2xl flex items-center justify-center relative overflow-hidden shadow-inner">

<Fingerprint className="w-20 h-20 text-blue-500 animate-pulse"/>

</div>

<button
onClick={() => alert("Scanner sidik jari belum tersedia")}
className="w-full py-3 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
>
Scan Sidik Jari
</button>

</motion.div>

{/* WAJAH */}
<motion.div
whileHover={{ y: -6 }}
className="border border-slate-200 rounded-3xl p-8 flex flex-col items-center gap-6 bg-gradient-to-br from-white to-slate-50 hover:border-blue-300 transition-all"
>

<div className="relative w-full h-44 rounded-2xl bg-white shadow-inner overflow-hidden flex items-center justify-center">

<motion.div
className="absolute w-28 h-28 rounded-full border-2 border-blue-300"
animate={{
scale:[1,1.15,1],
opacity:[0.6,0.2,0.6]
}}
transition={{
duration:2.2,
repeat:Infinity,
ease:"easeInOut"
}}
/>

<motion.div
className="absolute top-0 left-0 w-full h-1 bg-blue-400/70"
animate={{y:[0,176,0]}}
transition={{
duration:2.5,
repeat:Infinity,
ease:"linear"
}}
/>

<ScanFace className="w-20 h-20 text-blue-500 z-10 animate-pulse"/>

</div>

<button
onClick={()=>{
setShowBiometricModal(null)
setShowFaceScan(true)
}}
className="w-full py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
>
Scan Wajah
</button>

<p className="text-sm text-slate-500 text-center">
Gunakan kamera untuk verifikasi wajah pasien
</p>

</motion.div>

</div>

</motion.div>
</motion.div>
)}
    {/* BUTTON SECTION */}
<div className="flex gap-3 mt-6">

  {/* SCAN ULANG */}
  <button
    onClick={() => setShowBiometricModal(editData)}
    className="flex items-center justify-center gap-2 flex-1 
    border border-purple-500 text-purple-600 py-3 rounded-xl font-semibold 
    transition-all duration-200 
    hover:bg-purple-500 hover:text-white hover:-translate-y-[2px] hover:shadow-md"
  >
    <Fingerprint size={18} />
    Scan Ulang Biometrik
  </button>

  {/* SIMPAN */}
  <button
    onClick={saveEdit}
    className="flex items-center justify-center gap-2 flex-1 
    border border-blue-600 text-blue-600 py-3 rounded-xl font-semibold 
    transition-all duration-200 
    hover:bg-blue-600 hover:text-white hover:-translate-y-[2px] hover:shadow-md"
  >
    <Save size={18} />
    Simpan Perubahan
  </button>

</div>

  </Modal>
)}

          {confirmDelete && (
            <Modal
              title="Konfirmasi Hapus"
              onClose={() => setConfirmDelete(null)}
            >
              <p className="mb-4 text-sm">
                Hapus data pasien <b>{confirmDelete.nama}</b>?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={deleteRow}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg"
                >
                  Hapus
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 border rounded-lg py-2"
                >
                  Batal
                </button>
              </div>
            </Modal>
          )}
        </AnimatePresence>
        {showFaceScan && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div className="bg-white rounded-3xl w-full max-w-4xl p-10 shadow-2xl relative">

      <button
        onClick={() => setShowFaceScan(false)}
        className="absolute top-4 right-4"
      >
        <X />
      </button>

      <h2 className="text-xl font-semibold text-center mb-6">
        Perekaman Wajah Pasien
      </h2>

      <FaceScanner
        mode="register"
        onComplete={async (descriptor) => {

  const res = await fetch(
    `http://127.0.0.1:5000/update-biometric/${editData.noRM}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descriptor })
    }
  )

  const result = await res.json()

  if (result.status === "success") {

    setRows(prev =>
      prev.map(p =>
        p.noRM === editData.noRM
          ? { ...p, descriptor }
          : p
      )
    )

    if (detail) {
      setDetail(prev => ({
        ...prev,
        descriptor
      }))
    }

    setShowFaceScan(false)

    toast.success("Biometrik wajah berhasil diperbarui")
  }

}}
      />

    </div>
  </div>
)}

      </div>
    </Page>
  );
}

/* ===== COMPONENTS ===== */
function IconButton({ children, danger, primary, ...props }) {
  return (
    <button
      {...props}
      className={`p-2 rounded-lg border transition ${
        danger
          ? "text-red-600 hover:bg-red-50 border-red-200"
          : primary
          ? "text-blue-600 hover:bg-blue-50 border-blue-200"
          : "hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white w-[95vw] max-w-4xl max-h-[85vh] rounded-2xl p-8 relative shadow-2xl flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X />
        </button>
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        {children}
      </motion.div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-slate-700 ml-1">
        {label}
      </label>
      <input
        {...props}
        className="rounded-xl border border-slate-200 px-5 py-3.5 bg-slate-50/30 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500"
      />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-slate-700 ml-1">
        {label}
      </label>
      <select
        {...props}
        className="rounded-xl border border-slate-200 px-5 py-3.5 bg-slate-50/30 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500"
      >
        <option value="">Pilih</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}