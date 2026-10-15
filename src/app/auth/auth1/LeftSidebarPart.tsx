"use client";
import Image from "next/image";
import React from "react";
import Bgimg from "/public/images/logos/logo-1.png";
import { Button } from "flowbite-react";
import i18n from "@/utils/i18n";

const LeftSidebarPart = () => {
  return (

    <div className="flex flex-col justify-center items-center h-screen relative">
        <div className="flex justify-center">
            <Image src={Bgimg} alt="materilm" className="circle-bottom" />
        </div>
        <div className="text-center mt-4">
            <h2 className="text-white text-[40px] font-bold leading-[normal]">
                {i18n.t('Welcome to mess bot dashboard')}
            </h2>
        </div>
    </div>

  );
};

export default LeftSidebarPart;
