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
    @rm -rf dist coverage

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

# Run Deno tests with coverage
test-deno-coverage:
    @mkdir -p coverage/temp/deno coverage/reports
    deno test --coverage=coverage/temp/deno --allow-env --node-modules-dir --no-lock tests/deno.test.ts
    deno coverage coverage/temp/deno --lcov > coverage/reports/deno.lcov
    genhtml --ignore-errors source,range coverage/reports/deno.lcov --output-directory coverage/reports/deno

# Run Node.js tests with coverage
test-node-coverage:
    @mkdir -p coverage/temp coverage/reports
    npx c8 --reporter=lcov node --test tests/node.test.cjs tests/node.test.mjs
    mv coverage/lcov.info coverage/reports/node.lcov
    genhtml --ignore-errors source,range coverage/reports/node.lcov --output-directory coverage/reports/node
    npx c8 report --reporter=text

# Run Bun tests with coverage
test-bun-coverage:
    @mkdir -p coverage/reports
    bun test --coverage tests/bun.test.ts
    @echo "Note: Bun coverage output is console-only for now"

# Run all tests with coverage
test-coverage: build
    @rm -rf coverage
    @mkdir -p coverage/temp coverage/html coverage/reports
    @just test-deno-coverage
    @just test-node-coverage
    @just test-bun-coverage
    @echo "Merging coverage reports..."
    @mkdir -p coverage/temp/merged
    # Merge Node.js coverage first (includes both CJS and MJS)
    cp coverage/reports/node.lcov coverage/temp/merged/combined.lcov
    # Add Deno-specific coverage data
    grep -v "SF:.*env\.mjs" coverage/reports/deno.lcov >> coverage/temp/merged/combined.lcov
    genhtml --ignore-errors source,range coverage/temp/merged/combined.lcov --output-directory coverage/html
    # Generate JSON coverage data for the badge
    lcov --summary coverage/temp/merged/combined.lcov | grep -E "lines|functions|branches" | awk '{print $1 " " $3}' | jq -R 'split(" ") | {type:.[0], pct:.[1]}' | jq -s '{total: {"lines": .[0], "functions": .[1], "branches": .[2]}}' > coverage/coverage.json
    @echo "Individual reports in coverage/reports/{deno,node}/index.html"
    @echo "Combined coverage report in coverage/html/index.html"
    @rm -rf coverage/temp

# Bump version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease | from-git]
release version:
    git checkout main
    git pull
    npm version {{version}} --preid dev --sign-git-tag
    node -e "const fs = require('fs'); const pkg = require('./package.json'); let jsr = JSON.parse(fs.readFileSync('jsr.json', 'utf8')); jsr.version = pkg.version; fs.writeFileSync('jsr.json', JSON.stringify(jsr, null, 2));"
    git add jsr.json
    git commit --amend --no-edit
    git tag -f v$(node -p "require('./package.json').version")
    git push -f
    git push --tags -f
