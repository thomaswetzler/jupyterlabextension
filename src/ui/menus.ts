import { JupyterFrontEnd } from '@jupyterlab/application';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { Menu } from '@lumino/widgets';
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
  // Create Project menu
  const projectMenu = new Menu({ commands: app.commands });
  projectMenu.title.label = 'Project';
  
  // Add commands to Project menu
  projectMenu.addItem({ command: createKernel.CommandID });
  projectMenu.addItem({ command: pipCommand.CommandID });
  projectMenu.addItem({ command: deleteKernel.CommandID });
  projectMenu.addItem({ command: `${deleteKernel.CommandID}-reset` });
  
  // Add the menu to the main menu
  mainMenu.addMenu(projectMenu, { rank: 60 });
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
