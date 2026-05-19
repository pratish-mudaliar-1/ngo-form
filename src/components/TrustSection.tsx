"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Users, FileText, CheckCircle } from "lucide-react";

const stats = [
  {
    icon: <FileText className="w-6 h-6 text-blue-600" />,
    value: "1,200+",
    labelKey: "trust.issuesReported",
  },
  {
    icon: <Users className="w-6 h-6 text-green-600" />,
    value: "18",
    labelKey: "trust.communitiesConnected",
  },
  {
    icon: <CheckCircle className="w-6 h-6 text-blue-600" />,
    value: "840",
    labelKey: "trust.issuesResolved",
  },
];

export function TrustSection() {
  const { t } = useTranslation();
  return (
    <section className="bg-slate-50 py-24 px-6 relative z-10 border-t border-slate-200">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-semibold text-slate-900 mb-4"
          >
            {t('trust.title')}
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            {t('trust.subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                {stat.icon}
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                {t(stat.labelKey)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
