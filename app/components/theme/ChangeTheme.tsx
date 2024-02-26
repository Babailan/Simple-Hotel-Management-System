"use client";

import { changeThemeAction } from "@/app/actions/change-theme";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { decodeJwt } from "jose";
import { forwardRef, useEffect, useState } from "react";
import { useCookies } from "react-cookie";

export default forwardRef(function ChangeTheme() {
  const [cookies, setCookies, removeCookies] = useCookies();
  const [user] = [cookies.token ? decodeJwt(cookies.token) : null];

  const ChangeThemeEvent = async () => {
    await changeThemeAction();
  };

  return "light" == "light" ? (
    <MoonIcon
      width={30}
      height={30}
      className="hover:cursor-pointer"
      onClick={ChangeThemeEvent}
    />
  ) : (
    <SunIcon
      width={30}
      height={30}
      className="hover:cursor-pointer"
      onClick={ChangeThemeEvent}
    />
  );
});
