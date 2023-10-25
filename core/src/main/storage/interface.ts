import { LightrailDataStores, LightrailTrack } from "lightrail-sdk";
import { LightrailKB } from "./kb";
import { LightrailKVStore } from "./kv";

export const lightrailKBInstance = new LightrailKB();

export class LightrailDataStoresInterface implements LightrailDataStores {
  _track: LightrailTrack;
  kv: LightrailKVStore;
  // vector: LightrailVectorStore; // General interface for track-specific vector stores
  kb: LightrailKB; // Interface for accessing the KB, a specific vector store used by the KB track
  constructor(track: LightrailTrack) {
    this._track = track;
    this.kv = new LightrailKVStore(track);
    // this.vector = new LightrailVectorStore(track);
    this.kb = lightrailKBInstance;
  }
}
