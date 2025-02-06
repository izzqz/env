default:
    @just --list

# Build CommonJS version
build-cjs:
    npm exec tsc -- -p config/tsconfig.cjs.json
    mv dist/temp-cjs/env.js dist/env.cjs
    rm -rf dist/temp-cjs

# Build ESM version
build-esm:
    npm exec tsc -- -p config/tsconfig.esm.json
    mv dist/temp-esm/env.js dist/env.mjs
    mv dist/temp-esm/env.d.ts dist/env.d.ts
    rm -rf dist/temp-esm

# Build all versions
build: clean build-cjs build-esm 

# Clean build artifacts
clean:
    @rm -rf dist

# Run Deno tests
test-deno:
    deno test --allow-env --node-modules-dir --no-lock tests/deno.test.ts

# Run Node.js tests (both CJS and ESM)
test-node:
    node --test tests/node.test.cjs
    node --test tests/node.test.mjs

# Run Bun tests
test-bun:
    bun test tests/bun.test.ts

# Run all tests
test: build test-deno test-node test-bun

# Bump version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease | from-git]
release version:
    git checkout main
    git pull
    npm version {{version}} --preid dev --sign-git-tag
    node -e "const fs = require('fs'); const pkg = require('./package.json'); let jsr = JSON.parse(fs.readFileSync('jsr.json', 'utf8')); jsr.version = pkg.version; fs.writeFileSync('jsr.json', JSON.stringify(jsr, null, 2));"
    git add jsr.json
    git commit -m "chore: sync jsr.json version"
    git push
    git push --tags
