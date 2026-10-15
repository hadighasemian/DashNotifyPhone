"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, Select, Spinner, Button } from "flowbite-react";
import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import CreateAxiosInstanceServer from "@/resources/Net/CreateAxiosInstanceServer";
import authModel from "@/resources/models/Auth/AuthModel";
import URLs from "@/resources/Net/URLs";
import { unwrapList, unwrapOne } from "@/app/components/phonenotify/apiHelpers";
import type { MapDevice, Device, DeviceState } from "@/resources/models/PhoneNotify/types";
import { Notify } from "@/app/components/notification/Notification";

const DevicesMap = dynamic(() => import("@/app/components/phonenotify/DevicesMap"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-20">
      <Spinner />
    </div>
  ),
});

const BCrumb = [{ to: "/", title: "Home" }, { title: "Map" }];

export default function MapPage() {
  const { login } = authModel();
  const [devices, setDevices] = useState<MapDevice[]>([]);
  const [history, setHistory] = useState<DeviceState[]>([]);
  const [deviceList, setDeviceList] = useState<Device[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!login?.token) return;
    const axios = CreateAxiosInstanceServer({ login });
    setLoading(true);
    Promise.all([
      axios.get(URLs.admin.devicesMap),
      axios.get(URLs.admin.devices, { params: { per_page: 200 } }),
    ])
      .then(([mapRes, listRes]) => {
        const mapBody = unwrapOne<any>(mapRes);
        const mapItems = Array.isArray(mapBody)
          ? (mapBody as MapDevice[])
          : Array.isArray(mapBody?.devices)
            ? mapBody.devices
            : unwrapList<MapDevice>(mapRes).items;
        setDevices(mapItems.filter((d: MapDevice) => d.latitude != null && d.longitude != null));
        setDeviceList(unwrapList<Device>(listRes).items);
      })
      .catch((e) => Notify(e?.message || "Failed to load map", "danger"))
      .finally(() => setLoading(false));
  }, [login?.token]);

  const loadHistory = async (id: string) => {
    setSelectedId(id);
    setHistory([]);
    if (!id || !login?.token) return;
    const axios = CreateAxiosInstanceServer({ login });
    try {
      const res = await axios.get(`${URLs.admin.devices}/${id}/states`, {
        params: { per_page: 200 },
      });
      setHistory(unwrapList<DeviceState>(res).items);
    } catch (e: any) {
      Notify(e?.message || "Failed to load history", "danger");
    }
  };

  return (
    <>
      <BreadcrumbComp title="Device Map" items={BCrumb} />
      <Card className="shadow-md mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm mb-1 block">Show location history for device</label>
            <Select value={selectedId} onChange={(e) => loadHistory(e.target.value)}>
              <option value="">All devices (latest only)</option>
              {deviceList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label || d.device_uuid} — {d.brand} {d.model}
                </option>
              ))}
            </Select>
          </div>
          <Button color="light" onClick={() => loadHistory("")}>
            Clear history
          </Button>
        </div>
      </Card>
      <Card className="shadow-md p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="xl" />
          </div>
        ) : (
          <DevicesMap
            devices={selectedId ? [] : devices}
            history={history}
            showTrack={!!selectedId}
            height="560px"
          />
        )}
      </Card>
    </>
  );
}
