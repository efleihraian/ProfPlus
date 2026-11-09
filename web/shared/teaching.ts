// Ciclurile de clase din profilul didactic, pentru aplicația mobilă (P-195).
// Copia lui `stages` din web/lib/teaching-profile.ts; tests/mobile-account.mjs verifică să rămână identice.
import type {Stage} from "./api-types";

export const TEACHING_STAGES = [{id: "primary", label: "Clasele 0–IV"}, {id: "middle", label: "Clasele V–VIII"}, {id: "high", label: "Clasele IX–XIII"}] as const satisfies readonly {id: Stage; label: string}[];
