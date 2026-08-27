export interface ResourceRequest {
  readonly cpu_threads: number;
  readonly ram_mb: number;
  readonly gpu_count: number;
  readonly vram_mb: number;
}

export interface CapabilityRequest {
  readonly capability: string;
  readonly resources: Readonly<ResourceRequest>;
}

export function factoryBuildRequirement(): Readonly<CapabilityRequest> {
  return Object.freeze({
    capability: "engineering.patch",
    resources: Object.freeze({cpu_threads:1, ram_mb:1024, gpu_count:0, vram_mb:0}),
  });
}
