import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { VisionDB } from '../lib/db';
import { 
  Users, 
  Eye, 
  Activity, 
  TrendingUp, 
  Plus,
  ArrowUpRight,
  Clock,
  Calendar as CalendarIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from 'recharts';

const data = [
  { name: 'السبت', count: 12 },
  { name: 'الأحد', count: 19 },
  { name: 'الأثنين', count: 15 },
  { name: 'الثلاثاء', count: 22 },
  { name: 'الأربعاء', count: 30 },
  { name: 'الخميس', count: 25 },
];

export default function Dashboard() {
  const [stats, setStats] = useState({ totalPatients: 0, totalExams: 0, recentExams: [] as any[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const patients = await VisionDB.getAllPatients();
      const exams = await VisionDB.getAllExaminations();
      
      setStats({
        totalPatients: patients.length,
        totalExams: exams.filter(e => {
          const today = new Date().toISOString().split('T')[0];
          return e.date.startsWith(today);
        }).length,
        recentExams: exams.slice(0, 5).map(e => ({
          name: e.patient_name || 'غير معروف',
          date: e.date,
          diagnosis: e.diagnosis
        }))
      });
      setLoading(false);
    }
    loadData();
  }, []);

  const cards = [
    { label: 'إجمالي المرضى', value: stats.totalPatients, icon: Users, color: 'sky', trend: '+12%' },
    { label: 'فحوصات اليوم', value: stats.totalExams, icon: Eye, color: 'sky', trend: '+5' },
    { label: 'دقة التشخيص', value: '98%', icon: Activity, color: 'emerald', trend: 'ثابت' },
    { label: 'معدل النمو', value: '15%', icon: TrendingUp, color: 'slate', trend: '+2%' },
  ];

  return (
    <div className="space-y-6 pb-10 h-full overflow-y-auto no-scrollbar">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-2 rounded-2xl border border-sky-300 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
          >
            <div className={`p-3 rounded-xl w-fit mb-2 bg-${card.color}-50 text-${card.color}-600`}>
              <card.icon size={20} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{card.value}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${card.trend.includes('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {card.trend}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-12 gap-6 h-[400px]">
        <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-2xl border border-sky-500 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">نشاط الفحوصات الأسبوعي</h3>
            <div className="flex gap-2">
               <span className="w-3 h-3 bg-sky-500 rounded-full"></span>
               <span className="text-[10px] font-bold text-slate-400 uppercase">النمو</span>
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} />
                <Tooltip 
                   contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Exams */}
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-2xl border border-sky-400 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">آخر الفحوصات</h3>
            <button className="text-sky-600 font-bold text-[10px] uppercase hover:underline">عرض الكل</button>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar">
            {stats.recentExams.length > 0 ? stats.recentExams.map((exam: any, i) => (
              <div key={i} className="flex items-center gap-3 group cursor-pointer p-3 rounded-xl border border-slate-50 hover:border-sky-100 hover:bg-sky-50/50 transition-all">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-sky-600 group-hover:text-white transition-all text-sm italic">
                  {exam.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{exam.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{new Date(exam.date).toLocaleDateString('ar-EG')}</p>
                </div>
                <div className="text-[9px] font-black text-sky-600 bg-sky-50 px-2 py-1 rounded group-hover:bg-white transition-colors uppercase">
                  {exam.diagnosis || 'قيد المعالجة'}
                </div>
              </div>
            )) : (
              <div className="text-center py-10">
                <Clock className="text-slate-200 mx-auto mb-2" size={32} />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">لا توجد سجلات</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
