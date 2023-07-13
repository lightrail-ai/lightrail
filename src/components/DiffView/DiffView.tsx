import React, { useMemo } from "react";
import * as Diff from "diff";
import * as Diff2Html from "diff2html";
import { formatComponentTree } from "@/util/util";

export interface DiffingFile {
  name: string;
  contents: string;
}

export interface DiffViewProps {
  oldFile: DiffingFile;
  newFile: DiffingFile;
}

function DiffView({ oldFile, newFile }: DiffViewProps) {
  const diff = useMemo(() => {
    if (!oldFile || !newFile) return null;
    return Diff.createTwoFilesPatch(
      oldFile.name,
      newFile.name,
      oldFile.contents ? formatComponentTree(oldFile.contents) : "",
      newFile.contents ? formatComponentTree(newFile.contents) : ""
    );
  }, [oldFile, newFile]);

  const diffHtml = useMemo(() => {
    if (!diff) return "";
    return Diff2Html.html(diff, {
      drawFileList: false,
      matching: "lines",
      outputFormat: "side-by-side",
    });
  }, [diff]);

  return <div dangerouslySetInnerHTML={{ __html: diffHtml }}></div>;
}

export default DiffView;
