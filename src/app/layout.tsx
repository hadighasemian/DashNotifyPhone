import React from "react";
import type { Metadata } from "next";
import "./css/globals.css";
import { Flowbite, ThemeModeScript } from "flowbite-react";
import customTheme from "@/utils/theme/custom-theme";
import { CustomizerContextProvider } from "@/app/context/customizerContext";
import "./api/index"
import Providers from "@/app/providers";



export const metadata: Metadata = {
  title: "PhoneNotify Admin",
  description: "PhoneNotify device notification dashboard",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

    <html lang="per" >
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <ThemeModeScript />
      </head>
      <body >
      <Providers>
          <Flowbite theme={{ theme: customTheme }}>
              <CustomizerContextProvider>
                {children}
              </CustomizerContextProvider>
            </Flowbite>
      </Providers>

      </body>
    </html>

  );
}



