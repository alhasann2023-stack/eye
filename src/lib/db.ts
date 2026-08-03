import Dexie, { Table } from 'dexie';
import { Patient, Examination, HospitalSettings } from '../types';

export class VisionLocalDB extends Dexie {
  patients!: Table<Patient>;
  examinations!: Table<Examination>;
  settings!: Table<HospitalSettings>;

  constructor() {
    super('VisionLocalDB');
    this.version(1).stores({
      patients: '++id, file_number, name, phone',
      examinations: '++id, patient_id, date',
      settings: '++id, name'
    });
  }
}

export const db = new VisionLocalDB();

// Integration Helper to handle Offline-First pattern
// It will try to use Local DB first, and in a real app would sync to server
export const VisionDB = {
  // Patients
  async getAllPatients() {
    return await db.patients.toArray();
  },
  async getPatient(id: number) {
    return await db.patients.get(id);
  },
  async addPatient(patient: Omit<Patient, 'id'>) {
    return await db.patients.add(patient as Patient);
  },
  async searchPatients(query: string) {
    return await db.patients
      .filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.file_number.includes(query) ||
        p.phone.includes(query)
      )
      .toArray();
  },

  // Examinations
  async getAllExaminations() {
    const exams = await db.examinations.orderBy('date').reverse().toArray();
    // Join with patient names for UI
    for (const exam of exams) {
      const patient = await db.patients.get(exam.patient_id);
      if (patient) {
        exam.patient_name = patient.name;
        exam.file_number = patient.file_number;
        exam.age = patient.age;
      }
    }
    return exams;
  },
  async getExamination(id: number) {
    const exam = await db.examinations.get(id);
    if (exam) {
      const patient = await db.patients.get(exam.patient_id);
      if (patient) {
        exam.patient_name = patient.name;
        exam.age = patient.age;
        exam.gender = patient.gender;
        exam.patient_phone = patient.phone;
        exam.patient_address = patient.address;
        exam.file_number = patient.file_number;
      }
    }
    return exam;
  },
  async addExamination(exam: Omit<Examination, 'id'>) {
    return await db.examinations.add(exam as Examination);
  },
  async getPatientExaminations(patientId: number) {
    return await db.examinations
      .where('patient_id')
      .equals(patientId)
      .reverse()
      .toArray();
  },

  // Settings
  async getSettings() {
    const settings = await db.settings.get(1);
    if (!settings) {
      const defaultSettings: HospitalSettings = {
        id: 1,
        name: 'مركز رؤية التخصصي للعيون',
        logo: '',
        address: 'الرياض - المملكة العربية السعودية',
        phone: '+966 500 000 000',
        email: 'info@vision-care.com',
        doctor_name: 'د. محمد السبيعي',
        doctor_signature: '',
        stamp: '',
        footer_text: 'هذا التقرير معتمد طبياً وصادر من نظام رؤية الإلكتروني',
        primary_color: '#0ea5e9'
      };
      await db.settings.add(defaultSettings);
      return defaultSettings;
    }
    return settings;
  },
  async updateSettings(settings: HospitalSettings) {
    return await db.settings.put({ ...settings, id: 1 });
  },

  // Backup & Recovery
  async exportData() {
    const patients = await db.patients.toArray();
    const examinations = await db.examinations.toArray();
    const settings = await db.settings.toArray();
    
    return JSON.stringify({
      patients,
      examinations,
      settings,
      timestamp: new Date().toISOString(),
      version: 1
    });
  },

  async importData(jsonString: string) {
    try {
      const data = JSON.parse(jsonString);
      
      // Basic validation
      if (!data.patients || !data.examinations || !data.settings) {
        throw new Error("Invalid backup file format");
      }

      // Clear existing data
      await db.transaction('rw', db.patients, db.examinations, db.settings, async () => {
        await db.patients.clear();
        await db.examinations.clear();
        await db.settings.clear();

        // Restore data
        await db.patients.bulkAdd(data.patients);
        await db.examinations.bulkAdd(data.examinations);
        await db.settings.bulkAdd(data.settings);
      });

      return true;
    } catch (error) {
      console.error("Failed to import data:", error);
      throw error;
    }
  }
};
