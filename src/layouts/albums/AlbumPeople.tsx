import { ActionIcon, Button, Group, Image, Menu, Modal, Text, TextInput } from "@mantine/core";
import { useResizeObserver, useViewportSize } from "@mantine/hooks";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AutoSizer, Grid } from "react-virtualized";
import { DotsVertical, Edit, Trash, Users } from "tabler-icons-react";

import { deletePerson, fetchPeople, renamePerson } from "../../actions/peopleActions";
import { Tile } from "../../components/Tile";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { LEFT_MENU_WIDTH, TOP_MENU_HEIGHT } from "../../ui-constants";
import { HeaderComponent } from "./HeaderComponent";

const SIDEBAR_WIDTH = LEFT_MENU_WIDTH;

export function AlbumPeople() {
  const { height } = useViewportSize();
  const [entrySquareSize, setEntrySquareSize] = useState(200);

  const [numEntrySquaresPerRow, setNumEntrySquaresPerRow] = useState(0);
  const [openDeleteDialogState, setOpenDeleteDialogState] = useState(false);
  const [openRenameDialogState, setOpenRenameDialogState] = useState(false);
  const [personID, setPersonID] = useState("");
  const [personName, setPersonName] = useState("");
  const [newPersonName, setNewPersonName] = useState("");
  const { people, fetching } = useAppSelector(store => store.people);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const openDeleteDialog = (id: string, name: string) => {
    setOpenDeleteDialogState(true);
    setPersonID(id);
    setPersonName(name);
  };
  const openRenameDialog = (id: string, name: string) => {
    setOpenRenameDialogState(true);
    setPersonID(id);
    setPersonName(name);
  };

  const calculateEntrySquareSize = () => {
    let numPerRow = 6;
    if (window.innerWidth < 600) {
      numPerRow = 2;
    } else if (window.innerWidth < 800) {
      numPerRow = 3;
    } else if (window.innerWidth < 1000) {
      numPerRow = 4;
    } else if (window.innerWidth < 1200) {
      numPerRow = 5;
    }

    const columnWidth = window.innerWidth - SIDEBAR_WIDTH - 5 - 5 - 15;
    const squareSize = columnWidth / numPerRow;

    setNumEntrySquaresPerRow(numPerRow);
    setEntrySquareSize(squareSize);
  };

  const [ref, rect] = useResizeObserver();
  useEffect(() => {
    calculateEntrySquareSize();
  }, [rect]);

  useEffect(() => {
    if (people.length === 0) {
      fetchPeople(dispatch);
    }
  }, [dispatch, people]);

  function getPersonAmbum(album) {
    if (album.face_count === 0) {
      return <Image height={entrySquareSize - 10} width={entrySquareSize - 10} src="/unknown_user.jpg" />;
    }
    if (album.text === "unknown") {
      return (
        <Link to={`/person/${album.key}`}>
          <Image height={entrySquareSize - 10} width={entrySquareSize - 10} src="/unknown_user.jpg" />
        </Link>
      );
    }
    return (
      <div>
        <Link to={`/person/${album.key}`}>
          <Tile
            video={album.video === true}
            height={entrySquareSize - 10}
            width={entrySquareSize - 10}
            image_hash={album.face_photo_url}
          />
        </Link>
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          <Menu position="bottom-end">
            <Menu.Target>
              <ActionIcon>
                <DotsVertical />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item icon={<Edit />} onClick={() => openRenameDialog(album.key, album.text)}>
                {t("rename")}
              </Menu.Item>
              <Menu.Item
                icon={<Trash />}
                onClick={() => {
                  openDeleteDialog(album.key, album.text);
                }}
              >
                {t("delete")}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>
    );
  }

  const cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    const albumPersonIndex = rowIndex * numEntrySquaresPerRow + columnIndex;
    if (albumPersonIndex < people.length) {
      return (
        <div key={key} style={style}>
          <div style={{ padding: 5 }}>{getPersonAmbum(people[albumPersonIndex])}</div>
          <div style={{ paddingLeft: 15, paddingRight: 15, height: 50 }}>
            <Group position="apart">
              <div>
                <b>{people[albumPersonIndex].text}</b> <br />
                {t("numberofphotos", {
                  number: people[albumPersonIndex].face_count,
                })}
              </div>
            </Group>
          </div>
        </div>
      );
    }
    return <div key={key} style={style} />;
  };

  return (
    <div ref={ref}>
      <HeaderComponent
        icon={<Users size={50} />}
        title={t("people")}
        fetching={fetching}
        subtitle={t("personalbum.numberofpeople", {
          peoplelength: people.length,
        })}
      />
      <Modal
        title={t("personalbum.renameperson")}
        onClose={() => setOpenRenameDialogState(false)}
        opened={openRenameDialogState}
      >
        <Group>
          <TextInput
            error={
              people.map(el => el.text.toLowerCase().trim()).includes(newPersonName.toLowerCase().trim())
                ? t("personalbum.personalreadyexists", {
                    name: newPersonName.trim(),
                  })
                : false
            }
            onChange={e => {
              setNewPersonName(e.currentTarget.value);
            }}
            placeholder={t("personalbum.nameplaceholder")}
          />
          <Button
            onClick={() => {
              dispatch(renamePerson(personID, personName, newPersonName));
              setOpenRenameDialogState(false);
            }}
            disabled={people.map(el => el.text.toLowerCase().trim()).includes(newPersonName.toLowerCase().trim())}
            type="submit"
          >
            {t("rename")}
          </Button>
        </Group>
      </Modal>
      <Modal
        opened={openDeleteDialogState}
        title={t("personalbum.deleteperson")}
        onClose={() => setOpenDeleteDialogState(false)}
      >
        <Text size="sm">{t("personalbum.deletepersondescription")}</Text>
        <Group>
          <Button
            onClick={() => {
              setOpenDeleteDialogState(false);
            }}
          >
            {t("cancel")}
          </Button>
          <Button
            color="red"
            onClick={() => {
              dispatch(deletePerson(personID));
              setOpenDeleteDialogState(false);
            }}
          >
            {t("delete")}
          </Button>
        </Group>
      </Modal>

      <AutoSizer disableHeight style={{ outline: "none", padding: 0, margin: 0 }}>
        {({ width }) => (
          <Grid
            style={{ outline: "none" }}
            headerHeight={100}
            disableHeader={false}
            cellRenderer={cellRenderer}
            columnWidth={entrySquareSize}
            columnCount={numEntrySquaresPerRow}
            height={height - TOP_MENU_HEIGHT - 60}
            rowHeight={entrySquareSize + 60}
            // @ts-ignore
            rowCount={Math.ceil(people.length / numEntrySquaresPerRow.toFixed(1))}
            width={width}
          />
        )}
      </AutoSizer>
    </div>
  );
}
