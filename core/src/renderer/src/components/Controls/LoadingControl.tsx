import { LightrailControl } from "lightrail-sdk";
import { useEffect } from "react";
import Spinner from "../Spinner/Spinner";

const LoadingControl = ({ control }: { control: LightrailControl }) => {
  return <Spinner />;
};

export default LoadingControl;
