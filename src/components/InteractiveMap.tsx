"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { MapPin, Crosshair, Map as MapIcon, Plus, Minus, Check, Loader2, Navigation } from "lucide-react";
import L from "leaflet";

// Mumbai Center Coordinates
const MUMBAI_CENTER: [number, number] = [19.0760, 72.8777];

// Map Styles definition
const MAP_STYLES = {
  street: {
    name: "Street View",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  satellite: {
    name: "Satellite View",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
  },
  dark: {
    name: "Dark View",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }
};

type StyleKey = keyof typeof MAP_STYLES;

interface InteractiveMapProps {
  onLocationConfirm: (address: string) => void;
  onClose: () => void;
}

export default function InteractiveMap({ onLocationConfirm, onClose }: InteractiveMapProps) {
  const { t } = useTranslation();
  const [mapStyle, setMapStyle] = useState<StyleKey>("street");
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [address, setAddress] = useState("Determining address...");
  const [coords, setCoords] = useState<[number, number]>(MUMBAI_CENTER);
  const [isMapMoving, setIsMapMoving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied">("prompt");
  
  const mapRef = useRef<L.Map | null>(null);

  // Geo-location trigger
  const requestLocationAccess = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords: [number, number] = [position.coords.latitude, position.coords.longitude];
        setCoords(userCoords);
        setPermissionState("granted");
        setIsLocating(false);
        if (mapRef.current) {
          mapRef.current.flyTo(userCoords, 16, { duration: 1.5 });
        }
      },
      (error) => {
        console.error(error);
        setPermissionState("denied");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Mock Reverse Geocoder based on coordinates
  const reverseGeocode = (lat: number, lng: number) => {
    setAddress("Fetching nearby landmark...");
    
    // Simulate API delay
    setTimeout(() => {
      // Map basic coordinates to realistic Mumbai locations
      if (lat > 19.11 && lat < 19.14 && lng > 72.82 && lng < 72.85) {
        setAddress("Andheri West, Near Metro Station, Mumbai");
      } else if (lat > 19.05 && lat < 19.08 && lng > 72.82 && lng < 72.85) {
        setAddress("Bandra West, Linking Road, Mumbai");
      } else if (lat > 19.11 && lat < 19.14 && lng > 72.86 && lng < 72.90) {
        setAddress("Powai, Hiranandani Gardens, Mumbai");
      } else if (lat > 19.01 && lat < 19.04 && lng > 72.81 && lng < 72.84) {
        setAddress("Worli Sea Face, Near Promenade, Mumbai");
      } else {
        setAddress(`Selected Location (${lat.toFixed(4)}, ${lng.toFixed(4)}), Mumbai`);
      }
    }, 800);
  };

  // Listeners for Map events
  function MapEventsHandler() {
    const map = useMapEvents({
      movestart: () => {
        setIsMapMoving(true);
      },
      moveend: () => {
        setIsMapMoving(false);
        const center = map.getCenter();
        const newCoords: [number, number] = [center.lat, center.lng];
        setCoords(newCoords);
        reverseGeocode(center.lat, center.lng);
      }
    });

    useEffect(() => {
      if (map) mapRef.current = map;
    }, [map]);

    return null;
  }

  // Handle zooming controls manually
  const handleZoom = (type: "in" | "out") => {
    if (mapRef.current) {
      if (type === "in") mapRef.current.zoomIn();
      else mapRef.current.zoomOut();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col md:flex-row overflow-hidden">
      
      {/* Interactive Map Canvas */}
      <div className="relative flex-grow h-full w-full">
        {permissionState === "prompt" ? (
          <div className="absolute inset-0 bg-slate-900/90 z-50 flex flex-col items-center justify-center p-6 text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-slate-100"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Navigation className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{t('map.enableGps')}</h3>
              <p className="text-slate-600 mb-6">
                {t('map.gpsDesc')}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={requestLocationAccess}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('map.locatingText')}
                    </>
                  ) : (
                    t('map.grantAccess')
                  )}
                </button>
                <button
                  onClick={() => setPermissionState("granted")}
                  className="text-slate-500 hover:text-slate-700 font-medium py-2 transition-colors text-sm"
                >
                  {t('map.skip')}
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}

        {/* The Leaflet Map container */}
        <MapContainer
          center={coords}
          zoom={14}
          zoomControl={false}
          className="h-full w-full z-10"
        >
          <TileLayer
            attribution={MAP_STYLES[mapStyle].attribution}
            url={MAP_STYLES[mapStyle].url}
          />
          <MapEventsHandler />
        </MapContainer>

        {/* Stationary Custom Bouncing Marker in Absolute Center of Viewport */}
        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
          <motion.div 
            animate={{ 
              y: isMapMoving ? -18 : 0,
              scale: isMapMoving ? 1.1 : 1
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <MapPin className="w-12 h-12 text-blue-600 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]" fill="rgba(37,99,235,0.2)" />
              {/* Pulsing visual core inside map pin */}
              <div className="absolute top-[13px] left-[18px] w-3 h-3 bg-white rounded-full border border-blue-600" />
            </div>
            {/* Visual Shadow beneath pin when bouncing */}
            <motion.div 
              animate={{ 
                scale: isMapMoving ? 0.5 : 1,
                opacity: isMapMoving ? 0.3 : 0.7
              }}
              className="w-4 h-1 bg-black/40 rounded-full blur-[1px] mt-1" 
            />
          </motion.div>
        </div>

        {/* Modern Glassmorphic Top Controls */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-3">
          <button
            onClick={onClose}
            className="bg-white/95 backdrop-blur-md border border-slate-200/80 p-3 rounded-xl shadow-lg text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-semibold"
          >
            <span className="text-lg">←</span> Back to Form
          </button>
        </div>

        {/* Right Floating Modern Controls */}
        <div className="absolute right-4 top-4 z-20 flex flex-col gap-3">
          {/* Map style switcher */}
          <div className="relative">
            <button
              onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
              className="bg-white/95 backdrop-blur-md border border-slate-200/80 p-3.5 rounded-xl shadow-lg text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center"
              title="Switch Map Layers"
            >
              <MapIcon className="w-5 h-5 text-slate-600" />
            </button>
            <AnimatePresence>
              {isStyleMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: 10 }}
                  className="absolute right-full mr-2 top-0 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden p-2 flex flex-col gap-1 min-w-[140px]"
                >
                  {(Object.keys(MAP_STYLES) as StyleKey[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setMapStyle(key);
                        setIsStyleMenuOpen(false);
                      }}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors flex items-center justify-between ${mapStyle === key ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      {MAP_STYLES[key].name}
                      {mapStyle === key && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Zoom Buttons */}
          <div className="flex flex-col rounded-xl overflow-hidden shadow-lg border border-slate-200/80 bg-white/95 backdrop-blur-md">
            <button
              onClick={() => handleZoom("in")}
              className="p-3.5 hover:bg-slate-50 text-slate-600 border-b border-slate-100 flex items-center justify-center transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleZoom("out")}
              className="p-3.5 hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>

          {/* Locate me trigger */}
          <button
            onClick={requestLocationAccess}
            className="bg-blue-600 hover:bg-blue-700 p-3.5 rounded-xl shadow-lg text-white transition-all flex items-center justify-center"
            title="Locate Me / GPS Tracking"
          >
            <Crosshair className="w-5 h-5" />
          </button>
        </div>

        {/* Beautiful Floating Bottom Sheet Address Confirmation Sheet */}
        <div className="absolute bottom-6 inset-x-6 z-20 flex justify-center pointer-events-none">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-slate-200/80 p-5 pointer-events-auto flex flex-col gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-grow">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('map.confirmLocation')}</h4>
                <p className="text-slate-800 font-semibold text-lg leading-snug mt-1">{address}</p>
                <p className="text-slate-400 text-xs mt-1">Coordinates: {coords[0].toFixed(5)}, {coords[1].toFixed(5)}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onLocationConfirm(address)}
                className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md text-center text-sm flex items-center justify-center gap-1.5"
              >
                {t('map.confirmLocation')}
              </button>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
