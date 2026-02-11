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

export default function DataPasien({ auditLogs, setAuditLogs, user }) {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [editData, setEditData] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // 🔥 AMBIL DATA DARI DATABASE
  useEffect(() => {
    fetch("http://127.0.0.1:5000/patients")
      .then((res) => res.json())
      .then((data) => setRows(data))
      .catch((err) => console.error("Gagal ambil data pasien", err));
  }, []);

  const filtered = useMemo(() => {
    return rows.filter(
      (p) =>
        p.nama.toLowerCase().includes(search.toLowerCase()) ||
        p.nik.includes(search),
    );
  }, [rows, search]);

  /* ===== AUDIT ===== */
const saveEdit = async () => {
  try {
    const res = await fetch(
      `http://127.0.0.1:5000/update-patient/${editData.noRM}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      }
    );

    const result = await res.json();

    if (result.status === "success") {
      setRows((prev) =>
        prev.map((p) => (p.noRM === editData.noRM ? editData : p))
      );
      setEditData(null);
    }
  } catch (err) {
    alert("Gagal update");
  }
};



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
    const doc = new jsPDF();
    doc.text("Laporan Data Pasien Puskesmas", 14, 16);

    autoTable(doc, {
      startY: 22,
      head: [["No RM", "Nama", "NIK", "Alamat", "Tanggal"]],
      body: filtered.map((p) => [p.noRM, p.nama, p.nik, p.alamat, p.tanggal]),
    });

    doc.save("data-pasien.pdf");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Pasien");
    XLSX.writeFile(wb, "data-pasien.xlsx");
  };

const [scanMode, setScanMode] = useState(false);

const [showRescan, setShowRescan] = useState(null);

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
<div className="bg-white rounded-xl shadow-sm w-full overflow-x-auto">
  <table className="w-full text-sm table-auto">
    <thead className="bg-slate-100">
      <tr>
        {["No RM", "Nama", "NIK", "Alamat", "Tanggal", "Aksi"].map((h) => (
          <th key={h} className="px-4 py-3 text-left">
            {h}
          </th>
        ))}
      </tr>
    </thead>

    <tbody>
      {filtered.map((p) => (
        <tr key={p.noRM} className="border-t hover:bg-slate-50 transition">
          <td className="px-4 py-3">{p.noRM}</td>
          <td className="px-4 py-3">{p.nama}</td>
          <td className="px-4 py-3">{p.nik}</td>
          <td className="px-4 py-3">{p.alamat}</td>
          <td className="px-4 py-3">{p.tanggal || "-"}</td>
          <td className="px-4 py-3 flex gap-2">
            <IconButton title="Detail" onClick={() => setDetail(p)}>
              <Eye />
            </IconButton>

            <IconButton title="Edit" onClick={() => setEditData(p)}>
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
    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
      {Object.entries(detail).map(([key, value]) => (
        <div
          key={key}
          className="flex justify-between text-sm border-b pb-2"
        >
          <span className="text-slate-500 capitalize">
            {key.replace(/([A-Z])/g, " $1")}
          </span>
          <span className="font-medium text-slate-800 text-right max-w-[60%] break-words">
            {value || "-"}
          </span>
        </div>
      ))}
    </div>
  </Modal>
)}


{editData && (
  <Modal title="Edit Pasien" onClose={() => setEditData(null)}>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto pr-2">

      {Object.keys(editData).map((key) => {
        if (key === "id") return null;

        return (
          <div key={key} className="flex flex-col">
            <label className="text-xs text-slate-500 mb-1 capitalize">
              {key.replace(/([A-Z])/g, " $1")}
            </label>
            <input
              value={editData[key] || ""}
              onChange={(e) =>
                setEditData({ ...editData, [key]: e.target.value })
              }
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        );
      })}

    </div>

    {/* BUTTON SECTION */}
    <div className="flex gap-4 mt-6">
      <button
  onClick={() => setShowRescan(editData)}
  className="w-full bg-purple-600 text-white py-2 rounded-lg mb-3"
>
  Scan Ulang Biometrik
</button>


      <button
        onClick={saveEdit}
        className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold"
      >
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
        {showRescan && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-white rounded-2xl p-6 w-full max-w-3xl relative">
      <h2 className="text-lg font-semibold mb-4 text-center">
        Scan Ulang Biometrik
      </h2>

      <FaceScanner
        mode="verify"
        onComplete={async (descriptor) => {
          await fetch(
            `http://127.0.0.1:5000/update-biometric/${showRescan.noRM}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ descriptor }),
            }
          );

          setShowRescan(null);
          alert("Biometrik berhasil diperbarui");
        }}
      />

      <button
        onClick={() => setShowRescan(null)}
        className="absolute top-4 right-4"
      >
        <X />
      </button>
    </div>
  </div>
)}

      </div>
    </Page>
  );
}

/* ===== COMPONENTS ===== */
function IconButton({ children, danger, ...props }) {
  return (
    <button
      {...props}
      className={`p-2 rounded-lg border transition ${
        danger
          ? "text-red-600 hover:bg-red-50 border-red-200"
          : "hover:bg-slate-100"
      }`}
    >
      <div className="flex-1 overflow-y-auto pr-2">
  {children}
</div>

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
        className="bg-white w-[95vw] h-[90vh] rounded-2xl p-8 relative shadow-2xl overflow-hidden flex flex-col"
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
