import {Image} from 'expo-image';
import { openBrowserAsync } from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SITE_URL } from '@/components/ui/coming-soon';
import { Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { defaultNewsSettings, newsDate, newsExcerpt, safeNewsUrl, type NewsArticle, type NewsSettings } from '../../../web/lib/news';

export function HomeNews({accountId}: {accountId?: string}) {
  const [data, setData] = useState<{articles: NewsArticle[]; settings: NewsSettings} | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void api.request<{articles: NewsArticle[]; settings: NewsSettings}>('/api/news?home=1', {signal: controller.signal}).then(result => {
      if (!controller.signal.aborted) setData(result);
    }).catch(() => {
      if (!controller.signal.aborted) setFailed(true);
    });
    return () => controller.abort();
  }, [accountId, attempt]);

  const settings = data?.settings ?? defaultNewsSettings;
  const articles = (data?.articles ?? []).filter(article => article.status === 'published' && article.slot >= 0 && article.slot < 4)
    .sort((first, second) => first.slot - second.slot).slice(0, 4);

  return (
    <View style={styles.section}>
      <ThemedText type="subtitle" accessibilityRole="header">{settings.title}</ThemedText>
      {settings.intro ? <ThemedText themeColor="muted">{settings.intro}</ThemedText> : null}
      {failed ? (
        <View style={styles.section}>
          <ThemedText themeColor="muted" accessibilityLiveRegion="polite">Știrile nu pot fi încărcate momentan.</ThemedText>
          <Button variant="secondary" onPress={() => {setFailed(false); setAttempt(previous => previous + 1);}}>Reîncearcă</Button>
        </View>
      ) : !data ? <ActivityIndicator accessibilityLabel="Se încarcă știrile" style={styles.loading} /> : !articles.length ? (
        <ThemedText themeColor="muted">Noutățile pentru profesori vor apărea aici.</ThemedText>
      ) : null}
      {articles.map(article => (
        <Card key={article.id} title={article.title}>
          {article.image_url && safeNewsUrl(article.image_url) ? <NewsPhoto key={article.image_url} url={article.image_url} /> : null}
          <ThemedText type="small" themeColor="muted">{[article.category, newsDate(article)].filter(Boolean).join(' · ')}</ThemedText>
          <ThemedText>{newsExcerpt(article)}</ThemedText>
          {article.source_url && safeNewsUrl(article.source_url) ? (
            <Button variant="secondary" onPress={() => void openBrowserAsync(article.source_url)}>Citește la sursă</Button>
          ) : null}
        </Card>
      ))}
      <Button variant="secondary" onPress={() => void openBrowserAsync(SITE_URL + '/news')}>Toate știrile</Button>
    </View>
  );
}

function NewsPhoto({url}: {url: string}) {
  const [failed, setFailed] = useState(false);
  return failed ? null : <Image source={url} contentFit="cover" accessible={false} onError={() => setFailed(true)} style={styles.photo} />;
}

const styles = StyleSheet.create({
  section: {gap: Spacing.two},
  photo: {width: '100%', aspectRatio: 16 / 9, borderRadius: 8},
  loading: {alignSelf: 'flex-start'},
});
