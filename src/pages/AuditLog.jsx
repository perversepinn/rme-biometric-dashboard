import { Eye, X } from "lucide-react";
import { useState } from "react";
import Page from "../components/Page";

export default function AuditLog({ logs }) {
  const [detail, setDetail] = useState(null);

  return (
    <Page>
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Audit Log Aktivitas</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-left">Waktu</th>
              <th className="px-4 py-3 text-left">Aksi</th>
              <th className="px-4 py-3 text-left">No RM</th>
              <th className="px-4 py-3 text-left">Nama Pasien</th>
              <th className="px-4 py-3 text-left">Petugas</th>
              <th className="px-4 py-3 text-center">Detail</th>
            </tr>
          </thead>

          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-slate-500">
                  Belum ada aktivitas
                </td>
              </tr>
            ) : (
              logs.map((l, i) => (
                <tr key={i} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3">{l.waktu}</td>
                  <td className="px-4 py-3 font-medium">{l.aksi}</td>
                  <td className="px-4 py-3">{l.noRM}</td>
                  <td className="px-4 py-3">{l.nama}</td>
                  <td className="px-4 py-3">{l.petugas}</td>
                  <td className="px-4 py-3 text-center">
                    {l.aksi === "EDIT" ? (
                      <button
                        onClick={() => setDetail(l)}
                        className="p-2 rounded-lg border hover:bg-slate-100"
                        title="Lihat Detail Perubahan"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DETAIL */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg relative">
            <button
              onClick={() => setDetail(null)}
              className="absolute right-4 top-4 text-slate-400"
            >
              <X />
            </button>

            <h2 className="text-lg font-semibold mb-4">
              Detail Perubahan Data
            </h2>

            <p className="text-sm mb-4">
              Petugas: <b>{detail.petugas}</b>
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-medium mb-2 text-slate-600">Sebelum</h3>
                <p>Nama: {detail.before.nama}</p>
                <p>NIK: {detail.before.nik}</p>
                <p>Alamat: {detail.before.alamat}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2 text-slate-600">Sesudah</h3>
                <p>Nama: {detail.after.nama}</p>
                <p>NIK: {detail.after.nik}</p>
                <p>Alamat: {detail.after.alamat}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </Page>
  );
}
