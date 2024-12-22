# Default recipe: run `just` to display the list of tasks
_:
  @just --list --justfile {{justfile()}} --unsorted

# Install dependencies
install:
	yarn install --immutable

# Build formgator and its demos
build: install
	yarn workspaces foreach --all --parallel --topological-dev run build

# Run all tests
test: build
	yarn workspaces foreach --all --interlaced run test

# Update the version and the changelog
version: install
	# Update package.json and produce the changelog
	yarn changeset version

	# Keep jsr.json in sync with package.json
	yarn node -e 'fs.writeFileSync("jsr.json",fs.readFileSync("jsr.json","utf8").replace(/"version": ".+"/,`"version": "${process.env.npm_package_version}"`))'

# Release formgator to npm and jsr
release: build
	yarn changeset publish
	yarn dlx --quiet jsr publish
