import { EyeData, DiagnosticResult } from '../types';

export class VisionEngine {
  static analyzeEye(eye: EyeData): DiagnosticResult {
    const sph = parseFloat(eye.sph) || 0;
    const cyl = parseFloat(eye.cyl) || 0;
    const va = eye.va;
    const iop = parseFloat(eye.iop) || 0;

    let condition = "رؤية طبيعية (Normal Vision)";
    let severity: 'Mild' | 'Moderate' | 'High' | 'Normal' = 'Normal';
    const recommendations: string[] = [];
    let description = "نتائج الفحص ضمن النطاق السريري الطبيعي.";

    // Myopia (Nearsightedness)
    if (sph < 0) {
      const absSph = Math.abs(sph);
      condition = "قصر نظر (Myopia)";
      if (absSph <= 3) severity = 'Mild';
      else if (absSph <= 6) severity = 'Moderate';
      else severity = 'High';
      
      const severityAr = severity === 'Mild' ? 'بسيط' : severity === 'Moderate' ? 'متوسط' : 'عالي';
      description = `يعاني المريض من قصر نظر ${severityAr}. الرؤية البعيدة غير واضحة وتحتاج لنمط تصحيحي.`;
      recommendations.push("يُنصح بارتداء نظارة طبية للرؤية البعيدة.");
    } 
    // Hyperopia (Farsightedness)
    else if (sph > 0) {
      condition = "طول نظر (Hyperopia)";
      if (sph <= 3) severity = 'Mild';
      else if (sph <= 6) severity = 'Moderate';
      else severity = 'High';

      const severityAr = severity === 'Mild' ? 'بسيط' : severity === 'Moderate' ? 'متوسط' : 'عالي';
      description = `يعاني المريض من طول نظر ${severityAr}. قد يواجه المريض إجهاداً عند القراءة أو الرؤية القريبة.`;
      recommendations.push("يُنصح بنظارة للقراءة أو العمل القريب.");
    }

    // Astigmatism
    if (Math.abs(cyl) > 0.25) {
      condition += (condition.includes("طبيعية") ? " مع استجماتيزم (Astigmatism)" : " مع استجماتيزم");
      recommendations.push("ضرورة استخدام عدسات أسطوانية لتصحيح الانحراف.");
      description += " تم اكتشاف انحراف (استجماتيزم) يؤدي لتشتت الرؤية.";
    }

    // Visual Acuity Analysis
    if (va && va !== "6/6") {
      recommendations.push("المتابعة الدورية لفحص حدة الإبصار.");
      if (va === "6/60" || va === "6/24") {
        recommendations.push("يُنصح بفحص شامل لقاع العين والشبكية.");
      }
    }

    if (Math.abs(sph) > 4 || Math.abs(cyl) > 2) {
      recommendations.push("يُنصح بفحص ضغط العين والشبكية بشكل دوري.");
    }

    if (iop > 0) {
      if (iop > 24) {
        severity = 'High';
        recommendations.push("ضغط العين مرتفع جداً (> 24)، مخاطر عالية للجلوكوما.");
        recommendations.push("يُنصب بمراجعة أخصائي جلوكوما بشكل عاجل وفوري.");
        description += ` تم رصد ارتفاع حاد في ضغط العين (${iop} mmHg).`;
      } else if (iop > 21) {
        if (severity !== 'High') severity = 'Moderate';
        recommendations.push("ضغط العين مرتفع قليلاً (22-24)، يُنصح بالمتابعة الدورية.");
        recommendations.push("إجراء فحص الساحة البصرية (Visual Field) مراجعة ضغط العين الدوري.");
        description += ` ضغط العين (${iop} mmHg) يقع في النطاق المرتفع.`;
      } else if (iop < 10) {
        recommendations.push("ضغط العين منخفض جداً (< 10)، قد يشير لمشكلة أخرى.");
      }
    }

    // Lazy Eye (Amblyopia) Warning based on VA
    if (va && va !== "6/6" && va !== "6/5") {
      const vaValue = parseInt(va.split('/')[1]);
      if (vaValue >= 12) {
        recommendations.push("يُنصح بفحص كسل العين (Amblyopia Screening).");
        description += " وجود انخفاض في حدة الإبصار قد يشير إلى احتمالية كسل العين.";
      }
    }

    return { condition, severity, recommendations, description };
  }

  static calculateCL(sph: number, cyl: number, vertex: number = 0.012): { sph: string, cyl: string } {
    // 1. Calculate Spherical Equivalent first: SPH + (CYL / 2)
    // This is the standard procedure when moving to spherical-only contact lenses
    const sphericalEquivalent = sph + (cyl / 2);

    // 2. Vertex distance compensation formula: Fc = F / (1 - d*F)
    const applyVertex = (p: number) => {
      // Vertex usually only significant for powers >= 4.00 or <= -4.00
      if (Math.abs(p) < 4.00) return p;
      return p / (1 - vertex * p);
    };

    const roundTo025 = (n: number) => {
      return Math.round(n * 4) / 4;
    };

    const vertexCompensated = applyVertex(sphericalEquivalent);
    const finalSph = roundTo025(vertexCompensated);

    return {
      sph: finalSph > 0 ? "+" + finalSph.toFixed(2) : finalSph.toFixed(2),
      cyl: "" // User requested no cylinder in contact lens results
    };
  }

  static generateSummary(od: DiagnosticResult, os: DiagnosticResult, odData?: EyeData, osData?: EyeData): string {
    let summary = "";
    let amblyopiaDetected = false;

    // Check for Anisometropia (Difference between eyes)
    if (odData && osData) {
      const odSph = parseFloat(odData.sph) || 0;
      const osSph = parseFloat(osData.sph) || 0;
      const odCyl = parseFloat(odData.cyl) || 0;
      const osCyl = parseFloat(osData.cyl) || 0;
      
      const sphDiff = Math.abs(odSph - osSph);
      const cylDiff = Math.abs(odCyl - osCyl);

      if (sphDiff >= 1.5 || cylDiff >= 1.5) {
        summary += "ملاحظة: وجود تفاوت في القياس بين العينين (Anisometropia)، مما يرفع خطر الإصابة بكسل العين. ";
        amblyopiaDetected = true;
      }

      // Check Visual Acuity Difference
      const odVa = odData.va ? parseInt(odData.va.split('/')[1]) : 6;
      const osVa = osData.va ? parseInt(osData.va.split('/')[1]) : 6;
      if (Math.abs(odVa - osVa) >= 6) { // e.g., one eye 6/6 and other 6/12 or worse
        amblyopiaDetected = true;
      }
    }

    if (amblyopiaDetected) {
      summary += "التشخيص الإضافي: يُظهر الفحص احتمالية عالية لوجود كسل وظيفي في العين (Amblyopia). ";
    }

    // Check for high IOP in summary
    const odIop = odData ? (parseFloat(odData.iop) || 0) : 0;
    const osIop = osData ? (parseFloat(osData.iop) || 0) : 0;
    if (odIop > 21 || osIop > 21) {
      summary += `تحذير: ضغط العين (${Math.max(odIop, osIop)} mmHg) مرتفع عن المعدل الطبيعي. `;
    }

    if (od.condition === os.condition && od.severity === os.severity) {
      summary += `التشخيص: ${od.condition} في كلتا العينين بالمستوى ${od.severity === 'Mild' ? 'البسيط' : od.severity === 'Moderate' ? 'المتوسط' : 'العالي'}. ${od.description}`;
    } else {
      summary += `العين اليمنى (OD): ${od.condition}. العين اليسرى (OS): ${os.condition}.`;
    }

    return summary;
  }

  static isAmblyopiaLikely(odData: EyeData, osData: EyeData): boolean {
    const odSph = parseFloat(odData.sph) || 0;
    const osSph = parseFloat(osData.sph) || 0;
    const odCyl = parseFloat(odData.cyl) || 0;
    const osCyl = parseFloat(osData.cyl) || 0;
    
    // Difference based on sphere or cylinder
    if (Math.abs(odSph - osSph) >= 1.5 || Math.abs(odCyl - osCyl) >= 1.5) return true;
    
    // Difference based on Visual Acuity
    const odVa = odData.va ? parseInt(odData.va.split('/')[1]) : 6;
    const osVa = osData.va ? parseInt(osData.va.split('/')[1]) : 6;
    if (Math.abs(odVa - osVa) >= 6) return true;

    return false;
  }
}
