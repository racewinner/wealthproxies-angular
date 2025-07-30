#!/bin/bash

# Parse build-info.txt to extract VERSION and BUILD_NUMBER
BUILD_INFO_FILE="./build/build-info.txt"
if [[ -f "$BUILD_INFO_FILE" ]]; then
    VERSION=$(grep -E '^VERSION=' "$BUILD_INFO_FILE" | cut -d'=' -f2)
    BUILD_NUMBER=$(grep -E '^BUILD_NUMBER=' "$BUILD_INFO_FILE" | cut -d'=' -f2)
else
    echo "Error: $BUILD_INFO_FILE not found."
    exit 1
fi

if [[ -z "$VERSION" || -z "$BUILD_NUMBER" ]]; then
    echo "Error: VERSION or BUILD_NUMBER not found in $BUILD_INFO_FILE."
    exit 1
fi

# Construct the new tag
TAG="${VERSION}-${BUILD_NUMBER}"

# ECR repository URL
ECR_URL="055566003851.dkr.ecr.us-east-1.amazonaws.com/wealthproxies/wealthproxies-web"

# Authenticate to AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 055566003851.dkr.ecr.us-east-1.amazonaws.com

# Build, tag, and push the Docker image
docker build --platform linux/amd64 -f Dockerfile -t wealthproxies/wealthproxies-web:"$TAG" .
docker tag wealthproxies/wealthproxies-web:"$TAG" "$ECR_URL":"$TAG"
docker push "$ECR_URL":"$TAG"

echo "Docker image successfully built and pushed with tag: $TAG"
