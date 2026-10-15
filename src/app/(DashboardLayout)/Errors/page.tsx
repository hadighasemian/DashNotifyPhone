"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Badge, Button, Select, Spinner, Table, TextInput } from "flowbite-react";
import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import CreateAxiosInstanceServer from "@/resources/Net/CreateAxiosInstanceServer";
import authModel from "@/resources/models/Auth/AuthModel";
import URLs from "@/resources/Net/URLs";
import { unwrapList, formatDate } from "@/app/components/phonenotify/apiHelpers";
import type { AppErrorRow } from "@/resources/models/PhoneNotify/types";
import { Notify } from "@/app/components/notification/Notification";

const BCrumb = [{ to: "/", title: "Home" }, { title: "Errors" }];

const levelColor = (level: string) => {
  if (level === "fatal") return "failure";
  if (level === "warn") return "warning";
  return "info";
};

export default function ErrorsPage() {
  const { login } = authModel();
  const [data, setData] = useState<AppErrorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({});
  const [deviceId, setDeviceId] = useState("");
  const [level, setLevel] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = useCallback(() => {
    if (!login?.token) return;
    const axios = CreateAxiosInstanceServer({ login });
    setLoading(true);
    axios
      .get(URLs.admin.errors, {
        params: {
          page,
          per_page: 20,
          device_id: deviceId || undefined,
          level: level || undefined,
        },
      })
      .then((res) => {
        const { items, meta: m } = unwrapList<AppErrorRow>(res);
        setData(items);
        setMeta(m);
      })
      .catch((e) => Notify(e?.message || "Failed to load errors", "danger"))
      .finally(() => setLoading(false));
  }, [login?.token, page, deviceId, level]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <BreadcrumbComp title="App Errors" items={BCrumb} />
      <TitleIconCard title="Collected Errors">
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
          <Select
            value={level}
            onChange={(e) => {
              setPage(1);
              setLevel(e.target.value);
            }}
            className="max-w-[140px]"
          >
            <option value="">All levels</option>
            <option value="error">error</option>
            <option value="warn">warn</option>
            <option value="fatal">fatal</option>
          </Select>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Level</Table.HeadCell>
                <Table.HeadCell>Message</Table.HeadCell>
                <Table.HeadCell>Device</Table.HeadCell>
                <Table.HeadCell>App / OS</Table.HeadCell>
                <Table.HeadCell>When</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {data.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={5} className="text-center text-darklink">
                      No errors
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  data.map((err) => (
                    <React.Fragment key={err.id}>
                      <Table.Row
                        className="cursor-pointer"
                        onClick={() => setExpanded(expanded === err.id ? null : err.id)}
                      >
                        <Table.Cell>
                          <Badge color={levelColor(err.level)}>{err.level}</Badge>
                        </Table.Cell>
                        <Table.Cell className="max-w-lg">
                          <div className="truncate">{err.message}</div>
                        </Table.Cell>
                        <Table.Cell>{err.device_id ?? "—"}</Table.Cell>
                        <Table.Cell>
                          {err.app_version || "—"} / {err.os_version || "—"}
                        </Table.Cell>
                        <Table.Cell>{formatDate(err.created_at)}</Table.Cell>
                      </Table.Row>
                      {expanded === err.id && (
                        <Table.Row>
                          <Table.Cell colSpan={5}>
                            <pre className="text-xs whitespace-pre-wrap bg-lightgray dark:bg-dark p-3 rounded max-h-64 overflow-auto">
                              {err.stacktrace || JSON.stringify(err.context, null, 2) || "No stacktrace"}
                            </pre>
                          </Table.Cell>
                        </Table.Row>
                      )}
                    </React.Fragment>
                  ))
                )}
              </Table.Body>
            </Table>
          </div>
        )}
        <div className="flex justify-between items-center mt-4 px-2 text-sm">
          <span>
            Page {meta.current_page || page} / {meta.last_page || 1}
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
