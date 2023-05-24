import React from "react";
import ReactLoader from "react-loaders";
import "loaders.css/src/animations/ball-scale-ripple-multiple.scss";

export interface LoaderProps {}

function Loader({}: LoaderProps) {
  return <ReactLoader type="ball-scale-ripple-multiple" active />;
}

export default Loader;
