"use client";

import { useTranslation } from "react-i18next";
import { Heart, Mail, MessageCircle, Share2 } from "lucide-react";

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-slate-900 text-slate-300 py-16 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <h4 className="text-xl font-bold text-white mb-4">{t('footer.title')}</h4>
          <p className="text-slate-400 max-w-sm">
            {t('footer.desc')}
          </p>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{t('footer.links')}</h5>
          <ul className="space-y-3">
            <li><a href="#" className="hover:text-white transition-colors">{t('footer.about')}</a></li>
            <li><a href="#" className="hover:text-white transition-colors">{t('footer.howItWorks')}</a></li>
            <li><a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a></li>
            <li><a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a></li>
          </ul>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{t('footer.connect')}</h5>
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
              <Share2 className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors">
              <MessageCircle className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} {t('footer.rights')}</p>
        <p className="flex items-center gap-1 mt-4 md:mt-0">
          {t('footer.builtWith')} <Heart className="w-4 h-4 text-red-500" /> {t('footer.forCommunity')}
        </p>
      </div>
    </footer>
  );
}
