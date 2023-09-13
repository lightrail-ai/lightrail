import React, { useEffect, useMemo, useState } from "react";
import TextInput from "../ui-elements/TextInput/TextInput";
import Button from "../ui-elements/Button/Button";
import { trpcClient } from "@renderer/util/trpc-client";
import { rendererTracksManager } from "@renderer/util/lightrail-renderer";
import { LightrailTrack } from "lightrail-sdk";
import { loadTracks } from "@renderer/util/track-admin";
import Spinner from "../Spinner/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faRedo } from "@fortawesome/free-solid-svg-icons";

export interface TrackAdminProps {}

function TrackAdmin({}: TrackAdminProps) {
  const [installTrackInputValue, setInstallTrackInputValue] = useState("");
  const [trackList, setTrackList] = useState<LightrailTrack[]>([]);
  const [tracksLocation, setTracksLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [trackRepository, setTrackRepository] = useState<{
    [name: string]: { url: string };
  }>({});

  useEffect(() => {
    setTrackList(Object.values(rendererTracksManager._tracks));
  }, []);

  useEffect(() => {
    trpcClient.tracks.location.query().then((res) => {
      setTracksLocation(res);
    });
  }, []);

  useEffect(() => {
    trpcClient.tracks.repository
      .query()
      .then((r) => r.tracks && setTrackRepository(r.tracks));
  }, []);

  const installedTrackNames = useMemo(
    () => new Set(trackList.map((t) => t.name)),
    [trackList]
  );

  const availableTrackNames = useMemo(
    () =>
      Object.keys(trackRepository)
        .filter((name) => !installedTrackNames.has(name))
        .sort(),
    [installedTrackNames, trackRepository]
  );

  async function installTrack(url: string) {
    setLoading(true);
    const paths = await trpcClient.tracks.install.mutate(url);
    await loadTracks(paths);
    setTrackList(Object.values(rendererTracksManager._tracks));
    setLoading(false);
  }

  return (
    <div className="relative">
      <div className="py-4 px-6">
        {tracksLocation && (
          <div className="pb-4 text-sm opacity-50">
            <div className="font-semibold">Location</div>
            <div>{tracksLocation}</div>
          </div>
        )}
        <div className="text-sm mb-2 opacity-50 border-b">Installed</div>
        <div className="max-h-48 overflow-auto">
          {trackList.map((track) => {
            const color =
              track.tokens?.[0]?.color ||
              track.actions?.[0]?.color ||
              "#999999";
            return (
              <div
                className="px-2 py-2 text-sm border rounded-sm mb-2 flex flex-row items-center"
                style={{
                  backgroundColor: color + "30",
                  borderColor: color,
                  color: color,
                }}
              >
                <div className="font-semibold pr-4">{track.name}</div>
                <div className="flex-1"></div>

                {trackRepository[track.name] && (
                  <Button
                    title="Reinstall/Update Track"
                    onClick={() =>
                      installTrack(trackRepository[track.name].url)
                    }
                  >
                    <FontAwesomeIcon icon={faRedo} />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        <div className="text-sm mt-4 mb-2 opacity-50 border-b">Available</div>
        <div className="max-h-48 overflow-auto">
          {availableTrackNames.map((trackName) => {
            const { url } = trackRepository[trackName];
            return (
              <div className="px-2 py-2 text-sm border rounded-sm mb-2 flex flex-row items-center">
                <div className="font-semibold pr-4">{trackName}</div>
                <div className="flex-1">
                  {/* {track.tokens?.length ?? 0} token(s),{" "}
                {track.actions?.length ?? 0} action(s) */}
                </div>
                <Button
                  title="Install Track"
                  onClick={() => installTrack(url)}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                </Button>
              </div>
            );
          })}
          {availableTrackNames.length === 0 && (
            <div className="text-sm opacity-30 italic">None</div>
          )}
        </div>
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
          onClick={() => installTrack(installTrackInputValue)}
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
