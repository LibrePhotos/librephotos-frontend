import { ActionIcon, Divider, Footer, Group, Menu } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React from "react";
import { useTranslation } from "react-i18next";
import { push } from "redux-first-history";

import { selectAuthAccess, selectIsAuthenticated } from "../../store/auth/authSelectors";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { getNavigationItems, navigationStyles } from "./navigation";

export function FooterMenu(): JSX.Element {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const canAccess = useAppSelector(selectAuthAccess);
  const dispatch = useAppDispatch();
  const { classes } = navigationStyles();

  const matches = useMediaQuery("(min-width: 700px)");
  const { t } = useTranslation();

  if (matches) {
    return <div />;
  }

  const links = getNavigationItems(t, isAuthenticated, canAccess).map(item => {
    if (item.display === false) {
      return null;
    }

    const link = (
      <a
        href={item.link}
        key={item.label}
        onClick={event => {
          event.preventDefault();
          if (!item.submenu) {
            dispatch(push(item.link));
          }
        }}
      >
        <ActionIcon color={item.color} variant="light">
          <item.icon className={classes.linkIcon} size={33} style={{ margin: 0 }} />
        </ActionIcon>
      </a>
    );

    if (item.submenu) {
      return (
        <Menu control={link} withArrow position="top" placement="center" style={{ display: "block" }} gutter={0}>
          {item.submenu.map(subitem => {
            if (subitem.header) {
              return <Menu.Label>{subitem.header}</Menu.Label>;
            }
            if (subitem.separator) {
              return <Divider />;
            }
            const icon = <subitem.icon size={20} color={subitem.color} />;
            return (
              <Menu.Item icon={icon} onClick={() => dispatch(push(subitem.link!))}>
                {subitem.label}
              </Menu.Item>
            );
          })}
        </Menu>
      );
    }

    return link;
  });

  return (
    <Footer height={50} p="xs">
      <Group position="apart">{links}</Group>
    </Footer>
  );
}
