import { Navbar } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Dropdown, Icon } from "semantic-ui-react";

import { selectAuthAccess, selectIsAuthenticated } from "../../store/auth/authSelectors";
import { useAppSelector } from "../../store/store";
import { MainLink } from "./MenuLink";
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
      <Navbar.Section>
        <Dropdown
          pointing="left"
          item
          icon={<MainLink icon={<item.icon size={33} />} color={item.color} label={item.label} />}
        >
          {createSubmenuItems(item.submenu)}
        </Dropdown>
      </Navbar.Section>
    );
  }
  return (
    <Navbar.Section>
      <MainLink icon={<item.icon size={33} />} color={item.color} label={item.label} to={item.link} />
    </Navbar.Section>
  );
}

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
      {getMenuItems(t, canAccess, isAuthenticated).map(createMenuItem)}
    </Navbar>
  );
}
