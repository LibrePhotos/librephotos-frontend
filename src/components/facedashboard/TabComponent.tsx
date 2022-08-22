import { Loader, Tabs } from "@mantine/core";
import React from "react";
import { useTranslation } from "react-i18next";

import { FACES_INFERRED, FACES_LABELED } from "../../layouts/dataviz/constants";

type Props = {
  width: number;
  onTabChange: (name: string) => void;
  fetchingLabeledFacesList: boolean;
  fetchingInferredFacesList: boolean;
};

export function TabComponent(props: Props) {
  const { t } = useTranslation();
  const { width, onTabChange, fetchingLabeledFacesList, fetchingInferredFacesList } = props;

  return (
    <Tabs style={{ width }} defaultValue={FACES_LABELED} onTabChange={onTabChange}>
      <Tabs.List>
        <Tabs.Tab value={FACES_LABELED}>{t("settings.labeled")}</Tabs.Tab>
        <Tabs.Tab value={FACES_INFERRED}>{t("settings.inferred")}</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value={FACES_LABELED}>{fetchingLabeledFacesList ? <Loader size="sm" /> : null}</Tabs.Panel>
      <Tabs.Panel value={FACES_INFERRED}>{fetchingInferredFacesList ? <Loader size="sm" /> : null}</Tabs.Panel>
    </Tabs>
  );
}
