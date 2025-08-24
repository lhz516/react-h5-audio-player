import { action } from "storybook/actions";
import AudioPlayer from "../src/index";
import MediaSourcePlayer from "./mse-eme-player.tsx";
import React from "react";

export default {
  title: "MSE-EME",
  component: AudioPlayer,
};

export const MseEme = {
  render: () => <MediaSourcePlayer onEncrypted={action("onEncrypted")} />,
  name: "MSE-EME",
};
