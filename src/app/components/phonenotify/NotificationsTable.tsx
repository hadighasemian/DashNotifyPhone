"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Badge, Button, Select, Spinner, Table, TextInput } from "flowbite-react";
import CreateAxiosInstanceServer from "@/resources/Net/CreateAxiosInstanceServer";
import authModel from "@/resources/models/Auth/AuthModel";
import URLs from "@/resources/Net/URLs";
import { unwrapList, formatDate } from "@/app/components/phonenotify/apiHelpers";
import type { NotificationRow } from "@/resources/models/PhoneNotify/types";
import { Notify } from "@/app/components/notification/Notification";
import NotificationDetailModal from "@/app/components/phonenotify/NotificationDetailModal";

type Props = {
  /** When set, lock filter to this device and hide device column/filter */
  deviceId?: number | string;
  showDeviceFilter?: boolean;
  perPage?: number;
};

export default function NotificationsTable({
  deviceId,
  showDeviceFilter,
  perPage = 20,
}: Props) {
  const locked = deviceId != null && deviceId !== "";
  const { login } = authModel();
  const [data, setData] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({});
  const [filterDeviceId, setFilterDeviceId] = useState("");
  const [packageName, setPackageName] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detailPreview, setDetailPreview] = useState<NotificationRow | null>(null);

  const effectiveDeviceId = locked ? String(deviceId) : filterDeviceId;
  const allowDeviceFilter = showDeviceFilter ?? !locked;

  const load = useCallback(() => {
    if (!login?.token) return;
    const axios = CreateAxiosInstanceServer({ login });
    setLoading(true);
    axios
      .get(URLs.admin.notifications, {
        params: {
          page,
          per_page: perPage,
          device_id: effectiveDeviceId || undefined,
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
  }, [
    login?.token,
    page,
    perPage,
    effectiveDeviceId,
    packageName,
    status,
    dateFrom,
    dateTo,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = (row: NotificationRow) => {
    setDetailPreview(row);
    setDetailId(row.id);
  };

  const colCount = locked ? 5 : 6;

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-4 px-2">
        {allowDeviceFilter && (
          <TextInput
            placeholder="Device ID"
            value={filterDeviceId}
            onChange={(e) => {
              setPage(1);
              setFilterDeviceId(e.target.value);
            }}
            className="max-w-[120px]"
          />
        )}
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
              {!locked && <Table.HeadCell>Device</Table.HeadCell>}
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Posted</Table.HeadCell>
              <Table.HeadCell>Received</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {data.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={colCount} className="text-center text-darklink">
                    No notifications
                  </Table.Cell>
                </Table.Row>
              ) : (
                data.map((n) => (
                  <Table.Row
                    key={n.id}
                    className="cursor-pointer"
                    onClick={() => openDetail(n)}
                  >
                    <Table.Cell>
                      <div className="font-medium">{n.app_label || n.package_name}</div>
                      <div className="text-xs text-darklink">{n.package_name}</div>
                    </Table.Cell>
                    <Table.Cell className="max-w-md">
                      <div className="font-medium truncate">{n.title || "—"}</div>
                      <div className="text-xs text-darklink line-clamp-2">{n.text}</div>
                    </Table.Cell>
                    {!locked && <Table.Cell>#{n.device_id}</Table.Cell>}
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
          Page {meta.current_page || page} / {meta.last_page || 1} ·{" "}
          {meta.total ?? data.length} total
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

      <NotificationDetailModal
        open={detailId != null}
        notificationId={detailId}
        preview={detailPreview}
        onClose={() => {
          setDetailId(null);
          setDetailPreview(null);
        }}
      />
    </>
  );
}
