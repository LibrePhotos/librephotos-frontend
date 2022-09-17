import {
  Box,
  Button,
  Dialog,
  Divider,
  Group,
  Indicator,
  List,
  Loader,
  Modal,
  Popover,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import React, { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Book, Edit, ExternalLink, FaceId, QuestionMark, Refresh, RefreshDot, Tag, Trash } from "tabler-icons-react";

import { scanAllPhotos, scanNextcloudPhotos, scanPhotos } from "../../actions/photosActions";
import {
  deleteMissingPhotos,
  fetchCountStats,
  fetchJobList,
  fetchNextcloudDirectoryTree,
  fetchSiteSettings,
  generateEventAlbumTitles,
  generateEventAlbums,
  updateUser,
} from "../../actions/utilActions";
import { api } from "../../api_client/api";
import { serverAddress } from "../../api_client/apiClient";
import { ModalNextcloudScanDirectoryEdit } from "../../components/modals/ModalNextcloudScanDirectoryEdit";
import { CountStats } from "../../components/statistics";
import i18n from "../../i18n";
import { useAppDispatch, useAppSelector } from "../../store/store";

export function Library() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenNextcloudExplanation, setIsOpenNextcloudExplanation] = useState(false);
  const [isOpenCredentials, setIsOpenCredentials] = useState(false);
  const [isOpenUpdateDialog, setIsOpenUpdateDialog] = useState(false);
  const [avatarImgSrc, setAvatarImgSrc] = useState("/unknown_user.jpg");
  const [userSelfDetails, setUserSelfDetails] = useState({} as any);
  const [modalNextcloudScanDirectoryOpen, setModalNextcloudScanDirectoryOpen] = useState(false);
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth);
  const userSelfDetailsRedux = useAppSelector(state => state.user.userSelfDetails);
  const workerAvailability = useAppSelector(state => state.util.workerAvailability);
  const fetchedNextcloudDirectoryTree = useAppSelector(state => state.util.fetchedNextcloudDirectoryTree);
  const util = useAppSelector(state => state.util);
  const statusPhotoScan = useAppSelector(state => state.util.statusPhotoScan);
  const { t } = useTranslation();

  const open = () => setIsOpen(true);

  const close = () => setIsOpen(false);

  const onPhotoScanButtonClick = () => {
    dispatch(scanPhotos());
  };

  const onPhotoFullScanButtonClick = () => {
    dispatch(scanAllPhotos());
  };

  const onGenerateEventAlbumsButtonClick = () => {
    dispatch(generateEventAlbums());
  };

  const onDeleteMissingPhotosButtonClick = () => {
    dispatch(deleteMissingPhotos());
    close();
  };

  // open update dialog, when user was edited
  useEffect(() => {
    if (JSON.stringify(userSelfDetailsRedux) !== JSON.stringify(userSelfDetails)) {
      setIsOpenUpdateDialog(true);
    } else {
      setIsOpenUpdateDialog(false);
    }
  }, [userSelfDetailsRedux, userSelfDetails]);

  useEffect(() => {
    dispatch(fetchCountStats());
    fetchSiteSettings(dispatch);
    dispatch(api.endpoints.fetchUserSelfDetails.initiate(auth.access.user_id));
    dispatch(fetchNextcloudDirectoryTree("/"));
    if (auth.access.is_admin) {
      dispatch(fetchJobList());
    }
  }, [auth, dispatch]);

  useEffect(() => {
    setUserSelfDetails(userSelfDetailsRedux);
  }, [userSelfDetailsRedux]);

  let buttonsDisabled = !workerAvailability;
  buttonsDisabled = false;
  if (avatarImgSrc === "/unknown_user.jpg") {
    if (userSelfDetails.avatar_url) {
      setAvatarImgSrc(serverAddress + userSelfDetails.avatar_url);
    }
  }
  return (
    <Stack align="center" justify="flex-start">
      <Group spacing="xs">
        <Book size={35} />
        <Title order={2}>{t("settings.library")}</Title>
      </Group>
      <CountStats />
      <Divider hidden />
      <SimpleGrid
        cols={4}
        breakpoints={[
          { maxWidth: 1180, cols: 3, spacing: "md" },
          { maxWidth: 955, cols: 2, spacing: "sm" },
          { maxWidth: 700, cols: 1, spacing: "sm" },
        ]}
        spacing="xl"
      >
        <Box
          sx={theme => ({
            backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
            padding: theme.spacing.xl,
            borderRadius: theme.radius.md,
            cursor: "pointer",

            "&:hover": {
              backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1],
            },
          })}
        >
          <Stack>
            <Title order={5}>
              {util.countStats.num_photos} <Trans i18nKey="settings.photos">Photos</Trans>
            </Title>
            <Divider />
            <Button color="green" onClick={onPhotoScanButtonClick} disabled={buttonsDisabled}>
              {statusPhotoScan.status && statusPhotoScan.added ? <Loader /> : null}
              {statusPhotoScan.added
                ? `${t("settings.statusscanphotostrue")}(${statusPhotoScan.added}/${statusPhotoScan.to_add})`
                : t("settings.statusscanphotosfalse")}
            </Button>

            <Button
              onClick={() => {
                dispatch(scanNextcloudPhotos());
              }}
              disabled={!fetchedNextcloudDirectoryTree || buttonsDisabled || !userSelfDetails.nextcloud_scan_directory}
              color="blue"
            >
              <Refresh />
              <Trans i18nKey="settings.scannextcloudphotos">Scan photos (Nextcloud)</Trans>
            </Button>

            <Divider hidden />
            <List size="sm">
              <List.Item>
                <Trans i18nKey="settings.scannextclouddescription.item1">
                  Make a list of all files in subdirectories. For each media file:
                </Trans>
              </List.Item>
              <List.Item>
                <Trans i18nKey="settings.scannextclouddescription.item2">
                  If the filepath exists, check if the file has been modified. If it was modified, rescan the image. If
                  not, we skip.
                </Trans>
              </List.Item>
              <List.Item>
                <Trans i18nKey="settings.scannextclouddescription.item3">
                  Calculate a unique ID of the image file (md5)
                </Trans>
              </List.Item>
              <List.Item>
                <Trans i18nKey="settings.scannextclouddescription.item4">
                  If this media file is already in the database, we add the path to the existing media file.
                </Trans>
              </List.Item>
              <List.Item>
                <Trans i18nKey="settings.scannextclouddescription.item5">Generate a number of thumbnails</Trans>{" "}
              </List.Item>
              <List.Item>
                <Trans i18nKey="settings.scannextclouddescription.item6">Generate image captions</Trans>{" "}
              </List.Item>
              <List.Item>
                <Trans i18nKey="settings.scannextclouddescription.item7">Extract Exif information</Trans>{" "}
              </List.Item>
              <List.Item>
                <Trans i18nKey="settings.scannextclouddescription.item8">
                  Reverse geolocate to get location names from GPS coordinates{" "}
                </Trans>
              </List.Item>
              <List.Item>
                <Trans i18nKey="settings.scannextclouddescription.item9">Extract faces. </Trans>{" "}
              </List.Item>
              <List.Item>
                <Trans i18nKey="settings.scannextclouddescription.item10">Add photo to thing and place albums.</Trans>{" "}
              </List.Item>
              <List.Item>
                <Trans i18nKey="settings.scannextclouddescription.item11">
                  Check if photos are missing or have been moved.
                </Trans>
              </List.Item>
            </List>
            <Button color="green" onClick={onPhotoFullScanButtonClick} disabled={buttonsDisabled}>
              {statusPhotoScan.status && statusPhotoScan.added ? <Loader /> : null}
              {statusPhotoScan.added
                ? `${t("settings.statusrescanphotostrue")}(${statusPhotoScan.added}/${statusPhotoScan.to_add})`
                : t("settings.statusrescanphotosfalse")}
            </Button>
          </Stack>
        </Box>
        <Box
          sx={theme => ({
            backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
            padding: theme.spacing.xl,
            borderRadius: theme.radius.md,
            cursor: "pointer",

            "&:hover": {
              backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1],
            },
          })}
        >
          <Stack>
            <Title order={5}>
              {util.countStats.num_missing_photos} <Trans i18nKey="settings.missingphotos">Missing Photos</Trans>
            </Title>
            <Divider />
            <Button onClick={open} disabled={false && buttonsDisabled} color="red">
              <Trash />
              <Trans i18nKey="settings.missingphotosbutton">Remove missing photos</Trans>
            </Button>
            <Modal opened={isOpen} title={t("settings.missingphotosbutton")} onClose={close}>
              <Stack spacing="xl">
                This action will delete all missing photos and its metadata from the database.
                <Group>
                  <Button onClick={close}>Cancel</Button>
                  <Button color="red" onClick={onDeleteMissingPhotosButtonClick}>
                    Confirm
                  </Button>
                </Group>
              </Stack>
            </Modal>
            <Divider hidden />
            <p>
              <Trans i18nKey="settings.missingphotosdescription">
                On every scan LibrePhotos will check if the files are still in the same location or if they have been
                moved. If they are missing, then they get marked as such.
              </Trans>
            </p>
            <Divider />
          </Stack>
        </Box>
        <Box
          sx={theme => ({
            backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
            padding: theme.spacing.xl,
            borderRadius: theme.radius.md,
            cursor: "pointer",

            "&:hover": {
              backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1],
            },
          })}
        >
          <Stack>
            <Title order={5}>
              {util.countStats.num_albumauto} <Trans i18nKey="settings.eventsalbums">Event Albums</Trans>
            </Title>
            <Divider />
            <Button onClick={onGenerateEventAlbumsButtonClick} disabled={false && buttonsDisabled} color="green">
              <RefreshDot />
              <Trans i18nKey="settings.eventalbumsgenerate">Generate Event Albums</Trans>
            </Button>
            <Divider hidden />
            <p>
              <Trans i18nKey="settings.eventsalbumsdescription">
                The backend server will first group photos by time taken. If two consecutive photos are taken within 12
                hours of each other, the two photos are considered to be from the same event. After groups are put
                together in this way, it automatically generates a title for this album.
              </Trans>
            </p>
            <Divider />
            <Button
              onClick={() => {
                dispatch(generateEventAlbumTitles());
              }}
              disabled={false && buttonsDisabled}
              color="green"
            >
              <RefreshDot />
              <Trans i18nKey="settings.eventalbumsregenerate">Regenerate Event Titles</Trans>
            </Button>
            <Divider hidden />
            <p>
              <Trans i18nKey="settings.eventalbumsregeneratedescription">
                Automatically generated albums have names of people in the titles. If you trained your face classifier
                after making event albums, you can generate new titles for already existing event albums to reflect the
                new names associated with the faces in photos.
              </Trans>
            </p>
          </Stack>
        </Box>
        <Box
          sx={theme => ({
            backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
            padding: theme.spacing.xl,
            borderRadius: theme.radius.md,
            cursor: "pointer",

            "&:hover": {
              backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1],
            },
          })}
        >
          <Stack>
            <Title order={5}>
              {util.countStats.num_faces} <Trans i18nKey="settings.faces">Faces</Trans>, {util.countStats.num_people}{" "}
              <Trans i18nKey="settings.people">People</Trans>
            </Title>
            <Divider />
            <Button
              onClick={() => {
                dispatch(api.endpoints.trainFaces.initiate());
                showNotification({
                  message: i18n.t<string>("toasts.trainingstarted"),
                  title: i18n.t<string>("toasts.trainingstartedtitle"),
                  color: "teal",
                });
              }}
              color="green"
            >
              <FaceId /> <Trans i18nKey="settings.facesbutton">Train Faces</Trans>
            </Button>
            <Divider hidden />

            <Table striped highlightOnHover>
              <tbody>
                <tr>
                  <td>
                    <b>
                      <FaceId />
                      <Trans i18nKey="settings.inferred">Inferred</Trans>
                    </b>
                  </td>
                  <td>
                    {util.countStats.num_inferred_faces} <Trans i18nKey="settings.facessmall">faces</Trans>
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>
                      <Tag />
                      <Trans i18nKey="settings.labeled">Labeled</Trans>
                    </b>
                  </td>
                  <td>
                    {util.countStats.num_labeled_faces} <Trans i18nKey="settings.facessmall">faces</Trans>
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>
                      <QuestionMark />
                      <Trans i18nKey="settings.unknown">Unknown</Trans>
                    </b>
                  </td>
                  <td>
                    {util.countStats.num_unknown_faces} <Trans i18nKey="settings.facessmall">faces</Trans>
                  </td>
                </tr>
              </tbody>
            </Table>
            <Divider hidden />
            <Button leftIcon={<ExternalLink size={14} />} component="a" href="/faces">
              {t("settings.facedashboard")}
            </Button>
            <Divider hidden />
            <Button
              color="green"
              onClick={() => {
                dispatch(api.endpoints.rescanFaces.initiate());
                showNotification({
                  message: i18n.t<string>("toasts.rescanfaces"),
                  title: i18n.t<string>("toasts.rescanfacestitle"),
                  color: "teal",
                });
              }}
            >
              <FaceId />
              <Trans i18nKey="settings.rescanfaces">Rescan Faces</Trans>
            </Button>
          </Stack>
        </Box>
      </SimpleGrid>
      <Divider />
      <Title order={3}>
        <Popover
          opened={isOpenNextcloudExplanation}
          onClose={() => setIsOpenNextcloudExplanation(false)}
          position="top"
          withArrow
        >
          <Popover.Target>
            <Group>
              <Indicator
                inline
                onMouseEnter={() => setIsOpenNextcloudExplanation(true)}
                onMouseLeave={() => setIsOpenNextcloudExplanation(false)}
                color={fetchedNextcloudDirectoryTree ? "green" : "red"}
              >
                <div />
              </Indicator>
              <Trans i18nKey="settings.nextcloudheader">Nextcloud</Trans>
            </Group>
          </Popover.Target>

          <Popover.Dropdown>
            {fetchedNextcloudDirectoryTree ? t("settings.nextcloudloggedin") : t("settings.nextcloudnotloggedin")}
          </Popover.Dropdown>
        </Popover>
      </Title>
      <Stack>
        <TextInput
          onChange={event => {
            setUserSelfDetails({ ...userSelfDetails, nextcloud_server_address: event.currentTarget.value });
          }}
          value={userSelfDetails.nextcloud_server_address}
          label={t("settings.serveradress")}
          placeholder={t("settings.serveradressplaceholder")}
        />
        <Group>
          <TextInput
            onChange={event => {
              setUserSelfDetails({ ...userSelfDetails, nextcloud_username: event.currentTarget.value });
            }}
            label={t("settings.nextcloudusername")}
            placeholder={t("settings.nextcloudusernameplaceholder")}
            value={userSelfDetails.nextcloud_username}
          />
          <TextInput
            onChange={event => {
              setUserSelfDetails({ ...userSelfDetails, nextcloud_app_password: event.currentTarget.value });
            }}
            type="password"
            label={
              <Popover position="top" withArrow opened={isOpenCredentials} onClose={() => setIsOpenCredentials(false)}>
                <Popover.Target>
                  <Group>
                    {t("settings.nextcloudpassword")}
                    <QuestionMark
                      onMouseEnter={() => setIsOpenCredentials(true)}
                      onMouseLeave={() => setIsOpenCredentials(false)}
                    />
                  </Group>
                </Popover.Target>
                <Popover.Dropdown>{t("settings.credentialspopup")}</Popover.Dropdown>
              </Popover>
            }
            placeholder={t("settings.nextcloudpasswordplaceholder")}
            value={userSelfDetails.nextcloud_app_password}
          />
        </Group>
      </Stack>{" "}
      <Group grow>
        <Button
          variant="subtle"
          leftIcon={<Edit />}
          disabled={!fetchedNextcloudDirectoryTree}
          onClick={() => {
            setModalNextcloudScanDirectoryOpen(true);
          }}
        >
          {userSelfDetails.nextcloud_scan_directory ? userSelfDetails.nextcloud_scan_directory : t("adminarea.notset")}
        </Button>
      </Group>
      <ModalNextcloudScanDirectoryEdit
        onRequestClose={() => {
          setModalNextcloudScanDirectoryOpen(false);
        }}
        userToEdit={userSelfDetails}
        isOpen={modalNextcloudScanDirectoryOpen}
      />
      <Dialog
        opened={isOpenUpdateDialog}
        withCloseButton
        onClose={() => setIsOpenUpdateDialog(false)}
        size="lg"
        radius="md"
      >
        <Text size="sm" style={{ marginBottom: 10 }} weight={500}>
          Save Changes?
        </Text>

        <Group align="flex-end">
          <Button
            size="sm"
            color="green"
            onClick={() => {
              const newUserData = userSelfDetails;
              delete newUserData.scan_directory;
              delete newUserData.avatar;
              updateUser(newUserData, dispatch);
              dispatch(api.endpoints.fetchUserSelfDetails.initiate(auth.access.user_id));
              setIsOpenUpdateDialog(false);
            }}
          >
            <Trans i18nKey="settings.favoriteupdate">Update profile settings</Trans>
          </Button>
          <Button
            onClick={() => {
              setUserSelfDetails(userSelfDetails);
            }}
            size="sm"
          >
            <Trans i18nKey="settings.nextcloudcancel">Cancel</Trans>
          </Button>
        </Group>
      </Dialog>
    </Stack>
  );
}
