import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  User, 
  Phone, 
  Calendar, 
  Eye, 
  ChevronLeft,
  FileText,
  Filter,
  Plus,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Patient } from '../types';
import { VisionDB, db as dexieDb } from '../lib/db';

export default function PatientRecords() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async (search = '') => {
    setLoading(true);
    try {
      if (search) {
        const data = await VisionDB.searchPatients(search);
        setPatients(data);
      } else {
        const data = await VisionDB.getAllPatients();
        setPatients(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المريض وجميع فحوصاته السابقة؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    try {
      await dexieDb.patients.delete(id);
      // Also delete exams for this patient
      await dexieDb.examinations.where('patient_id').equals(id).delete();
      fetchPatients(searchTerm);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;
    try {
      await dexieDb.patients.put(editingPatient);
      setEditingPatient(null);
      fetchPatients(searchTerm);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    fetchPatients(val);
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">سجلات المرضى</h2>
          <p className="text-slate-500 mt-1">عرض وإدارة جميع حالات المرضى والتقارير السابقة</p>
        </div>
        <button 
          onClick={() => navigate('/exam/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>إضافة مريض جديد</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="ابحث بالاسم، رقم الهاتف، أو رقم الملف..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full bg-slate-50 border-none rounded-xl py-2 pr-12 pl-4 focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-colors">
          <Filter size={18} />
          <span>تصفية</span>
        </button>
      </div>

      {/* Patients Table/Grid */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-sm font-bold text-slate-500">مريض</th>
                <th className="px-6 py-5 text-sm font-bold text-slate-500">رقم الهاتف</th>
                <th className="px-6 py-5 text-sm font-bold text-slate-500">رقم الملف</th>
                <th className="px-6 py-5 text-sm font-bold text-slate-500">تاريخ التسجيل</th>
                <th className="px-6 py-5 text-sm font-bold text-slate-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-20 text-slate-400">جاري التحميل...</td></tr>
              ) : patients.length > 0 ? patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{patient.name}</p>
                        <p className="text-xs text-slate-400">{patient.age} سنة / {patient.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                      <Phone size={14} className="text-slate-400" />
                      <span className="font-mono">{patient.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-tight">
                      {patient.file_number}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <Calendar size={14} className="text-slate-300" />
                      {format(new Date(patient.created_at), 'dd MMMM yyyy', { locale: ar })}
                    </div>
                  </td>
                  <td className="px-6 py-2">
                    <div className="flex items-center gap-2">
                      <button 
                         onClick={() => navigate(`/patients/${patient.id}`)}
                         className="p-2 hover:bg-sky-50 text-sky-600 rounded-lg transition-colors border border-transparent hover:border-sky-100"
                         title="عرض السجل"
                      >
                         <FileText size={18} />
                      </button>
                      <button 
                         onClick={() => setEditingPatient(patient)}
                         className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors border border-transparent hover:border-amber-100"
                         title="تعديل البيانات"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                         onClick={() => handleDelete(patient.id)}
                         className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100"
                         title="حذف المريض"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button 
                         onClick={() => navigate(`/patients/${patient.id}`)}
                         className="mr-2 p-2 hover:bg-slate-100 text-slate-400 rounded-lg transition-colors"
                      >
                        <ChevronLeft size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center py-20">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="text-slate-200" size={40} />
                    </div>
                    <p className="text-slate-400 font-medium">لم يتم العثور على أي نتائج</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Edit Patient Modal */}
      <AnimatePresence>
        {editingPatient && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setEditingPatient(null)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-slate-200"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-800">تعديل بيانات المريض</h3>
                <button 
                  onClick={() => setEditingPatient(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الاسم الكامل</label>
                  <input 
                    type="text" 
                    value={editingPatient.name} 
                    onChange={e => setEditingPatient({...editingPatient, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-4 focus:ring-2 focus:ring-sky-500/20 font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">العمر</label>
                    <input 
                      type="number" 
                      value={editingPatient.age} 
                      onChange={e => setEditingPatient({...editingPatient, age: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-4 focus:ring-2 focus:ring-sky-500/20 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الجنس</label>
                    <select 
                      value={editingPatient.gender} 
                      onChange={e => setEditingPatient({...editingPatient, gender: e.target.value as any})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-4 focus:ring-2 focus:ring-sky-500/20 font-bold"
                    >
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">رقم الهاتف</label>
                  <input 
                    type="text" 
                    value={editingPatient.phone} 
                    onChange={e => setEditingPatient({...editingPatient, phone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-4 focus:ring-2 focus:ring-sky-500/20 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">العنوان</label>
                  <input 
                    type="text" 
                    value={editingPatient.address} 
                    onChange={e => setEditingPatient({...editingPatient, address: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-4 focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="submit"
                    className="flex-grow py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                  >
                    حفظ التغييرات
                  </button>
                  <button 
                    type="button"
                    onClick={() => setEditingPatient(null)}
                    className="px-6 py-3 bg-slate-50 text-slate-500 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
