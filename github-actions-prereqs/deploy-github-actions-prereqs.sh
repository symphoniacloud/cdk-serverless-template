#!/bin/bash

if [[ $# -lt 1 ]]; then
    echo "Invalid number of arguments"
    echo
    echo "usage:"
    echo "$ ./deploy.sh GITHUB_ORG [OIDC_PROVIDER_ARN]"
    echo
    exit 2
fi

if [[ $# -eq 2 ]]; then
  OIDC_PROVIDER_ARN="$2"
else
  OIDC_PROVIDER_ARN="NONE"
fi

set -euo pipefail

cfn-lint template.yaml

aws cloudformation deploy \
    --stack-name github-aws-oidc-cdk-serverless-template \
    --parameter-overrides GithubOrganization="$1" OIDCProviderArn="$OIDC_PROVIDER_ARN" \
    --template-file template.yaml \
    --capabilities CAPABILITY_IAM \
    --no-fail-on-empty-changeset

echo Stack deployed as github-aws-oidc-cdk-serverless-template
