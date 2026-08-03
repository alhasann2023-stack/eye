import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Eye, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Save,
  Activity,
  AlertCircle
} from 'lucide-react';
import { VisionEngine } from '../lib/visionEngine';
import { EyeData, Patient, Examination } from '../types';
import { VisionDB } from '../lib/db';

const INITIAL_EYE_DATA: EyeData = {
  sph: '', cyl: '', axis: '', add: '', va: '6/6', pd: '', prism: '', base: '', iop: '', cl_sph: '', cl_cyl: ''
};

export default function NewExamination() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState({
    name: '', age: '', gender: 'male', phone: '', address: '', file_number: `FILE-${Date.now().toString().slice(-6)}`
  });
  const [od, setOd] = useState<EyeData>(INITIAL_EYE_DATA);
  const [os, setOs] = useState<EyeData>(INITIAL_EYE_DATA);
  const [notes, setNotes] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [hasAmblyopia, setHasAmblyopia] = useState(false);

  // Real-time analysis
  const odAnalysis = VisionEngine.analyzeEye(od);
  const osAnalysis = VisionEngine.analyzeEye(os);

  const formatRx = (val: string | number | undefined | null) => {
    if (val === undefined || val === null || val === '') return '---';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return val;
    return (num >= 0 ? '+' : '') + num.toFixed(2);
  };

  // Auto-detect Amblyopia risk
  React.useEffect(() => {
    if (od.sph || os.sph || od.va || os.va) {
      const likely = VisionEngine.isAmblyopiaLikely(od, os);
      if (likely && !hasAmblyopia) {
        setHasAmblyopia(true);
      }
    }
  }, [od, os, hasAmblyopia]);

  // Sync AI recommendations to state if empty
  React.useEffect(() => {
    if (!recommendations && (od.sph || os.sph)) {
      const aiRecs = [...odAnalysis.recommendations, ...osAnalysis.recommendations];
      if (hasAmblyopia) {
        aiRecs.push("يُنصح بتمارين تنشيط العين الكسولة.", "المتابعة الدورية مع أخصائي البصريات.");
      }
      const uniqueRecs = Array.from(new Set(aiRecs)).join('، ');
      setRecommendations(uniqueRecs);
    }
  }, [odAnalysis.recommendations, osAnalysis.recommendations, recommendations, od.sph, os.sph, hasAmblyopia]);

  const handleCreateExam = async () => {
    setLoading(true);
    try {
      const newPatient: Omit<Patient, 'id'> = {
        name: patient.name,
        age: parseInt(patient.age) || 0,
        gender: patient.gender as any,
        phone: patient.phone,
        address: patient.address,
        file_number: patient.file_number,
        created_at: new Date().toISOString()
      };
      
      const patient_id = await VisionDB.addPatient(newPatient);

      let diagnosis = VisionEngine.generateSummary(odAnalysis, osAnalysis, od, os);
      if (hasAmblyopia) {
        diagnosis += " تم تشخيص الحالة بوجود كسل وظيفي في العين (Amblyopia).";
      }
      
      const finalRecs = recommendations || [...odAnalysis.recommendations, ...osAnalysis.recommendations].join('، ');

      const newExam: Omit<Examination, 'id'> = {
        patient_id,
        date: new Date().toISOString(),
        od_sph: od.sph, od_cyl: od.cyl, od_axis: od.axis, od_add: od.add, od_va: od.va, od_pd: od.pd, od_prism: od.prism, od_base: od.base, od_iop: od.iop, od_cl_sph: od.cl_sph, od_cl_cyl: od.cl_cyl,
        os_sph: os.sph, os_cyl: os.cyl, os_axis: os.axis, os_add: os.add, os_va: os.va, os_pd: os.pd, os_prism: os.prism, os_base: os.base, os_iop: os.iop, os_cl_sph: os.cl_sph, os_cl_cyl: os.cl_cyl,
        diagnosis, recommendations: finalRecs, notes,
        has_amblyopia: hasAmblyopia
      };

      const exam_id = await VisionDB.addExamination(newExam);
      navigate(`/reports/${exam_id}`);
    } catch (err) {
      console.error(err);
      alert('خطأ في حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 pb-10">
      
      {/* Patient & Clinical Info (Left) */}
      <section className="col-span-12 lg:col-span-3 space-y-4">
        <div className="bg-sky-900 p-5 rounded-2xl border border-slate-300 shadow-sm">
          <h3 className="text-[10px] font-bold text-slate-100 uppercase tracking-wider mb-4">تعريف المريض</h3>
          <div className="space-y-4 ">
            <div>
              <label className="block text-[9px] font-bold text-slate-100 mb-1 uppercase tracking-tight">الاسم الكامل</label>
              <input 
                type="text" 
                value={patient.name || ''}
                onChange={e => setPatient({ ...patient, name: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-[12px] font-bold focus:ring-2 focus:ring-sky-500/20" 
                placeholder="أدخل اسم المريض..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-100 mb-1 uppercase tracking-tight">العمر</label>
                <input 
                  type="text" 
                  value={patient.age || ''}
                  onChange={e => setPatient({ ...patient, age: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-[12px] font-bold focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-100 mb-1 uppercase tracking-tight">رقم الهاتف</label>
                <input 
                  type="text" 
                  value={patient.phone || ''}
                  onChange={e => setPatient({ ...patient, phone: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border  border-blue-200 rounded-lg text-[12px] font-bold focus:ring-2 focus:ring-sky-500/20"
                  placeholder="07XXXXXXXX"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2 bg-amber-50 rounded-xl border border-amber-300">
               <input 
                 type="checkbox" 
                 id="amblyopia" 
                 checked={hasAmblyopia}
                 onChange={(e) => setHasAmblyopia(e.target.checked)}
                 className="w-4 h-3 text-emerald-600 rounded bg-white border-amber-200 focus:ring-emerald-500"
               />
               <label htmlFor="amblyopia" className="text-[10px] font-bold text-amber-900 cursor-pointer">
                 يعاني من كسل في العين (Amblyopia)
               </label>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-100 mb-1 uppercase tracking-tight">نصائح وتوصيات طبية</label>
              <textarea 
                value={recommendations || ''}
                onChange={e => setRecommendations(e.target.value)}
                className="w-full px-3 py-1 bg-sky-50/50 border border-sky-200 rounded-lg text-[12px] font-medium h-20 resize-none focus:ring-2 focus:ring-sky-500/20"
                placeholder="سيقوم النظام باقتراح نصائح، يمكنك تعديلها..."
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-100 mb-1 uppercase tracking-tight">ملاحظات سريرية إضافية</label>
              <textarea 
                value={notes || ''}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-blue-200 rounded-lg text-[12px] font-medium h-15 resize-none focus:ring-2 focus:ring-sky-500/20"
                placeholder="أدخل أي ملاحظات سريرية أخرى..."
              />
            </div>
          </div>
        </div>

        {/* AI Analytics Card */}
        <div className="bg-sky-900 p-3 rounded-2xl text-white shadow-lg overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
            <Activity size={80} />
          </div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <h3 className="text-[10px] font-bold text-sky-300 uppercase tracking-widest">التحليل الذكي</h3>
            <span className="bg-sky-500 text-[10px] px-2 py-0.5 rounded font-bold animate-pulse">AI ACTIVE</span>
          </div>
          <div className="space-y-2 relative z-10">
            <div className="p-1 bg-white/10 rounded-xl">
              <p className="text-[10px] text-sky-200 uppercase font-bold mb-1">التشخيص المتوقع</p>
              <p className="text-[13px] font-bold leading-tight">
                {(od.sph || os.sph) ? VisionEngine.generateSummary(odAnalysis, osAnalysis, od, os) : 'بانتظار القياسات...'}
                {hasAmblyopia && <span className="text-amber-300 block mt-1"> + كسل العين</span>}
              </p>
            </div>
            <div className="p-1 bg-white/10 rounded-xl">
              <p className="text-[10px] text-sky-200 uppercase font-bold mb-1">مستوى الخطورة</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-grow h-1.5 bg-sky-800 rounded-full overflow-hidden">
                  <div 
                    className="bg-sky-400 h-full transition-all duration-500" 
                    style={{ width: (odAnalysis.severity === 'High' || osAnalysis.severity === 'High') ? '100%' : (odAnalysis.severity === 'Moderate' || osAnalysis.severity === 'Moderate') ? '60%' : (odAnalysis.severity === 'Mild' || osAnalysis.severity === 'Mild') ? '30%' : '0%' }}
                  ></div>
                </div>
                <span className="text-[10px] font-black uppercase">
                  {(odAnalysis.severity === 'High' || osAnalysis.severity === 'High') ? 'High' : (odAnalysis.severity === 'Moderate' || osAnalysis.severity === 'Moderate') ? 'Mid' : 'Low'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Eye Measurements (Center) */}
      <section className="col-span-12 lg:col-span-6 space-y-2">
        <div className="bg-white rounded-2xl border border-sky-500 shadow-sm flex flex-col min-h-[500px]">
          <div className="flex border-b border-slate-100">
            <button className="px-6 py-4 border-b-2 border-sky-600 text-sky-700 font-bold text-xs uppercase tracking-widest">نتائج الانكسار (OD/OS)</button>
            <button className="px-6 py-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600">حدة الإبصار البديلة</button>
          </div>
          
          <div className="p-2">
            <div className="grid grid-cols-2 gap-10">
              {/* OD Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                  <div className="w-6 h-6 bg-slate-800 text-white flex items-center justify-center rounded text-[10px] font-bold italic">OD</div>
                  <span className="text-xs font-bold uppercase tracking-wider">العين اليمنى</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'sph', label: 'Sphere (SPH)', placeholder: '-1.00' },
                    { key: 'cyl', label: 'Cylinder (CYL)', placeholder: '-0.25' },
                    { key: 'axis', label: 'Axis', placeholder: '180' },
                    { key: 'va', label: 'Visual Acuity', placeholder: '6/6', color: 'sky' },
                    { key: 'iop', label: 'ضغط العين (IOP)', placeholder: '15', color: 'amber' },
                  ].map((f) => (
                    <div key={f.key} className="bg-slate-50 p-2 rounded-xl border border-blue-300 group focus-within:border-sky-300 transition-all">
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tighter">{f.label}</label>
                      <input 
                        type="text" 
                        value={od[f.key as keyof EyeData] || ''}
                        onChange={e => setOd({ ...od, [f.key]: e.target.value })}
                        className={`w-full bg-transparent border-none p-0 text-sm font-bold focus:outline-none ${f.color === 'sky' ? 'text-sky-600' : 'text-slate-800'}`}
                        placeholder={f.placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* OS Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                  <div className="w-6 h-6 bg-sky-600 text-white flex items-center justify-center rounded text-[10px] font-bold italic">OS</div>
                  <span className="text-xs font-bold uppercase tracking-wider">العين اليسرى</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'sph', label: 'Sphere (SPH)', placeholder: '-1.00' },
                    { key: 'cyl', label: 'Cylinder (CYL)', placeholder: '-0.25' },
                    { key: 'axis', label: 'Axis', placeholder: '180' },
                    { key: 'va', label: 'Visual Acuity', placeholder: '6/6', color: 'sky' },
                    { key: 'iop', label: 'ضغط العين (IOP)', placeholder: '15', color: 'amber' },
                  ].map((f) => (
                    <div key={f.key} className="bg-slate-50 p-2 rounded-xl border border-red-300 group focus-within:border-sky-300 transition-all">
                      <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tighter">{f.label}</label>
                      <input 
                        type="text" 
                        value={os[f.key as keyof EyeData] || ''}
                        onChange={e => setOs({ ...os, [f.key]: e.target.value })}
                        className={`w-full bg-transparent border-none p-0 text-sm font-bold focus:outline-none ${f.color === 'sky' ? 'text-sky-600' : 'text-slate-800'}`}
                        placeholder={f.placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100">
               <div className="flex items-center justify-between mb-2">
                 <div>
                   <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">قياسات العدسات اللاصقة (Contact Lenses)</h4>
                   <p className="text-[9px] text-slate-400 font-bold uppercase">Vertex: 12.0mm</p>
                 </div>
                 <button 
                   onClick={() => {
                     const odCL = VisionEngine.calculateCL(parseFloat(od.sph) || 0, parseFloat(od.cyl) || 0);
                     const osCL = VisionEngine.calculateCL(parseFloat(os.sph) || 0, parseFloat(os.cyl) || 0);
                     setOd({ ...od, cl_sph: odCL.sph, cl_cyl: odCL.cyl });
                     setOs({ ...os, cl_sph: osCL.sph, cl_cyl: osCL.cyl });
                   }}
                   className="px-5 py-2.5 bg-amber-600 text-white rounded-xl text-[10px] font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-100 flex items-center gap-2"
                 >
                   <Activity size={14} />
                   <span>حساب قياسات العدسات (Calculate)</span>
                 </button>
               </div>
 
               <div className="grid grid-cols-2 gap-10">
                 {/* OD CL */}
                 <div className="space-y-3">
                   <div className="text-[8px] font-bold text-slate-500 border-b border-slate-200 pb-1 flex justify-between">
                     <span>العين اليمنى (OD)</span>
                     <span>RIGHT EYE</span>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-300 focus-within:ring-2 focus-within:ring-amber-500/20">
                       <label className="block text-[8px] font-black text-amber-700 uppercase mb-1 tracking-tighter">CL SPH</label>
                       <input 
                         type="text" 
                         value={od.cl_sph || ''}
                         onChange={e => setOd({ ...od, cl_sph: e.target.value })}
                         className="w-full bg-transparent border-none p-0 text-xl font-bold text-amber-900 focus:outline-none"
                         placeholder="0.00"
                       />
                     </div>
                     <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-300 focus-within:ring-2 focus-within:ring-amber-500/20">
                       <label className="block text-[8px] font-black text-amber-700 uppercase mb-1 tracking-tighter">CL CYL</label>
                       <input 
                         type="text" 
                         value={od.cl_cyl || ''}
                         onChange={e => setOd({ ...od, cl_cyl: e.target.value })}
                         className="w-full bg-transparent border-none p-0 text-xl font-bold text-amber-900 focus:outline-none"
                         placeholder="0.00"
                       />
                     </div>
                   </div>
                 </div>
 
                 {/* OS CL */}
                 <div className="space-y-3">
                   <div className="text-[8px] font-bold text-slate-500 border-b border-slate-200 pb-1 flex justify-between">
                     <span>العين اليسرى (OS)</span>
                     <span>LEFT EYE</span>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-300 focus-within:ring-2 focus-within:ring-amber-500/20">
                       <label className="block text-[8px] font-black text-amber-700 uppercase mb-1 tracking-tighter">CL SPH</label>
                       <input 
                         type="text" 
                         value={os.cl_sph || ''}
                         onChange={e => setOs({ ...os, cl_sph: e.target.value })}
                         className="w-full bg-transparent border-none p-0 text-xl font-bold text-amber-900 focus:outline-none"
                         placeholder="0.00"
                       />
                     </div>
                     <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-300 focus-within:ring-2 focus-within:ring-amber-500/20">
                       <label className="block text-[8px] font-black text-amber-700 uppercase mb-1 tracking-tighter">CL CYL</label>
                       <input 
                         type="text" 
                         value={os.cl_cyl || ''}
                         onChange={e => setOs({ ...os, cl_cyl: e.target.value })}
                         className="w-full bg-transparent border-none p-0 text-xl font-bold text-amber-900 focus:outline-none"
                         placeholder="0.00"
                       />
                     </div>
                   </div>
                 </div>
               </div>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { key: 'pd', label: 'Pupillary Distance (PD)', unit: 'mm' },
                { key: 'add', label: 'Reading Add', unit: 'Add' },
                { key: 'prism', label: 'Prism/Base', unit: 'Δ' },
              ].map((f) => (
                <div key={f.key} className="bg-slate-50 p-2 rounded-xl border border-dashed border-slate-500">
                  <div className="flex justify-between items-start mb-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-tight">{f.label}</label>
                    {f.key === 'add' && (od.add || os.add) && (od.sph || os.sph) && (
                      <div className="bg-emerald-50 text-emerald-700 text-[8px] px-1.5 py-0.5 rounded font-black flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                        <CheckCircle2 size={10} />
                        <span>RX NEAR: OD {formatRx((parseFloat(od.sph) || 0) + (parseFloat(od.add) || 0))} / OS {formatRx((parseFloat(os.sph) || 0) + (parseFloat(os.add) || 0))}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={od[f.key as keyof EyeData] || ''}
                      onChange={e => {
                        setOd({ ...od, [f.key]: e.target.value });
                        setOs({ ...os, [f.key]: e.target.value });
                      }}
                      className="w-full bg-transparent border-none p-0 text-xl font-bold text-slate-700 focus:outline-none"
                    />
                    <span className="text-[10px] font-bold text-slate-300">{f.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Report Preview Small (Right) */}
      <section className="col-span-12 lg:col-span-3 flex flex-col gap-4">
        <div className="bg-sky-900 rounded-2xl border border-slate-300 shadow-sm p-5 h-full flex flex-col">
          <div className="bg-sky-600 text-white rounded-full text-[9px] font-bold px-3 py-1 w-fit mb-4 shadow-md shadow-sky-200 uppercase tracking-widest mx-auto">
            A5 MEDICAL REPORT PREVIEW
          </div>
          
          <div className="flex-1 border border-slate-100 p-4 rounded-xl bg-slate-50/50 shadow-inner overflow-hidden text-[9px] space-y-3">
             <div className="text-center border-b border-slate-100 pb-2 mb-2">
               <div className="w-8 h-8 bg-sky-600 rounded mx-auto mb-1 flex items-center justify-center text-white font-bold text-xs italic">V</div>
               <p className="font-bold">مركز سمارت فيجن</p>
             </div>
             <div className="grid grid-cols-2 gap-1 border-b border-slate-100 pb-2">
               <span className="font-bold">المريض:</span> <span>{patient.name || '--'}</span>
               <span className="font-bold">التاريخ:</span> <span>{new Date().toLocaleDateString('ar-EG')}</span>
             </div>
             
             <table className="w-full text-center border-collapse">
               <thead>
                 <tr className="bg-slate-200">
                   <th className="p-1">Eye</th>
                   <th className="p-1">SPH</th>
                   <th className="p-1">CYL</th>
                   <th className="p-1">VA</th>
                 </tr>
               </thead>
               <tbody>
                  <tr><td className="p-1 font-bold">OD</td><td>{od.sph || '0'}</td><td>{od.cyl || '0'}</td><td>{od.va}</td></tr>
                  <tr><td className="p-1 font-bold">OS</td><td>{os.sph || '0'}</td><td>{os.cyl || '0'}</td><td>{os.va}</td></tr>
               </tbody>
             </table>

             {(od.add || os.add) && (
               <div className="p-2 bg-emerald-50 rounded text-emerald-800 border border-emerald-100">
                 <p className="font-black underline mb-1 uppercase text-[8px]">Near RX / نظارة القريب:</p>
                 <p className="leading-tight">
                   OD: {formatRx((parseFloat(od.sph) || 0) + (parseFloat(od.add) || 0))} / 
                   OS: {formatRx((parseFloat(os.sph) || 0) + (parseFloat(os.add) || 0))}
     
                 </p>
               </div>
             )}

             <div className="p-2 bg-sky-50 rounded text-sky-800">
               <p className="font-black underline mb-1 uppercase text-[8px]">Diagnosis:</p>
               <p className="leading-tight">{odAnalysis.condition}</p>
             </div>

             <div className="mt-6 flex justify-between items-end opacity-50">
               <div className="w-12 h-6 border-b border-slate-300"></div>
               <div className="text-right text-[7px]">التوقيع الإلكتروني<br/>#DR-NASHWAN</div>
             </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <button 
              onClick={handleCreateExam}
              disabled={loading || !patient.name}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
              إصدار وطباعة التقرير A5
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full py-3 bg-slate-50 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors uppercase tracking-widest"
            >
              إلغاء العملية
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
