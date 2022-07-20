export interface WorkpalSettings {
  disableNotificationsGlobally: boolean;
  tabs: TabSettings[];
  enabledDictionaries: string[];
  activeTab: string | null;
  width: number;
  height: number;
}

export interface TabSettings {
  id: string;
  sandboxed: boolean;
  disableNotifications: boolean;
  url: string;
  disabled?: boolean;
}
