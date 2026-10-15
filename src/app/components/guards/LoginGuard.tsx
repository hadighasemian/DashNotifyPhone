"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import authModel from "@/resources/models/Auth/AuthModel";

function isAdmin(user: any) {
  if (!user) return false;
  const role = user.role;
  if (typeof role === "string") return role === "admin";
  return role?.title === "admin" || role?.name === "admin";
}

export default function LoginGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const { login, user } = authModel();

  useEffect(() => {
    if (!login?.login || !isAdmin(user)) {
      router.push("/auth/auth2/login");
    } else {
      setAuthorized(true);
    }
  }, [login?.login, user, router]);

  return authorized ? <>{children}</> : null;
}
