import PublicDownload from "@/app/components/phonenotify/PublicDownload";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PhoneNotify — Download",
  description: "Download the PhoneNotify Android app",
};

export default function HomePage() {
  return <PublicDownload />;
}
