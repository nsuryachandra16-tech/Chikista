# Core React Code Snippets for Project Report

This document compiles the most technically significant and impressive React code snippets from the **Chikitsa** platform. These snippets represent the core functionalities of the application and are ready to be included directly in your React-focused academic or project report.

---

## 🔬 Snippet 1: AI Clinical Triage Chat Engine (`HealthCheck.jsx`)
*This snippet demonstrates React state management for a clinical chat interface, complex dynamic system prompt injection for low-latency triage, and custom regex tag-parsing (`[FINAL_VERDICT]`) to trigger database saves and report compilation.*

```javascript
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Stethoscope, MapPin, FileText, Send } from 'lucide-react';

export default function HealthCheck() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [medicalTurnCount, setMedicalTurnCount] = useState(0);
  const [triageReport, setTriageReport] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // 1. Injected Clinical System Prompt optimized for fast triage
      const prompt = `
        You are "Chikitsa AI", a highly efficient clinical doctor. 
        CONVERSATIONAL RULES:
        1. SIMPLE ENGLISH: Never use complex medical jargon. Use language a 10-year-old understands.
        2. EXTREME SPEED: If the user provides clear symptoms (e.g. "cough", "headache"), DO NOT ask follow-up questions. Provide [FINAL_VERDICT] in the FIRST response.
        3. NO CHATTY INTROS: Skip long empathetic paragraphs. Get straight to the analysis.
        4. SKIP TO FINAL: If input has >5 words, it is enough for a preliminary [FINAL_VERDICT].
        
        INVESTIGATION PROTOCOL (Round ${medicalTurnCount + 1} of 3):
        - ONLY ask a question if the input is completely vague (e.g., "I feel bad").
        - For everything else, provide [FINAL_VERDICT] NOW.
      `;

      // 2. Fetching Llama-3.3-70b-versatile via Groq endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage], systemPrompt: prompt })
      });
      const data = await response.json();

      const aiContent = data.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);
      setMedicalTurnCount(prev => prev + 1);

      // 3. Extracting and Parsing the Final Verdict using Regex
      if (aiContent.includes('[FINAL_VERDICT]')) {
        const cleanReport = parseVerdict(aiContent);
        setTriageReport(cleanReport);
        
        // Auto-save parsed report to database via REST API
        await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanReport)
        });
      }
    } catch (err) {
      console.error("Clinical dispatch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Regex parser to extract structured diagnostics from plain-text LLM response
  const parseVerdict = (text) => {
    const diseaseMatch = text.match(/Suspected Condition:\s*(.+)/i);
    const specialistMatch = text.match(/Clinical Recommendation:\s*(.+)/i);
    return {
      disease: diseaseMatch ? diseaseMatch[1].trim() : "Undetermined",
      specialist: specialistMatch ? specialistMatch[1].trim() : "General Physician",
      timestamp: new Date().toISOString()
    };
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-900 rounded-[2rem] p-6">
      {/* Scrollable Clinical Chat Screen */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-medical-500 self-end ml-auto' : 'bg-slate-800 self-start'}`}
            >
              <p className="text-white text-sm">{msg.content}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Tray */}
      <form onSubmit={handleSend} className="mt-4 flex gap-3">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe how you feel (e.g. throbbing sinus headache)..."
          className="flex-1 px-5 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
        />
        <button className="p-4 bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors">
          <Send size={20} className="text-white" />
        </button>
      </form>
    </div>
  );
}
```

---

## 🛡️ Snippet 2: Defensive Rendering Pipeline (`DiseaseInfo.jsx`)
*This snippet showcases advanced defensive programming in React JSX. LLMs sometimes return raw JSON arrays or nested objects instead of simple strings. To prevent a fatal crash (**React Minified Error #31**), this React component intercepts and normalizes the state data dynamically before rendering.*

```javascript
import React, { useState } from 'react';
import { Stethoscope, ShieldCheck, Zap, BookOpen } from 'lucide-react';

export default function DiseaseInfo() {
  const [result, setResult] = useState(null); // Holds dynamic AI diagnostics

  return (
    <div className="space-y-8 p-8 max-w-4xl mx-auto">
      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 space-y-8">
          
          {/* 1. Etiology & Root Causes: Object and Array Check */}
          <section>
            <h4 className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              <Stethoscope size={16} className="text-medical-500" /> Etiology & Root Causes
            </h4>
            <p className="text-base text-slate-300 leading-relaxed">
              {typeof result.causes === 'string' 
                ? result.causes 
                : (Array.isArray(result.causes) 
                    ? result.causes.join(', ') // Joins arrays cleanly to remove brackets and quotes
                    : JSON.stringify(result.causes) // Safe stringify fallback
                  )}
            </p>
          </section>

          {/* 2. Preventive Protocols: Safeguarding Dynamic State */}
          <section className="p-6 bg-emerald-950/20 border border-emerald-800/30 rounded-2xl">
            <h4 className="flex items-center gap-3 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
              <ShieldCheck size={18} /> Preventive Protocols
            </h4>
            <p className="text-emerald-200 text-sm leading-relaxed">
              {typeof result.prevention === 'string' 
                ? result.prevention 
                : (Array.isArray(result.prevention) 
                    ? result.prevention.join(', ') 
                    : JSON.stringify(result.prevention)
                  )}
            </p>
          </section>

          {/* 3. Recommended Therapeutics: Safe Property Extraction from AI Objects */}
          {result.recommendedTablet && (
            <section className="p-6 bg-blue-950/20 border border-blue-800/30 rounded-2xl">
              <h4 className="flex items-center gap-3 text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
                <BookOpen size={16} /> Tablet & Age-Specific Dosage
              </h4>
              <p className="text-blue-200 text-sm leading-relaxed font-bold">
                {typeof result.recommendedTablet === 'string' 
                  ? result.recommendedTablet 
                  : (result.recommendedTablet.name || 
                     result.recommendedTablet.tablet || 
                     JSON.stringify(result.recommendedTablet) // Extends properties without breaking JSX
                    )}
              </p>
            </section>
          )}

        </div>
      )}
    </div>
  );
}
```

---

## 🗺️ Snippet 3: Geospatial Geolocation and Haversine distance (`NearbyCare.jsx`)
*This snippet demonstrates React Leaflet integration with an open-source mapping database (Overpass API). It includes coordinate tracking and a pure JavaScript implementation of the **Haversine Formula** to compute distances along the Earth's curve dynamically.*

```javascript
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

export default function NearbyCare() {
  const [userLocation, setUserLocation] = useState({ lat: 12.9716, lng: 77.5946 }); // Default: Bangalore
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);

  // Core Search Engine: Querying OpenStreetMap Overpass API directly
  const fetchNearbyFacilities = async (lat, lng) => {
    setLoading(true);
    try {
      // OSM Overpass query: Find all amenities matching 'hospital' or 'clinic' within a 10km radius (10,000m)
      const query = `[out:json];node(around:10000,${lat},${lng})[amenity~"hospital|clinic"];out;`;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
      
      const response = await fetch(url);
      const data = await response.json();

      const parsed = (data.elements || []).map((element) => {
        
        // --- MATHEMATICAL HAVERSINE FORMULA IN REACT ---
        const R = 6371; // Earth's Radius in Kilometers
        const dLat = (element.lat - lat) * Math.PI / 180;
        const dLon = (element.lon - lng) * Math.PI / 180;
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat * Math.PI / 180) * Math.cos(element.lat * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
                  
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distanceInKm = R * c; // Mathematical absolute geodesic distance
        // ------------------------------------------------

        return {
          id: element.id,
          name: element.tags?.name || "Local Healthcare Facility",
          lat: element.lat,
          lng: element.lon,
          distance: `${distanceInKm.toFixed(1)} km`,
          distanceVal: distanceInKm
        };
      });

      // Sort coordinates from closest to furthest
      setFacilities(parsed.sort((a, b) => a.distanceVal - b.distanceVal));
    } catch (err) {
      console.error("OSM Overpass extraction failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Automatically retrieve user's hardware coordinates on mount
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        fetchNearbyFacilities(coords.lat, coords.lng);
      },
      () => fetchNearbyFacilities(userLocation.lat, userLocation.lng)
    );
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6">
      
      {/* 1. Left Tray: List of Nearby Facilities */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 max-h-[500px] overflow-y-auto">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <Navigation size={20} className="text-emerald-400" /> Closest Healthcare Services
        </h3>
        {facilities.map((fac) => (
          <div key={fac.id} className="p-4 bg-slate-800 border border-slate-700 rounded-xl flex justify-between">
            <span className="text-slate-200 text-sm font-bold truncate max-w-[70%]">{fac.name}</span>
            <span className="text-emerald-400 text-xs font-bold">{fac.distance}</span>
          </div>
        ))}
      </div>

      {/* 2. Right Tray: Leaflet Map Container */}
      <div className="md:col-span-2 h-[500px] bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden relative">
        <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={14} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {/* User Location pin */}
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>You are here</Popup>
          </Marker>

          {/* Hospital/Clinic pins fetched in real-time */}
          {facilities.map((fac) => (
            <Marker key={fac.id} position={[fac.lat, fac.lng]}>
              <Popup>
                <div className="text-slate-950 font-bold">{fac.name}</div>
                <div className="text-slate-500 text-xs">Distance: {fac.distance}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

    </div>
  );
}
```
