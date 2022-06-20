import { createStyles, Stack } from "@mantine/core";
import { push } from "connected-react-router";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, FaceId, Sitemap, Map, Users, Tags, Globe, Cloud, ChartBar, Share, UserCircle } from "tabler-icons-react";

import { fetchAutoAlbumsList, fetchUserAlbumsList } from "../../actions/albumsActions";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { HeaderComponent } from "./HeaderComponent";

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef('icon');
  return {
    group: {
      display: 'flex',
      section: {
        flexGrow: 3,
        margin: 10
      },
      header: {
        color: theme.colorScheme === 'dark' ? theme.white : theme.colors.dark[3],
        textTransform: 'uppercase',
        margin: '10px 0 10px 10px'
      },
      ul: {
        listStyle: 'none',
        paddingLeft: 0,
        marginRight: 20,
        li: {
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'flex-start',
          height: 48,
          cursor: 'pointer',
          color: theme.colorScheme === 'dark' ? theme.white : theme.colors.dark[5],
          svg: {
            marginLeft: 5,
            marginRight: 10,
          },
          div: {
            marginTop: 5
          },
          '&:hover': {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2],
            color: theme.colorScheme === 'dark' ? theme.white : theme.colors.dark[5],
            [`& .${icon}`]: {
              color: theme.colorScheme === 'dark' ? theme.white : theme.colors.dark[5],
            },
          }
        }
      }
    }
  }
});

export const Explorer = () => {
  const { fetchingAlbumsAutoList } = useAppSelector(store => store.albums);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { classes } = useStyles();

  useEffect(() => {
    dispatch(fetchAutoAlbumsList());
    dispatch(fetchUserAlbumsList());
  }, []);

  const groups = [
    {
      name: 'Data visualization',
      items: [
        { label: t('sidemenu.placetree'), link: '/placetree', icon: Sitemap },
        { label: t('sidemenu.wordclouds'), link: '/wordclouds', icon: Cloud },
        { label: t('sidemenu.timeline'), link: '/timeline', icon: ChartBar },
        { label: t("sidemenu.socialgraph"), link: '/socialgraph', icon: Share },
        { label: t("sidemenu.facecluster"), link: '/facescatter', icon: UserCircle },
      ]
    },
    {
      name: 'Images',
      items: [
        { label: t("sidemenu.people"), link: '/people', icon: Users },
        { label: t("sidemenu.places"), link: '/places', icon: Map },
        { label: t("sidemenu.things"), link: '/things', icon: Tags }
      ]
    },
    {
      name: 'Other',
      items: [
        { label: t("sidemenu.facerecognition"), link: '/faces', icon: FaceId },
        { label: t("sidemenu.publicphotos"), link: '/users', icon: Globe },
      ]
    }
  ]

  const exploreGroups = groups.map(group => {
    return (
      <section>
        <header>{group.name}</header>
        <ul>
          {group.items.map(item => (
            <li onClick={() => dispatch(push(item.link))}>
              <item.icon size={24} />
              <div className={item.label}>{item.label}</div>
            </li>
          ))}
        </ul>
      </section>
    );
  });

  return (
    <Stack>
      <HeaderComponent
        icon={<Search size={50} />}
        fetching={fetchingAlbumsAutoList || fetchingAlbumsAutoList}
        title="Explore"
        subtitle=""
      />
      <div className={classes.group}>
        {exploreGroups}
      </div>
    </Stack>
  );
};
