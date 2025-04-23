import { JupyterFrontEnd } from '@jupyterlab/application';
import { KernelOperations } from '../services/kernelOperations';
import { showDialog, Dialog } from '@jupyterlab/apputils';
import { NotificationService } from '../services/notificationService';

/**
 * Command ID for creating a kernel.
 */
export const CommandID = 'environment-manager:create-kernel';

/**
 * Register the create kernel command.
 * 
 * @param app - JupyterLab application
 * @param kernelOps - Kernel operations service
 * @param notification - Notification service
 */
export function registerCommand(
  app: JupyterFrontEnd,
  kernelOps: KernelOperations,
  notification: NotificationService
): void {
  app.commands.addCommand(CommandID, {
    label: 'Create Project Kernel',
    caption: 'Create a conda environment and register it as a kernel',
    execute: async () => {
      // Get Python version from user
      const result = await showDialog({
        title: 'Create Project Kernel',
        body: new PythonVersionInput(),
        buttons: [Dialog.cancelButton(), Dialog.okButton()]
      });

      if (result.button.accept) {
        const pythonVersion = (result.value as string) || '3.11';
        
        // Show notification
        const toastId = notification.emit('Creating project kernel...');
        
        try {
          const success = await kernelOps.createKernel(pythonVersion);
          
          if (success) {
            notification.update({
              id: toastId,
              message: 'Project kernel created successfully',
              type: 'success',
              autoClose: 3000
            });
          } else {
            notification.update({
              id: toastId,
              message: 'Failed to create project kernel',
              type: 'error',
              autoClose: 5000
            });
          }
        } catch (error) {
          notification.update({
            id: toastId,
            message: `Error creating project kernel: ${error}`,
            type: 'error',
            autoClose: 5000
          });
        }
      }
    }
  });
}

/**
 * A widget for Python version input.
 */
class PythonVersionInput implements Dialog.IBodyWidget<string> {
  constructor() {
    this.node = document.createElement('div');
    this._input = document.createElement('input');
    this._input.placeholder = '3.11';
    this._input.value = '3.11';
    
    const label = document.createElement('label');
    label.textContent = 'Enter Python version:';
    
    this.node.appendChild(label);
    this.node.appendChild(document.createElement('br'));
    this.node.appendChild(this._input);
  }
  
  getValue(): string {
    return this._input.value;
  }
  
  readonly node: HTMLElement;
  private _input: HTMLInputElement;
  
  // Required by Dialog.IBodyWidget interface
  dispose(): void {}
  get isDisposed(): boolean {
    return false;
  }
}
