"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Badge, Button, Select, Spinner, Table, TextInput } from "flowbite-react";
import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import CreateAxiosInstanceServer from "@/resources/Net/CreateAxiosInstanceServer";
import authModel from "@/resources/models/Auth/AuthModel";
import URLs from "@/resources/Net/URLs";
import { unwrapList, formatDate } from "@/app/components/phonenotify/apiHelpers";
import type { NotificationRow } from "@/resources/models/PhoneNotify/types";
import { Notify } from "@/app/components/notification/Notification";

const BCrumb = [{ to: "/", title: "Home" }, { title: "Notifications" }];

export default function NotificationsPage() {
  const { login } = authModel();
  const [data, setData] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({});
  const [deviceId, setDeviceId] = useState("");
  const [packageName, setPackageName] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const load = useCallback(() => {
    if (!login?.token) return;
    const axios = CreateAxiosInstanceServer({ login });
    setLoading(true);
    axios
      .get(URLs.admin.notifications, {
        params: {
          page,
          per_page: 20,
          device_id: deviceId || undefined,
          package_name: packageName || undefined,
          status: status || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        },
      })
      .then((res) => {
        const { items, meta: m } = unwrapList<NotificationRow>(res);
        setData(items);
        setMeta(m);
      })
      .catch((e) => Notify(e?.message || "Failed to load notifications", "danger"))
      .finally(() => setLoading(false));
  }, [login?.token, page, deviceId, packageName, status, dateFrom, dateTo]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <BreadcrumbComp title="Notifications" items={BCrumb} />
      <TitleIconCard title="Captured Notifications">
        <div className="flex flex-wrap gap-3 mb-4 px-2">
          <TextInput
            placeholder="Device ID"
            value={deviceId}
            onChange={(e) => {
              setPage(1);
              setDeviceId(e.target.value);
            }}
            className="max-w-[120px]"
          />
          <TextInput
            placeholder="Package name"
            value={packageName}
            onChange={(e) => {
              setPage(1);
              setPackageName(e.target.value);
            }}
            className="max-w-xs"
          />
          <Select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="max-w-[140px]"
          >
            <option value="">All status</option>
            <option value="received">received</option>
            <option value="processed">processed</option>
          </Select>
          <TextInput
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setPage(1);
              setDateFrom(e.target.value);
            }}
          />
          <TextInput
            type="date"
            value={dateTo}
            onChange={(e) => {
              setPage(1);
              setDateTo(e.target.value);
            }}
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>App</Table.HeadCell>
                <Table.HeadCell>Title / Text</Table.HeadCell>
                <Table.HeadCell>Device</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Posted</Table.HeadCell>
                <Table.HeadCell>Received</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {data.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={6} className="text-center text-darklink">
                      No notifications
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  data.map((n) => (
                    <Table.Row key={n.id}>
                      <Table.Cell>
                        <div className="font-medium">{n.app_label || n.package_name}</div>
                        <div className="text-xs text-darklink">{n.package_name}</div>
                      </Table.Cell>
                      <Table.Cell className="max-w-md">
                        <div className="font-medium truncate">{n.title || "—"}</div>
                        <div className="text-xs text-darklink line-clamp-2">{n.text}</div>
                      </Table.Cell>
                      <Table.Cell>#{n.device_id}</Table.Cell>
                      <Table.Cell>
                        <Badge color={n.status === "processed" ? "success" : "info"}>
                          {n.status || "received"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>{formatDate(n.posted_at)}</Table.Cell>
                      <Table.Cell>{formatDate(n.received_at)}</Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
          </div>
        )}
        <div className="flex justify-between items-center mt-4 px-2 text-sm">
          <span>
            Page {meta.current_page || page} / {meta.last_page || 1} · {meta.total ?? data.length} total
          </span>
          <div className="flex gap-2">
            <Button size="xs" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </Button>
            <Button
              size="xs"
              disabled={page >= (meta.last_page || 1)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </TitleIconCard>
    </>
  );
}
