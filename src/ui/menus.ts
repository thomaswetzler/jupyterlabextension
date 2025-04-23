import { JupyterFrontEnd } from '@jupyterlab/application';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { CommandRegistry } from '@lumino/commands';
import * as createKernel from '../commands/createKernel';
import * as pipCommand from '../commands/pipCommand';
import * as deleteKernel from '../commands/deleteKernel';

/**
 * Add menu entries to the main menu.
 * 
 * @param app - JupyterLab application
 * @param mainMenu - Main menu
 */
export function addMainMenuEntries(
  app: JupyterFrontEnd,
  mainMenu: IMainMenu
): void {
  const { commands } = app;
  
  // Create Project menu
  mainMenu.addMenu({
    rank: 60,
    label: 'Project',
    menu: {
      id: 'environment-manager-menu'
    }
  });

  // Add commands to Project menu
  const projectMenu = mainMenu.menus.find(
    menu => menu.id === 'environment-manager-menu'
  );

  if (projectMenu) {
    projectMenu.addItem({ command: createKernel.CommandID });
    projectMenu.addItem({ command: pipCommand.CommandID });
    projectMenu.addItem({ command: deleteKernel.CommandID });
    projectMenu.addItem({ command: `${deleteKernel.CommandID}-reset` });
  }
}

/**
 * Add context menu entries.
 * 
 * @param app - JupyterLab application
 */
export function addContextMenuEntries(app: JupyterFrontEnd): void {
  // Add to file browser context menu for directories
  app.contextMenu.addItem({
    command: createKernel.CommandID,
    selector: '.jp-DirListing-item[data-isdir="true"]',
    rank: 10
  });

  app.contextMenu.addItem({
    command: pipCommand.CommandID,
    selector: '.jp-DirListing-item[data-isdir="true"]',
    rank: 11
  });

  app.contextMenu.addItem({
    command: deleteKernel.CommandID,
    selector: '.jp-DirListing-item[data-isdir="true"]',
    rank: 12
  });

  // Add to notebook context menu
  app.contextMenu.addItem({
    command: createKernel.CommandID,
    selector: '.jp-Notebook',
    rank: 10
  });

  app.contextMenu.addItem({
    command: pipCommand.CommandID,
    selector: '.jp-Notebook',
    rank: 11
  });

  app.contextMenu.addItem({
    command: deleteKernel.CommandID,
    selector: '.jp-Notebook',
    rank: 12
  });
}
