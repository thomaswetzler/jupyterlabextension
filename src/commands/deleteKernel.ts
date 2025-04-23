import { JupyterFrontEnd } from '@jupyterlab/application';
import { KernelOperations } from '../services/kernelOperations';
import { showDialog, Dialog, Notification } from '@jupyterlab/apputils';

/**
 * Command ID for deleting a kernel.
 */
export const CommandID = 'environment-manager:delete-kernel';

/**
 * Register the delete kernel command.
 * 
 * @param app - JupyterLab application
 * @param kernelOps - Kernel operations service
 * @param notification - Notification service
 */
export function registerCommand(
  app: JupyterFrontEnd,
  kernelOps: KernelOperations,
  notification: Notification
): void {
  app.commands.addCommand(CommandID, {
    label: 'Delete Project Kernel',
    caption: 'Delete a project kernel and optionally the conda environment',
    execute: async () => {
      // Ask user if they want to delete the conda environment as well
      const result = await showDialog({
        title: 'Delete Project Kernel',
        body: 'Do you want to delete the conda environment as well?',
        buttons: [
          Dialog.cancelButton(),
          Dialog.okButton({ label: 'Kernel only' }),
          Dialog.okButton({ label: 'Kernel and environment' })
        ]
      });

      if (!result.button.accept) {
        return;
      }

      const deleteEnvironment = result.button.label === 'Kernel and environment';
      
      // Show notification
      const toastId = notification.emit(
        deleteEnvironment ? 
          'Deleting project kernel and environment...' : 
          'Deleting project kernel...'
      );
      
      try {
        const success = await kernelOps.deleteKernel(deleteEnvironment);
        
        if (success) {
          notification.update({
            id: toastId,
            message: deleteEnvironment ? 
              'Project kernel and environment deleted successfully' : 
              'Project kernel deleted successfully',
            type: 'success',
            autoClose: 3000
          });
        } else {
          notification.update({
            id: toastId,
            message: 'Failed to delete project kernel',
            type: 'error',
            autoClose: 5000
          });
        }
      } catch (error) {
        notification.update({
          id: toastId,
          message: `Error deleting project kernel: ${error}`,
          type: 'error',
          autoClose: 5000
        });
      }
    }
  });

  // Also register a reset kernel command
  app.commands.addCommand(`${CommandID}-reset`, {
    label: 'Reset Project Kernel',
    caption: 'Delete and recreate the project kernel and environment',
    execute: async () => {
      // Confirm with user
      const result = await showDialog({
        title: 'Reset Project Kernel',
        body: 'This will delete and recreate the project kernel and environment. Continue?',
        buttons: [Dialog.cancelButton(), Dialog.okButton()]
      });

      if (!result.button.accept) {
        return;
      }
      
      // Show notification
      const toastId = notification.emit('Resetting project kernel...');
      
      try {
        const success = await kernelOps.resetKernel();
        
        if (success) {
          notification.update({
            id: toastId,
            message: 'Project kernel reset successfully',
            type: 'success',
            autoClose: 3000
          });
        } else {
          notification.update({
            id: toastId,
            message: 'Failed to reset project kernel',
            type: 'error',
            autoClose: 5000
          });
        }
      } catch (error) {
        notification.update({
          id: toastId,
          message: `Error resetting project kernel: ${error}`,
          type: 'error',
          autoClose: 5000
        });
      }
    }
  });
}
