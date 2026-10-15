"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Badge, Button, Spinner } from "flowbite-react";
import Link from "next/link";
import CreateAxiosInstanceServer from "@/resources/Net/CreateAxiosInstanceServer";
import authModel from "@/resources/models/Auth/AuthModel";
import URLs from "@/resources/Net/URLs";
import { unwrapOne, formatDate } from "@/app/components/phonenotify/apiHelpers";
import type { NotificationRow } from "@/resources/models/PhoneNotify/types";

type Props = {
  open: boolean;
  notificationId: number | null;
  onClose: () => void;
  /** Optional row snapshot while fetching */
  preview?: NotificationRow | null;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="sm:col-span-1">
      <div className="text-xs text-darklink mb-0.5">{label}</div>
      <div className="text-sm font-medium break-words whitespace-pre-wrap">{children ?? "—"}</div>
    </div>
  );
}

function formatExtras(extras: NotificationRow["extras"]) {
  if (extras == null || extras === "") return null;
  if (typeof extras === "string") {
    try {
      return JSON.stringify(JSON.parse(extras), null, 2);
    } catch {
      return extras;
    }
  }
  try {
    return JSON.stringify(extras, null, 2);
  } catch {
    return String(extras);
  }
}

export default function NotificationDetailModal({
  open,
  notificationId,
  onClose,
  preview,
}: Props) {
  const { login } = authModel();
  const [data, setData] = useState<NotificationRow | null>(preview || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !notificationId || !login?.token) return;
    setData(preview || null);
    setError(null);
    setLoading(true);
    const axios = CreateAxiosInstanceServer({ login });
    axios
      .get(`${URLs.admin.notifications}/${notificationId}`)
      .then((res) => setData(unwrapOne<NotificationRow>(res)))
      .catch((e) => {
        setError(e?.message || "Failed to load notification");
        if (preview) setData(preview);
      })
      .finally(() => setLoading(false));
  }, [open, notificationId, login?.token]);

  const n = data;
  const extrasText = formatExtras(n?.extras ?? null);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="fixed inset-0 z-50 flex w-screen items-center justify-center bg-black/40 p-4"
    >
      <DialogPanel className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white dark:bg-darkgray p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3 mb-4">
          <DialogTitle className="text-lg font-semibold text-ld">
            Notification detail
            {n?.id ? <span className="text-darklink font-normal text-sm ms-2">#{n.id}</span> : null}
          </DialogTitle>
          <Button size="xs" color="light" onClick={onClose}>
            Close
          </Button>
        </div>

        {loading && !n ? (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        ) : error && !n ? (
          <p className="text-red-500">{error}</p>
        ) : n ? (
          <div className="space-y-5">
            {loading && (
              <p className="text-xs text-darklink flex items-center gap-2">
                <Spinner size="sm" /> Refreshing from server…
              </p>
            )}
            {error && <p className="text-xs text-warning">{error} — showing available data</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Title">{n.title || "—"}</Field>
              <Field label="Status">
                <Badge color={n.status === "processed" ? "success" : "info"}>
                  {n.status || "received"}
                </Badge>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Text">{n.text || "—"}</Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Subtext">{n.subtext || "—"}</Field>
              </div>
              <Field label="App label">{n.app_label || "—"}</Field>
              <Field label="Package name">
                <span className="font-mono text-xs">{n.package_name}</span>
              </Field>
              <Field label="Posted at">{formatDate(n.posted_at)}</Field>
              <Field label="Received at">{formatDate(n.received_at)}</Field>
              <Field label="Device notif key">
                <span className="font-mono text-xs">{n.device_notif_key || "—"}</span>
              </Field>
              <Field label="Device">
                {n.device_id ? (
                  <Link href={`/Devices/${n.device_id}`} className="text-primary hover:underline">
                    #{n.device_id}
                    {n.device
                      ? ` — ${n.device.label || `${n.device.brand || ""} ${n.device.model || ""}`.trim()}`
                      : ""}
                  </Link>
                ) : (
                  "—"
                )}
              </Field>
            </div>

            <div>
              <div className="text-xs text-darklink mb-1">Extras (JSON)</div>
              {extrasText ? (
                <pre className="text-xs whitespace-pre-wrap bg-lightgray dark:bg-dark p-3 rounded-lg max-h-72 overflow-auto font-mono">
                  {extrasText}
                </pre>
              ) : (
                <p className="text-sm text-darklink">No extras</p>
              )}
            </div>
          </div>
        ) : null}
      </DialogPanel>
    </Dialog>
  );
}
