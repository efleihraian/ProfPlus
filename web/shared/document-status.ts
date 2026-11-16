export const statusLabel = (status: string) => status === "ready" ? "Gata · folosit de Profi" : status === "indexing" ? "Se pregătește…" : status === "uploading" ? "Se încarcă…" : status === "deleting" ? "Se șterge…" : "Eroare · șterge și reîncarcă";
export const busyStatus = (status: string) => ["uploading", "indexing", "deleting"].includes(status);
