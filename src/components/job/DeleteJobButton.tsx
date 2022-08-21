import { Button, Popover } from "@mantine/core";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { deleteJob } from "../../actions/utilActions";
import { useAppDispatch } from "../../store/store";

type Props = {
  job: {
    id: number;
  };
  pageSize: number;
  activePage: number;
};

export function DeleteJobButton({ job, pageSize, activePage }: Props) {
  const { id } = job;
  const [opened, setOpened] = useState(false);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  return (
    <Popover opened={opened} position="top" withArrow width={260} onClose={() => setOpened(false)}>
      <Popover.Target>
        <Button
          onMouseEnter={() => setOpened(true)}
          onMouseLeave={() => setOpened(false)}
          onClick={() => dispatch(deleteJob(id, activePage, pageSize))}
          color="red"
        >
          {t("adminarea.remove")}
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <div style={{ display: "flex" }}>{t("joblist.removeexplanation")}</div>
      </Popover.Dropdown>
    </Popover>
  );
}
