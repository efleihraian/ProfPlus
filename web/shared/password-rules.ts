export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 128;

const COMMON = /^(?:parola|password|passw0rd|profplus|qwerty|azerty|asdfgh|zxcvbn|admin|letmein|welcome|iloveyou|abc|123|1234|12345|123456|1234567|12345678|123456789|1234567890|0123456789|111111|000000)+[\d!.?_-]*$/i;
const SEQUENCES = ["0123456789", "abcdefghijklmnopqrstuvwxyz", "qwertyuiopasdfghjklzxcvbnm"];

const distinct = (value: string) => new Set(value.toLowerCase()).size;
const obvious = (value: string) => { const lower = value.toLowerCase(); return COMMON.test(lower) || SEQUENCES.some(seq => seq.includes(lower) || (seq + seq).includes(lower)); };

export function weakPassword(value: string): boolean {
  return distinct(value) < 5 || obvious(value);
}

export function passwordRules(value: string): {id: string; label: string; ok: boolean}[] {
  return [
    {id: "length", label: `Între ${PASSWORD_MIN} și ${PASSWORD_MAX} de caractere`, ok: value.length >= PASSWORD_MIN && value.length <= PASSWORD_MAX},
    {id: "distinct", label: "Cel puțin 5 caractere diferite", ok: distinct(value) >= 5},
    {id: "common", label: "Nu o parolă comună sau un șir simplu (123456, qwerty, abcdef)", ok: value.length > 0 && !obvious(value)},
  ];
}
