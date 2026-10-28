export const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

/** 25 Oktober 2026 */
export const formatDateId = (d: Date) => `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;

/** Tanggal default kunjungan: besok. */
export const defaultTourDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDateId(d);
};

/** "25 Oktober 2026" atau "2026-10-25" -> "2026-10-25" (format yang dibaca Postgres). */
export const toIsoDate = (value: string): string => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const m = value.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!m) throw new Error(`Format tanggal tidak dikenali: ${value}`);
  const idx = MONTHS_ID.findIndex((n) => n.toLowerCase() === m[2].toLowerCase());
  if (idx < 0) throw new Error(`Nama bulan tidak dikenali: ${m[2]}`);
  return `${m[3]}-${String(idx + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
};
