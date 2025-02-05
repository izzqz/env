import { build, emptyDir } from 'https://deno.land/x/dnt/mod.ts';

await emptyDir('./npm');

await build({
    entryPoints: ['./mod.ts'],
    outDir: './npm',
    shims: {
        deno: true,
    },
    package: {
        name: '@izzqz/env',
        version: '0.1.0',
        description: 'Environment variables helper for Node.js, Deno and Bun',
        license: 'MIT',
        repository: {
            type: 'git',
            url: 'git+https://github.com/izzqz/env.git',
        },
        bugs: {
            url: 'https://github.com/izzqz/env/issues',
        },
        engines: {
            node: '>=16',
        },
    },
    typeCheck: true,
    test: false,
});
