# React-NodeJS EKS Application

A full-stack containerized application deployed on Amazon EKS (Elastic Kubernetes Service) with automated CI/CD pipeline using GitHub Actions.

## Architecture

- **Frontend**: React application served with Nginx
- **Backend**: Node.js/Express API server
- **Infrastructure**: Amazon EKS cluster
- **Container Registry**: Amazon ECR
- **Load Balancing**: AWS Load Balancer Controller
- **CI/CD**: GitHub Actions workflow

## Features

- **Containerized Applications**: Docker containers for both frontend and backend
- **Kubernetes Orchestration**: Managed EKS cluster with auto-scaling
- **Automated Deployment**: GitHub Actions workflow for complete CI/CD
- **Load Balancing**: Application Load Balancer with health checks
- **Service Discovery**: Internal communication between frontend and backend
- **Infrastructure as Code**: eksctl configuration files

## Prerequisites

- **AWS Account** with appropriate permissions
- **GitHub repository** with Actions enabled
- **Local Development Tools**:
  - Docker
  - kubectl
  - eksctl
  - AWS CLI

## Setup

### Bootstrap Steps. Run on your local machine.

<BR>

**Step 1: Retrieve the SHA-1 Fingerprint (Thumbprint) of GitHub's OIDC SSL Certificate**

Run the following command to fetch the SHA-1 fingerprint (thumbprint) of GitHub's OIDC provider SSL certificate (token.actions.githubusercontent.com) in the correct format for AWS:

```bash
echo | openssl s_client -servername token.actions.githubusercontent.com -showcerts -connect token.actions.githubusercontent.com:443 2>/dev/null | openssl x509 -fingerprint -noout | sed 's/SHA1 Fingerprint=//' | tr -d ':'
```

Expected Output: A 40-character hexadecimal string.

<BR>

**Step 2: Create the OIDC Provider in AWS**

Using the thumbprint retrieved in Step 1, create an OIDC provider in AWS to allow GitHub Actions to authenticate via OIDC:

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list <40-character hexadecimal string from step 1>
```

Expected Output:
```json
{
    "OpenIDConnectProviderArn": "arn:aws:iam::154864927037:oidc-provider/token.actions.githubusercontent.com"
}
```

<BR>

**Step 3: Verify the OIDC Provider**

Verify that the OIDC provider was created successfully:

```bash
aws iam list-open-id-connect-providers
```

Expected Output:
```json
{
    "OpenIDConnectProviderList": [
        {
            "Arn": "arn:aws:iam::154864927037:oidc-provider/token.actions.githubusercontent.com"
        }
    ]
}
```

<BR>

**Step 4: Clone the repository locally and configure GitHubActionsRole and GitHubActionsPolicy**

<BR>

**Note:** The GitHubActionsRole and its associated policy (GitHubActionsPolicy) grant GitHub Actions the necessary permissions to deploy your infrastructure. These resources should be managed via Terraform under `project_bootstrap` directory.

Navigate to the Bootstrap Directory:

```bash
cd Terraform-Experiment/terraform/project_bootstrap/iam_json
```

Create/update IAM JSON files (Policy & Role) inside:
- `Terraform-Experiment/terraform/project_bootstrap/iam_json/GitHubActionsPolicy.json`
- `Terraform-Experiment/terraform/project_bootstrap/iam_json/GitHubActionsRole.json`

**Note:** In the GitHubActionsPolicy, broader permissions are granted. For improved security, consider scoping down each statement to specific resources or permissions.

<BR>

**Step 5: Update terraform state S3 bucket configuration**

Update configuration in `Terraform-Experiment/terraform/project_bootstrap/tfvars/main.tfvar`:

```hcl
account_number    = "154864927037"
aws_region        = "ap-southeast-2"
state_bucket_name = "terraform-state-19042025"
environment       = "assessment"
```

<BR>

**Step 6: Initialize the Bootstrap Project**

Initialize the Terraform project in the bootstrap directory to create the state bucket, DynamoDB table, and IAM role/policy.

Navigate to the Bootstrap Directory (if not already there):
```bash
cd Terraform-Experiment/terraform/project_bootstrap
```

Initialize Terraform:
```bash
terraform init
```

Generate a Plan:
```bash
terraform plan --var-file=tfvars/main.tfvar
```

Apply the Changes: If the plan looks correct, apply it to create the resources:
```bash
terraform apply --var-file=tfvars/main.tfvar
```

This creates:
- The Terraform state bucket (e.g. terraform-state-19042025)
- The DynamoDB table (terraform-locks) for state locking
- The GitHubActionsRole and GitHubActionsPolicy

<BR>

**Step 7: Verify the Setup**

Check the State Bucket:
```bash
aws s3 ls --region ap-southeast-2 | grep terraform-state
```

Check the DynamoDB Table:
```bash
aws dynamodb list-tables --region ap-southeast-2
```

Check the IAM Role:
```bash
aws iam get-role --role-name GitHubActionsRole
```

### GitHub Secrets Configuration

Set up the following repository environment variable:

**Variables:**
- `AWS_ACCOUNT`: Your AWS account ID

### Local Development

```bash
# Clone the repository
git clone 04React-NodeJS-EKS-App
cd 04React-NodeJS-EKS-App

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

## Deployment

### Automated Deployment (Recommended)

1. **Trigger GitHub Actions Workflow**:
   - Go to GitHub Actions tab
   - Select "EKS Deployment and Cleanup"
   - Choose "deploy" action
   - Enter cluster name (e.g., "staging-cluster")
   - Run workflow

2. **The workflow will**:
   - Build and push Docker images to ECR
   - Create EKS cluster with eksctl
   - Install AWS Load Balancer Controller
   - Deploy frontend and backend applications
   - Provision Application Load Balancers

## Project Structure

```
04React-NodeJS-EKS-App/
├── .github/workflows/
│   └── deployment.yml          # GitHub Actions CI/CD pipeline
├── eksctl/
│   └── cluster.yaml           # EKS cluster configuration
├── k8s/
│   ├── backend.yaml           # Backend Kubernetes manifests
│   └── frontend.yaml          # Frontend Kubernetes manifests
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── backend/
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
└── README.md
```

## Configuration

### EKS Cluster Configuration

The cluster is configured with:
- **Node Group**: 3 x m5.large instances
- **Networking**: Private subnets with public ALB
- **Add-ons**: AWS Load Balancer Controller, EBS CSI Driver
- **IAM**: Comprehensive policies for ALB, EC2, and EKS operations

### Application Configuration

**Frontend (React + Nginx)**:
- Serves static React build files
- Proxies `/api/*` requests to backend service
- Health check endpoint at `/health`

**Backend (Node.js + Express)**:
- REST API with CORS enabled
- Health check endpoint at `/api/health`
- Sample endpoint: `/api/mycats`

## Accessing the Application

After deployment, access your application:

1. **Get the frontend ALB URL**:
```bash
kubectl get svc -n app frontend -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

2. **Open in browser**: `http://<alb-url>`

## Result

The deployed application successfully displays "Hinson's Cats" with data fetched from the backend API:

![Application Screenshot](result/image.png)


### Common Commands

```bash
# Check pod status
kubectl get pods -n app

# Check service status
kubectl get svc -n app

# View pod logs
kubectl logs -n app -l app=frontend
kubectl logs -n app -l app=backend

# Check ALB status
aws elbv2 describe-load-balancers --names <alb-name>

# Check target group health
aws elbv2 describe-target-health --target-group-arn <target-group-arn>
```

### Troubleshooting Guide

**Issue**: ALB not accessible from internet
- **Solution**: Ensure security group allows inbound traffic on port 80
```bash
aws ec2 authorize-security-group-ingress --group-id <sg-id> --protocol tcp --port 80 --cidr 0.0.0.0/0
```

**Issue**: Frontend shows API errors
- **Solution**: Check if backend service is running and nginx proxy configuration

**Issue**: Pods not starting
- **Solution**: Check ECR permissions and image pull secrets

## Cleanup

### Automated Cleanup
1. Go to GitHub Actions
2. Select "EKS Deployment and Cleanup"
3. Choose "destroy" action
4. Run workflow

### Manual Cleanup
```bash
# Delete applications
kubectl delete -f k8s/

# Delete cluster
eksctl delete cluster -f eksctl/cluster.yaml

# Delete ECR repositories
aws ecr delete-repository --repository-name react-frontend --force
aws ecr delete-repository --repository-name node-backend --force
```
