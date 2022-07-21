interface Source {
  storageSource: {
    bucket: string;
    object: string;
    generation: string;
  };
}

interface PushTiming {
  startTime: string;
  endTime: string;
}

interface Image {
  name: string;
  digest: string;
  pushTiming: PushTiming;
}

interface Results {
  images: Image[];
  buildStepImages: string[];
  buildStepOutputs: string[];
}

interface Timing {
  startTime: string;
  endTime: string;
}

interface PullTiming {
  startTime: string;
  endTime: string;
}

interface Step {
  name: string;
  args: string[];
  timing?: Timing;
  status?: string;
  pullTiming?: PullTiming;
}

interface ResolvedStorageSource {
  bucket: string;
  object: string;
  generation: string;
}

interface FileHash {
  type: string;
  value: string;
}

interface SourceProvenance {
  resolvedStorageSource: ResolvedStorageSource;
  fileHashes?: Record<string, FileHash>;
}

interface Options {
  logging: string;
  pool: {};
}

interface Substitutions {
  COMMIT_SHA: string;
  REPO_NAME: string;
  REF_NAME: string;
  _SERVICE_NAME: string;
  REVISION_ID: string;
  SHORT_SHA: string;
  BRANCH_NAME: string;
  TRIGGER_BUILD_CONFIG_PATH: string;
  _PLATFORM: string;
  TRIGGER_NAME: string;
  _DEPLOY_REGION: string;
  _GCR_HOSTNAME: string;
  _LABELS: string;
  _TRIGGER_ID: string;
}

export interface CloudBuildMessage {
  id: string;
  status: "QUEUED" | "WORKING" | "SUCCESS" | "FAILURE" | "INTERNAL_ERROR";
  source: Source;
  createTime: string | Date;
  startTime: string | Date;
  finishTime?: string | Date;
  results?: Results;
  steps: Step[];
  timeout: string;
  images: string[];
  projectId: string;
  logsBucket: string;
  sourceProvenance: SourceProvenance;
  options: Options;
  logUrl: string;
  substitutions?: Substitutions;
  tags: string[];
  timing?: Record<
    "FETCHSOURCE" | "BUILD" | "PUSH",
    { startTime: string | Date; endTime: string | Date }
  >;
  artifacts: { images: string[] };
  queueTtl: string;
  name: string;
}
