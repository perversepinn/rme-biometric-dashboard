import { Search, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Header() {
    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-xl w-96 group focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-300">
                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500" />
                <input
                    type="text"
                    placeholder="Cari pasien atau jadwal..."
                    className="bg-transparent border-none focus:ring-0 text-sm w-full text-slate-600 placeholder:text-slate-400"
                />
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800">Administrator</p>
                        <p className="text-xs text-slate-500">Puskesmas Pusat</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100 overflow-hidden border-2 border-white">
                        <User className="w-6 h-6" />
                    </div>
                </div>
            </div>
        </header>
    );
}
