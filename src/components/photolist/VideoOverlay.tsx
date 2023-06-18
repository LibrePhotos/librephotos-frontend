import { createStyles } from "@mantine/core";
import { Duration } from "luxon";
import React from "react";
import { PlayerPlay, Run } from "tabler-icons-react";

import { MediaType } from "../../actions/photosActions.types";

type Props = {
  item: {
    type: MediaType;
    video_length: string;
  };
};

const styles = createStyles(() => ({
  container: {
    display: "flex",
    alignItems: "center",
    color: "white",
    padding: "0 0 5px 5px",
  },

  duration: {
    margin: "5px 0 0 5px",
  },
}));

export function VideoOverlay({ item }: Props) {
  const { classes } = styles();

  function getDuration({ video_length }) {
    if (video_length.match(/\d+:[0-5]\d/)){
      const [hour, minute, sec] = video_length.split(':');
      const time = hour * 3600 + minute * 60 + sec * 1;
      return <span className={classes.duration}>{Duration.fromObject({ seconds: time }).toFormat("mm:ss")}</span>;
    }
    return <span className={classes.duration}>{Duration.fromObject({ seconds: video_length }).toFormat("mm:ss")}</span>;
  }

  if (![MediaType.VIDEO, MediaType.MOTION_PHOTO].includes(item.type)) {
    return <div />;
  }

  return (
    <div className={classes.container}>
      {item.type === MediaType.MOTION_PHOTO ? <Run /> : <PlayerPlay />}
      {item.video_length && item.video_length !== "None" && getDuration(item)}
    </div>
  );
}
