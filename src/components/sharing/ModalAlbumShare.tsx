import {
  Avatar,
  Divider,
  Group,
  Modal,
  Popover,
  ScrollArea,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Share } from "tabler-icons-react";

import { setUserAlbumShared } from "../../actions/albumsActions";
import { fetchPublicUserList } from "../../actions/publicActions";
import { useAppDispatch, useAppSelector } from "../../store/store";

function fuzzyMatch(str: string, pattern: string) {
  if (pattern.split("").length > 0) {
    const expr = pattern.split("").reduce((a, b) => `${a}.*${b}`);
    return new RegExp(expr).test(str);
  }
  return false;
}

type Props = {
  isOpen: boolean;
  onRequestClose: () => void;
  params: any;
};
// TODO: Add missing locales
export function ModalAlbumShare(props: Props) {
  const [userNameFilter, setUserNameFilter] = useState("");
  const [opened, setOpened] = useState(false);

  const { pub, auth } = useAppSelector(store => store);
  const { albumDetails } = useAppSelector(store => store.albums);

  const dispatch = useAppDispatch();
  const { isOpen, onRequestClose, params } = props;

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchPublicUserList());
    }
  }, [isOpen, dispatch]);

  let filteredUserList;
  if (userNameFilter.length > 0) {
    filteredUserList = pub.publicUserList.filter(
      el =>
        fuzzyMatch(el.username.toLowerCase(), userNameFilter.toLowerCase()) ||
        fuzzyMatch(`${el.first_name.toLowerCase()} ${el.last_name.toLowerCase()}`, userNameFilter.toLowerCase())
    );
  } else {
    filteredUserList = pub.publicUserList;
  }
  filteredUserList = filteredUserList.filter(el => el.id !== auth.access.user_id);

  return (
    <Modal
      zIndex={1500}
      opened={isOpen}
      title={<Title>Share Album</Title>}
      onClose={() => {
        onRequestClose();
        setUserNameFilter("");
      }}
    >
      <Stack>
        <Title order={4}>Search user</Title>
        <TextInput
          onChange={event => {
            setUserNameFilter(event.currentTarget.value);
          }}
          placeholder="Person name"
        />
        <Divider />
        <ScrollArea>
          {filteredUserList.length > 0 &&
            filteredUserList.map(item => {
              let displayName;
              if (item.first_name.length > 0 && item.last_name.length > 0) {
                displayName = `${item.first_name} ${item.last_name}`;
              } else {
                displayName = item.username;
              }
              return (
                <Group key={item.id}>
                  <Avatar radius="xl" size={60} src="/unknown_user.jpg" />
                  <Title
                    order={4}
                    onClick={() => {
                      dispatch(setUserAlbumShared(parseInt(params.albumID, 10), item.id, true));
                      onRequestClose();
                    }}
                  >
                    <Group>
                      {displayName}
                      {albumDetails.shared_to && albumDetails.shared_to.map(e => e.id).includes(item.id) && (
                        <Popover opened={opened} onClose={() => setOpened(false)} withArrow position="bottom">
                          <Popover.Target>
                            <Share />
                          </Popover.Target>
                          <Popover.Dropdown>Share</Popover.Dropdown>
                        </Popover>
                      )}
                    </Group>
                  </Title>
                  <Text>Joined {moment(item.date_joined).format("MMMM YYYY")}</Text>
                  <Switch
                    checked={albumDetails.shared_to && albumDetails.shared_to.map(e => e.id).includes(item.id)}
                    onChange={() => {
                      dispatch(
                        setUserAlbumShared(
                          parseInt(params.albumID, 10),
                          item.id,
                          !albumDetails.shared_to.map(e => e.id).includes(item.id)
                        )
                      );
                    }}
                  />
                </Group>
              );
            })}
        </ScrollArea>
      </Stack>
    </Modal>
  );
}
