import { Avatar, Box, Center, Indicator, Tooltip } from "@mantine/core";
import { t } from "i18next";
import _ from "lodash";
import React, { useState } from "react";

import { serverAddress } from "../../api_client/apiClient";
import { FACES_INFERRED, FACES_LABELED } from "../../layouts/dataviz/constants";
import { PhotoIcon } from "./PhotoIcon";

type Props = {
  cell: any;
  isScrollingFast: boolean;
  selectMode: boolean;
  entrySquareSize: number;
  isSelected: boolean;
  activeItem: string;
  handleClick: (e: any, cell: any) => void;
};

function calculateProbabiltyColor(probability: number) {
  if (probability > 0.9) {
    return "green";
  }
  if (probability > 0.8) {
    return "yellow";
  }
  if (probability > 0.7) {
    return "orange";
  }
  return "red";
}

export function FaceComponent(props: Props) {
  const { cell, isScrollingFast, entrySquareSize, activeItem, selectMode, handleClick } = props;

  const labelProbabilityColor = calculateProbabiltyColor(cell.person_label_probability);
  const showPhotoIcon = <PhotoIcon photo={cell.photo} />;
  const [tooltipOpened, setTooltipOpened] = useState(false);
  // TODO: janky shit going on in the next line!
  const faceImageSrc = `${serverAddress}/media/faces/${_.reverse(cell.image.split("/"))[0]}`;
  if (isScrollingFast) {
    return <Avatar radius="xl" src="/thumbnail_placeholder.png" size={entrySquareSize - 10} />;
  }
  if (selectMode) {
    const { isSelected } = props;
    return (
      <Box
        sx={theme => ({
          display: "block",
          backgroundColor: isSelected ? "rgba(174, 214, 241, 0.7)" : "transparent",
          alignContent: "center",
          borderRadius: theme.radius.md,
          padding: 10,
          marginRight: 10,
          cursor: "pointer",
          "&:hover": {
            backgroundColor: isSelected ? "rgba(174, 214, 241, 0.95)" : "rgba(174, 214, 241, 0.7)",
          },
        })}
      >
        <Center>
          <Tooltip
            opened={tooltipOpened && activeItem === FACES_INFERRED}
            label={t<string>("settings.confidencepercentage", {
              percentage: (cell.person_label_probability * 100).toFixed(1),
            })}
            position="bottom"
            withArrow
          >
            <Indicator
              color={labelProbabilityColor}
              onMouseEnter={() => setTooltipOpened(true)}
              onMouseLeave={() => setTooltipOpened(false)}
              disabled={activeItem === FACES_LABELED}
              size={15}
            >
              <Avatar
                radius="xl"
                onClick={(e: any) => {
                  handleClick(e, cell);
                }}
                src={faceImageSrc}
                size={entrySquareSize - 30}
              />
            </Indicator>
          </Tooltip>
          {showPhotoIcon}
        </Center>
      </Box>
    );
  }
  return (
    <Box
      sx={theme => ({
        display: "block",
        backgroundColor: "transparent",
        alignContent: "center",
        borderRadius: theme.radius.md,
        padding: 0,
        marginRight: 10,
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "rgba(174, 214, 241, 0.7)",
        },
      })}
    >
      <Center>
        <Tooltip
          opened={tooltipOpened && activeItem === FACES_INFERRED}
          label={t<string>("settings.confidencepercentage", {
            percentage: (cell.person_label_probability * 100).toFixed(1),
          })}
          position="bottom"
        >
          <Indicator
            offset={10}
            color={labelProbabilityColor}
            onMouseEnter={() => setTooltipOpened(true)}
            onMouseLeave={() => setTooltipOpened(false)}
            disabled={activeItem === FACES_LABELED}
            size={15}
          >
            <Avatar
              onClick={(e: any) => handleClick(e, cell)}
              radius="xl"
              src={faceImageSrc}
              size={entrySquareSize - 10}
            />
          </Indicator>
        </Tooltip>
        {showPhotoIcon}
      </Center>
    </Box>
  );
}
