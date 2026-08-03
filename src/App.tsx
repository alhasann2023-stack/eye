import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NewExamination from './pages/NewExamination';
import ReportPreview from './pages/ReportPreview';
import Settings from './pages/Settings';
import PatientRecords from './pages/PatientRecords';
import PatientDetails from './pages/PatientDetails';

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/exam/new" element={<NewExamination />} />
          <Route path="/reports/:id" element={<ReportPreview />} />
          <Route path="/patients" element={<PatientRecords />} />
          <Route path="/patients/:id" element={<PatientDetails />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/analytics" element={<Dashboard />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}