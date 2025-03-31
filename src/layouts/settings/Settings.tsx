import {
  Button,
  Card,
  Container,
  Dialog,
  Flex,
  Group,
  NumberInput,
  Radio,
  Select,
  Space,
  Stack,
  Switch,
  Text,
  Title,
} from "@mantine/core";
import { IconSettings as SettingIcon } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { api } from "../../api_client/api";
import { useUpdateUserMutation } from "../../api_client/user";
import { useFetchTimezonesQuery } from "../../api_client/util";
import { ConfigDateTime } from "../../components/settings/ConfigDateTime";
import { useAppDispatch, useAppSelector } from "../../store/store";

export function Settings() {
  const [isOpenUpdateDialog, setIsOpenUpdateDialog] = useState(false);
  const userSelfDetailsRedux = useAppSelector(state => state.user.userSelfDetails);
  const [userSelfDetails, setUserSelfDetails] = useState(userSelfDetailsRedux);
  useEffect(() => {
    if (userSelfDetailsRedux) {
      setUserSelfDetails({
        ...userSelfDetailsRedux,
        scan_for_duplicates: userSelfDetailsRedux.scan_for_duplicates ?? false,
      });
    }
  }, [userSelfDetailsRedux]);
  
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth);
  const { t } = useTranslation();
  const { data: timezoneList = [] } = useFetchTimezonesQuery();
  const [updateUser] = useUpdateUserMutation();

  useEffect(() => {
    if (JSON.stringify(userSelfDetailsRedux) !== JSON.stringify(userSelfDetails)) {
      setIsOpenUpdateDialog(true);
    } else {
      setIsOpenUpdateDialog(false);
    }
  }, [userSelfDetailsRedux, userSelfDetails]);

  useEffect(() => {
    dispatch(api.endpoints.fetchUserSelfDetails.initiate(auth.access.user_id)).refetch();
  }, [auth.access.user_id, dispatch]);

  useEffect(() => {
    setUserSelfDetails(userSelfDetailsRedux);
  }, [userSelfDetailsRedux]);

  return (
    <Container>
      <Group gap="xs" mt={40} mb={20}>
        <SettingIcon size={35} />
        <Title order={1}>{t("settings.header")}</Title>
      </Group>
      <Stack>
        <Card shadow="md">
          <Title order={4} mb={16}>
            <Trans i18nKey="settings.scanoptions">Scan Options</Trans>
          </Title>
          <Flex align="flex-start" direction="column" gap="md">
            <Radio.Group
              description={t("settings.confidencelevel")}
              label={t("settings.sceneconfidence")}
              value={userSelfDetails.confidence?.toString() || "0"}
              onChange={value => {
                setUserSelfDetails({ ...userSelfDetails, confidence: value || "0" });
              }}
            >
              <Group mt="xs">
                <Radio value="0.5" label={t("settings.confidence.high")} />
                <Radio value="0.1" label={t("settings.confidence.standard")} />
                <Radio value="0.05" label={t("settings.confidence.low")} />
                <Radio value="0" label={t("settings.confidence.none")} />
              </Group>
            </Radio.Group>
            <Radio.Group
              label={t("settings.semanticsearchheader")}
              description={t("settings.semanticsearch.placeholder")}
              value={userSelfDetails.semantic_search_topk?.toString()}
              onChange={value => {
                setUserSelfDetails({ ...userSelfDetails, semantic_search_topk: value || "0" });
              }}
            >
              <Group mt="xs">
                <Radio value="100" label={t("settings.semanticsearch.top100")} />
                <Radio value="50" label={t("settings.semanticsearch.top50")} />
                <Radio value="10" label={t("settings.semanticsearch.top10")} />
                <Radio value="0" label={t("settings.semanticsearch.top0")} />
              </Group>
            </Radio.Group>
            <Switch
              label={t("settings.scan_for_duplicates")}
              description={t("settings.scan_for_duplicates_description")}
              checked={userSelfDetails.scan_for_duplicates}
              onChange={event => {
                setUserSelfDetails({
                  ...userSelfDetails,
                  scan_for_duplicates: event.currentTarget.checked,
                });
              }}
            />
          </Flex>
        </Card>
        <Card shadow="md">
          <Title order={4} mb={16}>
            <Trans i18nKey="settings.metadata">Metadata</Trans>
          </Title>
          <Flex align="flex-start" direction="column" gap="md">
            <Radio.Group
              label={t("settings.sync")}
              value={userSelfDetails.save_metadata_to_disk}
              onChange={value => {
                setUserSelfDetails({ ...userSelfDetails, save_metadata_to_disk: value || "OFF" });
              }}
            >
              <Group mt="xs">
                <Radio value="OFF" label={t("settings.favoritesyncoptions.off")} />
                <Radio value="SIDECAR_FILE" label={t("settings.favoritesyncoptions.sidecar")} />
                <Radio value="MEDIA_FILE" label={t("settings.favoritesyncoptions.mediafile")} />
              </Group>
            </Radio.Group>
            <Radio.Group
              label={t("settings.favoriteminimum")}
              value={userSelfDetails.favorite_min_rating?.toString()}
              onChange={value => {
                setUserSelfDetails({ ...userSelfDetails, favorite_min_rating: value || "3" });
              }}
            >
              <Group mt="xs">
                <Radio value="1" label="1" />
                <Radio value="2" label="2" />
                <Radio value="3" label="3" />
                <Radio value="4" label="4" />
                <Radio value="5" label="5" />
              </Group>
            </Radio.Group>
            <Select
              label={t("defaulttimezone")}
              value={userSelfDetails.default_timezone}
              placeholder={t("defaulttimezone")}
              searchable
              title={t("timezoneexplain")}
              onChange={value => {
                setUserSelfDetails({ ...userSelfDetails, default_timezone: value ?? "UTC" });
              }}
              data={timezoneList}
            />
          </Flex>
        </Card>
        <Card shadow="md">
          <ConfigDateTime
            value={userSelfDetails.datetime_rules}
            onChange={value => {
              setUserSelfDetails({ ...userSelfDetails, datetime_rules: value || "[]" });
            }}
          />
        </Card>
        <Space h="xl" />
      </Stack>
      <Dialog
        opened={isOpenUpdateDialog}
        withCloseButton
        onClose={() => setIsOpenUpdateDialog(false)}
        size="lg"
        radius="md"
      >
        <Text size="sm" style={{ marginBottom: 10 }} fw={500}>
          {t("settings.savechanges")}
        </Text>
        <Group justify="flex-end">
          <Button
            size="sm"
            color="green"
            onClick={() => {
              const newUserData = userSelfDetails;
              delete newUserData.scan_directory;
              delete newUserData.avatar;
              updateUser(newUserData);
              setIsOpenUpdateDialog(false);
            }}
          >
            <Trans i18nKey="settings.favoriteupdate">Update profile settings</Trans>
          </Button>
          <Button
            onClick={() => {
              setUserSelfDetails(userSelfDetailsRedux);
              setIsOpenUpdateDialog(false);
            }}
            size="sm"
          >
            <Trans i18nKey="settings.nextcloudcancel">Cancel</Trans>
          </Button>
        </Group>
      </Dialog>
    </Container>
  );
}
