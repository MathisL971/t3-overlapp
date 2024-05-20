"use client";

import React, { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import LightSVG from "./LightSVG";
import DarkSVG from "./DarkSVG";

type BrightnessToggleButtonProps = {
  theme: string;
};

const BrightnessToggleButton = (props: BrightnessToggleButtonProps) => {
  const [lightOn, setLightOn] = useState(props.theme === "light");

  useEffect(() => {
    if (!document.cookie.includes("theme")) {
      const likesDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      document.cookie = `theme=${likesDarkMode ? "dark" : "light"}`;
    }
  }, []);

  const toggleBrightness = () => {
    if (document.body.classList.contains("dark")) {
      document.cookie = "theme=light";
      document.body.classList.remove("dark");
      setLightOn(true);
    } else {
      document.cookie = "theme=dark";
      document.body.classList.add("dark");
      setLightOn(false);
    }
  };

  return (
    <Button onClick={toggleBrightness} className="p-2">
      {lightOn ? <DarkSVG /> : <LightSVG />}
    </Button>
  );
};

export default BrightnessToggleButton;
