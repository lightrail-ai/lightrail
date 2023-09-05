import React, { useEffect, useState } from "react";
import TextInput from "../ui-elements/TextInput/TextInput";
import Button from "../ui-elements/Button/Button";
import { trpcClient } from "@renderer/util/trpc-client";
import { rendererTracksManager } from "@renderer/util/lightrail-renderer";
import { LightrailTrack } from "lightrail-sdk";
import { loadTracks } from "@renderer/util/track-admin";
import Spinner from "../Spinner/Spinner";

export interface TrackAdminProps {}

function TrackAdmin({}: TrackAdminProps) {
  const [installTrackInputValue, setInstallTrackInputValue] = useState("");
  const [trackList, setTrackList] = useState<LightrailTrack[]>([]);
  const [tracksLocation, setTracksLocation] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTrackList(Object.values(rendererTracksManager._tracks));
  }, []);

  useEffect(() => {
    trpcClient.tracks.location.query().then((res) => {
      setTracksLocation(res);
    });
  }, []);

  return (
    <div className="relative">
      <div className="py-4 px-6">
        {tracksLocation && (
          <div className="pb-4 text-sm opacity-50">
            <div className="font-semibold">Location</div>
            <div>{tracksLocation}</div>
          </div>
        )}
        {trackList.map((track) => {
          const color =
            track.tokens?.[0]?.color || track.actions?.[0]?.color || "#999999";
          return (
            <div
              className="px-2 py-2 text-sm border rounded-sm mb-2"
              style={{
                backgroundColor: color + "30",
                borderColor: color,
                color: color,
              }}
            >
              <span className="font-semibold pr-4">{track.name}</span>
              {track.tokens?.length ?? 0} token(s), {track.actions?.length ?? 0}{" "}
              action(s)
            </div>
          );
        })}
      </div>
      <div className="flex flex-row px-6 py-2 items-end">
        <TextInput
          containerClassName="flex-1 pr-1"
          inputClassName="w-full"
          value={installTrackInputValue}
          onChange={setInstallTrackInputValue}
          label="Install From URL"
          placeholder="https://.../file.zip"
        />
        <Button
          onClick={async () => {
            setLoading(true);
            const paths = await trpcClient.tracks.install.mutate(
              installTrackInputValue
            );
            await loadTracks(paths);
            setTrackList(Object.values(rendererTracksManager._tracks));
            setLoading(false);
          }}
          disabled={loading}
        >
          Fetch Track(s)
        </Button>
      </div>
      {loading && (
        <div className="bg-neutral-950 bg-opacity-90 absolute top-0 left-0 w-full h-full flex gap-4 items-center justify-center z-10">
          <Spinner /> Working...
        </div>
      )}
    </div>
  );
}

export default TrackAdmin;
