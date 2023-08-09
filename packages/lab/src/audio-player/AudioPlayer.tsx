import { useEffect, useState, useCallback } from 'react';
import { makePrefixer, Text } from "@salt-ds/core";
import { PauseSolidIcon, PlaySolidIcon, VolumeOffIcon, VolumeUpIcon, Forward5Icon, Forward10Icon, Forward15Icon, Forward30Icon, Replay5Icon, Replay10Icon, Replay15Icon, Replay30Icon, DownloadIcon } from 'packages/icons/src';
import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import audioPlayerCss from "./AudioPlayer.css";

import { ButtonBar, OrderedButton, Slider } from '@salt-ds/lab';
export interface AudioPlayerProps {
  src: string;
  skipDuration: 5 | 10 | 15;
  title?: string;
  className?: string;
}

function timeFormat(durationS: number): string {
  const date = new Date(0);
  date.setSeconds(durationS);
  const timeString = date.toISOString().substring(11, 19);
  return timeString;
}

const ForwardIconByVariant = {
  5: <Forward5Icon size={10}/>,
  10: <Forward10Icon size={10}/>,
  15: <Forward15Icon size={10}/>,
  20: <Forward30Icon size={10}/>,
};

const ReplayIconByVariant = {
  5: <Replay5Icon size={10}/>,
  10: <Replay10Icon size={10}/>,
  15: <Replay15Icon size={10}/>,
  30: <Replay30Icon size={10}/>,
};

// export const ButtonBar = forwardRef<HTMLDivElement, AudioPlayerProps>(

export const AudioPlayer = forwardRef<HTMLDivElement, AudioPlayerProps> (
  function AudioPlayer({ src, title, skipDuration = 15, className, ...rest }, ref) {
  const [audioElem, setAudioElem] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mute, setMute] = useState(false);
  const [playDisabled, setPlayDisabled] = useState(true);
  const [durationString, setDurationString] = useState('00:00:00');
  const [timeNowString, setTimeNowString] = useState('00:00:00');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [timeNowSeconds, setTimeNowSeconds] = useState(0);

  const withBaseName = makePrefixer("saltBadge");
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "salt-list-item",
    css: audioPlayerCss,
    window: targetWindow,
  });

  const audioRef = useCallback(audioNode => {
    setAudioElem(audioNode);
  }, []);

  const timeUpdate = useCallback(() => {
    if (audioElem) {
      const currentTimeFormatted = timeFormat(audioElem.currentTime);
      setTimeNowString(currentTimeFormatted);
      setTimeNowSeconds(audioElem.currentTime);
    }
  }, [audioElem]);

  const onLoad = useCallback(() => {
    if (audioElem) {
      const durationFormatted = timeFormat(audioElem.duration);
      setDurationString(durationFormatted);
      setDurationSeconds(audioElem.duration);
      setPlayDisabled(false);
    }
  }, [audioElem]);

  useEffect(() => {
    if (audioElem) {
      audioElem.addEventListener('timeupdate', timeUpdate);
      audioElem.addEventListener('loadedmetadata', onLoad);
    }
    return () => {
      if (audioElem) {
        audioElem.removeEventListener('timeupdate', timeUpdate);
        audioElem.removeEventListener('loadedmetadata', onLoad);
      }
    };
  }, [audioElem, onLoad, timeUpdate]);

  const handleFastforward = () => {
    if (audioElem) {
      audioElem.currentTime += skipDuration;
    }
  };

  const handleRewind = () => {
    if (audioElem) {
      audioElem.currentTime -= skipDuration;
    }
  };

  const handlePlay = () => {
    if (isPlaying) {
      audioElem?.pause();
      setIsPlaying(false);
    } else {
      audioElem?.play();
      setIsPlaying(true);
    }
  };

  const handleMute = () => {
    if (audioElem?.volume) {
      audioElem.volume = 0;
      setMute(true);
    } else if (audioElem) {
      audioElem.volume = 1;
      setMute(false);
    }
  };

  const handleSliderInput = e => {
    if (audioElem) {
      audioElem.currentTime = e;
      timeUpdate();
    }
  };

  return (
    <div className={clsx(withBaseName(), className)} ref={ref} {...rest}>
      <audio ref={audioRef} aria-label="audio" src={`${src}`} />
      <span className={withBaseName("title")}>{title}</span>
      {/* <Caption3 className={withBaseName("title")}>{title}</Caption3> */}
      <div className={withBaseName("sliderContainer")}>
      <span>{timeNowString}</span>
      <Text styleAs={"h4"}> {timeNowString} </Text>
        <Slider
          className={withBaseName("slider")}
          min={0}
          max={durationSeconds}
          value={timeNowSeconds}
          onChange={handleSliderInput}
        />
        <Text styleAs={"h4"}> {durationString} </Text>
      </div>

      <ButtonBar className={withBaseName("buttonBar")} stackAtBreakpoint={0} disableAutoAlignment={true}>
        <div>
          <a href={src} download target="_blank" rel="noreferrer">
            <OrderedButton variant="secondary" className={withBaseName("button")}>
              <DownloadIcon size={10} />
            </OrderedButton>
          </a>
        </div>
        <OrderedButton className={withBaseName("button")} variant="secondary" onClick={handleRewind}>
          {/* <Replay10Icon size={10}/> */}
          {ReplayIconByVariant[skipDuration]}
        </OrderedButton>
        <OrderedButton
          className={withBaseName("button")}
          variant="secondary"
          onClick={handlePlay}
          disabled={playDisabled}
        >
          {isPlaying ? <PlaySolidIcon size={10}/> : <PauseSolidIcon size={10}/>}
        </OrderedButton>
        <OrderedButton className={withBaseName("button")} variant="secondary" onClick={handleFastforward}>
          {/* <Forward10Icon size={10}/> */}
          {ForwardIconByVariant[skipDuration]}
        </OrderedButton>
        <OrderedButton variant="secondary" onClick={handleMute} className={withBaseName("button")}>
          {mute ? <VolumeOffIcon/> : <VolumeUpIcon/> }
        </OrderedButton>
      </ButtonBar>
    </div>
    );
  }
);
