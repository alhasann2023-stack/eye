import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { QRCodeSVG } from 'qrcode.react';
import Settings from './Settings';

import { 
  Printer, 
  Download, 
  ChevronRight, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail,
  Activity,
  AlertTriangle,
  Stethoscope
} from 'lucide-react';
import { Examination, HospitalSettings } from '../types';
import { VisionDB } from '../lib/db';

export default function ReportPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const componentRef = useRef<HTMLDivElement>(null);
  const [exam, setExam] = useState<Examination | null>(null);
  const [settings, setSettings] = useState<HospitalSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      const examData = await VisionDB.getExamination(parseInt(id));
      const settingsData = await VisionDB.getSettings();
      setExam(examData || null);
      setSettings(settingsData);
      setLoading(false);
    }
    loadData();
  }, [id]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Report_${exam?.patient_name}_${id}`,
  });
  
  const formatRx = (val: string | number | undefined | null) => {
    if (val === undefined || val === null || val === '') return '---';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return val;
    return (num >= 0 ? '+' : '') + num.toFixed(2);
  };


  if (loading || !exam || !settings) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 no-scrollbar overflow-x-hidden">
      {/* Actions Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm sticky top-24 z-20 no-print">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/patients')}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
          >
            <ChevronRight size={24} />
          </button>
          <div>
            <h3 className="font-bold">معاينة التقرير الطبي</h3>
            <p className="text-xs text-slate-400">رقم الفحص: #{exam.id}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handlePrint()}
            className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-sky-100"
          >
            <Printer size={18} />
            <span>طباعة مباشر (A5 Portrait)</span>
          </button>
        </div>
      </div>

      {/* Report Component Wrapper */}
      <div className="flex justify-center bg-slate-200/50 p-2 md:p-4 rounded-[2rem] overflow-x-auto min-h-screen">
        {/* A5 Container: 148mm x 210mm */}
        <div 
          ref={componentRef}
          dir="rtl"
          className="bg-white shadow-2xl w-[148mm] min-h-[210mm] p-6 relative flex flex-col print:shadow-none print:w-[148mm] print:h-[210mm] print:m-0 print:border-0"
          style={{ 
            fontFamily: '"Inter", "IBM Plex Sans Arabic", sans-serif',
            boxSizing: 'border-box'
          }}
        >
          {/* 1. Header Section */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {settings.logo ? (
                  <img src={settings.logo} alt="clinic logo" className="w-12 h-12 object-contain" />
                ) : (
                  <div className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center text-white font-bold text-lg">V</div>
                )}
                <div>
                  <h1 className="text-sm font-bold text-[#003B73]">{settings.name}</h1>
                  <p className="text-[8px] text-slate-400 font-medium">{settings.description || 'Vision Care Center'}</p>
                </div>
              </div>
              <div className="mt-1 space-y-0.5 text-[8px] text-slate-500">
                <div className="flex items-center gap-1.5"><Phone size={8} className="text-sky-600" /> <span>{settings.phone}</span></div>
                <div className="flex items-center gap-1.5"><Mail size={8} className="text-sky-600" /> <span>{settings.email}</span></div>
                <div className="flex items-center gap-1.5"><MapPin size={8} className="text-sky-600" /> <span>{settings.address}</span></div>
              </div>
            </div>

            <div className="text-center pt-1">
              <h2 className="text-lg font-black text-[#003B73] border-b border-[#003B73] pb-0.5 inline-block px-3">تقرير فحص النظر</h2>
              <p className="text-[8px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">EYE REPORT</p>
              <div className="mt-2 flex flex-col items-center gap-0.5 text-[8px] font-bold text-slate-600">
                <div className="flex gap-1"><span>#REF:</span> <span className="font-mono">{exam.id}</span></div>
                <div>{new Date(exam.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="border border-slate-100 p-1 rounded-md">
                <QRCodeSVG 
                  value={settings.phone ? `https://wa.me/${settings.phone.replace(/[^0-9]/g, '')}` : `tel:${settings.phone}`} 
                  size={45} 
                  level="H" 
                />
              </div>
              <p className="text-[6px] font-bold text-slate-300 mt-0.5">WHATSAPP CONTACT</p>
            </div>
          </div>

          <div className="border-b border-slate-100 mb-1" />

          {/* 2. Patient Information */}
          <section className="mb-2">
            <div className="bg-[#003B73] text-white py-1 px-3 rounded-t-md flex justify-between items-center text-[10px] font-bold uppercase">
              <span>Patient Info / بيانات المريض</span>
            </div>
            <div className="border border-slate-300 border-t-0 rounded-b-md p-1 grid grid-cols-12 gap-3 relative bg-slate-50/20">
              <div className="col-span-12 grid grid-cols-3 gap-y-2 gap-x-4 text-[9px]">
                <div className="flex  border-b border-slate-100 pb-0.5">
                  <span className="text-slate-400">Name:</span>
                  <span className="font-bold text-slate-800 text-[10px]">{exam.patient_name}</span>
                </div>
                <div className="flex  border-b border-slate-100 pb-0.5">
                  <span className="text-slate-400">Age:</span>
                  <span className="font-bold text-slate-800 text-[10px]">{exam.age} Yr</span>
                </div>                
                <div className="flex  border-b border-slate-100 pb-0.5">
                  <span className="text-slate-400">File No:</span>
                  <span className="font-bold text-slate-800 font-mono text-[10px]">{exam.file_number}</span>
                </div>



              </div>
            </div>
                            {(parseFloat(exam.od_iop) > 21 || parseFloat(exam.os_iop) > 21) && (
                  <div className="col-span-2 mt-1">
                    <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded border border-red-200 uppercase tracking-tighter flex items-center gap-1">
                      <AlertTriangle size={10} />
                      IOP Alert: High Pressure / ضغط عين مرتفع
                    </span>
                  </div>
                )}
          </section>

          {/* 3. Refraction Results */}
          <section className="mb-1">
            <div className="bg-[#003B73] text-white py-1 px-3 rounded-t-md text-[10px] font-bold uppercase">
              Refraction Results / نتائج الفحص
            </div>
            <div className="border border-blue-300 border-t-0 rounded-b-md overflow-hidden">
              <table className="w-full text-[9px] border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-sky-900 border-b border-slate-200">
                    <th className="py-1 border-l border-blue-200"> العين اليسرى OS</th>
                    <th className="py-1 border-l border-blue-200 text-center">PARAMETER</th>
                    <th className="py-1">العين اليمنى OD</th>
                  </tr>
                </thead>
                <tbody className="font-bold text-slate-700">
                  {[
                    { label: 'SPH', os: exam.os_sph, od: exam.od_sph },
                    { label: 'CYL', os: exam.os_cyl, od: exam.od_cyl },
                    { label: 'AXIS', os: exam.os_axis, od: exam.od_axis },
                    { label: 'ADD', os: exam.os_add, od: exam.od_add },
                    { label: 'VA', os: exam.os_va, od: exam.od_va, color: 'text-sky-600' },
                    { label: 'IOP', os: exam.os_iop, od: exam.od_iop, color: 'text-amber-600' }
                  ].map((row, idx) => (
                    <tr key={idx} className={`border-b border-blue-100  ${row.color || ''}`}>
                                            <td className="py-1 px-2 text-center">
                        {row.label === 'SPH' || row.label === 'CYL' || row.label === 'ADD' 
                          ? formatRx(row.os) 
                          : (row.os || '---')}
                      </td>

                      <td className="py-1 px-2 text-center bg-slate-50/50 text-[9px] text-sky-700 font-black border-x border-blue-200">{row.label}</td>
                      <td className="py-1 px-2 text-center ">
                        {row.label === 'SPH' || row.label === 'CYL' || row.label === 'ADD' 
                          ? formatRx(row.od) 
                          : (row.od || '---')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Near Vision Rx (Calculated) */}
          {(parseFloat(exam.od_add) > 0 || parseFloat(exam.os_add) > 0) && (
            <section className="mb-1 animate-in fade-in slide-in-from-right-2">
              <div className="bg-slate-400 text-white py-1 px-3 rounded-t-md text-[10px] font-bold uppercase flex justify-between">
                <span>Near Prescription / وصفة القريب</span>
                <span className="text-[7px] opacity-80">(Distance SPH + ADD)</span>
              </div>
              <div className="border border-slate-300 border-t-0 rounded-b-md overflow-hidden bg-blue-50/20">
                <table className="w-full text-[9px] border-collapse">
                  <tbody className="font-bold text-emerald-900">
                    <tr className="border-b border-slate-200">
                      <td className="py-1 px-1 text-center w-1/3">
                        {formatRx((parseFloat(exam.os_sph) || 0) + (parseFloat(exam.os_add) || 0))}
                      </td>
                      <td className="py-1 px-2 text-center bg-slate-100/50 text-[7px] text-blue-600 font-black border-x border-emerald-100 uppercase">OS NEAR SPH</td>
                      <td className="py-1 px-2 text-center w-1/3">
                        {formatRx((parseFloat(exam.od_sph) || 0) + (parseFloat(exam.od_add) || 0))}
                     </td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 text-center text-slate-400 text-[8px]">{formatRx(exam.os_cyl)} × {exam.os_axis || '0'}</td>
                      <td className="py-1 px-2 text-center bg-slate-100/50 text-[7px] text-blue-600 font-black border-x border-emerald-100 uppercase">CYL / AXIS</td>
                      <td className="py-1 px-2 text-center text-slate-400 text-[8px]">{formatRx(exam.od_cyl)} × {exam.od_axis || '0'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}


          {/* 4. Analysis & CL */}
          <div className="grid grid-cols-2 gap-3 mb-1">
            <div className="border border-slate-300 rounded-md p-1 bg-slate-50/30 flex flex-col">
              <h4 className="text-[9px] font-black text-[#003B73] mb-1.5 border-b border-slate-100 pb-0.5">توصيات واقتراحات / ADVICE</h4>
              <ul className="space-y-1">
                {exam.recommendations.split('،').slice(0, 3).map((rec, i) => (
                  <li key={i} className="flex gap-1.5 text-[9px] text-slate-600 font-bold leading-tight">
                    <div className="w-1 h-1 rounded-full bg-sky-500 mt-1 shrink-0" />
                    <span>{rec.trim()}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-amber-200 border-t-1 border-r-1 border-l-1 border-b-1 rounded-md overflow-hidden bg-amber-50/10">
               <div className="bg-amber-600 text-white text-[9px] font-bold py-0.5 px-2 text-center uppercase">
                 Contact Lenses / العدسات اللاصقة
               </div>
               <table className="w-full text-center border-collapse">
                 <thead>
                   <tr className="text-[8px] text-slate-700 border-b border-slate-200">
                     <th className="py-0.5">EYE</th>
                     <th className="py-0.5">SPH</th>
                     <th className="py-0.5">CYL</th>
                   </tr>
                 </thead>
                 <tbody className="text-[8px] font-bold text-slate-700">
                   <tr className="border-b border-slate-200">
                     <td className="py-1 text-[8px] text-slate-500">OD (R)</td>
                     <td>{exam.od_cl_sph || '--'}</td>
                     <td>{exam.od_cl_cyl || '--'}</td>
                   </tr>
                   <tr>
                     <td className="py-1 text-[8px] text-slate-500">OS (L)</td>
                     <td>{exam.os_cl_sph || '--'}</td>
                     <td>{exam.os_cl_cyl || '--'}</td>
                   </tr>
                 </tbody>
               </table>
               <div className="bg-white/50 border-t border-slate-300 py-0.5 px-2 flex justify-between text-[7px] font-bold text-slate-400 italic">
                 <span>VD: 12mm</span>
                 <span>(Toric/Sph)</span>
               </div>
            </div>
          </div>

          {/* 5. Diagnosis */}
          <div className="mb-2 bg-sky-50/50 p-1 rounded border border-sky-200 page-break-inside-avoid">
             <h4 className="text-[9px] font-black text-sky-800 uppercase mb-1 flex items-center gap-1">
               <Stethoscope size={8} /> Diagnosis / التشخيص السريري
             </h4>
             <p className="text-[9px] font-bold text-slate-700 leading-snug">
               {exam.diagnosis}
             </p>
          </div>

          {/* Footer Section */}
          <div className="mt-auto pt-3 border-t border-blue-100 grid grid-cols-12 gap-2 items-end">
            <div className="col-span-8 flex gap-4">
              <div className="flex flex-col items-center">
                <p className="text-[7px] font-bold text-slate-400 mb-2 uppercase tracking-tighter">Center Stamp</p>
                <div className="w-12 h-12 border border-sky-100 rounded-full flex items-center justify-center opacity-20 rotate-12">
                   <Activity size={24} className="text-sky-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Clinic Notes</p>
                <p className="text-[7px] text-slate-500 font-medium max-w-[120px]">{exam.notes || 'No extra notes.'}</p>
              </div>
            </div>
            <div className="col-span-4 text-center">
              <div className="h-6 w-full border-b border-slate-200 border-dotted mb-1" />{settings.stamp}
              <p className="text-[8px] font-black text-slate-800">{settings.doctor_name}</p>
              <p className="text-[6px] font-bold text-slate-400 uppercase">Consultant Optometrist</p>
            </div>
          </div>

          {/* Copyright line */}
          <div className="mt-2 text-[6px] text-slate-300 text-center uppercase tracking-widest">
            This report is digitally generated and validated.
          </div>
        </div>
      </div>
    </div>
  );
}
