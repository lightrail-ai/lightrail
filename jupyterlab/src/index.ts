import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the lightrail extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'lightrail:plugin',
  description: 'Connect JupyterLab to Lightrail AI',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension lightrail is activated!');
  }
};

export default plugin;
