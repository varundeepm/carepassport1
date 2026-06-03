export type StoredPatientCsv = {
  patientId: string;
  fileName: string;
  csvText: string;
  timestamp: number;
};

const KEY_PREFIX = 'patient_viz_csv:';

export function savePatientCsv(patientId: string, fileName: string, csvText: string): StoredPatientCsv {
  const record: StoredPatientCsv = {
    patientId,
    fileName,
    csvText,
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem(KEY_PREFIX + patientId, JSON.stringify(record));
  } catch (_) {
    // Ignore storage errors (quota etc.)
  }
  return record;
}

export function getPatientCsv(patientId: string): StoredPatientCsv | null {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + patientId);
    if (!raw) return null;
    return JSON.parse(raw) as StoredPatientCsv;
  } catch (_) {
    return null;
  }
}