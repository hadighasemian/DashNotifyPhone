"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "flowbite-react";

/** Legacy top-level route → Devices / Notifications */
export default function NotificationsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/Devices/Notifications");
  }, [router]);
  return (
    <div className="flex justify-center py-20">
      <Spinner size="xl" />
    </div>
  );
}
