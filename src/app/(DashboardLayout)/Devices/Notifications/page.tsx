"use client";
import React from "react";
import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import NotificationsTable from "@/app/components/phonenotify/NotificationsTable";

const BCrumb = [
  { to: "/", title: "Home" },
  { to: "/Devices", title: "Devices" },
  { title: "Notifications" },
];

export default function DevicesNotificationsPage() {
  return (
    <>
      <BreadcrumbComp title="Device Notifications" items={BCrumb} />
      <TitleIconCard title="All device notifications">
        <NotificationsTable showDeviceFilter />
      </TitleIconCard>
    </>
  );
}
