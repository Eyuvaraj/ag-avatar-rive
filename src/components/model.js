"use client";

import { useEffect } from "react";
import {
  useRive,
  useStateMachineInput,
  Layout,
  Fit,
  Alignment,
} from "@rive-app/react-canvas";

const RIVE_FILE = "/chatbot.riv";
const STATE_MACHINE_NAME = "Lip Sync";
const INPUT_NAME = "isTalking";

export function Model({ isSpeaking }) {
  const { rive, RiveComponent } = useRive({
    src: RIVE_FILE,
    stateMachines: STATE_MACHINE_NAME,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center,
    }),
  });

  const isTalkingInput = useStateMachineInput(
    rive,
    STATE_MACHINE_NAME,
    INPUT_NAME
  );

  useEffect(() => {
    if (isTalkingInput) {
      isTalkingInput.value = isSpeaking;
    }
  }, [isSpeaking, isTalkingInput]);

  return <RiveComponent style={{ width: "100%", height: "100%" }} />;
}
