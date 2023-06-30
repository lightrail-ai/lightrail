import {
  type ProjectWithFiles,
  type File,
  type FileUpdate,
} from "@/util/storage";
import React, { useMemo, useState } from "react";
import Modal from "../Modal/Modal";
import * as Diff from "diff";
import * as Diff2Html from "diff2html";
import "diff2html/bundles/css/diff2html.min.css";
import { formatComponentTree } from "@/util/util";
import Button from "../Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faRedo } from "@fortawesome/free-solid-svg-icons";
import "./styles.css";
import { SERVER_URL } from "@/util/constants";
import { getJSONFromStream } from "@/util/transfers";
import classNames from "classnames";
import { toast } from "react-hot-toast";

export interface UpdateProposal {
  message: string;
  file: File;
  request: any;
  update: FileUpdate;
}

export interface UpdateProposalModalProps {
  proposal: UpdateProposal | null;
  onAccepted: () => void;
  onChangeProposal: (u: UpdateProposal | null) => void;
  project: ProjectWithFiles;
}

function UpdateProposalModal({
  proposal,
  onChangeProposal,
  onAccepted,
  project,
}: UpdateProposalModalProps) {
  const [loading, setLoading] = useState(false);

  const diff = useMemo(() => {
    if (!proposal) return null;
    return Diff.createTwoFilesPatch(
      proposal.file.path,
      proposal.file.path,
      proposal.file.contents ? formatComponentTree(proposal.file.contents) : "",
      proposal.update.contents
        ? formatComponentTree(proposal.update.contents)
        : ""
    );
  }, [proposal]);

  const diffHtml = useMemo(() => {
    if (!diff) return "";
    return Diff2Html.html(diff, {
      drawFileList: false,
      matching: "lines",
      outputFormat: "side-by-side",
    });
  }, [diff]);

  async function applyProposal() {
    if (!proposal) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${SERVER_URL}/api/projects/${project.id}/files/${proposal.file.path}`,
        {
          method: "PUT",
          body: JSON.stringify(proposal.update),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      const json = await res.json();
      if (json.status === "error") {
        console.error(json);
        throw new Error(json.error);
      }
      onAccepted();
      toast.success("Component updated!", {
        position: "bottom-center",
      });
      onChangeProposal(null);
    } catch (e) {
      toast.error("Failed to update component!", {
        position: "bottom-center",
      });
    } finally {
      setLoading(false);
    }
  }

  async function retry() {
    if (!proposal) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${SERVER_URL}/api/projects/${project.id}/files/${proposal.file.path}/revisions`,
        {
          method: "POST",
          body: JSON.stringify(proposal.request),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const json = await getJSONFromStream(res);
      if (json.status === "error") {
        console.error(json);
        throw new Error(json.message);
      }
      onChangeProposal({
        ...proposal,
        update: json.update,
        message: json.message,
      });
    } catch (e) {
      toast.error("Retrying failed -- wait a few seconds and try again!", {
        position: "bottom-center",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      wide
      visible={proposal !== null}
      onClose={() => onChangeProposal(null)}
      title={"Proposed Change"}
      content={
        <div
          className={classNames({
            "opacity-50": loading,
          })}
        >
          <pre className="border-l-4 border-l-sky-300 bg-sky-300 bg-opacity-10 pr-2 py-2 mb-4 pl-4 italic text-slate-700 text-sm whitespace-pre-wrap">
            {proposal?.message}
          </pre>
          <div dangerouslySetInnerHTML={{ __html: diffHtml }}></div>
        </div>
      }
      actions={[
        <Button key={0} onClick={retry} secondary disabled={loading}>
          <FontAwesomeIcon icon={faRedo} className="mr-2" />
          Try Again
        </Button>,
        <Button key={1} onClick={applyProposal} disabled={loading}>
          <FontAwesomeIcon icon={faCheck} className="mr-2" />
          Accept
        </Button>,
      ]}
    />
  );
}

export default UpdateProposalModal;
