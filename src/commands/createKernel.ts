import { JupyterFrontEnd } from '@jupyterlab/application';
import { KernelOperations } from '../services/kernelOperations';
import { showDialog, Dialog } from '@jupyterlab/apputils';
import { INotification } from '@jupyterlab/apputils';

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
  notification: INotification
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
 * A widget to input Python version.
 */
class PythonVersionInput extends Dialog.InputDialog {
  constructor() {
    super({
      title: 'Python Version',
      placeholder: '3.11',
      label: 'Enter Python version:',
      value: '3.11',
      accept: value => {
        // Simple validation for Python version format
        return /^\d+\.\d+$/.test(value);
      }
    });
  }
}
