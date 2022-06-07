import { createStyles, Text, Navbar } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { push } from "connected-react-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Album, Photo, Trash, Search, Share } from "tabler-icons-react";

import { useAppDispatch } from "../../store/store";

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef('icon');
  return {
    link: {
      ...theme.fn.focusStyles(),
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      fontSize: theme.fontSizes.sm,
      color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[7],
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 500,

      '&:hover': {
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        color: theme.colorScheme === 'dark' ? theme.white : theme.black,

        [`& .${icon}`]: {
          color: theme.colorScheme === 'dark' ? theme.white : theme.black,
        },
      },
    },

    linkIcon: {
      ref: icon,
      color: theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.gray[6],
      marginRight: theme.spacing.sm,
    },

    linkActive: {
      '&, &:hover': {
        backgroundColor:
          theme.colorScheme === 'dark'
            ? theme.fn.rgba(theme.colors[theme.primaryColor][8], 0.25)
            : theme.colors[theme.primaryColor][0],
        color: theme.colorScheme === 'dark' ? theme.white : theme.colors[theme.primaryColor][7],
        [`& .${icon}`]: {
          color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 5 : 7],
        },
      },
    }
  };
});

export function SideMenuNarrow(): JSX.Element {
  const dispatch = useAppDispatch();
  const isDesktop = useMediaQuery("(min-width: 700px)");
  const location = useLocation();
  const { t } = useTranslation();
  const { classes, cx } = useStyles();
  const [ active, setActive ] = useState<string>(location.pathname);

  const navigation = [
    { link: '/', label: t('sidemenu.photos'), icon: Photo },
    { link: '/useralbums', label: t('sidemenu.albums'), icon: Album },
    { link: '/explore', label: t('sidemenu.explore'), icon: Search },
    { link: '/shared/fromme/photos', label: t('sidemenu.sharing'), icon: Share },
    { link: '/deleted', label: t('photos.deleted'), icon: Trash },
  ];
  const links = navigation.map(item => (
    <Text<'a'>
      className={cx(classes.link, { [classes.linkActive]: active === item.link })}
      component="a"
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.link);
        dispatch(push(item.link));
      }}
    >
      <item.icon className={classes.linkIcon} />
      <span>{item.label}</span>
    </Text>
  ));

  if (!isDesktop) {
    return <div></div>;
  }

  return (
    <Navbar width={{ sm: 250 }} style={{ paddingTop: 20 }}>
      <Navbar.Section grow>
        {links}
      </Navbar.Section>
    </Navbar>
  );
}
