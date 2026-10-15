"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Badge, Card, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import CreateAxiosInstanceServer from "@/resources/Net/CreateAxiosInstanceServer";
import authModel from "@/resources/models/Auth/AuthModel";
import URLs from "@/resources/Net/URLs";
import { unwrapOne } from "@/app/components/phonenotify/apiHelpers";
import type { AdminStats } from "@/resources/models/PhoneNotify/types";
import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const BCrumb = [{ to: "/", title: "Home" }, { title: "Overview" }];

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  return (
    <Card className="shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-darklink mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-ld">{value ?? "—"}</h3>
        </div>
        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${color}`}>
          <Icon icon={icon} height={24} />
        </div>
      </div>
    </Card>
  );
}

export default function OverviewPage() {
  const { login } = authModel();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!login?.token) return;
    const axios = CreateAxiosInstanceServer({ login });
    setLoading(true);
    axios
      .get(URLs.admin.stats)
      .then((res) => setStats(unwrapOne<AdminStats>(res)))
      .catch((e) => setError(e?.message || "Failed to load stats"))
      .finally(() => setLoading(false));
  }, [login?.token]);

  const seriesDates = stats?.notifications_over_time || [];
  const chartOptions: any = {
    chart: { type: "area", toolbar: { show: false }, fontFamily: "inherit" },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    xaxis: { categories: seriesDates.map((d) => d.date) },
    colors: ["#5D87FF"],
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 },
    },
    tooltip: { theme: "dark" },
  };
  const chartSeries = [
    { name: "Notifications", data: seriesDates.map((d) => d.count) },
  ];

  const brandData = stats?.devices_by_brand || [];

  return (
    <>
      <BreadcrumbComp title="Overview" items={BCrumb} />
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="xl" />
        </div>
      ) : error ? (
        <Card>
          <p className="text-red-500">{error}</p>
          <p className="text-sm text-darklink mt-2">
            Backend may still be starting. Stats endpoint: GET /admin/stats
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Devices Online"
              value={stats?.devices_online ?? 0}
              icon="solar:smartphone-update-bold-duotone"
              color="bg-lightsuccess text-success"
            />
            <StatCard
              title="Devices Offline"
              value={stats?.devices_offline ?? 0}
              icon="solar:smartphone-line-duotone"
              color="bg-lighterror text-error"
            />
            <StatCard
              title="Notifications"
              value={stats?.notifications_total ?? 0}
              icon="solar:bell-bing-bold-duotone"
              color="bg-lightprimary text-primary"
            />
            <StatCard
              title="Errors"
              value={stats?.errors_total ?? 0}
              icon="solar:danger-triangle-bold-duotone"
              color="bg-lightwarning text-warning"
            />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2 shadow-md">
              <h5 className="text-lg font-semibold mb-4">Notifications over time</h5>
              {seriesDates.length ? (
                <Chart options={chartOptions} series={chartSeries} type="area" height={320} />
              ) : (
                <p className="text-darklink text-sm py-10 text-center">No time-series data yet</p>
              )}
            </Card>
            <Card className="shadow-md">
              <h5 className="text-lg font-semibold mb-4">Summary</h5>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span>Total devices</span>
                  <Badge color="info">{stats?.devices_total ?? 0}</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Notifications today</span>
                  <Badge color="purple">{stats?.notifications_today ?? 0}</Badge>
                </li>
                <li className="flex justify-between">
                  <span>Errors today</span>
                  <Badge color="failure">{stats?.errors_today ?? 0}</Badge>
                </li>
                <li className="flex justify-between">
                  <span>App downloads</span>
                  <Badge color="success">{stats?.app_downloads ?? 0}</Badge>
                </li>
              </ul>
              {brandData.length > 0 && (
                <div className="mt-6">
                  <h6 className="font-medium mb-2">By brand</h6>
                  <ul className="space-y-2 text-sm">
                    {brandData.map((b) => (
                      <li key={b.brand} className="flex justify-between">
                        <span>{b.brand || "Unknown"}</span>
                        <span>{b.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  );
}
