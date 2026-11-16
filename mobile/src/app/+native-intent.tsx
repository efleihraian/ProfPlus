// Întoarcerea din login-ul Google (profplus://auth/callback?code=...) nu are ecran propriu:
// codul îl preia useAuth().signInWithGoogle, iar aplicația rămâne pe fila Cont.
// P-241: la fel, întoarcerea din importul Google Classroom (profplus://auth/classroom?gc_code=...) este preluată
// de dialogul de import, iar aplicația rămâne pe fila Clase.
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  if (path.includes('auth/classroom')) return '/clase';
  return path.includes('auth/callback') ? '/cont' : path;
}
