'use client';
import {useEffect, useId, useState} from 'react';
import {AI_MODELS, DEFAULT_AI_MODEL, isAIModel, type AIModel} from '../lib/ai-models';
const EVENT = 'profplus-ai-model';
const keyFor = (userId: string) => 'profos-ai-model-' + userId;
function readModel(userId?: string): AIModel {
  if (userId) try { const value = localStorage.getItem(keyFor(userId)); if (isAIModel(value)) return value; } catch {}
  return DEFAULT_AI_MODEL;
}
export function useAIModel(userId?: string) {
  const [choice, setChoice] = useState<{userId?: string; model: AIModel}>({model: DEFAULT_AI_MODEL});
  useEffect(() => {
    const sync = () => setChoice({userId, model: readModel(userId)});
    void Promise.resolve().then(sync);
    window.addEventListener(EVENT, sync); window.addEventListener('storage', sync);
    return () => {window.removeEventListener(EVENT, sync); window.removeEventListener('storage', sync);};
  }, [userId]);
  const model = choice.userId === userId ? choice.model : DEFAULT_AI_MODEL;
  function choose(value: AIModel) {
    if (!userId || !isAIModel(value)) return;
    setChoice({userId, model: value});
    try { localStorage.setItem(keyFor(userId), value); window.dispatchEvent(new Event(EVENT)); } catch {}
  }
  return [model, choose, choice.userId === userId] as const;
}
export default function ModelSelector({value, onChange, disabled = false, compact = false}: {
  value: AIModel; onChange: (value: AIModel) => void; disabled?: boolean; compact?: boolean;
}) {
  const id = useId();
  return <div className={'ai-model-selector' + (compact ? ' compact' : '')}>
    <label htmlFor={id}>Model AI</label>
    <select id={id} value={value} disabled={disabled} onChange={e => {if (isAIModel(e.target.value)) onChange(e.target.value);}} aria-describedby={compact ? undefined : id + '-help'}>
      {AI_MODELS.map(model => <option key={model.id} value={model.id}>{model.label}{compact ? '' : ' — ' + model.description}</option>)}
    </select>
    {!compact && <p id={id + '-help'}>Ambele modele sunt disponibile pentru testare. Alegerea se reține pentru contul tău în acest browser și se aplică următoarelor răspunsuri. GPT-6.1 Sol poate răspunde mai lent.</p>}
  </div>;
}
