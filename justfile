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
build: clean
    just build-cjs
    just build-esm

# Clean build artifacts
clean:
    @rm -rf dist

# Run Deno tests
test-deno:
    deno test tests/deno.test.ts

# Run all tests
test: test-deno
