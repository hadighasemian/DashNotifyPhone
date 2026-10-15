"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Select, Spinner, Table, TextInput } from "flowbite-react";
import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import CreateAxiosInstanceServer from "@/resources/Net/CreateAxiosInstanceServer";
import authModel from "@/resources/models/Auth/AuthModel";
import URLs from "@/resources/Net/URLs";
import {
  unwrapList,
  formatDate,
  isOnline,
} from "@/app/components/phonenotify/apiHelpers";
import type { Device } from "@/resources/models/PhoneNotify/types";
import { Notify } from "@/app/components/notification/Notification";

const BCrumb = [{ to: "/", title: "Home" }, { title: "Devices" }];

export default function DevicesPage() {
  const { login } = authModel();
  const [data, setData] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({});
  const [status, setStatus] = useState("");
  const [brand, setBrand] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    if (!login?.token) return;
    const axios = CreateAxiosInstanceServer({ login });
    setLoading(true);
    axios
      .get(URLs.admin.devices, {
        params: {
          page,
          per_page: 15,
          status: status || undefined,
          brand: brand || undefined,
          search: search || undefined,
        },
      })
      .then((res) => {
        const { items, meta: m } = unwrapList<Device>(res);
        setData(items);
        setMeta(m);
      })
      .catch((e) => Notify(e?.message || "Failed to load devices", "danger"))
      .finally(() => setLoading(false));
  }, [login?.token, page, status, brand, search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <BreadcrumbComp title="Devices" items={BCrumb} />
      <TitleIconCard title="Phones / Devices">
        <div className="flex flex-wrap gap-3 mb-4 px-2">
          <TextInput
            placeholder="Search UUID, model, label..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="max-w-xs"
          />
          <Select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="max-w-[160px]"
          >
            <option value="">All status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </Select>
          <TextInput
            placeholder="Brand filter"
            value={brand}
            onChange={(e) => {
              setPage(1);
              setBrand(e.target.value);
            }}
            className="max-w-[160px]"
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
                <Table.HeadCell>Device</Table.HeadCell>
                <Table.HeadCell>Brand / Model</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Last seen</Table.HeadCell>
                <Table.HeadCell>App</Table.HeadCell>
                <Table.HeadCell></Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {data.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={6} className="text-center text-darklink">
                      No devices
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  data.map((d) => {
                    const online = isOnline(d.last_seen_at, d.is_online);
                    return (
                      <Table.Row key={d.id}>
                        <Table.Cell>
                          <div className="font-medium">{d.label || d.device_uuid?.slice(0, 12)}</div>
                          <div className="text-xs text-darklink">{d.device_uuid}</div>
                        </Table.Cell>
                        <Table.Cell>
                          {d.brand} {d.model}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color={online ? "success" : "failure"}>
                            {online ? "Online" : "Offline"}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>{formatDate(d.last_seen_at)}</Table.Cell>
                        <Table.Cell>{d.app_version || "—"}</Table.Cell>
                        <Table.Cell>
                          <Button as={Link} href={`/Devices/${d.id}`} size="xs" color="light">
                            Details
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })
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
