import { Button, Group, Stack, Textarea, Title } from "@mantine/core";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "react-virtualized/styles.css";
import { Note } from "tabler-icons-react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { generatePhotoIm2txtCaption, editPhoto } from "../../actions/photosActions";
import { Photo } from "../../actions/photosActions.types";

type Props = {
  isPublic: boolean;
  photoDetail: Photo;
};

function getCaption(props: Props) {
  if (props.photoDetail.captions_json.user != undefined) {
    return props.photoDetail.captions_json.user;
  } else {
    return props.photoDetail.captions_json.im2txt;
  }
}

export function CaptionItem(props: Props) {
  const dispatch = useAppDispatch()
  const { generatingCaptionIm2txt } = useAppSelector(store => store.photos);
  const { photoDetail, isPublic } = props;
  const { t } = useTranslation();
  const onSubmit = () => {
    const differentJson = { caption: getCaption(props) };
    dispatch(editPhoto(photoDetail.image_hash, differentJson));
  };

  const generateIm2txtCaption = () => {
    generatePhotoIm2txtCaption(props.photoDetail.image_hash)
  }

  return (
    <Stack>
      <Group>
        <Note></Note>
        <Title order={4}>{t("lightbox.sidebar.caption")}</Title>
      </Group>
      {false && getCaption(props)}
      <Stack>
        <Textarea
          value={getCaption(props)}
          disabled={isPublic}
          placeholder={getCaption(props)}
        />
        <Group>
          <Button
            disabled={isPublic}
            size="sm"
            color="green"
            onClick={onSubmit}
          >
            {t("lightbox.sidebar.submit")}
          </Button>
          <Button
            loading={generatingCaptionIm2txt}
            onClick={generateIm2txtCaption}
            disabled={isPublic || (generatingCaptionIm2txt != null && generatingCaptionIm2txt)}
            size="sm"
            color="blue"
          >
            {t("lightbox.sidebar.generate")}
          </Button>
        </Group>
      </Stack>
    </Stack>
  );
}


