export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  if (path.includes('auth/classroom')) return '/clase';
  return path.includes('auth/callback') ? '/cont' : path;
}
