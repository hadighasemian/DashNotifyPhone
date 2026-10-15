"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Button, Spinner, Table, TextInput, Textarea, Label, Checkbox } from "flowbite-react";
import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import TitleIconCard from "@/app/components/shared/TitleIconCard";
import CreateAxiosInstanceServer from "@/resources/Net/CreateAxiosInstanceServer";
import authModel from "@/resources/models/Auth/AuthModel";
import URLs from "@/resources/Net/URLs";
import { unwrapList, formatBytes, formatDate } from "@/app/components/phonenotify/apiHelpers";
import type { AppVersion } from "@/resources/models/PhoneNotify/types";
import { Notify } from "@/app/components/notification/Notification";

const BCrumb = [{ to: "/", title: "Home" }, { title: "App Versions" }];

export default function AppVersionsPage() {
  const { login } = authModel();
  const [data, setData] = useState<AppVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [versionName, setVersionName] = useState("");
  const [versionCode, setVersionCode] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [isActive, setIsActive] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    if (!login?.token) return;
    const axios = CreateAxiosInstanceServer({ login });
    setLoading(true);
    axios
      .get(URLs.admin.appVersions)
      .then((res) => setData(unwrapList<AppVersion>(res).items))
      .catch((e) => Notify(e?.message || "Failed to load versions", "danger"))
      .finally(() => setLoading(false));
  }, [login?.token]);

  useEffect(() => {
    load();
  }, [load]);

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      Notify("Select an APK file", "danger");
      return;
    }
    if (!versionName || !versionCode) {
      Notify("Version name and code required", "danger");
      return;
    }
    const form = new FormData();
    form.append("apk", file);
    form.append("file", file);
    form.append("version_name", versionName);
    form.append("version_code", versionCode);
    form.append("release_notes", releaseNotes);
    form.append("is_active", isActive ? "1" : "0");

    setUploading(true);
    try {
      const axios = CreateAxiosInstanceServer({ login });
      await axios.post(URLs.admin.appVersions, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Notify("APK uploaded", "success");
      setVersionName("");
      setVersionCode("");
      setReleaseNotes("");
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (err: any) {
      Notify(err?.message || "Upload failed", "danger");
    } finally {
      setUploading(false);
    }
  };

  const activate = async (id: number) => {
    try {
      const axios = CreateAxiosInstanceServer({ login });
      await axios.patch(`${URLs.admin.appVersions}/${id}`, { is_active: true });
      // also try activate endpoint variants
      try {
        await axios.post(`${URLs.admin.appVersions}/${id}/activate`);
      } catch (_) {}
      Notify("Version activated", "success");
      load();
    } catch (err: any) {
      Notify(err?.message || "Activate failed", "danger");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this version?")) return;
    try {
      const axios = CreateAxiosInstanceServer({ login });
      await axios.delete(`${URLs.admin.appVersions}/${id}`);
      Notify("Deleted", "success");
      load();
    } catch (err: any) {
      Notify(err?.message || "Delete failed", "danger");
    }
  };

  return (
    <>
      <BreadcrumbComp title="App Versions" items={BCrumb} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <TitleIconCard title="Upload new APK">
          <form onSubmit={onUpload} className="space-y-3 px-2">
            <div>
              <Label value="Version name" />
              <TextInput value={versionName} onChange={(e) => setVersionName(e.target.value)} placeholder="1.0.0" />
            </div>
            <div>
              <Label value="Version code" />
              <TextInput
                type="number"
                value={versionCode}
                onChange={(e) => setVersionCode(e.target.value)}
                placeholder="1"
              />
            </div>
            <div>
              <Label value="Release notes" />
              <Textarea value={releaseNotes} onChange={(e) => setReleaseNotes(e.target.value)} rows={3} />
            </div>
            <div>
              <Label value="APK file" />
              <input ref={fileRef} type="file" accept=".apk,application/vnd.android.package-archive" className="block w-full text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} id="is_active" />
              <Label htmlFor="is_active">Set as active</Label>
            </div>
            <Button type="submit" color="primary" disabled={uploading} className="w-full">
              {uploading ? <Spinner size="sm" /> : "Upload APK"}
            </Button>
          </form>
        </TitleIconCard>
        <div className="xl:col-span-2">
          <TitleIconCard title="Versions">
            {loading ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table hoverable>
                  <Table.Head>
                    <Table.HeadCell>Version</Table.HeadCell>
                    <Table.HeadCell>Size</Table.HeadCell>
                    <Table.HeadCell>Downloads</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Created</Table.HeadCell>
                    <Table.HeadCell></Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {data.length === 0 ? (
                      <Table.Row>
                        <Table.Cell colSpan={6} className="text-center text-darklink">
                          No versions uploaded
                        </Table.Cell>
                      </Table.Row>
                    ) : (
                      data.map((v) => (
                        <Table.Row key={v.id}>
                          <Table.Cell>
                            <div className="font-medium">
                              {v.version_name} ({v.version_code})
                            </div>
                            <div className="text-xs text-darklink line-clamp-2">{v.release_notes}</div>
                          </Table.Cell>
                          <Table.Cell>{formatBytes(v.file_size)}</Table.Cell>
                          <Table.Cell>{v.downloads ?? 0}</Table.Cell>
                          <Table.Cell>
                            <Badge color={v.is_active ? "success" : "gray"}>
                              {v.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>{formatDate(v.created_at)}</Table.Cell>
                          <Table.Cell>
                            <div className="flex gap-2">
                              {!v.is_active && (
                                <Button size="xs" color="success" onClick={() => activate(v.id)}>
                                  Activate
                                </Button>
                              )}
                              <Button size="xs" color="failure" onClick={() => remove(v.id)}>
                                Delete
                              </Button>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      ))
                    )}
                  </Table.Body>
                </Table>
              </div>
            )}
          </TitleIconCard>
        </div>
      </div>
    </>
  );
}
