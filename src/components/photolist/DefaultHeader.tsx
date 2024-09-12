import { Button, Group, Loader, Menu, Stack, Text, Title } from "@mantine/core";
import {
  IconCalendar as Calendar,
  IconChevronDown as ChevronDown,
  IconClock as Clock,
  IconEyeOff as EyeOff,
  IconGlobe as Globe,
  IconPhoto as Photo,
  IconStar as Star,
  IconVideo as Video,
} from "@tabler/icons-react";
import { DateTime } from "luxon";
import type { ReactElement } from "react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { push } from "redux-first-history";

import { useFetchUserListQuery } from "../../api_client/api";
import { i18nResolvedLanguage } from "../../i18n";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { ModalUserEdit } from "../modals/ModalUserEdit";

type Props = Readonly<{
  loading: boolean;
  numPhotosetItems: number;
  numPhotos: number;
  icon: ReactElement;
  title: string;
  additionalSubHeader: string;
  dayHeaderPrefix: string;
  date: string;
}>;

export function DefaultHeader(props: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState({});

  const auth = useAppSelector(state => state.auth);
  const user = useAppSelector(store => store.user.userSelfDetails);
  const route = useAppSelector(store => store.router);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { data: userList } = useFetchUserListQuery();

  // return true if it is a view with a dropdown
  const isMenuView = () => {
    // @ts-ignore
    const path = route.location.pathname;
    return (
      path === "/" ||
      path.startsWith("/hidden") ||
      path.startsWith("/favorites") ||
      path.startsWith("/notimestamp") ||
      path.startsWith("/recent") ||
      path.startsWith("/user/") ||
      path.startsWith("/photos") ||
      path.startsWith("/videos")
    );
  };

  const isScanView = () => route.location.pathname === "/";

  const { loading, numPhotosetItems, icon, numPhotos, title, additionalSubHeader, date, dayHeaderPrefix } = props;

  function getPhotoCounter() {
    if (loading || numPhotosetItems < 1) {
      return (
        <Text align="left" c="dimmed">
          {loading ? t("defaultheader.loading") : null}
          {!loading && numPhotosetItems < 1 ? t("defaultheader.noimages") : null}
          {loading ? <Loader size={20} /> : null}
        </Text>
      );
    }

    return (
      <Text align="left" c="dimmed">
        {numPhotosetItems !== numPhotos ? `${numPhotosetItems} ${t("defaultheader.days")}, ` : ""}
        {numPhotos} {t("defaultheader.photos")}
        {additionalSubHeader}
      </Text>
    );
  }

  if (!loading && auth.access && isScanView() && auth.access.is_admin && !user.scan_directory && numPhotosetItems < 1) {
    return (
      <Stack align="center">
        <Title order={3}>{t("defaultheader.setup")}</Title>
        <Button
          color="green"
          onClick={() => {
            setUserToEdit({ ...user });
            setModalOpen(true);
          }}
        >
          {t("defaultheader.gettingstarted")}
        </Button>
        <ModalUserEdit
          onRequestClose={() => {
            setModalOpen(false);
          }}
          userToEdit={userToEdit}
          isOpen={modalOpen}
          updateAndScan
          userList={userList}
          createNew={false}
          firstTimeSetup
        />
      </Stack>
    );
  }

  return (
    <div>
      <Group justify="apart">
        <Group justify="left">
          {icon}
          <div>
            {auth.access && isMenuView() && auth.access.is_admin ? (
              <Menu>
                <Menu.Target>
                  <Title style={{ minWidth: 200 }} align="left" order={2}>
                    {title} <ChevronDown size={20} />
                  </Title>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item leftSection={<Calendar color="green" size={14} />} onClick={() => dispatch(push("/"))}>
                    {t("sidemenu.withtimestamp")}
                  </Menu.Item>

                  <Menu.Item
                    leftSection={<Calendar color="red" size={14} />}
                    onClick={() => dispatch(push("/notimestamp"))}
                  >
                    {t("sidemenu.withouttimestamp")}
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item leftSection={<Clock size={14} />} onClick={() => dispatch(push("/recent"))}>
                    {t("sidemenu.recentlyadded")}
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item leftSection={<EyeOff color="red" size={14} />} onClick={() => dispatch(push("/hidden"))}>
                    {t("sidemenu.hidden")}
                  </Menu.Item>

                  <Menu.Item
                    leftSection={<Star color="yellow" size={14} />}
                    onClick={() => dispatch(push("/favorites"))}
                  >
                    {t("sidemenu.favorites")}
                  </Menu.Item>

                  <Menu.Item leftSection={<Photo color="blue" size={14} />} onClick={() => dispatch(push("/photos"))}>
                    {t("sidemenu.photos")}
                  </Menu.Item>

                  <Menu.Item leftSection={<Video color="pink" size={14} />} onClick={() => dispatch(push("/videos"))}>
                    {t("sidemenu.videos")}
                  </Menu.Item>

                  <Menu.Item
                    leftSection={<Globe color="green" size={14} />}
                    disabled={!auth.access}
                    onClick={() => dispatch(push(auth.access ? `/user/${auth.access.name}` : "/"))}
                  >
                    {t("sidemenu.mypublicphotos")}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Title align="left" order={2}>
                {title}
              </Title>
            )}
            {getPhotoCounter()}
          </div>
        </Group>
        <Group justify="right">
          <Text>
            <b>
              {dayHeaderPrefix}
              {DateTime.fromISO(date).isValid
                ? DateTime.fromISO(date).setLocale(i18nResolvedLanguage()).toLocaleString(DateTime.DATE_HUGE)
                : date}
            </b>
          </Text>
        </Group>
      </Group>
    </div>
  );
}
