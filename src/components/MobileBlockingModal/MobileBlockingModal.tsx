import { useMediaQuery } from "@react-hook/media-query";
import React from "react";
import Modal from "../Modal/Modal";

export interface MobileBlockingModalProps {}

function MobileBlockingModal({}: MobileBlockingModalProps) {
  const matches = useMediaQuery("only screen and (min-width: 700px)");
  if (matches) return null;
  return (
    <Modal
      blackout
      visible={true}
      title="Unsupported Screen Size"
      content={
        <div className="pb-4">
          <b>Lightwand</b> is a web-based platform for building React/Tailwind
          front-ends with the help of an LLM. Unfortunately, it is not currently
          usable on mobile devices. Please check back on something with a larger
          screen size.{" "}
          <div className="pt-4">
            Lightwand is fully open-source. You can also learn more at our{" "}
            <a
              href="https://github.com/vishnumenon/lightwand"
              className="underline text-sky-600"
            >
              Github repository
            </a>
            !
          </div>
        </div>
      }
    />
  );
}

export default MobileBlockingModal;
