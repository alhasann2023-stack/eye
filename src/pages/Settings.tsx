import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Save, 
  Upload, 
  Palette,
  Signature,
  Stamp,
  Download,
  Database,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { HospitalSettings } from '../types';
import { VisionDB } from '../lib/db';

export default function Settings() {
  const [settings, setSettings] = useState<HospitalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      const data = await VisionDB.getSettings();
      setSettings(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setStatus('saving');
    try {
      await VisionDB.updateSettings(settings);
      setStatus('saved');
      setTimeout(() => setStatus(''), 2000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const handleExport = async () => {
    try {
      const json = await VisionDB.exportData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Vision_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('فشل تصدير البيانات');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('تحذير: استيراد البيانات سيقوم بحذف جميع البيانات الحالية واستبدالها ببيانات النسخة الاحتياطية. هل أنت متأكد؟')) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = event.target?.result as string;
        await VisionDB.importData(json);
        alert('تم استيراد البيانات بنجاح. سيتم إعادة تحميل الصفحة.');
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert('فشل استيراد البيانات. تأكد من صحة الملف.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    if (!window.confirm('تحذير نهائي: سيتم حذف جميع المرضى والفحوصات والإعدادات نهائياً. هل أنت متأكد؟')) return;
    try {
      await VisionDB.importData(JSON.stringify({ patients: [], examinations: [], settings: [settings] }));
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = (field: keyof HospitalSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => prev ? { ...prev, [field]: reader.result } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading || !settings) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">إعدادات العيادة</h2>
          <p className="text-slate-500 mt-1">تخصيص الهوية البصرية وبيانات التقارير الطبية</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={status === 'saving'}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
        >
          {status === 'saving' ? 'جاري الحفظ...' : status === 'saved' ? 'تم الحفظ!' : <><Save size={20} /> حفظ الإعدادات</>}
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="bg-white p-4 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <Building2 className="text-blue-600" size={24} />
            <h3 className="font-bold text-lg">البيانات الأساسية</h3>
          </div>
          
          <div className="space-y-2">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5 mr-1">اسم المستشفى / المركز</label>
              <input 
                type="text"
                value={settings.name || ''}
                onChange={e => setSettings({ ...settings, name: e.target.value })}
                className="w-full bg-slate-50 border-slate-500 border-none rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5 mr-1">العنوان</label>
              <div className="relative">
                <MapPin size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  value={settings.address || ''}
                  onChange={e => setSettings({ ...settings, address: e.target.value })}
                  className="w-full bg-slate-50 border-sky-200 rounded-xl py-2.5 pr-10 pl-4 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5 mr-1">رقم التواصل</label>
                <div className="relative">
                  <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    value={settings.phone || ''}
                    onChange={e => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-xl py-2.5 pr-10 pl-4 focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5 mr-1">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="email"
                    value={settings.email || ''}
                    onChange={e => setSettings({ ...settings, email: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-xl py-2.5 pr-10 pl-4 focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <Palette className="text-indigo-600" size={24} />
            <h3 className="font-bold text-lg">الهوية البصرية</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group">
                {settings.logo ? (
                  <img src={settings.logo} className="w-full h-full object-contain p-2" alt="logo" />
                ) : (
                  <Upload className="text-slate-300" />
                )}
                <input type="file" onChange={handleImageUpload('logo')} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <div>
                <p className="font-bold text-sm">شعار المركز (Logo)</p>
                <p className="text-xs text-slate-400 mt-1">يفضل استخدامه بخلفية شفافة</p>
                <button type="button" className="text-xs font-bold text-indigo-600 mt-2 hover:underline">تغيير الشعار</button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-3 mr-1">اللون الأساسي للهوية</label>
              <div className="flex gap-3">
                {['#2563eb', '#4f46e5', '#0891b2', '#059669', '#dc2626', '#1e293b'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSettings({ ...settings, primary_color: color })}
                    className={`w-10 h-10 rounded-full transition-all ${settings.primary_color === color ? 'scale-125 ring-2 ring-offset-2 ring-slate-300' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Info */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <Signature className="text-emerald-600" size={24} />
            <h3 className="font-bold text-lg">بيانات الطبيب والتوقيع</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5 mr-1">اسم الطبيب المعالج</label>
              <input 
                type="text"
                value={settings.doctor_name || ''}
                onChange={e => setSettings({ ...settings, doctor_name: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
            
            <div className="flex items-center gap-6">
              <div className="w-32 h-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group">
                {settings.doctor_signature ? (
                  <img src={settings.doctor_signature} className="w-full h-full object-contain grayscale" alt="sig" />
                ) : (
                  <Upload className="text-slate-300" />
                )}
                <input type="file" onChange={handleImageUpload('doctor_signature')} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <div>
                <p className="font-bold text-sm">التوقيع الإلكتروني</p>
                <p className="text-[10px] text-slate-400 mt-1">صورة التوقيع فقط (PNG)</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-slate-50 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group">
                {settings.stamp ? (
                  <img src={settings.stamp} className="w-full h-full object-contain opacity-50" alt="stamp" />
                ) : (
                  <Stamp className="text-slate-300" />
                )}
                <input type="file" onChange={handleImageUpload('stamp')} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <div>
                <p className="font-bold text-sm">ختم العيادة (Stamp)</p>
                <p className="text-[10px] text-slate-400 mt-1">صورة الختم الدائرية</p>
              </div>
            </div>
          </div>
        </div>

        {/* Report Customization */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <Upload className="text-slate-600" size={24} />
            <h3 className="font-bold text-lg">تذييل التقارير (Footer)</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5 mr-1">نص التذييل للتقرير</label>
              <textarea 
                value={settings.footer_text || ''}
                onChange={e => setSettings({ ...settings, footer_text: e.target.value })}
                className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500 text-sm h-32 leading-relaxed"
                placeholder="أدخل النص الذي يظهر أسفل التقرير الطبي..."
              />
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-red-50 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-red-50 pb-4">
            <Database className="text-red-600" size={24} />
            <h3 className="font-bold text-lg text-red-900">إدارة البيانات المحلية (IndexedDB)</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              تنبيه: يتم تخزين جميع البيانات محلياً في متصفحك فقط. ننصح بعمل نسخة احتياطية بشكل دوري لتجنب فقدان البيانات في حال مسح ذاكرة المتصفح.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 bg-slate-900 text-white p-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
              >
                <Download size={18} />
                تصدير نسخة احتياطية
              </button>
              
              <div className="relative">
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImport}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <button 
                  type="button"
                  className="w-full flex items-center justify-center gap-2 bg-amber-50 text-amber-700 border border-amber-100 p-3 rounded-xl font-bold text-sm hover:bg-amber-100 transition-all"
                >
                  <RefreshCw size={18} />
                  استيراد نسخة احتياطية
                </button>
              </div>

              <button 
                type="button"
                onClick={handleReset}
                className="col-span-1 sm:col-span-2 flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-100 p-3 rounded-xl font-bold text-sm hover:bg-red-100 transition-all mt-2"
              >
                <Trash2 size={18} />
                تهيئة النظام (حذف كافة البيانات)
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
