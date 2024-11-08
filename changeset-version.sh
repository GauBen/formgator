#!/usr/bin/env bash
# This script is currently unused as Node hangs running "changeset version" on GitHub
set -euxo pipefail

# Changeset runs git reset --hard, so we need to reinstall dependencies
yarn install --immutable

# Update package.json and produce the changelog
# (yarn hangs, use node instead)
yarn dlx changeset version

# Keep jsr.json in sync with package.json
yarn node -e 'fs.writeFileSync("jsr.json",fs.readFileSync("jsr.json","utf8").replace(/"version": ".+"/,`"version": "${process.env.npm_package_version}"`))'
