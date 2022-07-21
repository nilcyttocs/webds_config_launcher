import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the @webds/config_launcher extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@webds/config_launcher:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension @webds/config_launcher is activated!');
  }
};

export default plugin;
