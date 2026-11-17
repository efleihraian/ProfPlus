export const PROJECTS_CHANGED = 'profplus:projects-changed';
export function notifyProjectsChanged() { if (typeof window !== 'undefined') window.dispatchEvent(new Event(PROJECTS_CHANGED)); }
