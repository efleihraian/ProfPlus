import type {Stage,TeachingProfile} from "./api-types";

export const EDUCATOR_PROFILE: TeachingProfile = {role: "educator", subject: "Educație timpurie", stages: []};

export const TEACHING_STAGES = [{id: "primary", label: "Clasele 0–IV"}, {id: "middle", label: "Clasele V–VIII"}, {id: "high", label: "Clasele IX–XIII"}] as const satisfies readonly {id: Stage; label: string}[];
