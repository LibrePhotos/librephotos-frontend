import { Button, Divider, Grid, Modal, Stack, TextInput, Title } from "@mantine/core";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import SortableTree from "react-sortable-tree";
import FileExplorerTheme from "react-sortable-tree-theme-file-explorer";

import { fetchNextcloudDirectoryTree, updateUser } from "../../actions/utilActions";
import { useAppDispatch, useAppSelector } from "../../store/store";

type Props = {
  isOpen: boolean;
  userToEdit: any;
  selectedNodeId?: string;
  onRequestClose: () => void;
};

export const ModalNextcloudScanDirectoryEdit = (props: Props) => {
  const { t } = useTranslation();
  const [newScanDirectory, setNewScanDirectory] = useState("");
  const [treeData, setTreeData] = useState([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const auth = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const { nextcloudDirectoryTree } = useAppSelector(state => state.util);

  useEffect(() => {
    setTreeData(nextcloudDirectoryTree);
  }, [nextcloudDirectoryTree]);

  useEffect(() => {
    if (auth.access && auth.access.is_admin) {
      dispatch(fetchNextcloudDirectoryTree(""));
    }
  }, [auth.access, dispatch]);

  const nodeClicked = (event, rowInfo) => {
    //@ts-ignore
    inputRef.current.inputRef.value = rowInfo.node.absolute_path;
    setNewScanDirectory(rowInfo.node.absolute_path);
  };

  return (
    <Modal
      opened={props.isOpen}
      centered
      onClose={() => {
        props.onRequestClose();
        setNewScanDirectory("");
      }}
      title={<Title order={4}>{t("modalnextcloud.setdirectory")}</Title>}
      size="xl"
    >
      <Stack>
        <Title order={5}>{t("modalnextcloud.currentdirectory")}</Title>
        <Grid grow>
          <Grid.Col span={9}>
            <TextInput
              ref={inputRef}
              placeholder={
                props.userToEdit
                  ? props.userToEdit.nextcloud_scan_directory === ""
                    ? t("modalnextcloud.notset")
                    : props.userToEdit.nextcloud_scan_directory
                  : "..."
              }
            ></TextInput>
          </Grid.Col>
          <Grid.Col span={3}>
            <Button
              type="submit"
              color="green"
              onClick={() => {
                const newUserData = {
                  ...props.userToEdit,
                  nextcloud_scan_directory: newScanDirectory,
                };
                const ud = newUserData;
                updateUser(ud, dispatch);
                props.onRequestClose();
              }}
            >
              {t("modalnextcloud.update")}
            </Button>
          </Grid.Col>
        </Grid>
        <Divider />
        <Title order={5}>{t("modalnextcloud.choosedirectory")}</Title>
        <div style={{ height: "250px", overflow: "auto" }}>
          <SortableTree
            innerStyle={{ outline: "none" }}
            canDrag={() => false}
            canDrop={() => false}
            treeData={treeData}
            onChange={treeData => setTreeData(treeData)}
            theme={FileExplorerTheme}
            generateNodeProps={rowInfo => {
              const nodeProps = {
                onClick: event => nodeClicked(event, rowInfo),
              };
              if (props.selectedNodeId === rowInfo.node.id) {
                //@ts-ignore
                nodeProps.className = "selected-node";
              }
              return nodeProps;
            }}
          />
        </div>
      </Stack>
    </Modal>
  );
};
