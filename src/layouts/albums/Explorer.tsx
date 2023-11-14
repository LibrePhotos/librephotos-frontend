import { Box, Button, Group, Stack, Title } from "@mantine/core";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Ballon } from "tabler-icons-react";

import { useFetchPeopleAlbumsQuery } from "../../api_client/albums/people";
import { useFetchPlacesAlbumsQuery } from "../../api_client/albums/places";
import { useFetchThingsAlbumsQuery } from "../../api_client/albums/things";
import { Tile } from "../../components/Tile";
import { HeaderComponent } from "./HeaderComponent";

export function Explorer() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const entrySquareSize = 200;
  const { data: peopleAlbums, isFetching: isFetchingPeopleAlbums } = useFetchPeopleAlbumsQuery();
  const { data: thingsAlbums, isFetching: isFetchingThingsAlbums } = useFetchThingsAlbumsQuery();
  const { data: placesAlbums, isFetching: isFetchingPlacesAlbums } = useFetchPlacesAlbumsQuery();

  return (
    <Stack>
      <HeaderComponent
        icon={<Ballon size={50} />}
        fetching={isFetchingPeopleAlbums || isFetchingThingsAlbums || isFetchingPlacesAlbums}
        title="Explorer"
        subtitle="Explore your photos."
      />

      {!isFetchingPeopleAlbums && (
        <>
          <Title order={3}>{t("people")}</Title>
          <Group>
            {peopleAlbums?.slice(0, 19).map(album => (
              <Link key={album.key} to={`/person/${album.key}/`}>
                <Tile
                  video={album.video === true}
                  height={entrySquareSize - 10}
                  width={entrySquareSize - 10}
                  image_hash={album.face_photo_url}
                />
              </Link>
            ))}
            <Box color="gray">
              <Button
                variant="light"
                color="gray"
                onClick={() => {
                  navigate(`/people/`);
                }}
              >
                Show More
              </Button>
            </Box>
          </Group>
        </>
      )}

      {!isFetchingThingsAlbums && (
        <>
          <Title order={3}>{t("things")}</Title>
          <Group>
            {thingsAlbums?.slice(0, 19).map(album => (
              <Link key={album.id} to={`/thing/${album.id}/`}>
                <Tile
                  video={album.cover_photos[0].video === true}
                  height={entrySquareSize - 10}
                  width={entrySquareSize - 10}
                  image_hash={album.cover_photos[0].image_hash}
                />
              </Link>
            ))}
            <Box color="gray">
              <Button
                variant="light"
                color="gray"
                onClick={() => {
                  navigate(`/things/`);
                }}
              >
                Show More
              </Button>
            </Box>
          </Group>
        </>
      )}

      {!isFetchingPlacesAlbums && (
        <>
          <Title order={3}>{t("places")}</Title>
          <Group>
            {placesAlbums?.slice(0, 19).map(album => (
              <Link key={album.id} to={`/place/${album.id}/`}>
                <Tile
                  video={album.cover_photos[0].video === true}
                  height={entrySquareSize - 10}
                  width={entrySquareSize - 10}
                  image_hash={album.cover_photos[0].image_hash}
                />
              </Link>
            ))}
            <Box color="gray">
              <Button
                variant="light"
                color="gray"
                onClick={() => {
                  navigate(`/places/`);
                }}
              >
                Show More
              </Button>
            </Box>
          </Group>
        </>
      )}
    </Stack>
  );
}
