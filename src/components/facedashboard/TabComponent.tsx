import { Loader, Tabs } from "@mantine/core";
import React from "react";
import { useTranslation } from "react-i18next";

import { FaceDetection } from "../../layouts/dataviz/constants";

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
    <Tabs style={{ width }} defaultValue={FaceDetection.LABELED} onTabChange={onTabChange}>
      <Tabs.List>
        <Tabs.Tab value={FaceDetection.LABELED}>{t("settings.labeled")}</Tabs.Tab>
        <Tabs.Tab value={FaceDetection.INFERRED}>{t("settings.inferred")}</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value={FaceDetection.LABELED}>{fetchingLabeledFacesList ? <Loader size="sm" /> : null}</Tabs.Panel>

      <Tabs.Panel value={FaceDetection.INFERRED}>
        {t("settings.inferred")} {fetchingInferredFacesList ? <Loader size="sm" /> : null}
      </Tabs.Panel>
    </Tabs>
  );
}
