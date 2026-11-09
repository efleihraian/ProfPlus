// P-194 — anunț în pagină când se schimbă proiectele (de ex. o clasă creată sau ștearsă creează/șterge proiectul ei),
// ca Asistentul, montat în fundal, să-și reîncarce istoricul fără refresh manual. Nu transportă date.
export const PROJECTS_CHANGED = 'profplus:projects-changed';
export function notifyProjectsChanged() { if (typeof window !== 'undefined') window.dispatchEvent(new Event(PROJECTS_CHANGED)); }
