import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { LightrailClient } from 'lightrail-sdk';
import { io } from 'socket.io-client';

let lightrailClient = new LightrailClient(
  'jupyterlab-client',
  io('ws://localhost:1218') as any
);

/**
 * Initialization data for the lightrail extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'lightrail:plugin',
  description: 'Connect JupyterLab to Lightrail AI',
  autoStart: true,
  requires: [INotebookTracker, IFileBrowserFactory, JupyterFrontEnd.IPaths],
  activate: (
    app: JupyterFrontEnd,
    notebookTracker: INotebookTracker,
    factory: IFileBrowserFactory,
    paths: JupyterFrontEnd.IPaths
  ) => {
    console.log('JupyterLab extension lightrail is activated!');

    lightrailClient.registerHandler('get-active-notebook', async () => {
      const currentNotebook = notebookTracker.currentWidget;
      await currentNotebook?.context.save();
      const serverRoot = paths.directories.serverRoot;
      const fullPath = `${serverRoot}/${currentNotebook?.context.path}`;
      return fullPath;
    });

    lightrailClient.registerHandler(
      'refresh-notebook-from-disk',
      async (path: string) => {
        const currentNotebook = notebookTracker.currentWidget;
        await currentNotebook?.context.revert();
      }
    );
  }
};

export default plugin;
