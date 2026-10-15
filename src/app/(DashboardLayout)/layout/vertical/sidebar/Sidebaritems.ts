import { uniqueId } from "lodash";

export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
}

const SidebarContent: MenuItem[] = [
  {
    id: 1,
    name: "PhoneNotify",
    items: [
      {
        heading: "Dashboard",
        children: [
          {
            name: "Overview",
            icon: "solar:chart-2-line-duotone",
            id: uniqueId(),
            url: "/Overview",
          },
          {
            name: "Devices",
            icon: "solar:smartphone-line-duotone",
            id: uniqueId(),
            children: [
              {
                name: "All devices",
                icon: "solar:smartphone-2-line-duotone",
                id: uniqueId(),
                url: "/Devices",
              },
              {
                name: "Notifications",
                icon: "solar:bell-line-duotone",
                id: uniqueId(),
                url: "/Devices/Notifications",
              },
            ],
          },
          {
            name: "Map",
            icon: "solar:map-point-line-duotone",
            id: uniqueId(),
            url: "/Map",
          },
          {
            name: "Errors",
            icon: "solar:danger-triangle-line-duotone",
            id: uniqueId(),
            url: "/Errors",
          },
          {
            name: "App Versions",
            icon: "solar:download-minimalistic-line-duotone",
            id: uniqueId(),
            url: "/AppVersions",
          },
          {
            name: "Users",
            icon: "solar:user-id-line-duotone",
            id: uniqueId(),
            url: "/Users",
          },
        ],
      },
    ],
  },
];

export default SidebarContent;
