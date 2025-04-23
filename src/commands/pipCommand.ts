import { JupyterFrontEnd } from '@jupyterlab/application';
import { KernelOperations } from '../services/kernelOperations';
import { FileOperations } from '../services/fileOperations';
import { NotificationService } from '../services/notificationService';

/**
 * Command ID for running pip-compile and pip install.
 */
export const CommandID = 'environment-manager:pip-command';

/**
 * Register the pip command.
 * 
 * @param app - JupyterLab application
 * @param kernelOps - Kernel operations service
 * @param fileOps - File operations service
 * @param notification - Notification service
 */
export function registerCommand(
  app: JupyterFrontEnd,
  kernelOps: KernelOperations,
  fileOps: FileOperations,
  notification: NotificationService
): void {
  app.commands.addCommand(CommandID, {
    label: 'Run pip-compile and pip install',
    caption: 'Generate requirements.txt and install dependencies',
    execute: async () => {
      // Show notification
      const toastId = notification.emit('Checking environment setup...');
      
      try {
        // Ensure we have a requirements.in file
        await fileOps.createRequirementsFile();

        // Read .env file to check for kernel
        const env = await fileOps.readEnvFile();
        
        // Check if we need to create a kernel first
        if (!env.ENV_NAME) {
          notification.update({
            id: toastId,
            message: 'Creating kernel first...',
            type: 'info'
          });
          
          // Create kernel with default Python version
          const kernelCreated = await kernelOps.createKernel();
          
          if (!kernelCreated) {
            notification.update({
              id: toastId,
              message: 'Failed to create kernel',
              type: 'error',
              autoClose: 5000
            });
            return;
          }
        }
        
        // Now run pip-compile and pip install
        notification.update({
          id: toastId,
          message: 'Running pip-compile and pip install...',
          type: 'info'
        });
        
        const success = await kernelOps.runPipCompileAndInstall();
        
        if (success) {
          notification.update({
            id: toastId,
            message: 'Dependencies installed successfully',
            type: 'success',
            autoClose: 3000
          });
        } else {
          notification.update({
            id: toastId,
            message: 'Failed to install dependencies',
            type: 'error',
            autoClose: 5000
          });
        }
      } catch (error) {
        notification.update({
          id: toastId,
          message: `Error installing dependencies: ${error}`,
          type: 'error',
          autoClose: 5000
        });
      }
    }
  });
}
