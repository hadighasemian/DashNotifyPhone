const API_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL) ||
  "https://phonenotify.hi-team.ir/api/v1";

export default {
  base: API_BASE.replace(/\/$/, "") + "/",
  auth: {
    login: "auth/login",
    logout: "auth/logout",
    me: "auth/me",
  },
  admin: {
    users: "admin/users",
    devices: "admin/devices",
    devicesMap: "admin/devices/map",
    notifications: "admin/notifications",
    errors: "admin/errors",
    appVersions: "admin/app-versions",
    stats: "admin/stats",
  },
  app: {
    latest: "app/latest",
    download: "app/download",
  },
};
