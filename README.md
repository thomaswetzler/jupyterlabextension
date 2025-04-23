# JupyterLab Environment Manager

A JupyterLab extension for managing Python environments and kernels directly from the JupyterLab interface.

## Overview

This extension automates common environment management tasks that typically require manual terminal commands, making the workflow more efficient for data scientists and developers. The extension provides the following features:

1. **Create Project Kernels**: Create conda environments and register them as JupyterLab kernels.
2. **Dependency Management**: Run pip-compile and pip install on requirements.in files.
3. **Delete/Reset Kernels**: Delete or reset existing kernels and environments.

All these features are accessible from both the main menu and context menus in JupyterLab.

## Prerequisites

- JupyterLab 4.x
- conda/mamba environment manager
- pip-tools package

## Installation

```bash
# Install the extension
pip install jupyterlab-environment-manager

# Verify installation
jupyter labextension list
```

## Features

### Create Project Kernel

This feature creates a conda environment and registers it as a kernel in JupyterLab. It:

1. Creates a `.env` file in the project directory if not present
2. Creates a conda environment with the specified Python version
3. Installs required packages (pip, pip-tools, ipykernel)
4. Registers the kernel with JupyterLab

**Usage**:
- Select "Create Project Kernel" from the Project menu
- Right-click on a directory in the file browser and select "Create Project Kernel"
- Right-click in a notebook and select "Create Project Kernel"

### Run pip-compile and pip install

This feature manages project dependencies using pip-tools. It:

1. Creates a `requirements.in` file in the project directory if not present
2. Runs pip-compile to generate a requirements.txt file
3. Runs pip install to install the dependencies

**Usage**:
- Select "Run pip-compile and pip install" from the Project menu
- Right-click on a directory in the file browser and select "Run pip-compile and pip install"
- Right-click in a notebook and select "Run pip-compile and pip install"

### Delete/Reset Project Kernel

This feature allows you to delete or reset a project kernel. It:

1. Removes the kernel from JupyterLab
2. Optionally removes the conda environment
3. For reset: also recreates the kernel and environment

**Usage**:
- Select "Delete Project Kernel" or "Reset Project Kernel" from the Project menu
- Right-click on a directory in the file browser and select delete/reset options
- Right-click in a notebook and select delete/reset options

## File Structure

The extension creates and manages the following files:

### .env

Contains environment configuration:

```
PYTHON_VERSION=3.11
ENV_NAME=conda-projectname
KERNEL_NAME=python-projectname
KERNEL_DISPLAY_NAME=Python (projectname)
REGISTER_KERNEL=true
```

### requirements.in

Contains Python package dependencies (used by pip-compile):

```
# Python dependencies
numpy
pandas

# Add your dependencies below
```

## Context Determination

The extension determines the working directory based on:

1. The directory of the currently active notebook
2. The directory selected in the file browser
3. The current directory in the file browser

## Development

### Building the extension

```bash
# Clone the repository
git clone https://github.com/thomaswetzler/jupyterlabextension.git
cd jupyterlabextension

# Install dependencies
jlpm

# Build the extension
jlpm build

# Link the extension for development
jupyter labextension develop . --overwrite

# Watch for changes
jlpm watch
```

## Docker Integration

You can integrate this extension into a JupyterLab Docker image by adding the tarball in your Dockerfile. Here's how to do it:

### Option 1: Using a GitHub Release Tarball

```dockerfile
FROM quay.io/jupyter/scipy-notebook:2025-03-14

# Install Node.js for extension building
USER root
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Download and install the extension
WORKDIR /tmp
RUN wget https://github.com/thomaswetzler/jupyterlabextension/releases/download/nightly-$(date +'%Y-%m-%d')/jupyterlab-environment-manager.tar.gz -O extension.tar.gz || \
    wget https://github.com/thomaswetzler/jupyterlabextension/releases/latest/download/jupyterlab-environment-manager.tar.gz -O extension.tar.gz
RUN pip install extension.tar.gz && \
    jupyter labextension list

# Switch back to jovyan user
USER ${NB_UID}
```

### Option 2: Building the Extension Inside the Dockerfile

```dockerfile
FROM quay.io/jupyter/scipy-notebook:2025-03-14

# Install Node.js for extension building
USER root
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Clone and build the extension
WORKDIR /tmp
RUN git clone https://github.com/thomaswetzler/jupyterlabextension.git && \
    cd jupyterlabextension && \
    npm install && \
    npm run build:prod && \
    pip install . && \
    jupyter labextension list

# Switch back to jovyan user
USER ${NB_UID}
```

### Option 3: Using a Local Tarball

First, download the extension tarball or build it locally. Then, create a Dockerfile in the same directory:

```dockerfile
FROM quay.io/jupyter/scipy-notebook:2025-03-14

# Copy and install the extension
COPY jupyterlab-environment-manager.tar.gz /tmp/
RUN pip install /tmp/jupyterlab-environment-manager.tar.gz && \
    jupyter labextension list

# Clean up
RUN rm /tmp/jupyterlab-environment-manager.tar.gz
```

### Verifying the Installation

You can verify that the extension was installed correctly by checking the JupyterLab extensions list:

```bash
docker run --rm your-image-name jupyter labextension list
```

The output should include `jupyterlab-environment-manager` in the list of installed extensions.

## License

This extension is released under the BSD-3-Clause license.
