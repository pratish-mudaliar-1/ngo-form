"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Camera, MapPin, CheckCircle2, Loader2, UploadCloud, X, Crosshair, Clock, Search } from "lucide-react";
import dynamic from "next/dynamic";

const InteractiveMap = dynamic(
  () => import("./InteractiveMap"),
  { 
    ssr: false, 
    loading: () => (
      <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-md flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="font-semibold text-lg tracking-wide">Initializing High-Fidelity Map Engine...</p>
      </div>
    ) 
  }
);

const ISSUE_TYPES = [
  "Pothole / Damaged Road",
  "Garbage Overflow",
  "Broken Streetlight",
  "Water Leakage / Pipe Burst",
  "Open Drain / Manhole",
  "Traffic Signal Malfunction",
  "Other"
];

const MUMBAI_AREAS = [
  "Andheri East", "Andheri West", "Bandra East", "Bandra West", "Borivali East", "Borivali West",
  "Byculla", "Chembur", "Colaba", "Dadar East", "Dadar West", "Dharavi", "Ghatkopar East", "Ghatkopar West",
  "Goregaon East", "Goregaon West", "Juhu", "Kandivali East", "Kandivali West", "Khar West", "Kurla",
  "Lower Parel", "Malad East", "Malad West", "Mulund East", "Mulund West", "Nariman Point", "Powai",
  "Prabhadevi", "Santacruz East", "Santacruz West", "Sion", "Thane", "Vashi", "Vile Parle East", "Vile Parle West", "Worli"
].sort((a, b) => a.localeCompare(b));

interface GroupedAreas {
  [key: string]: string[];
}

export function ComplaintForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    issueType: "",
    description: "",
    location: "",
    photo: null as string | null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  
  // Advanced Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredAreas, setFilteredAreas] = useState<string[]>(MUMBAI_AREAS);
  const [recentLocations, setRecentLocations] = useState<string[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showMapModal, setShowMapModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load recent locations from LocalStorage
  useEffect(() => {
    const recents = JSON.parse(localStorage.getItem("recent_locations") || "[]");
    setRecentLocations(recents);
  }, []);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine current active lists for keyboard navigation flat-mapping
  const getActiveList = () => {
    if (!formData.location) {
      return recentLocations.length > 0 ? recentLocations : MUMBAI_AREAS;
    }
    return filteredAreas;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "location") {
      setFocusedIndex(-1);
      if (value.length > 0) {
        // Sort & filter alphabetically
        const filtered = MUMBAI_AREAS.filter(area => 
          area.toLowerCase().includes(value.toLowerCase())
        ).sort((a, b) => a.localeCompare(b));
        setFilteredAreas(filtered);
        setShowSuggestions(true);
      } else {
        setFilteredAreas(MUMBAI_AREAS);
        setShowSuggestions(true);
      }
    }
  };

  const selectArea = (area: string) => {
    setFormData(prev => ({ ...prev, location: area }));
    setShowSuggestions(false);
    setFocusedIndex(-1);

    // Save to recents
    const updatedRecents = [area, ...recentLocations.filter(loc => loc !== area)].slice(0, 3);
    setRecentLocations(updatedRecents);
    localStorage.setItem("recent_locations", JSON.stringify(updatedRecents));
  };

  // Keyboard navigation logic
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;
    const activeList = getActiveList();
    if (activeList.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(prev => (prev + 1) % activeList.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(prev => (prev - 1 + activeList.length) % activeList.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < activeList.length) {
        selectArea(activeList[focusedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setFocusedIndex(-1);
    }
  };

  // Autoscroll list items in dropdown when using keyboard
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[focusedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({
          block: "nearest",
          behavior: "smooth"
        });
      }
    }
  }, [focusedIndex]);

  const handleMapLocationConfirm = (address: string) => {
    setFormData(prev => ({ ...prev, location: address }));
    setShowMapModal(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newId = `CMP-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
      const newComplaint = {
        id: newId,
        ...formData,
        timestamp: new Date().toISOString(),
        status: "Pending"
      };

      const existing = JSON.parse(localStorage.getItem("complaints") || "[]");
      localStorage.setItem("complaints", JSON.stringify([newComplaint, ...existing]));

      setSubmittedId(newId);
      setIsSubmitting(false);
    }, 1500);
  };

  const resetForm = () => {
    setFormData({ issueType: "", description: "", location: "", photo: null });
    setSubmittedId(null);
  };

  // Group an array of strings by their first letter alphabetically
  const getGroupedData = (list: string[]): GroupedAreas => {
    return list.reduce((acc: GroupedAreas, val: string) => {
      const firstLetter = val.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(val);
      return acc;
    }, {});
  };

  const renderDropdownContents = () => {
    const activeList = getActiveList();

    if (activeList.length === 0) {
      return (
        <div className="p-8 text-center">
          <p className="text-slate-700 font-medium">{t('form.noMatch')}</p>
        </div>
      );
    }

    // If searching empty but has recents
    if (!formData.location && recentLocations.length > 0) {
      return (
        <div className="p-2 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Recent Locations
          </div>
          <div ref={listRef}>
            {recentLocations.map((loc, idx) => (
              <div
                key={loc}
                onClick={() => selectArea(loc)}
                className={`px-4 py-3 hover:bg-slate-50 cursor-pointer rounded-lg text-slate-700 flex items-center justify-between transition-colors ${focusedIndex === idx ? 'bg-slate-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{loc}</p>
                    <p className="text-[10px] text-slate-400">Recently searched</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Default or filtered view grouped alphabetically
    const grouped = getGroupedData(activeList);
    const sortedKeys = Object.keys(grouped).sort();

    // Map item indexes in the flat active list for focus styling
    let flatIndexCounter = 0;

    return (
      <div className="p-2 space-y-4" ref={listRef}>
        {!formData.location && (
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 pt-2 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" />
            {t('form.popular')}
          </div>
        )}
        {sortedKeys.map(key => (
          <div key={key} className="space-y-1">
            <div className="text-xs font-semibold text-blue-600 bg-blue-50/50 w-6 h-6 rounded-full flex items-center justify-center select-none ml-2">
              {key}
            </div>
            {grouped[key].map(area => {
              const currentFlatIndex = flatIndexCounter++;
              return (
                <div
                  key={area}
                  onClick={() => selectArea(area)}
                  className={`px-4 py-2.5 hover:bg-slate-50 cursor-pointer rounded-lg text-slate-700 flex items-center gap-3 transition-colors ${focusedIndex === currentFlatIndex ? 'bg-blue-50/60' : ''}`}
                >
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{area}</p>
                    <p className="text-[10px] text-slate-400">Mumbai, Maharashtra</p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <section id="report-section" className="bg-[#f8f9fa] py-32 px-6 relative z-10">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-semibold text-slate-800 mb-4 tracking-tight">{t('form.title')}</h2>
          <p className="text-slate-600 text-lg max-w-xl mx-auto">
            Your report goes directly to community logs. Please provide clear details to help resolve the problem faster.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-[0_4px_40px_rgb(0,0,0,0.03)] border border-slate-200/60 p-8 md:p-12 overflow-hidden relative">
          
          <AnimatePresence mode="wait">
            {submittedId ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center text-center py-12"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8 border border-green-100"
                >
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </motion.div>
                <h3 className="text-3xl font-semibold text-slate-800 mb-3 tracking-tight">{t('form.successTitle')}</h3>
                <p className="text-slate-600 mb-10 max-w-md text-lg">
                  Thank you. Your complaint has been securely logged on this device.
                </p>
                
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mb-10 w-full max-w-sm">
                  <p className="text-sm text-slate-500 uppercase tracking-widest mb-2 font-medium">{t('form.refId')}</p>
                  <p className="text-3xl font-mono text-slate-800 tracking-tight">{submittedId}</p>
                </div>

                <button 
                  onClick={resetForm}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-8 py-4 rounded-md transition-colors text-lg"
                >
                  {t('form.submitAnother')}
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit} 
                className="space-y-10"
              >
                
                {/* Issue Type */}
                <div className="relative group">
                  <select
                    id="issueType"
                    name="issueType"
                    required
                    value={formData.issueType}
                    onChange={handleInputChange}
                    className="block w-full bg-transparent border-b-2 border-slate-300 text-slate-800 py-4 focus:outline-none focus:border-blue-600 transition-colors appearance-none peer text-lg font-medium"
                  >
                    <option value="" disabled className="text-slate-400">{t('form.selectIssue')}</option>
                    {ISSUE_TYPES.map(t => <option key={t} value={t} className="text-slate-800">{t}</option>)}
                  </select>
                  <label htmlFor="issueType" className="absolute top-0 -translate-y-4 text-xs font-semibold text-slate-500 uppercase tracking-widest transition-all peer-focus:text-blue-600">
                    {t('form.selectIssue')} <span className="text-red-500">*</span>
                  </label>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 peer-focus:text-blue-600 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>

                {/* Location with Autocomplete & Map Pin */}
                <div className="relative group pt-4" ref={dropdownRef}>
                  <div className="flex items-end gap-3">
                    <div className="relative flex-grow">
                      <input
                        id="location"
                        name="location"
                        type="text"
                        ref={inputRef}
                        required
                        placeholder=" "
                        autoComplete="off"
                        value={formData.location}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                          setShowSuggestions(true);
                          setFocusedIndex(-1);
                        }}
                        className="block w-full bg-transparent border-b-2 border-slate-300 text-slate-800 py-3 pr-10 focus:outline-none focus:border-blue-600 transition-colors peer text-lg font-medium placeholder-transparent"
                      />
                      <label 
                        htmlFor="location" 
                        className="absolute left-0 top-3 text-slate-500 text-lg transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:uppercase peer-focus:font-semibold peer-focus:tracking-widest peer-valid:-top-4 peer-valid:text-xs peer-valid:uppercase peer-valid:font-semibold peer-valid:tracking-widest"
                      >
                        {t('form.locationInput')} <span className="text-red-500">*</span>
                      </label>
                      <MapPin className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 peer-focus:text-blue-600 transition-colors pointer-events-none" />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShowMapModal(true)}
                      title="Mark from Map / GPS"
                      className="flex-shrink-0 w-12 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center transition-colors border border-slate-200"
                    >
                      <Crosshair className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <p className="absolute -bottom-6 left-0 text-xs text-slate-400">Search area, use keyboard arrows, or auto-detect via GPS.</p>

                  {/* Autocomplete Dropdown */}
                  <AnimatePresence>
                    {showSuggestions && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full mt-2 w-[calc(100%-3.75rem)] bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto"
                      >
                        {renderDropdownContents()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Description */}
                <div className="relative group pt-8">
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={3}
                    placeholder=" "
                    value={formData.description}
                    onChange={handleInputChange}
                    className="block w-full bg-transparent border-b-2 border-slate-300 text-slate-800 py-3 focus:outline-none focus:border-blue-600 transition-colors peer text-lg font-medium resize-none placeholder-transparent"
                  />
                  <label 
                    htmlFor="description" 
                    className="absolute left-0 top-3 text-slate-500 text-lg transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:uppercase peer-focus:font-semibold peer-focus:tracking-widest peer-valid:-top-4 peer-valid:text-xs peer-valid:uppercase peer-valid:font-semibold peer-valid:tracking-widest"
                  >
                    {t('form.describe')} <span className="text-red-500">*</span>
                  </label>
                  <p className="absolute -bottom-6 left-0 text-xs text-slate-400">{t('form.describe')}</p>
                </div>

                {/* Photo Upload */}
                <div className="pt-8">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-4">
                    {t('form.photoTitle')}
                  </label>
                  
                  {!formData.photo ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-slate-300 rounded-lg p-10 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-5 group-hover:-translate-y-1 transition-transform">
                        <Camera className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <p className="text-base font-medium text-slate-700">{t('form.photoHelp')}</p>
                      <p className="text-sm text-slate-500 mt-2">Supports JPG, PNG</p>
                    </div>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-video w-full max-h-[400px]">
                      <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute top-4 right-4 p-2.5 bg-slate-900/70 hover:bg-slate-900 backdrop-blur-md text-white rounded-full transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-5 rounded-md shadow-sm transition-all flex items-center justify-center gap-3 text-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        {t('form.submitting')}
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-6 h-6" />
                        {t('form.submit')}
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
      {showMapModal && (
        <InteractiveMap 
          onLocationConfirm={handleMapLocationConfirm}
          onClose={() => setShowMapModal(false)}
        />
      )}
    </section>
  );
}
