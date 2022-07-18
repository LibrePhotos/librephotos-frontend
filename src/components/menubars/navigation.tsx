import { ActionIcon, Navbar } from "@mantine/core";
import React from "react";
import { Dropdown, Icon as SemanticIcon } from "semantic-ui-react";
import { Album, ChartLine, FaceId, Icon, Link, Photo, Trash, Users } from "tabler-icons-react";

import { MainLink } from "./MenuLink";

export interface NavigationSubmenu {
  header: string;
  separator: boolean;
  label: string;
  link: string;
  icon: string;
  color: string;
  disabled: boolean;
}

export interface Navigation {
  label: string;
  icon: Icon;
  color: string;
  link?: string;
  display?: boolean;
  submenu?: Array<Partial<NavigationSubmenu>>;
}

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
            <SemanticIcon name={item.icon} color={item.color} />
            {item.label}
          </Dropdown.Item>
        );
      })}
    </Dropdown.Menu>
  );
}

export function createDesktopMenuItem(item: any) {
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

export function createMobileMenuItem(item: any) {
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

export function getMenuItems(t: (s: string) => string, access: boolean, display: boolean): Array<Navigation> {
  return [
    { label: t("sidemenu.photos"), link: "/", icon: Photo, color: "green" },
    {
      label: t("sidemenu.albums"),
      icon: Album,
      color: "blue",
      submenu: [
        { header: t("sidemenu.albums") },
        { label: t("sidemenu.people"), link: "/people", icon: "users" },
        { label: t("sidemenu.places"), link: "/places", icon: "map" },
        { label: t("sidemenu.things"), link: "/things", icon: "tags" },
        { separator: true },
        { label: t("sidemenu.myalbums"), link: "/useralbums", icon: "bookmark" },
        { label: t("sidemenu.autoalbums"), link: "/events", icon: "wizard" },
      ],
    },
    {
      label: t("sidemenu.datavizsmall"),
      icon: ChartLine,
      color: "yellow",
      submenu: [
        { header: t("sidemenu.dataviz") },
        { label: t("sidemenu.placetree"), link: "/placetree", icon: "sitemap" },
        { label: t("sidemenu.wordclouds"), link: "/wordclouds", icon: "cloud" },
        { label: t("sidemenu.timeline"), link: "/timeline", icon: "chart bar" },
        { label: t("sidemenu.socialgraph"), link: "/socialgraph", icon: "share alternate" },
        { label: t("sidemenu.facecluster"), link: "/facescatter", icon: "user circle" },
      ],
    },
    { label: t("sidemenu.facerecognition"), link: "/faces", icon: FaceId, color: "orange" },
    {
      label: t("sidemenu.sharing"),
      display: display,
      icon: Users,
      color: "red",
      submenu: [
        { header: t("sidemenu.sharing") },
        { label: t("sidemenu.publicphotos"), link: "/users/", icon: "globe", disabled: !access },
        { label: t("sidemenu.youshared"), link: "/shared/fromme/photos/", icon: "share", color: "red" },
        { label: t("sidemenu.sharedwithyou"), link: "/shared/tome/photos/", icon: "share", color: "green" },
      ],
    },
    { label: t("photos.deleted"), link: "/deleted", icon: Trash, color: "black" },
  ];
}
