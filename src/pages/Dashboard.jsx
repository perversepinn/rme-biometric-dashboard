import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, Activity, Fingerprint, TrendingUp } from "lucide-react";
import Page from "../components/Page";
import { motion } from "framer-motion";

const stats = [
  {
    title: "Total Pasien",
    value: "1.245",
    change: "+12.5%",
    icon: Users,
    color: "from-blue-600 to-blue-400",
    shadow: "shadow-blue-200",
  },
  {
    title: "Kunjungan Hari Ini",
    value: "48",
    change: "+8.2%",
    icon: Activity,
    color: "from-emerald-600 to-emerald-400",
    shadow: "shadow-emerald-200",
  },
  {
    title: "Biometrik Terdaftar",
    value: "32",
    change: "+24.0%",
    icon: Fingerprint,
    color: "from-violet-600 to-violet-400",
    shadow: "shadow-violet-200",
  },
];

const dataPasien = [
  { hari: "Sen", jumlah: 12 },
  { hari: "Sel", jumlah: 18 },
  { hari: "Rab", jumlah: 10 },
  { hari: "Kam", jumlah: 22 },
  { hari: "Jum", jumlah: 30 },
  { hari: "Sab", jumlah: 25 },
  { hari: "Min", jumlah: 15 },
];

export default function Dashboard({ activeTab }) {
  const [animateChart, setAnimateChart] = useState(false);
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    setAnimateChart(false);

    const t = setTimeout(() => {
      setChartKey((prev) => prev + 1); // paksa chart mount ulang
      setAnimateChart(true);           // mulai animasi garis
    }, 150);

    return () => clearTimeout(t);
  }, [activeTab]);

  return (
    <Page>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ringkasan Dashboard</h2>
          <p className="text-slate-500">
            Selamat datang kembali, berikut adalah statistik hari ini.
          </p>
        </div>

        {/* STATISTIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{item.title}</p>
                  <h3 className="text-3xl font-bold text-slate-800">{item.value}</h3>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-500">{item.change}</span>
                    <span className="text-xs text-slate-400 ml-1">dari bulan lalu</span>
                  </div>
                </div>
                <div className={`p-4 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg ${item.shadow}`}>
                  <item.icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CHART */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 w-full"
        >
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-800">Tren Kunjungan Pasien</h3>
            <p className="text-sm text-slate-400">Statistik mingguan periode Jan 2026</p>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart key={chartKey} data={dataPasien}>
                <defs>
                  <linearGradient id="colorJumlah" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hari" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={10}/>
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }}/>

                <Tooltip
                  contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  cursor={{ stroke: "#3b82f6", strokeWidth: 2 }}
                />

                <Area
                  type="monotone"
                  dataKey="jumlah"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorJumlah)"
                  isAnimationActive={animateChart}
                  animationDuration={1400}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </Page>
  );
}
