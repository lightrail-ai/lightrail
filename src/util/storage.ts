export interface Project {
  id: string;
  name: string;
  files: {
    [filePath: string]: string;
  };
}

export let projects: {
  [id: string]: Project;
} = {
  "1": {
    id: "1",
    name: "Test Project",
    files: {
      index: `<div className="bg-green-600"><Wrapper>hello world</Wrapper></div>`,
      Wrapper: `<div className="bg-blue-200 m-4 p-4"><Text>{children}</Text></div>`,
      Text: `<div className="bg-red-400">{children}</div>`,
    },
  },
};

export function getProject(projectId: string) {
  return projects[projectId];
}

export function setProject(projectId: string, project: Project) {
  projects[projectId] = project;
}

export function getFile(projectId: string, filePath: string) {
  return projects[projectId].files[filePath];
}

export function setFile(projectId: string, filePath: string, file: string) {
  projects[projectId].files[filePath] = file;
}

export function getProjectId() {
  return Object.keys(projects).length + 1;
}
