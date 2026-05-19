"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { MapPin, Clock } from "lucide-react";

type Complaint = {
  id: string;
  issueType: string;
  location: string;
  description: string;
  photo: string | null;
  timestamp: string;
  status: string;
};

export function CommunityReports() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<Complaint[]>([]);

  const issueKeyMap: Record<string, string> = {
    "Pothole": "form.pothole",
    "Garbage Collection": "form.garbage",
    "Broken Streetlight": "form.streetlight",
    "Water Logging": "form.water",
    "Other": "form.other",
  };

  useEffect(() => {
    // Only load on client to avoid hydration mismatch
    const data = JSON.parse(localStorage.getItem("complaints") || "[]");
    setReports(data.slice(0, 6)); // Show latest 6
  }, []);

  if (reports.length === 0) return null;

  return (
    <section className="bg-slate-50 py-24 px-6 border-t border-slate-200">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-semibold text-slate-900 mb-2">{t('reports.title')}</h2>
          <p className="text-slate-600">{t('reports.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report, idx) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              {report.photo && (
                <div className="w-full h-48 bg-slate-100 relative">
                  <img src={report.photo} alt="Issue" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                    {t(issueKeyMap[report.issueType] || report.issueType)}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-100">
                    {report.status}
                  </span>
                </div>
                
                <p className="text-slate-900 font-medium mb-3 line-clamp-2">
                  {report.description}
                </p>

                <div className="mt-auto space-y-2 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{report.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(report.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
