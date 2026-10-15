import React from "react";
import BreadcrumbComp from "../../layout/shared/breadcrumb/BreadcrumbComp";
import BasicAccordion from "@/app/components/ui-components/Accordian/BasicAccordion";
import FlushAccordian from "@/app/components/ui-components/Accordian/FlushAccordion";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Ui Accordion",
};

const BCrumb = [
  {
    to: "/",
    title: "Home",
  },
  {
    title: "Accordion",
  },
];

const page = () => {
  return (
    <>

    </>
  );
};

export default page;
