# 🚀 Backend Deployment Guide - DoorStepDoctor

## Complete Step-by-Step Guide for AWS SAM Deployment

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Install AWS SAM CLI](#install-aws-sam-cli)
3. [Configure AWS Credentials](#configure-aws-credentials)
4. [Prepare Backend Files](#prepare-backend-files)
5. [Build the Application](#build-the-application)
6. [Deploy to AWS](#deploy-to-aws)
7. [Get API Endpoint](#get-api-endpoint)
8. [Update Frontend](#update-frontend)
9. [Verify Deployment](#verify-deployment)
10. [Troubleshooting](#troubleshooting)

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ AWS Account with admin access
- ✅ AWS Cognito User Pool created (see AWS_SETUP_INSTRUCTIONS.md)
- ✅ AWS Bedrock Knowledge Base created
- ✅ DynamoDB tables created
- ✅ Node.js 18+ installed
- ✅ Python 3.9+ installed (for SAM CLI)
- ✅ Git installed
- ✅ Windows PowerShell or Command Prompt

---

## 1️⃣ Install AWS SAM CLI

### Option A: Using Chocolatey (Recommended for Windows)

**Step 1: Install Chocolatey (if not installed)**
```powershell
# Run PowerShell as Administrator
# Check if Chocolatey is installed
choco --version

# If not installed, run:
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

**Step 2: Install AWS SAM CLI**
```powershell
# Run PowerShell as Administrator
choco install aws-sam-cli -y
```

**Step 3: Verify Installation**
```powershell
sam --version
# Expected output: SAM CLI, version 1.