import type { EmbeddedClient } from "weaviate-ts-embedded";
import weaviate, { EmbeddedOptions } from "weaviate-ts-embedded";
import log from "../logger";

/* monkeypatch fetch to allow weaviate port */

// Get the badPorts list from the original undici module.
const badPorts = require("undici/lib/fetch/constants").badPorts;
// Remove envoy port
const index = badPorts.indexOf("6666");
if (index !== -1) {
  badPorts.splice(index, 1);
}
// Replace global fetch with our monkeypatched fetch
global.fetch = require("undici").fetch;

/* end monkeypatching */

export type VectorStoreItem = {
  [key: string]: string | string[] | number | number[];
};

export class LightrailVectorStore {
  _track: { name: string };
  _client: EmbeddedClient | undefined;
  _classes: Set<string> = new Set();

  constructor(track: { name: string }) {
    this._track = track;
  }

  _scopeClassName(className: string) {
    return `${this._track.name[0].toUpperCase()}${this._track.name.slice(
      1
    )}_${className}`;
  }

  async _getClient() {
    if (!this._client) {
      const options = new EmbeddedOptions({
        version: "1.22.3",
      });
      this._client = weaviate.client(options);
      await this._client?.embedded.start();
      log.info(await this._client?.misc.metaGetter().do());
    }
    return this._client!;
  }

  async ensureClass(
    classObj: { class: string } & { [prop: string]: any }
  ): Promise<string> {
    const client = await this._getClient();
    const scopedClassName = this._scopeClassName(classObj.class);
    if (this._classes.has(scopedClassName)) {
      return scopedClassName;
    }

    const scopedClassObj = {
      ...classObj,
      vectorizer: "none",
      class: scopedClassName,
    };
    try {
      await client.schema.classCreator().withClass(scopedClassObj).do();
    } catch (e) {
      log.warn(e);
    }

    this._classes.add(scopedClassName);

    return scopedClassName;
  }

  async insertOne(className: string, item: VectorStoreItem, vector: number[]) {
    const client = await this._getClient();

    const scopedClassName = this._scopeClassName(className);
    await client.data
      .creator()
      .withClassName(scopedClassName)
      .withProperties(item)
      .withVector(vector)
      .do();
  }
  async insertMany(
    className: string,
    items: VectorStoreItem[],
    vectors: number[][]
  ) {
    const client = await this._getClient();
    const scopedClassName = this._scopeClassName(className);
    let batcher = client.batch.objectsBatcher();
    for (let i = 0; i < items.length; i++) {
      batcher = batcher.withObject({
        class: scopedClassName,
        properties: items[i],
        vector: vectors[i],
      });
    }
    const res = await batcher.do();
    log.info("Finished weaviate batch insert");
    res.forEach((r) => r.result?.errors && log.error(r.result?.errors));
  }

  async query(className: string) {
    const client = await this._getClient();
    const scopedClassName = this._scopeClassName(className);
    return client.graphql.get().withClassName(scopedClassName);
  }

  // Implement reset method to delete all objects of a specified class
  async reset(className: string) {
    const client = await this._getClient();
    const scopedClassName = this._scopeClassName(className);
    await client.batch
      .objectsBatchDeleter()
      .withWhere({
        operator: "NotEqual",
        path: ["title"],
        valueString: "this is an ugly hack to delete all objects",
      })
      .withClassName(scopedClassName)
      .do();
  }
}
