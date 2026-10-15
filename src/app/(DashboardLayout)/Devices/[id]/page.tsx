"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge, Card, Spinner, Table } from "flowbite-react";
import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import CreateAxiosInstanceServer from "@/resources/Net/CreateAxiosInstanceServer";
import authModel from "@/resources/models/Auth/AuthModel";
import URLs from "@/resources/Net/URLs";
import {
  unwrapOne,
  unwrapList,
  formatDate,
  isOnline,
} from "@/app/components/phonenotify/apiHelpers";
import type { Device, DeviceState } from "@/resources/models/PhoneNotify/types";
import NotificationsTable from "@/app/components/phonenotify/NotificationsTable";

export default function DeviceDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { login } = authModel();
  const [device, setDevice] = useState<Device | null>(null);
  const [states, setStates] = useState<DeviceState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!login?.token || !id) return;
    const axios = CreateAxiosInstanceServer({ login });
    setLoading(true);
    Promise.all([
      axios.get(`${URLs.admin.devices}/${id}`),
      axios
        .get(`${URLs.admin.devices}/${id}/states`, { params: { per_page: 50 } })
        .catch(() => null),
    ])
      .then(([devRes, stRes]) => {
        setDevice(unwrapOne<Device>(devRes));
        if (stRes) {
          const { items } = unwrapList<DeviceState>(stRes);
          setStates(items);
        }
      })
      .catch((e) => setError(e?.message || "Failed to load device"))
      .finally(() => setLoading(false));
  }, [login?.token, id]);

  const BCrumb = [
    { to: "/", title: "Home" },
    { to: "/Devices", title: "Devices" },
    { title: device?.label || device?.device_uuid || id },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error || !device) {
    return (
      <Card>
        <p className="text-red-500">{error || "Device not found"}</p>
        <Link href="/Devices" className="text-primary text-sm mt-2 inline-block">
          Back to list
        </Link>
      </Card>
    );
  }

  const online = isOnline(device.last_seen_at, device.is_online);
  const state = device.latest_state || states[0];

  return (
    <>
      <BreadcrumbComp title="Device Detail" items={BCrumb} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 shadow-md">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">
                {device.label || device.model || "Device"}
              </h3>
              <p className="text-sm text-darklink font-mono">{device.device_uuid}</p>
            </div>
            <Badge color={online ? "success" : "failure"} size="lg">
              {online ? "Online" : "Offline"}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <Info label="Brand" value={device.brand} />
            <Info label="Model" value={device.model} />
            <Info label="Manufacturer" value={device.manufacturer} />
            <Info label="OS" value={device.os_version} />
            <Info label="SDK" value={device.sdk_int} />
            <Info label="App version" value={device.app_version} />
            <Info label="Last seen" value={formatDate(device.last_seen_at)} />
            <Info label="Created" value={formatDate(device.created_at)} />
            <Info label="Notifications" value={device.notifications_count ?? "—"} />
            <Info label="Errors" value={device.errors_count ?? "—"} />
          </div>
        </Card>
        <Card className="shadow-md">
          <h5 className="font-semibold mb-3">Permissions & Status</h5>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span>Notification access</span>
              <Badge color={device.notification_access ? "success" : "failure"}>
                {device.notification_access ? "Yes" : "No"}
              </Badge>
            </li>
            <li className="flex justify-between">
              <span>Battery opt. ignored</span>
              <Badge color={device.battery_optimization_ignored ? "success" : "warning"}>
                {device.battery_optimization_ignored ? "Yes" : "No"}
              </Badge>
            </li>
            <li className="flex justify-between">
              <span>Notif. permission (state)</span>
              <Badge color={state?.has_notification_permission ? "success" : "failure"}>
                {state?.has_notification_permission ? "Yes" : "No"}
              </Badge>
            </li>
            <li className="flex justify-between">
              <span>Battery</span>
              <span>
                {state?.battery_level != null ? `${state.battery_level}%` : "—"}
                {state?.is_charging ? " ⚡" : ""}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Network</span>
              <span>{state?.network_type || "—"}</span>
            </li>
            <li className="flex justify-between">
              <span>Location</span>
              <span>
                {state?.latitude != null && state?.longitude != null
                  ? `${Number(state.latitude).toFixed(5)}, ${Number(state.longitude).toFixed(5)}`
                  : "—"}
              </span>
            </li>
          </ul>
        </Card>
      </div>

      <div className="mt-6">
        <TitleIconCard title="Notifications from this device">
          <NotificationsTable deviceId={id} perPage={15} />
        </TitleIconCard>
      </div>

      <Card className="mt-6 shadow-md">
        <h5 className="font-semibold mb-3">Location / state history</h5>
        <div className="overflow-x-auto">
          <Table>
            <Table.Head>
              <Table.HeadCell>Reported</Table.HeadCell>
              <Table.HeadCell>Battery</Table.HeadCell>
              <Table.HeadCell>Network</Table.HeadCell>
              <Table.HeadCell>Lat</Table.HeadCell>
              <Table.HeadCell>Lng</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {states.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={5} className="text-center text-darklink">
                    No history
                  </Table.Cell>
                </Table.Row>
              ) : (
                states.map((s, i) => (
                  <Table.Row key={s.id || i}>
                    <Table.Cell>{formatDate(s.reported_at)}</Table.Cell>
                    <Table.Cell>
                      {s.battery_level != null ? `${s.battery_level}%` : "—"}
                      {s.is_charging ? " ⚡" : ""}
                    </Table.Cell>
                    <Table.Cell>{s.network_type || "—"}</Table.Cell>
                    <Table.Cell>{s.latitude ?? "—"}</Table.Cell>
                    <Table.Cell>{s.longitude ?? "—"}</Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>
      </Card>
    </>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-darklink text-xs">{label}</div>
      <div className="font-medium">{value ?? "—"}</div>
    </div>
  );
}
