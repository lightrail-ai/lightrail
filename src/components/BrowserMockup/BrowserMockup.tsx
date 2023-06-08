import React from "react";
import "./browsermockup.scss";
import PreviewFrame from "../PreviewFrame/PreviewFrame";

export interface BrowserMockupProps {
  children?: React.ReactNode;
}

function BrowserMockup({ children }: BrowserMockupProps) {
  return (
    <div className="browser-template">
      <div className="browser-template__top-bar">
        <ul className="browser-template__buttons">
          <li className="browser-template__buttons_item"></li>
          <li className="browser-template__buttons_item"></li>
          <li className="browser-template__buttons_item"></li>
        </ul>

        <div className="browser-template__address"></div>

        <ul className="browser-template__controls">
          <li className="browser-template__controls_item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path
                fill="currentColor"
                d="M229.9 473.899l19.799-19.799c4.686-4.686 4.686-12.284 0-16.971L94.569 282H436c6.627 0 12-5.373 12-12v-28c0-6.627-5.373-12-12-12H94.569l155.13-155.13c4.686-4.686 4.686-12.284 0-16.971L229.9 38.101c-4.686-4.686-12.284-4.686-16.971 0L3.515 247.515c-4.686 4.686-4.686 12.284 0 16.971L212.929 473.9c4.686 4.686 12.284 4.686 16.971-.001z"
              />
            </svg>
          </li>
          <li className="browser-template__controls_item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path
                fill="currentColor"
                d="M218.101 38.101L198.302 57.9c-4.686 4.686-4.686 12.284 0 16.971L353.432 230H12c-6.627 0-12 5.373-12 12v28c0 6.627 5.373 12 12 12h341.432l-155.13 155.13c-4.686 4.686-4.686 12.284 0 16.971l19.799 19.799c4.686 4.686 12.284 4.686 16.971 0l209.414-209.414c4.686-4.686 4.686-12.284 0-16.971L235.071 38.101c-4.686-4.687-12.284-4.687-16.97 0z"
              />
            </svg>
          </li>
          <li className="browser-template__controls_item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path
                fill="currentColor"
                d="M483.515 28.485L431.35 80.65C386.475 35.767 324.485 8 256.001 8 119.34 8 7.9 119.525 8 256.185 8.1 393.067 119.095 504 256 504c63.926 0 122.202-24.187 166.178-63.908 5.113-4.618 5.353-12.561.482-17.433l-19.738-19.738c-4.498-4.498-11.753-4.785-16.501-.552C351.787 433.246 306.105 452 256 452c-108.321 0-196-87.662-196-196 0-108.321 87.662-196 196-196 54.163 0 103.157 21.923 138.614 57.386l-54.128 54.129c-7.56 7.56-2.206 20.485 8.485 20.485H492c6.627 0 12-5.373 12-12V36.971c0-10.691-12.926-16.045-20.485-8.486z"
              />
            </svg>
          </li>
        </ul>
      </div>
      <div
        id="browser-template__contents"
        className="browser-template__contents"
      >
        <PreviewFrame>{children}</PreviewFrame>
      </div>
    </div>
  );
}

export default BrowserMockup;
