import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import PendaftaranPasien from "./pages/PendaftaranPasien";
import Pendaftaran from "./pages/Pendaftaran";
import DataPasien from "./pages/DataPasien";
import AuditLog from "./pages/AuditLog";
import Login from "./pages/Login";
import { AnimatePresence, motion } from "framer-motion";

export default function App() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("dashboard");
  const [auditLogs, setAuditLogs] = useState([]);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active={active} setActive={setActive} />

      <main className="flex-1 flex flex-col">
        {/* <Header /> */}

        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {active === "dashboard" && <Dashboard activeTab={active} />}
                {active === "pendaftaranPasien" && (
                  <PendaftaranPasien setActive={setActive} />
                )}
                {active === "pendaftaran" && <Pendaftaran />}
                {active === "pasien" && (
                  <DataPasien
                    auditLogs={auditLogs}
                    setAuditLogs={setAuditLogs}
                    user={user}
                  />
                )}
                {active === "audit" && (
                  <AuditLog logs={auditLogs} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
