import { Avatar, Group, Menu } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconAdjustments as Adjustments,
  IconBook as Book,
  IconLogout as Logout,
  IconSettings as Settings,
  IconUser as User,
} from "@tabler/icons-react";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { push } from "redux-first-history";

import { toggleSidebar } from "../../actions/uiActions";
import { api, useFetchUserSelfDetailsQuery } from "../../api_client/api";
import { serverAddress } from "../../api_client/apiClient";
import { logout } from "../../store/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { ChunkedUploadButton } from "../ChunkedUploadButton";
import { SiteSearch } from "../SiteSearch";
import { TopMenuCommon } from "./TopMenuPublic";
import { WorkerIndicator } from "./WorkerIndicator";

export function TopMenu(): React.ReactNode {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const matches = useMediaQuery("(min-width: 700px)");
  const auth = useAppSelector(state => state.auth);
  const { data: user } = useFetchUserSelfDetailsQuery(auth.access.user_id);

  return (
    <Group justify="space-between" h="100%" px={15}>
      {matches && <TopMenuCommon onToggleSidebar={() => dispatch(toggleSidebar())} />}
      <Group>
        <SiteSearch />
      </Group>

      <Group>
        <ChunkedUploadButton />
        <WorkerIndicator />

        <Menu width={200}>
          <Menu.Target>
            <Group m="xs" style={{ cursor: "pointer" }}>
              <Avatar
                src={user && user.avatar_url ? serverAddress + user.avatar_url : "/unknown_user.jpg"}
                size={25}
                alt="it's me"
                radius="xl"
              />
            </Group>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>
              <Trans i18nKey="topmenu.loggedin">Logged in as</Trans> {auth.access ? auth.access.name : ""}
            </Menu.Label>

            <Menu.Item leftSection={<Book />} onClick={() => dispatch(push("/library"))}>
              {t("topmenu.library")}
            </Menu.Item>

            <Menu.Item leftSection={<User />} onClick={() => dispatch(push("/profile"))}>
              {t("topmenu.profile")}
            </Menu.Item>

            <Menu.Item leftSection={<Settings />} onClick={() => dispatch(push("/settings"))}>
              {t("topmenu.settings")}
            </Menu.Item>

            {auth.access && auth.access.is_admin && <Menu.Divider />}

            {auth.access && auth.access.is_admin && (
              <Menu.Item leftSection={<Adjustments />} onClick={() => dispatch(push("/admin"))}>
                {t("topmenu.adminarea")}
              </Menu.Item>
            )}

            <Menu.Item
              leftSection={<Logout />}
              onClick={() => {
                dispatch(logout());
                dispatch(api.util.resetApiState());
              }}
            >
              {t("topmenu.logout")}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}
