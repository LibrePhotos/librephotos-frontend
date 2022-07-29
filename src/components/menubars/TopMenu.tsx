import { ActionIcon, Avatar, Button, Divider, Grid, Group, Header, Image, Menu } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React, { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { push } from "redux-first-history";
import { Adjustments, Book, Heart, Logout, Menu2, Settings, User } from "tabler-icons-react";

import { toggleSidebar } from "../../actions/uiActions";
import { api } from "../../api_client/api";
import { serverAddress } from "../../api_client/apiClient";
import { logout } from "../../store/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { SUPPORT_LINK } from "../../ui-constants";
import { ChunkedUploadButton } from "../ChunkedUploadButton";
import { CustomSearch } from "../CustomSearch";
import { WorkerIndicator } from "./WorkerIndicator";

export function TopMenu() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth);
  const userSelfDetails = useAppSelector(state => state.user.userSelfDetails);

  const { t } = useTranslation();

  const matches = useMediaQuery("(min-width: 700px)");

  useEffect(() => {
    if (auth.access) {
      dispatch(api.endpoints.fetchUserSelfDetails.initiate(auth.access.user_id));
    }
  }, [auth.access, dispatch]);

  return (
    <Header height={45}>
      <Grid justify="space-between" grow style={{ padding: 5 }}>
        {matches && (
          <Grid.Col span={1}>
            <Group>
              <Menu2
                onClick={() => {
                  dispatch(toggleSidebar());
                }}
              />
              <Button
                color="dark"
                style={{
                  padding: 2,
                }}
              >
                <Image height={30} src="/logo-white.png" />
              </Button>
            </Group>
          </Grid.Col>
        )}
        <Grid.Col span={3}>
          <CustomSearch />
        </Grid.Col>
        <Grid.Col span={1}>
          <Group position="right">
            {!matches && (
              <ActionIcon onClick={() => dispatch(push(SUPPORT_LINK))} color="pink">
                <Heart />
              </ActionIcon>
            )}
            <ChunkedUploadButton />
            <WorkerIndicator />
            <Menu
              trigger="hover"
              control={
                <Group spacing="xs">
                  <Avatar
                    src={
                      userSelfDetails && userSelfDetails.avatar_url
                        ? serverAddress + userSelfDetails.avatar_url
                        : "/unknown_user.jpg"
                    }
                    size={25}
                    alt="it's me"
                    radius="xl"
                  />
                </Group>
              }
            >
              <Menu.Label>
                <Trans i18nKey="topmenu.loggedin">Logged in as</Trans> {auth.access ? auth.access.name : ""}
              </Menu.Label>
              <Menu.Item icon={<Book />} onClick={() => dispatch(push("/library"))}>
                {t("topmenu.library")}
              </Menu.Item>
              <Menu.Item icon={<User />} onClick={() => dispatch(push("/profile"))}>
                {t("topmenu.profile")}
              </Menu.Item>
              <Menu.Item icon={<Settings />} onClick={() => dispatch(push("/settings"))}>
                {t("topmenu.settings")}
              </Menu.Item>
              {auth.access && auth.access.is_admin && <Divider />}

              {auth.access && auth.access.is_admin && (
                <Menu.Item icon={<Adjustments />} onClick={() => dispatch(push("/admin"))}>
                  {t("topmenu.adminarea")}
                </Menu.Item>
              )}
              <Menu.Item icon={<Logout />} onClick={() => dispatch(logout())}>
                {t("topmenu.logout")}
              </Menu.Item>
            </Menu>
          </Group>
        </Grid.Col>
      </Grid>
    </Header>
  );
}
