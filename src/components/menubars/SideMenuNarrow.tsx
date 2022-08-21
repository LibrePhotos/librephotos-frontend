import { ActionIcon, Divider, Menu, Navbar } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { push } from "redux-first-history";
import { ChevronRight, Heart } from "tabler-icons-react";

import { selectAuthAccess, selectIsAuthenticated } from "../../store/auth/authSelectors";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { LEFT_MENU_WIDTH, MENU_DROPDOWN_WIDTH, SUPPORT_LINK } from "../../ui-constants";
import { getNavigationItems, navigationStyles } from "./navigation";

export function SideMenuNarrow(): JSX.Element {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const canAccess = useAppSelector(selectAuthAccess);
  const dispatch = useAppDispatch();
  const { classes, cx } = navigationStyles();
  const [active, setActive] = useState("/");

  const { t } = useTranslation();
  const matches = useMediaQuery("(min-width: 700px)");

  if (!matches) {
    return <div />;
  }

  const links = getNavigationItems(t, isAuthenticated, canAccess).map(item => {
    if (item.display === false) {
      return null;
    }

    const link = (
      <a
        className={cx(classes.link, { [classes.linkActive]: item.link === active })}
        href={item.link}
        key={item.label}
        onClick={event => {
          event.preventDefault();
          if (!item.submenu) {
            setActive(item.link);
            dispatch(push(item.link));
          }
        }}
      >
        <ActionIcon className={classes.linkIcon} color={item.color} variant="light">
          <item.icon />
        </ActionIcon>
        <span style={{ flexGrow: 2 }}>{item.label}</span>
        {item.submenu && <ChevronRight size={16} />}
      </a>
    );

    if (item.submenu) {
      return (
        <Menu key={item.label} withArrow position="right-start" width={MENU_DROPDOWN_WIDTH} arrowOffset={20}>
          <Menu.Target>{link}</Menu.Target>

          <Menu.Dropdown>
            {item.submenu.map(subitem => {
              const idx = item.submenu?.indexOf(subitem);
              if (subitem.header) {
                return <Menu.Label key={idx}>{subitem.header}</Menu.Label>;
              }
              if (subitem.separator) {
                return <Divider key={idx} />;
              }
              const onClick = (event: { preventDefault: () => void }) => {
                event.preventDefault();
                setActive(item.link);
                dispatch(push(subitem.link!));
              };
              const icon = (
                <ActionIcon color={subitem.color} variant="light">
                  <subitem.icon />
                </ActionIcon>
              );
              return (
                <Menu.Item key={idx} onClick={onClick} icon={icon}>
                  {subitem.label}
                </Menu.Item>
              );
            })}
          </Menu.Dropdown>
        </Menu>
      );
    }

    return link;
  });

  return (
    <Navbar width={{ xs: LEFT_MENU_WIDTH }} pt="md">
      <Navbar.Section grow>{links}</Navbar.Section>

      <Navbar.Section mb="lg">
        <a href={SUPPORT_LINK} target="_blank" rel="noreferrer" className={classes.link}>
          <ActionIcon className={classes.linkIcon} color="pink" variant="light">
            <Heart />
          </ActionIcon>
          <span style={{ flexGrow: 2 }}>{t("supportus")}</span>
        </a>
      </Navbar.Section>
    </Navbar>
  );
}
