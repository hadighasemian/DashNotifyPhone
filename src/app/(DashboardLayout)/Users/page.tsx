"use client";
import React from "react";
import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import UserTable from "@/app/(DashboardLayout)/Users/UserTable";

const BCrumb = [{ to: "/", title: "Home" }, { title: "Users" }];

export default function UsersPage() {
  return (
    <>
      <BreadcrumbComp title="Users" items={BCrumb} />
      <UserTable />
    </>
  );
}
