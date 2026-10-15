/** Public model catalogue only. API credentials and entitlement decisions stay server-side. */
export const AI_MODELS = [
  {id: 'gpt-4.1-mini', label: 'GPT-4.1 mini', description: 'Rapid · pentru cerințe uzuale'},
  {id: 'gpt-6.1-sol', label: 'GPT-6.1 Sol', description: 'Raționament · pentru cerințe complexe'},
] as const;
export type AIModel = typeof AI_MODELS[number]['id'];
export const DEFAULT_AI_MODEL: AIModel = 'gpt-4.1-mini';
export function isAIModel(value: unknown): value is AIModel {
  return AI_MODELS.some(model => model.id === value);
}
export function resolveAIModel(requested: unknown, authenticated: boolean, configured?: string): AIModel {
  if (requested !== undefined && !isAIModel(requested)) throw new Error('INVALID_AI_MODEL');
  if (!authenticated) {
    if (requested === 'gpt-6.1-sol') throw new Error('AI_MODEL_LOGIN_REQUIRED');
    return DEFAULT_AI_MODEL;
  }
  // Pilot: every authenticated account may test both. Replace this policy with server-verified entitlements when plans launch.
  return requested as AIModel | undefined ?? (isAIModel(configured) ? configured : DEFAULT_AI_MODEL);
}
export function modelLabel(value: unknown): string {
  return AI_MODELS.find(model => model.id === value)?.label || '';
}
export function modelRequestOptions(model: unknown, outputTokens: number) {
  return model === 'gpt-6.1-sol'
    ? {reasoning: {effort: 'medium'}, max_output_tokens: outputTokens + 8000}
    : {max_output_tokens: outputTokens};
}
