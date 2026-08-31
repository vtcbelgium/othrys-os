import type { AtlasStatus, AtlasHealth, AtlasRisk } from "../domain/atlas-model.js";
export interface Overlay {
    readonly label: string;
    readonly icon: string;
    readonly tone: "good" | "warn" | "bad" | "neutral" | "muted";
    readonly accessibleText: string;
}
export declare function statusOverlay(status: AtlasStatus): Overlay;
export declare function healthOverlay(health: AtlasHealth): Overlay;
export declare function riskOverlay(risk: AtlasRisk): Overlay;
//# sourceMappingURL=overlays.d.ts.map