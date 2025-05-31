'use client';

import { useEffect, useState } from 'react';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';

const RIVE_FILE = '/chatbot.riv';
const BLINK_ANIMATION_NAME = 'blink';
const TALK_ANIMATION_NAME = 'talk';

export function Model({ isSpeaking }) {
  const [activeAnimation, setActiveAnimation] = useState(BLINK_ANIMATION_NAME);

  const { rive, RiveComponent } = useRive({
    src: RIVE_FILE,
    animations: activeAnimation,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center,
    }),
  });

  useEffect(() => {
    if (isSpeaking && activeAnimation !== TALK_ANIMATION_NAME) {
      setActiveAnimation(TALK_ANIMATION_NAME);
    } else if (!isSpeaking && activeAnimation !== BLINK_ANIMATION_NAME) {
      setActiveAnimation(BLINK_ANIMATION_NAME);
    }
  }, [isSpeaking, activeAnimation]);

  return <RiveComponent style={{ width: '100%', height: '100%' }} />;
}
