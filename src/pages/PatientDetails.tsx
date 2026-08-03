import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  ChevronRight, 
  Calendar, 
  FileText, 
  Clock,
  ChevronLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Patient, Examination } from '../types';
import { VisionDB } from '../lib/db';

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [exams, setExams] = useState<Examination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      const patientId = Number(id);
      const p = await VisionDB.getPatient(patientId);
      const examsData = await VisionDB.getPatientExaminations(patientId);
      setPatient(p || null);
      setExams(examsData);
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading || !patient) return <div className="p-10 text-center">جاري التحميل...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/patients')}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
        >
          <ChevronRight size={24} />
        </button>
        <div>
          <h2 className="text-3xl font-bold text-slate-900">{patient.name}</h2>
          <p className="text-slate-500 mt-1">تاريخ المرضي وسجل الفحوصات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patient Profile Card */}
        <div className="md:col-span-1 bg-white p-6 rounded-[2.5rem] border border-slate-400 shadow-sm h-fit space-y-6">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold">
            {patient.name.charAt(0)}
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-slate-500 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">رقم التواصل</p>
              <p className="font-bold text-slate-900">{patient.phone}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">العمر / النوع</p>
              <p className="font-bold text-slate-900">{patient.age} سنة - {patient.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">رقم الملف</p>
              <p className="font-bold text-blue-600">{patient.file_number}</p>
            </div>
          </div>
        </div>

        {/* Exams History List */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2 mr-2">
            <Clock className="text-slate-400" size={20} />
            سجل الفحوصات
          </h3>
          
          <div className="space-y-3">
            {exams.length > 0 ? exams.map((exam) => (
              <div 
                key={exam.id}
                onClick={() => navigate(`/reports/${exam.id}`)}
                className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{format(new Date(exam.date), 'dd MMMM yyyy (HH:mm)', { locale: ar })}</p>
                    <p className="text-xs text-slate-400 font-medium truncate max-w-[300px]">{exam.diagnosis}</p>
                  </div>
                </div>
                <ChevronLeft size={20} className="text-slate-300 group-hover:text-blue-600 group-hover:-translate-x-1 transition-all" />
              </div>
            )) : (
              <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                <FileText className="mx-auto text-slate-200 mb-4" size={40} />
                <p className="text-slate-400 font-medium">لا توجد فحوصات سابقة لهذا المريض</p>
                <button 
                  onClick={() => navigate('/exam/new')}
                  className="mt-4 text-blue-600 font-bold hover:underline"
                >
                  بدء فحص جديد
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
