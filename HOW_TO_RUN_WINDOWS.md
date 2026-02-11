# How to Run Windows 11 Setup Guide

## System Requirements
- 64-bit processor
- 4 GB RAM or more
- 64 GB or larger storage device
- DirectX 12 compatible graphics / WDDM 2.x
- A display greater than 9" with HD Resolution (720p)

## Step 1: Install Prerequisites
1. **Git**: Download from [git-scm.com](https://git-scm.com/download/win) and follow the installation instructions.
2. **Node.js**: Download from [nodejs.org](https://nodejs.org/) and install the LTS version.
3. **Docker Desktop**: Download from [docker.com](https://www.docker.com/products/docker-desktop) and install.

## Step 2: Configure Windows Settings
- Ensure virtualization is enabled in BIOS.
- Enable WSL (Windows Subsystem for Linux) from Windows Features.
- Enable Hyper-V from Windows Features if using Docker.

## Step 3: Clone Repository
Run the following command in your terminal:
```bash
git clone https://github.com/piyush26293/testing-module.git
```

## Step 4: Configure Environment Variables
- Go to System Properties > Environment Variables.
- Add the following variables if they are not already present:
  - `NODE_ENV`: `development`
  - Any other necessary variables as documented in the repository.

## Step 5: Start Platform with Docker Compose
Navigate to the cloned directory and run:
```bash
docker-compose up
```

## Step 6: Verify Installation
- Open your browser and navigate to `http://localhost:<PORT>` where `<PORT>` is the port defined in your docker-compose file.

## Step 7: Access Application
- Once the application is running, you can access it through your browser as mentioned above.

## Step 8: Create First Test
- Follow the instructions in the repository to create and run your first test.

## Alternative: Run Without Docker
- If you prefer to run the application without Docker, follow the instructions provided in the repository for local setup.

## Troubleshooting Windows Issues
- Ensure all prerequisites are installed correctly.
- Make sure your Windows updates are up to date.
- Check logs in the Docker Desktop for any issues.

## Useful Windows Commands
- `docker -v` - Check Docker version
- `git --version` - Check Git version
- `node -v` - Check Node.js version
- `docker-compose -v` - Check Docker Compose version
