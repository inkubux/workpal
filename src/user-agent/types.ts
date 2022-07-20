export type ChromiumVersions = Array<{
  os: string;
  versions: Array<{
    branch_commit: string;
    branch_base_position: string;
    skia_commit?: string;
    v8_version: string;
    previous_version: string;
    v8_commit?: string;
    true_branch: string;
    previous_reldate: string;
    branch_base_commit: string;
    version: string;
    current_reldate: string;
    current_version: string;
    os: string;
    channel: ChromiumVersionsChannel;
    chromium_commit?: string;
  }>;
}>;

export enum ChromiumVersionsChannel {
  Beta = "beta",
  Canary = "canary",
  CanaryAsan = "canary_asan",
  Dev = "dev",
  Stable = "stable",
}

export type FirefoxVersions = {
  FIREFOX_AURORA: string;
  FIREFOX_DEVEDITION: string;
  FIREFOX_ESR: string;
  FIREFOX_ESR_NEXT: string;
  FIREFOX_NIGHTLY: string;
  FIREFOX_PINEBUILD: string;
  LAST_MERGE_DATE: string;
  LAST_RELEASE_DATE: string;
  LAST_SOFTFREEZE_DATE: string;
  LATEST_FIREFOX_DEVEL_VERSION: string;
  LATEST_FIREFOX_OLDER_VERSION: string;
  LATEST_FIREFOX_RELEASED_DEVEL_VERSION: string;
  LATEST_FIREFOX_VERSION: string;
  NEXT_MERGE_DATE: string;
  NEXT_RELEASE_DATE: string;
  NEXT_SOFTFREEZE_DATE: string;
};
