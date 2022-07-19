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

function createSubmenuItems(item: any, id: number) {
  if (item.separator) {
    return <Dropdown.Divider key={id} />;
  }
  if (item.header) {
    return <Dropdown.Header key={id}>{item.header}</Dropdown.Header>;
  }
  return (
    <Dropdown.Item key={id} as={Link} to={item.link} disabled={item.disabled}>
      <SemanticIcon name={item.icon} color={item.color} />
      {item.label}
    </Dropdown.Item>
  );
}

export function createDesktopMenuItem(item: any, id: number) {
  if (item.display === false) {
    return null;
  }
  if (item.submenu) {
    console.log(item.submenu);
    return (
      <Navbar.Section key={id}>
        <Dropdown
          pointing="left"
          item
          icon={<MainLink icon={<item.icon size={33} />} color={item.color} label={item.label} />}
        >
          <Dropdown.Menu>{item.submenu.map(createSubmenuItems)}</Dropdown.Menu>
        </Dropdown>
      </Navbar.Section>
    );
  }
  return (
    <Navbar.Section key={id}>
      <MainLink icon={<item.icon size={33} />} color={item.color} label={item.label} to={item.link} />
    </Navbar.Section>
  );
}

export function createMobileMenuItem(item: any, id: number) {
  if (item.display === false) {
    return null;
  }
  if (item.submenu) {
    return (
      <Dropdown
        key={id}
        pointing="top"
        item
        icon={
          <ActionIcon color="blue" variant="light">
            <item.icon size={33} />
          </ActionIcon>
        }
      >
        <Dropdown.Menu>{item.submenu.map(createSubmenuItems)}</Dropdown.Menu>
      </Dropdown>
    );
  }
  return (
    <ActionIcon key={id} color={item.color} variant="light" component={Link} to={item.link}>
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
