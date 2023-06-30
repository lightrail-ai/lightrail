import { ProjectWithFiles } from "@/util/storage";
import { atom } from "recoil";
import { UpdateProposal } from "../UpdateProposalModal";

export const activeProject = atom<ProjectWithFiles | undefined>({
  key: "activeProject",
  default: undefined,
});

export const activeProposal = atom<UpdateProposal | null>({
  key: "activeProposal",
  default: null,
});
