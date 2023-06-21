import { useMediaQuery } from "@react-hook/media-query";
import React, { useState } from "react";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
// @ts-ignore
import ModalVideo from "react-modal-video";
import "node_modules/react-modal-video/scss/modal-video.scss";

export interface MobileBlockingModalProps {}

function MobileBlockingModal({}: MobileBlockingModalProps) {
  const [demoOpen, setDemoOpen] = useState(false);

  const matches = useMediaQuery("only screen and (min-width: 700px)");
  if (matches) return null;
  return (
    <>
      <Modal
        blackout
        visible={true}
        title="Unsupported Screen Size"
        content={
          <div className="pb-4">
            <b>Lightrail</b> is a web-based platform for building React/Tailwind
            front-ends with the help of an LLM. Unfortunately, it is not
            currently usable on mobile devices. Please check back on something
            with a larger screen size.
            <div className="text-center p-4">
              <Button onClick={() => setDemoOpen(true)}>Watch a Demo</Button>
            </div>
            <div className="pt-4"></div>
            Lightrail is fully open-source. You can also learn more at our{" "}
            <a
              href="https://github.com/vishnumenon/lightrail"
              className="underline text-sky-600"
            >
              Github repository
            </a>
            !
          </div>
        }
      />
      <ModalVideo
        channel="vimeo"
        autoplay
        isOpen={demoOpen}
        videoId="838399518"
        title={false}
        onClose={() => setDemoOpen(false)}
      />
    </>
  );
}

export default MobileBlockingModal;
