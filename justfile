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
