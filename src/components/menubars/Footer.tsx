import { ActionIcon, Footer, Group } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Dropdown, Icon } from "semantic-ui-react";

import { selectAuthAccess, selectIsAuthenticated } from "../../store/auth/authSelectors";
import { useAppSelector } from "../../store/store";
import { getMenuItems } from "./navigation";

function createSubmenuItems(items: any) {
  return (
    <Dropdown.Menu>
      {items.map((item: any) => {
        if (item.separator) {
          return <Dropdown.Divider />;
        }
        if (item.header) {
          return <Dropdown.Header>{item.header}</Dropdown.Header>;
        }
        return (
          <Dropdown.Item as={Link} to={item.link} disabled={item.disabled}>
            <Icon name={item.icon} color={item.color} />
            {item.label}
          </Dropdown.Item>
        );
      })}
    </Dropdown.Menu>
  );
}

function createMenuItem(item: any) {
  if (item.display === false) {
    return null;
  }
  if (item.submenu) {
    return (
      <Dropdown
        pointing="top"
        item
        icon={
          <ActionIcon color="blue" variant="light">
            <item.icon size={33} />
          </ActionIcon>
        }
      >
        {createSubmenuItems(item.submenu)}
      </Dropdown>
    );
  }
  return (
    <ActionIcon color={item.color} variant="light" component={Link} to={item.link}>
      <item.icon size={33} />
    </ActionIcon>
  );
}

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
      <Group position="apart">{getMenuItems(t, canAccess, isAuthenticated).map(createMenuItem)}</Group>
    </Footer>
  );
}
