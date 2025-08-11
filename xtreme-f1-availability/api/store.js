import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export function loadJson(filename){
  const p = path.join(DATA_DIR, filename);
  if(!fs.existsSync(p)) return JSON.parse('{}');
  return JSON.parse(fs.readFileSync(p,'utf8') || '{}');
}
export function saveJson(filename, data){
  const p = path.join(DATA_DIR, filename);
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

// ---- Availability helpers ----
const AVAIL_FILE = path.join(DATA_DIR, 'availability.json');
export function loadAvailability() {
  if (!fs.existsSync(AVAIL_FILE)) return {};
  return JSON.parse(fs.readFileSync(AVAIL_FILE, 'utf8'));
}
export function saveAvailability(obj) {
  fs.writeFileSync(AVAIL_FILE, JSON.stringify(obj, null, 2));
}

export function buildSlotsForDay(tz, businessHours, slotLen) {
  const [oH,oM] = businessHours.open.split(':').map(Number);
  const [cH,cM] = businessHours.close.split(':').map(Number);
  const start = oH * 60 + oM;
  const end   = cH * 60 + cM;
  const out = [];
  for (let m = start; m + slotLen <= end; m += slotLen) {
    const hh = String(Math.floor(m/60)).padStart(2,'0');
    const mm = String(m%60).padStart(2,'0');
    out.push(`${hh}:${mm}`);
  }
  return out;
}