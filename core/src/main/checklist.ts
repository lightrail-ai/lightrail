import jsonStorage from "electron-json-storage";
import { promisify } from "util";

// The Checklist is a record of notices / onboardings / etc that this user has completed.

type Checklist = {
  [id: string]: boolean;
};

let checklist: Checklist | undefined;

export async function isComplete(id: string): Promise<boolean> {
  if (!checklist) {
    checklist = ((await promisify(jsonStorage.get)("checklist")) ??
      {}) as Checklist;
  }
  return checklist[id] || false;
}

export async function markComplete(id: string): Promise<void> {
  if (!checklist) {
    checklist = ((await promisify(jsonStorage.get)("checklist")) ??
      {}) as Checklist;
  }
  checklist[id] = true;
  await promisify(jsonStorage.set)("checklist", checklist);
}
