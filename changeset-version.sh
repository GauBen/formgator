#!/usr/bin/env bash
set -euxo pipefail

# Changeset runs git reset --hard, so we need to reinstall dependencies
yarn install --immutable

# Update package.json and produce the changelog
yarn changeset version

# Keep jsr.json in sync with package.json
yarn node -e 'fs.writeFileSync("jsr.json",fs.readFileSync("jsr.json","utf8").replace(/"version": ".+"/,`"version": "${process.env.npm_package_version}"`))'
