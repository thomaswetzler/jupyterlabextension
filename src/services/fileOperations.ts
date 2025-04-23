import { ContextProvider } from './contextProvider';
import { PathExt } from '@jupyterlab/coreutils';
import { Contents } from '@jupyterlab/services';

/**
 * Service for managing file operations related to environment setup.
 */
export class FileOperations {
  constructor(
    private contextProvider: ContextProvider,
    private contentsManager: Contents.IManager
  ) {}

  /**
   * Creates or updates a .env file in the current directory.
   * 
   * @param pythonVersion - Python version to use (defaults to 3.11)
   * @returns Promise that resolves when the file is created
   */
  async createEnvFile(pythonVersion: string = '3.11'): Promise<void> {
    const directory = this.contextProvider.getCurrentDirectory();
    const projectName = this.contextProvider.getProjectName();
    const path = PathExt.join(directory, '.env');

    // Check if file exists
    try {
      await this.contentsManager.get(path);
      // File exists, don't overwrite
      console.log(`File ${path} already exists, not overwriting.`);
      return;
    } catch (error) {
      // File doesn't exist, create it
      console.log(`Creating .env file at ${path}`);
    }

    const content = [
      `PYTHON_VERSION=${pythonVersion}`,
      `ENV_NAME=conda-${projectName}`,
      `KERNEL_NAME=python-${projectName}`,
      `KERNEL_DISPLAY_NAME=Python (${projectName})`,
      `REGISTER_KERNEL=true`
    ].join('\n');

    await this.contentsManager.save(path, {
      type: 'file',
      format: 'text',
      content
    });
  }

  /**
   * Creates or updates a requirements.in file in the current directory.
   * 
   * @returns Promise that resolves when the file is created
   */
  async createRequirementsFile(): Promise<void> {
    const directory = this.contextProvider.getCurrentDirectory();
    const path = PathExt.join(directory, 'requirements.in');

    // Check if file exists
    try {
      await this.contentsManager.get(path);
      // File exists, don't overwrite
      console.log(`File ${path} already exists, not overwriting.`);
      return;
    } catch (error) {
      // File doesn't exist, create it
      console.log(`Creating requirements.in file at ${path}`);
    }

    const content = [
      '# Python dependencies',
      'numpy',
      'pandas',
      '',
      '# Add your dependencies below',
      ''
    ].join('\n');

    await this.contentsManager.save(path, {
      type: 'file',
      format: 'text',
      content
    });
  }

  /**
   * Reads a .env file and parses its contents.
   * 
   * @returns Promise that resolves with the parsed environment variables
   */
  async readEnvFile(): Promise<Record<string, string>> {
    const directory = this.contextProvider.getCurrentDirectory();
    const path = PathExt.join(directory, '.env');
    
    try {
      const file = await this.contentsManager.get(path, { content: true });
      
      if (file.content) {
        const lines = (file.content as string).split('\n');
        const env: Record<string, string> = {};
        
        for (const line of lines) {
          if (line && !line.startsWith('#')) {
            const [key, value] = line.split('=');
            if (key && value) {
              env[key.trim()] = value.trim();
            }
          }
        }
        
        return env;
      }
    } catch (error) {
      console.error(`Error reading .env file: ${error}`);
    }
    
    return {};
  }

  /**
   * Ensures .gitignore contains .env entry.
   * 
   * @returns Promise that resolves when the gitignore is updated
   */
  async updateGitignore(): Promise<void> {
    const directory = this.contextProvider.getCurrentDirectory();
    const path = PathExt.join(directory, '.gitignore');
    
    try {
      let content = '';
      let exists = false;
      
      try {
        const file = await this.contentsManager.get(path, { content: true });
        content = file.content as string;
        exists = true;
      } catch (error) {
        // File doesn't exist, create it
        content = '';
      }
      
      // Check if .env is already in .gitignore
      const lines = content.split('\n');
      if (!lines.includes('.env')) {
        lines.push('.env');
        content = lines.join('\n');
        
        await this.contentsManager.save(path, {
          type: 'file',
          format: 'text',
          content
        });
      }
    } catch (error) {
      console.error(`Error updating .gitignore file: ${error}`);
    }
  }
}
