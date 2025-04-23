import { ContextProvider } from './contextProvider';
import { FileOperations } from './fileOperations';
import { ServerConnection } from '@jupyterlab/services';
import { URLExt } from '@jupyterlab/coreutils';

/**
 * Service for managing kernel operations.
 */
export class KernelOperations {
  constructor(
    private contextProvider: ContextProvider,
    private fileOperations: FileOperations
  ) {}

  /**
   * Creates a conda environment and registers it as a kernel.
   * 
   * @param pythonVersion - Python version to use
   * @returns Promise that resolves with success status
   */
  async createKernel(pythonVersion: string = '3.11'): Promise<boolean> {
    // Ensure .env file exists
    await this.fileOperations.createEnvFile(pythonVersion);
    
    // Read environment variables from .env file
    const env = await this.fileOperations.readEnvFile();
    
    if (!env.PYTHON_VERSION || !env.ENV_NAME || !env.KERNEL_NAME || !env.KERNEL_DISPLAY_NAME) {
      console.error('Required environment variables missing from .env file');
      return false;
    }
    
    try {
      // Check if conda environment exists
      const envExists = await this.condaEnvExists(env.ENV_NAME);
      
      if (!envExists) {
        // Create conda environment
        await this.executeCommand(
          `conda create -n ${env.ENV_NAME} python=${env.PYTHON_VERSION} -y`
        );
      }
      
      // Install required packages
      await this.executeCommand(
        `conda run -n ${env.ENV_NAME} pip install --upgrade pip pip-tools ipykernel`
      );
      
      // Register kernel
      if (env.REGISTER_KERNEL === 'true') {
        // Check if kernel already exists
        const kernelExists = await this.kernelExists(env.KERNEL_NAME);
        
        if (kernelExists) {
          console.log(`Kernel ${env.KERNEL_NAME} already exists`);
        } else {
          await this.executeCommand(
            `conda run -n ${env.ENV_NAME} python -m ipykernel install --user --name ${env.KERNEL_NAME} --display-name "${env.KERNEL_DISPLAY_NAME}"`
          );
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Error creating kernel: ${error}`);
      return false;
    }
  }

  /**
   * Executes pip-compile and pip install on the requirements.in file.
   * 
   * @returns Promise that resolves with success status
   */
  async runPipCompileAndInstall(): Promise<boolean> {
    // Ensure requirements.in file exists
    await this.fileOperations.createRequirementsFile();
    
    // Read environment variables from .env file
    const env = await this.fileOperations.readEnvFile();
    
    if (!env.ENV_NAME) {
      console.error('ENV_NAME missing from .env file');
      return false;
    }
    
    try {
      const directory = this.contextProvider.getCurrentDirectory();
      
      // Run pip-compile
      await this.executeCommand(
        `cd ${directory} && conda run -n ${env.ENV_NAME} pip-compile requirements.in -o requirements.txt`
      );
      
      // Run pip install
      await this.executeCommand(
        `cd ${directory} && conda run -n ${env.ENV_NAME} pip-sync requirements.txt`
      );
      
      return true;
    } catch (error) {
      console.error(`Error running pip-compile and install: ${error}`);
      return false;
    }
  }

  /**
   * Deletes a kernel.
   * 
   * @param deleteEnvironment - Whether to delete the conda environment as well
   * @returns Promise that resolves with success status
   */
  async deleteKernel(deleteEnvironment: boolean = false): Promise<boolean> {
    // Read environment variables from .env file
    const env = await this.fileOperations.readEnvFile();
    
    if (!env.KERNEL_NAME || !env.ENV_NAME) {
      console.error('Required environment variables missing from .env file');
      return false;
    }
    
    try {
      // Check if kernel exists
      const kernelExists = await this.kernelExists(env.KERNEL_NAME);
      
      if (kernelExists) {
        // Remove kernel
        await this.executeCommand(
          `jupyter kernelspec remove ${env.KERNEL_NAME} -f`
        );
      } else {
        console.log(`Kernel ${env.KERNEL_NAME} does not exist`);
      }
      
      if (deleteEnvironment) {
        // Check if conda environment exists
        const envExists = await this.condaEnvExists(env.ENV_NAME);
        
        if (envExists) {
          // Remove conda environment
          await this.executeCommand(
            `conda env remove -n ${env.ENV_NAME} -y`
          );
        } else {
          console.log(`Conda environment ${env.ENV_NAME} does not exist`);
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting kernel: ${error}`);
      return false;
    }
  }

  /**
   * Resets a kernel by deleting and recreating it.
   * 
   * @returns Promise that resolves with success status
   */
  async resetKernel(): Promise<boolean> {
    // Read environment variables from .env file
    const env = await this.fileOperations.readEnvFile();
    
    if (!env.PYTHON_VERSION) {
      console.error('PYTHON_VERSION missing from .env file');
      return false;
    }
    
    try {
      // Delete kernel
      await this.deleteKernel(true);
      
      // Create kernel
      return await this.createKernel(env.PYTHON_VERSION);
    } catch (error) {
      console.error(`Error resetting kernel: ${error}`);
      return false;
    }
  }

  /**
   * Checks if a conda environment exists.
   * 
   * @param envName - Name of the conda environment
   * @returns Promise that resolves with true if environment exists
   */
  private async condaEnvExists(envName: string): Promise<boolean> {
    try {
      const { stdout } = await this.executeCommand('conda env list');
      const lines = stdout.split('\n');
      
      for (const line of lines) {
        if (line.startsWith(envName + ' ')) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error(`Error checking conda environment: ${error}`);
      return false;
    }
  }

  /**
   * Checks if a kernel exists.
   * 
   * @param kernelName - Name of the kernel
   * @returns Promise that resolves with true if kernel exists
   */
  private async kernelExists(kernelName: string): Promise<boolean> {
    try {
      const { stdout } = await this.executeCommand('jupyter kernelspec list');
      return stdout.includes(kernelName);
    } catch (error) {
      console.error(`Error checking kernel: ${error}`);
      return false;
    }
  }

  /**
   * Executes a shell command.
   * 
   * @param command - Command to execute
   * @returns Promise that resolves with command output
   */
  private async executeCommand(command: string): Promise<{ exitCode: number; stdout: string; stderr: string }> {
    // In a real extension, this would use JupyterLab's server API
    // Here we're using a simple wrapper that will be replaced with real implementation
    const serverSettings = ServerConnection.makeSettings();
    const url = URLExt.join(serverSettings.baseUrl, 'api/execute');
    
    const response = await ServerConnection.makeRequest(
      url,
      {
        method: 'POST',
        body: JSON.stringify({ command }),
        headers: { 'Content-Type': 'application/json' }
      },
      serverSettings
    );
    
    if (!response.ok) {
      throw new Error(`Failed to execute command: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }
}
