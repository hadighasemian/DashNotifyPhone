export type PaginatedMeta = {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number;
  to?: number;
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role?: string | { id?: number; name?: string; title?: string };
  created_at?: string;
  updated_at?: string;
};

export type Device = {
  id: number;
  device_uuid: string;
  brand?: string;
  model?: string;
  manufacturer?: string;
  os_version?: string;
  sdk_int?: number;
  app_version?: string;
  label?: string | null;
  notification_access?: boolean;
  battery_optimization_ignored?: boolean;
  last_seen_at?: string | null;
  is_online?: boolean;
  created_at?: string;
  notifications_count?: number;
  errors_count?: number;
  latest_state?: DeviceState | null;
};

export type DeviceState = {
  id?: number;
  device_id?: number;
  has_notification_permission?: boolean;
  battery_level?: number;
  is_charging?: boolean;
  network_type?: string;
  latitude?: number | null;
  longitude?: number | null;
  location_accuracy?: number | null;
  reported_at?: string;
};

export type MapDevice = {
  id: number;
  label?: string | null;
  brand?: string;
  model?: string;
  latitude: number;
  longitude: number;
  last_seen_at?: string;
  is_online?: boolean;
};

export type NotificationRow = {
  id: number;
  device_id: number;
  device_notif_key?: string | null;
  package_name: string;
  app_label?: string | null;
  title?: string | null;
  text?: string | null;
  subtext?: string | null;
  posted_at?: string;
  received_at?: string;
  status?: "received" | "processed" | string;
  extras?: Record<string, unknown> | unknown[] | string | null;
  device?: Partial<Device>;
};

export type AppErrorRow = {
  id: number;
  device_id?: number | null;
  level: "error" | "warn" | "fatal" | string;
  message: string;
  stacktrace?: string;
  app_version?: string;
  os_version?: string;
  context?: Record<string, unknown>;
  created_at?: string;
  device?: Partial<Device>;
};

export type AppVersion = {
  id: number;
  version_name: string;
  version_code: number;
  file_path?: string;
  file_size?: number;
  sha256?: string;
  release_notes?: string;
  is_active?: boolean;
  downloads?: number;
  created_at?: string;
  download_url?: string;
};

export type AdminStats = {
  devices_total?: number;
  devices_online?: number;
  devices_offline?: number;
  notifications_total?: number;
  notifications_today?: number;
  errors_total?: number;
  errors_today?: number;
  app_downloads?: number;
  notifications_over_time?: { date: string; count: number }[];
  devices_by_brand?: { brand: string; count: number }[];
  [key: string]: unknown;
};
