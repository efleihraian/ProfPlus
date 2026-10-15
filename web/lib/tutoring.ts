/**
 * P-087: anunțuri de meditații — tipuri și validare comune client/server.
 * Datele de contact sunt introduse și publicate de profesor, cu acord explicit; se afișează doar utilizatorilor conectați.
 */
export const TUTORING_LEVELS = [{id: "primar", label: "Primar"}, {id: "gimnaziu", label: "Gimnaziu"}, {id: "liceu", label: "Liceu"}, {id: "evaluare", label: "Evaluarea Națională"}, {id: "bacalaureat", label: "Bacalaureat"}] as const;
export const TUTORING_FORMATS = [{id: "online", label: "Online"}, {id: "domiciliu", label: "La domiciliul elevului"}, {id: "sediu", label: "La mine"}] as const;
export type TutoringLevel = typeof TUTORING_LEVELS[number]["id"];
export type TutoringFormat = typeof TUTORING_FORMATS[number]["id"];
export const COMMON_SUBJECTS = ["Matematică", "Limba și literatura română", "Limba engleză", "Limba franceză", "Limba germană", "Fizică", "Chimie", "Biologie", "Informatică", "Istorie", "Geografie", "Pregătire pentru clasa pregătitoare", "Muzică", "Desen"];
export const MAX_ACTIVE_ADS = 3, AD_DAYS = 60, AUTO_HIDE_REPORTS = 3;
export type TutoringInput = {displayName: string; title: string; subject: string; levels: TutoringLevel[]; formats: TutoringFormat[]; city: string; price: number | null; description: string; contactEmail: string; contactPhone: string};
export type TutoringAd = Omit<TutoringInput, "contactEmail" | "contactPhone"> & {id: string; updatedAt: string; expiresAt: string};
export type OwnTutoringAd = TutoringInput & {id: string; status: "published" | "paused" | "hidden"; updatedAt: string; expiresAt: string};

const clean = (v: unknown, max: number) => typeof v === "string" ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").replace(/[ \t]+/g, " ").trim().slice(0, max + 1) : null;
const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(ro|com|net|org|eu|info)\b)/i;
export const validEmail = (v: string) => v === "" || (/^[^\s@<>()]{1,64}@[^\s@<>()]+\.[a-z]{2,}$/i.test(v) && v.length <= 254);
export const normalPhone = (v: string) => v.replace(/[\s().-]/g, "");
export const validPhone = (v: string) => v === "" || /^\+?\d{9,15}$/.test(normalPhone(v));
export type TutoringError = {field: keyof TutoringInput | "consent"; message: string};
/** Validează și normalizează anunțul; întoarce prima eroare, cu numele câmpului pentru formular. */
export function validateTutoring(value: unknown): {ok: true; input: TutoringInput} | {ok: false; error: TutoringError} {
  if (!value || typeof value !== "object") return {ok: false, error: {field: "title", message: "Completează anunțul."}};
  const v = value as Record<string, unknown>;
  const displayName = clean(v.displayName, 60), title = clean(v.title, 90), subject = clean(v.subject, 80), city = clean(v.city, 60) ?? "", description = typeof v.description === "string" ? v.description.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim() : null;
  const contactEmail = (clean(v.contactEmail, 254) ?? "").toLowerCase(), contactPhone = normalPhone(clean(v.contactPhone, 20) ?? "");
  const levels = Array.isArray(v.levels) ? [...new Set(v.levels)] : [], formats = Array.isArray(v.formats) ? [...new Set(v.formats)] : [];
  const price = v.price === null || v.price === "" || v.price === undefined ? null : Number(v.price);
  const fail = (field: TutoringError["field"], message: string) => ({ok: false as const, error: {field, message}});
  if (!displayName || displayName.length < 2 || displayName.length > 60) return fail("displayName", "Numele afișat are 2–60 de caractere.");
  if (!title || title.length < 5 || title.length > 90) return fail("title", "Titlul are 5–90 de caractere.");
  if (!subject || subject.length < 2 || subject.length > 80) return fail("subject", "Alege disciplina.");
  if (!levels.length || levels.some(l => !TUTORING_LEVELS.some(t => t.id === l))) return fail("levels", "Alege cel puțin un nivel.");
  if (!formats.length || formats.some(f => !TUTORING_FORMATS.some(t => t.id === f))) return fail("formats", "Alege cel puțin un mod de desfășurare.");
  if (city.length > 60) return fail("city", "Localitatea are cel mult 60 de caractere.");
  if (formats.some(f => f !== "online") && !city) return fail("city", "Scrie localitatea pentru meditațiile față în față.");
  if (price !== null && (!Number.isInteger(price) || price < 0 || price > 1000)) return fail("price", "Prețul pe oră este un număr întreg între 0 și 1000 lei.");
  if (!description || description.length < 30 || description.length > 1200) return fail("description", "Descrierea are 30–1200 de caractere.");
  if ([title, description, displayName, city].some(t => LINK.test(t))) return fail("description", "Nu include linkuri sau adrese web în anunț.");
  if (!validEmail(contactEmail)) return fail("contactEmail", "Adresa de e-mail nu este validă.");
  if (!validPhone(contactPhone)) return fail("contactPhone", "Telefonul are 9–15 cifre.");
  if (!contactEmail && !contactPhone) return fail("contactEmail", "Lasă cel puțin un e-mail sau un telefon de contact.");
  return {ok: true, input: {displayName, title, subject, levels: levels as TutoringLevel[], formats: formats as TutoringFormat[], city, price, description, contactEmail, contactPhone}};
}
export const levelLabel = (id: string) => TUTORING_LEVELS.find(l => l.id === id)?.label || id;
export const formatLabel = (id: string) => TUTORING_FORMATS.find(f => f.id === id)?.label || id;
export const priceLabel = (price: number | null) => price === null ? "Preț la cerere" : price === 0 ? "Gratuit" : `${price} lei / oră`;
