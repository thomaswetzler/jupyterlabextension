import { JupyterFrontEnd } from '@jupyterlab/application';
import { IFileBrowserFactory, FileBrowser } from '@jupyterlab/filebrowser';
import { INotebookTracker } from '@jupyterlab/notebook';
import { PathExt } from '@jupyterlab/coreutils';

/**
 * Service for determining the current working directory context.
 */
export class ContextProvider {
  constructor(
    private _app: JupyterFrontEnd,
    private fileBrowserFactory: IFileBrowserFactory,
    private notebookTracker: INotebookTracker
  ) {}

  /**
   * Gets the current working directory based on context.
   * 
   * Priority:
   * 1. Current notebook directory
   * 2. File browser selection directory
   * 3. File browser current directory
   * 
   * @returns The current directory path
   */
  getCurrentDirectory(): string {
    // Try to get directory from current notebook
    const notebookDir = this.getNotebookDirectory();
    if (notebookDir) {
      return notebookDir;
    }
    
    // Try to get directory from file browser selection
    const selectionDir = this.getSelectionDirectory();
    if (selectionDir) {
      return selectionDir;
    }
    
    // Use the current file browser directory
    const browser = this.fileBrowserFactory.tracker.currentWidget;
    return browser ? browser.model.path : '';
  }

  /**
   * Gets the current project name based on the directory name.
   * 
   * @returns The project name
   */
  getProjectName(): string {
    const currentDir = this.getCurrentDirectory();
    return PathExt.basename(currentDir);
  }

  /**
   * Gets the current kernel associated with the active notebook.
   * 
   * @returns The kernel name or null if no active kernel
   */
  getCurrentKernel(): string | null {
    const current = this.notebookTracker.currentWidget;
    if (!current) {
      return null;
    }

    const sessionContext = current.sessionContext;
    if (!sessionContext || !sessionContext.session) {
      return null;
    }

    return sessionContext.kernelDisplayName;
  }

  /**
   * Gets the directory of the currently active notebook.
   * 
   * @returns The directory path or null if no active notebook
   */
  private getNotebookDirectory(): string | null {
    const current = this.notebookTracker.currentWidget;
    if (!current) {
      return null;
    }

    const path = current.context.path;
    return PathExt.dirname(path);
  }

  /**
   * Gets the directory from the current file browser selection.
   * 
   * @returns The selected directory path or null
   */
  private getSelectionDirectory(): string | null {
    const browser = this.fileBrowserFactory.tracker.currentWidget;
    if (!browser) {
      return null;
    }
    
    // Use any type to bypass the TypeScript errors
    type FileItem = { path: string; type: string; selected: boolean };
    // Convert the items iterator to an array with the right type
    const items = Array.from(browser.model.items()) as unknown as FileItem[];
    // Filter for selected items
    const selection = items.filter(item => item.selected);

    if (selection.length === 0) {
      return null;
    }

    // If a directory is selected, use it
    for (const item of selection) {
      if (item.type === 'directory') {
        return item.path;
      }
    }

    // If files are selected, use the parent directory of the first file
    return selection.length > 0 ? PathExt.dirname(selection[0].path) : null;
  }
}
