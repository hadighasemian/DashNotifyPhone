"use client";

import React, { useContext } from "react";
import { Sidebar } from "flowbite-react";
import { IconSidebar } from "./IconSidebar";
import SidebarContent from "./Sidebaritems";
import NavItems from "./NavItems";
import NavCollapse from "./NavCollapse";
import { CustomizerContext } from "@/app/context/customizerContext";
import SimpleBar from "simplebar-react";
import SideProfile from "./SideProfile/SideProfile";
import i18n from "@/utils/i18n";

const SidebarLayout = () => {
  const { selectedIconId, setSelectedIconId } = useContext(CustomizerContext) || {};
  const selectedContent = SidebarContent.find(
    (data) => data.id === selectedIconId
  );

  return (
    <>
      <div className="xl:block hidden">

        <div className="minisidebar-icon border-e border-ld bg-white dark:bg-darkgray fixed start-0 z-[1]">
          <IconSidebar />
          <SideProfile />
        </div>
        <Sidebar
          className="fixed menu-sidebar pt-8 bg-white dark:bg-darkgray ps-4 rtl:pe-4 rtl:ps-0"
          aria-label="Sidebar with multi-level dropdown example"

        >

          <SimpleBar className="h-[calc(100vh_-_85px)]">
            <Sidebar.Items className="pe-4 rtl:pe-0 rtl:ps-4">
              <Sidebar.ItemGroup className="sidebar-nav hide-menu ">
                {selectedContent &&
                  selectedContent.items?.map((item, index) => (
                    <React.Fragment key={index}>
                      <h5 className="text-link font-semibold text-sm caption ">
                        {i18n.t(`${item.heading}`)}
                      </h5>
                      {item.children?.map((child, index) => (
                        <React.Fragment key={child.id && index}>
                          {child.children ? (
                            <NavCollapse item={child} />
                          ) : (
                            <NavItems item={child} />
                          )}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))}
              </Sidebar.ItemGroup>
            </Sidebar.Items>
          </SimpleBar>
        </Sidebar>
      </div>
    </>
  );
};

export default SidebarLayout;
