import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Label
} from "recharts";
import { Users, Fingerprint, TrendingUp, ScanFace } from "lucide-react";
import Page from "../components/Page";
import { motion } from "framer-motion";


export default function Dashboard({ activeTab }) {

  const [biometricChart, setBiometricChart] = useState([]);
const [chartKey, setChartKey] = useState(0);
const totalBiometrik = biometricChart.reduce(
  (sum, item) => sum + item.value,
  0
);

const wajah = biometricChart.find(i => i.name === "Wajah")?.value || 0;
const persen = totalBiometrik
  ? Math.round((wajah / totalBiometrik) * 100)
  : 0;

const COLORS = [
  "#8b5cf6",  // wajah
  "#10b981",  // sidik jari
  "#3b82f6",  // keduanya
  "#e5e7eb"   // belum
];

const [statsData, setStatsData] = useState({
  totalPasien: 0,
  wajahTerdaftar: 0,
  sidikJariTerdaftar: 0
});

const stats = [
  {
    title: "Total Pasien",
    value: statsData.totalPasien,
    icon: Users,
    color: "from-blue-600 to-blue-400",
    shadow: "shadow-blue-200",
  },
  {
    title: "Sidik Jari Terdaftar",
    value: statsData.sidikJariTerdaftar,
    icon: Fingerprint,
    color: "from-emerald-600 to-emerald-400",
    shadow: "shadow-emerald-200",
  },
  {
    title: "Wajah Terdaftar",
    value: statsData.wajahTerdaftar,
    icon: ScanFace,
    color: "from-violet-600 to-violet-400",
    shadow: "shadow-violet-200",
  },
];

useEffect(() => {
  if (activeTab === "dashboard") {

    fetch("http://127.0.0.1:5000/dashboard-stats")
      .then(res => res.json())
      .then(data => {
        setStatsData(data.stats)
        setBiometricChart(data.biometricChart)

        // trigger re-render chart
        setChartKey(prev => prev + 1)
      })
      .catch(err => console.error(err))

  }
}, [activeTab])

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
                </div>
                <div className={`p-4 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg ${item.shadow}`}>
                  <item.icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CHART */}
<div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100">

  <div className="mb-10">
    <h3 className="text-xl font-bold text-slate-800">
      Status Biometrik Pasien
    </h3>
    <p className="text-sm text-slate-400">
      Persentase pasien dengan biometrik terdaftar
    </p>
  </div>

  <div className="grid md:grid-cols-2 gap-12 items-center">

    {/* CHART */}
    <div className="h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart key={chartKey}>
          <Pie
  data={biometricChart}
  dataKey="value"
  nameKey="name"
  innerRadius={120}
  outerRadius={170}
  paddingAngle={4}
  stroke="none"
  isAnimationActive={true}
  animationDuration={1200}
>
            {biometricChart.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}

            <Label
              value={`${persen}%`}
              position="center"
              className="text-4xl font-bold fill-slate-800"
            />

          </Pie>

          <Tooltip
            contentStyle={{
              borderRadius: "16px",
              border: "none",
              boxShadow: "0 10px 20px rgba(0,0,0,0.12)"
            }}
          />

        </PieChart>
      </ResponsiveContainer>
    </div>


    {/* LEGEND */}
    <div className="space-y-6">

      {biometricChart.map((item, index) => (

        <div
          key={index}
          className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:shadow-sm transition"
        >

          <div className="flex items-center gap-4">

            <div
              className="w-4 h-4 rounded-full"
              style={{ background: COLORS[index] }}
            />

            <span className="text-base font-semibold text-slate-700">
              {item.name}
            </span>

          </div>

          <span className="text-xl font-bold text-slate-800">
            {item.value}
          </span>

        </div>

      ))}

    </div>

  </div>

</div>
      </div>
    </Page>
  );
}
