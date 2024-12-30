import { action } from "@storybook/addon-actions";
import { SAMPLE_MP3_URL } from "./utils";
import AudioPlayer from "../src/index.tsx";
import React from "react";

export default {
  title: "Edge Cases",
  component: AudioPlayer,
};

export const NoSrc = {
  render: () => (
    <AudioPlayer
      onError={action("onError")}
      onPlayError={action("onPlayError")}
    />
  ),
  name: "No src",
};

export const EmptyStringSrc = {
  render: () => (
    <AudioPlayer
      src=""
      onError={action("onError")}
      onPlayError={action("onPlayError")}
    />
  ),
  name: "Empty string src",
};

export const InvalidSrc = {
  render: () => (
    <AudioPlayer
      src="https://invalidsrc.com/nothing.mp3"
      onError={action("onError")}
      onPlayError={action("onPlayError")}
    />
  ),

  name: "Invalid src",
};
