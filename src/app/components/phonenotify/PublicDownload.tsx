"use client";
import React, { useEffect, useState } from "react";
import { Button, Card, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import URLs from "@/resources/Net/URLs";
import { formatBytes } from "@/app/components/phonenotify/apiHelpers";
import type { AppVersion } from "@/resources/models/PhoneNotify/types";
import axios from "axios";

export default function PublicDownload() {
  const [info, setInfo] = useState<AppVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(URLs.base + URLs.app.latest, { headers: { Accept: "application/json" } })
      .then((res) => {
        const body = res.data?.data ?? res.data;
        setInfo(body);
      })
      .catch((e) => setError(e?.response?.data?.message || e.message || "App version unavailable"))
      .finally(() => setLoading(false));
  }, []);

  const downloadUrl =
    info?.download_url ||
    (URLs.base.replace(/\/$/, "") + "/" + URLs.app.download);

  return (
    <div className="min-h-screen bg-gradient-to-b from-lightprimary/30 to-white dark:from-dark dark:to-darkgray flex flex-col">
      <header className="px-6 py-4 flex justify-between items-center max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Icon icon="solar:smartphone-vibration-bold-duotone" height={32} className="text-primary" />
          <span className="text-xl font-bold text-ld">PhoneNotify</span>
        </div>
        <Link href="/auth/auth2/login" className="text-sm text-primary font-medium">
          Admin Login
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="max-w-lg w-full shadow-xl border-none text-center">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-2xl bg-lightprimary text-primary flex items-center justify-center">
              <Icon icon="solar:download-minimalistic-bold-duotone" height={48} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-ld mb-2">Download PhoneNotify</h1>
          <p className="text-darklink mb-6">
            Android app that securely forwards device notifications to your PhoneNotify server.
          </p>
          {loading ? (
            <Spinner size="xl" />
          ) : error ? (
            <div>
              <p className="text-red-500 mb-4">{error}</p>
              <Button color="primary" href={downloadUrl} className="w-full">
                Try download anyway
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-lightgray dark:bg-dark rounded-lg p-4 mb-6 text-sm text-start">
                <div className="flex justify-between mb-2">
                  <span className="text-darklink">Version</span>
                  <span className="font-semibold">
                    {info?.version_name} ({info?.version_code})
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-darklink">Size</span>
                  <span>{formatBytes(info?.file_size)}</span>
                </div>
                {info?.release_notes && (
                  <div className="mt-3 pt-3 border-t border-ld">
                    <p className="text-darklink mb-1">Release notes</p>
                    <p className="whitespace-pre-wrap">{info.release_notes}</p>
                  </div>
                )}
              </div>
              <Button
                as="a"
                href={downloadUrl}
                color="primary"
                size="xl"
                className="w-full"
              >
                <Icon icon="solar:download-bold" className="me-2" height={22} />
                Download APK
              </Button>
            </>
          )}
        </Card>
      </main>
      <footer className="text-center text-xs text-darklink py-6">
        PhoneNotify · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
