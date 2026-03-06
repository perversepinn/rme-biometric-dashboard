import { LayoutDashboard, UserPlus, Users, ClipboardList, LogOut, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar({ active, setActive }) {
  const menu = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "pendaftaranPasien", label: "Pendaftaran Pasien", icon: UserCheck }, // BARU
    { key: "pendaftaran", label: "Pendaftaran Biometrik", icon: UserPlus },
    { key: "pasien", label: "Data Pasien", icon: Users },
    { key: "audit", label: "Audit Log", icon: ClipboardList },
    { key: "dummyForm", label: "Form Pasien", icon: ClipboardList }, 
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <ClipboardList className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-tight">RME</h1>
          <p className="text-xs text-slate-500 font-medium">Smart Healthcare</p>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-2">
        {menu.map((item) => (
          <button
            key={item.key}
            onClick={() => setActive(item.key)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group
              ${active === item.key
                ? "bg-blue-50 text-blue-600 font-semibold"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
          >
            {active === item.key && (
              <motion.div layoutId="activeTab" className="absolute left-0 w-1.5 h-6 bg-blue-600 rounded-r-full" />
            )}
            <item.icon className={`w-5 h-5 ${active === item.key ? "scale-110" : "group-hover:scale-110"}`} />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() => window.location.reload()}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
