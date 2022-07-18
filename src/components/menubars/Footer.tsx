import { Footer, Group } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React from "react";
import { useTranslation } from "react-i18next";

import { selectAuthAccess, selectIsAuthenticated } from "../../store/auth/authSelectors";
import { useAppSelector } from "../../store/store";
import { createMobileMenuItem, getMenuItems } from "./navigation";

export function FooterMenu(): JSX.Element {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const canAccess = useAppSelector(selectAuthAccess);

  const matches = useMediaQuery("(min-width: 700px)");
  const { t } = useTranslation();

  if (matches) {
    return <div />;
  }

  return (
    <Footer height={50} p="xs">
      <Group position="apart">{getMenuItems(t, canAccess, isAuthenticated).map(createMobileMenuItem)}</Group>
    </Footer>
  );
}
