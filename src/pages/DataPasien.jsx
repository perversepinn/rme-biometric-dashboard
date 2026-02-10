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
  const saveEdit = () => {
    const before = rows.find((p) => p.noRM === editData.noRM);

    setRows((prev) =>
      prev.map((p) => (p.noRM === editData.noRM ? editData : p)),
    );

    setAuditLogs((prev) => [
      {
        waktu: new Date().toLocaleString(),
        aksi: "EDIT",
        noRM: editData.noRM,
        nama: editData.nama,
        petugas: user.username,
        before: { ...before },
        after: { ...editData },
      },
      ...prev,
    ]);

    setEditData(null);
  };

  const deleteRow = () => {
    setRows((prev) => prev.filter((p) => p.noRM !== confirmDelete.noRM));

    setAuditLogs((prev) => [
      {
        waktu: new Date().toLocaleString(),
        aksi: "DELETE",
        noRM: confirmDelete.noRM,
        nama: confirmDelete.nama,
        petugas: user.username,
      },
      ...prev,
    ]);

    setConfirmDelete(null);
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
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                {["No RM", "Nama", "NIK", "Alamat", "Tanggal", "Aksi"].map(
                  (h) => (
                    <th key={h} className="px-4 py-3 text-left">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.noRM}
                  className="border-t hover:bg-slate-50 transition"
                >
                  <td className="px-4 py-3">{p.noRM}</td>
                  <td className="px-4 py-3">{p.nama}</td>
                  <td className="px-4 py-3">{p.nik}</td>
                  <td className="px-4 py-3">{p.alamat}</td>
                  <td className="px-4 py-3">{p.tanggal}</td>
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
              {Object.entries(detail).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </Modal>
          )}

          {editData && (
            <Modal title="Edit Pasien" onClose={() => setEditData(null)}>
              {["nama", "nik", "alamat"].map((f) => (
                <input
                  key={f}
                  value={editData[f]}
                  onChange={(e) =>
                    setEditData({ ...editData, [f]: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 mb-3"
                />
              ))}
              <button
                onClick={saveEdit}
                className="w-full bg-blue-600 text-white py-2 rounded-lg"
              >
                Simpan
              </button>
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
        className="bg-white p-6 rounded-xl w-full max-w-md relative shadow-lg"
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
