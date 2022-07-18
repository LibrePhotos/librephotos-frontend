import { Navbar } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React from "react";
import { useTranslation } from "react-i18next";

import { selectAuthAccess, selectIsAuthenticated } from "../../store/auth/authSelectors";
import { useAppSelector } from "../../store/store";
import { createDesktopMenuItem, getMenuItems } from "./navigation";

export function SideMenuNarrow(): JSX.Element {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const canAccess = useAppSelector(selectAuthAccess);

  const matches = useMediaQuery("(min-width: 700px)");
  const { t } = useTranslation();

  if (!matches) {
    return <div />;
  }

  return (
    <Navbar p="sm" hidden={false} width={{ base: 100 }}>
      {getMenuItems(t, canAccess, isAuthenticated).map(createDesktopMenuItem)}
    </Navbar>
  );
}
