import PublicDownload from "@/app/components/phonenotify/PublicDownload";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download — PhoneNotify",
  description: "Download the PhoneNotify Android app",
};

export default function DownloadPage() {
  return <PublicDownload />;
}
