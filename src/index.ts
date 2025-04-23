import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { INotebookTracker } from '@jupyterlab/notebook';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { INotification } from '@jupyterlab/apputils';
import { Contents } from '@jupyterlab/services';

import { ContextProvider } from './services/contextProvider';
import { FileOperations } from './services/fileOperations';
import { KernelOperations } from './services/kernelOperations';

import * as createKernel from './commands/createKernel';
import * as pipCommand from './commands/pipCommand';
import * as deleteKernel from './commands/deleteKernel';

import * as menus from './ui/menus';

/**
 * Initialization data for the jupyterlab-environment-manager extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-environment-manager:plugin',
  autoStart: true,
  requires: [
    IFileBrowserFactory,
    INotebookTracker,
    IMainMenu,
    INotification
  ],
  activate: (
    app: JupyterFrontEnd,
    fileBrowserFactory: IFileBrowserFactory,
    notebookTracker: INotebookTracker,
    mainMenu: IMainMenu,
    notification: INotification
  ) => {
    console.log('JupyterLab Environment Manager extension is activated!');

    // Initialize services
    const contextProvider = new ContextProvider(
      app,
      fileBrowserFactory,
      notebookTracker
    );

    const contentsManager = app.serviceManager.contents;
    
    const fileOperations = new FileOperations(
      contextProvider,
      contentsManager
    );

    const kernelOperations = new KernelOperations(
      contextProvider,
      fileOperations
    );

    // Register commands
    createKernel.registerCommand(app, kernelOperations, notification);
    pipCommand.registerCommand(app, kernelOperations, fileOperations, notification);
    deleteKernel.registerCommand(app, kernelOperations, notification);

    // Add menu entries
    menus.addMainMenuEntries(app, mainMenu);
    menus.addContextMenuEntries(app);

    // Log that extension is ready
    console.log('JupyterLab Environment Manager is ready!');
  }
};

export default plugin;
