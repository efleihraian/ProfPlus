// Întoarcerea din login-ul Google (profplus://auth/callback?code=...) nu are ecran propriu:
// codul îl preia useAuth().signInWithGoogle, iar aplicația rămâne pe fila Cont.
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  return path.includes('auth/callback') ? '/cont' : path;
}
