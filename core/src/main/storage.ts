import { LightrailDataStores, LightrailTrack } from "lightrail-sdk";
import jsonStorage from "electron-json-storage";
import path from "path";

export class LightrailKVStore {
  _track: LightrailTrack;
  _dataPath: string;
  constructor(track: LightrailTrack) {
    this._track = track;
    this._dataPath = path.join(jsonStorage.getDataPath(), "tracks", track.name);
  }
  get<T = any>(key: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      jsonStorage.get(
        key,
        {
          dataPath: this._dataPath,
        },
        (err, data: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(data?.value as T);
          }
        }
      );
    });
  }
  set(key: string, value: any) {
    return new Promise<void>((resolve, reject) => {
      jsonStorage.set(
        key,
        { value: value },
        {
          dataPath: this._dataPath,
        },
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }
}

export class LightrailDataStoresInterface implements LightrailDataStores {
  _track: LightrailTrack;
  kv: LightrailKVStore;
  constructor(track: LightrailTrack) {
    this._track = track;
    this.kv = new LightrailKVStore(track);
  }
}
