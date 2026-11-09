// Profilul didactic, ca pe site (web/app/account/teaching-form.tsx): rolul, disciplina și ciclurile de clase.
// Se salvează prin serverul ProfPlus, care validează disciplina și ciclurile (POST /api/account, acțiunea profile).
import { openBrowserAsync } from 'expo-web-browser';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Choice } from '@/components/account/choice';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { SITE_URL } from '@/components/ui/coming-soon';
import { Select } from '@/components/ui/select';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api, ApiError, TEACHING_STAGES, type AccountResponse, type Stage, type TeachingProfile } from '@/lib/api';

type Props = { account: AccountResponse; showName?: boolean; disabled?: boolean; onSaved: (message: string) => void };

/** Serverul care primește profilul și ștergerea din aplicație trimite și lista disciplinelor (P-195). Un server mai vechi le refuză. */
export const accountEditable = (account: AccountResponse) => Array.isArray(account.subjects);

/** Până la actualizarea serverului, profilul se schimbă pe site; formularul ar fi refuzat. */
export function OnSite({ what }: { what: string }) {
  return (
    <View style={styles.form}>
      <ThemedText themeColor="muted">{what} se poate face din aplicație după actualizarea serverului ProfPlus. Până atunci, folosește site-ul, cu același cont.</ThemedText>
      <Button variant="secondary" onPress={() => openBrowserAsync(SITE_URL + '/account')}>
        Deschide contul pe profplus.ro
      </Button>
    </View>
  );
}

export function TeachingForm(props: Props) {
  return accountEditable(props.account) ? <Form {...props} /> : <OnSite what="Completarea profilului" />;
}

function Form({ account, showName, disabled, onSaved }: Props) {
  const theme = useTheme();
  const initial = account.user?.teaching ?? null;
  const [name, setName] = useState(account.user?.name ?? '');
  const [role, setRole] = useState<TeachingProfile['role'] | ''>(initial?.role ?? '');
  const [subject, setSubject] = useState(initial?.role === 'teacher' ? initial.subject : '');
  const [stages, setStages] = useState<Stage[]>(initial?.role === 'teacher' ? initial.stages : []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subjects = account.subjects ?? [];
  const ready = role === 'primary' || (role === 'teacher' && !!subject && stages.length > 0);
  const locked = disabled || busy;

  async function save() {
    if (!ready) return;
    const teaching: TeachingProfile = role === 'primary' ? { role: 'primary', subject: '*', stages: ['primary'] } : { role: 'teacher', subject, stages };
    setBusy(true);
    setError(null);
    try {
      const result = await api.account.update({ action: 'profile', name: name.trim(), teaching });
      onSaved(result.message ?? 'Profil salvat.');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Profilul nu a putut fi salvat. Verifică internetul și încearcă din nou.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.form}>
      {showName ? (
        <TextField label="Nume afișat (opțional)" value={name} onChangeText={setName} maxLength={100} autoComplete="name" textContentType="name" editable={!locked} />
      ) : null}
      <ThemedText type="smallBold" accessibilityRole="header">
        Cum predai?
      </ThemedText>
      <Choice kind="radio" label="Învățător — toate materiile, clasele 0–4" selected={role === 'primary'} onPress={() => setRole('primary')} disabled={locked} />
      <Choice kind="radio" label="Profesor — aleg disciplina și clasele" selected={role === 'teacher'} onPress={() => setRole('teacher')} disabled={locked} />
      {role === 'teacher' ? (
        subjects.length ? (
          <>
            <Select label="Disciplina" value={subject} options={[{ value: '', label: 'Alege disciplina' }, ...subjects.map((s) => ({ value: s, label: s }))]} onChange={setSubject} />
            <ThemedText type="smallBold" accessibilityRole="header">
              La ce clase predai? Poți alege mai multe cicluri.
            </ThemedText>
            {TEACHING_STAGES.map((stage) => (
              <Choice
                key={stage.id}
                kind="checkbox"
                label={stage.label}
                selected={stages.includes(stage.id)}
                disabled={locked}
                onPress={() => setStages((current) => (current.includes(stage.id) ? current.filter((s) => s !== stage.id) : [...current, stage.id]))}
              />
            ))}
          </>
        ) : (
          <ThemedText themeColor="dangerText">Lista disciplinelor nu s-a încărcat. Încearcă din nou puțin mai târziu.</ThemedText>
        )
      ) : null}
      <ThemedText type="small" themeColor="muted">
        Se aleg automat manualele, culegerile, olimpiadele, concursurile și documentele potrivite materiei și claselor. Nu solicităm școala, adresa sau date despre elevi.
      </ThemedText>
      {error ? (
        <View accessibilityLiveRegion="polite" style={[styles.error, { backgroundColor: theme.dangerSoft, borderColor: theme.dangerBorder }]}>
          <ThemedText themeColor="dangerText">{error}</ThemedText>
        </View>
      ) : null}
      <Button onPress={save} loading={busy} disabled={!ready || disabled}>
        {initial ? 'Salvează profilul' : 'Salvează și continuă'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.two },
  error: { borderWidth: 1, borderRadius: 8, padding: 12 },
});
