"use client";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import english from "../utils/languages/en.json";
import persian from "../utils/languages/per.json";


const resources = {
  per: {
    translation: persian,
  },

};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "per",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
