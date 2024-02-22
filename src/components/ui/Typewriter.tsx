"use client";
import { Bot, Rocket } from "lucide-react";
import React from "react";
import Typewriter from "typewriter-effect";

type Props = {};

const TypewriterTitle = (props: Props) => {
  return (
    <Typewriter 
      options={{
        loop: true,
      }}
      onInit={(typewriter) => {
        typewriter
          .typeString(`Personalize`)
          .pauseFor(1000)
          .deleteAll()
          .typeString(`Interview`)
          .pauseFor(1000)
          .deleteAll()
          .typeString(`Feedback`)
          .pauseFor(1000)
          .deleteAll()
          .typeString(`Create More`)
          .start();
      }}
    />
  );
};

export default TypewriterTitle;