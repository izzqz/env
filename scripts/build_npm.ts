import { build, emptyDir } from '@deno/dnt';

await emptyDir('./build');

await build({
    entryPoints: ['./mod.ts'],
    outDir: './build',
    shims: {
        deno: false,
    },
    package: {
        name: '@izzqz/env',
        version: Deno.args[0],
        description:
            'Minimal environment variable library. Runtime agnostic, no dependencies',
        license: 'MIT',
        repository: {
            type: 'git',
            url: 'git+https://github.com/izzqz/env.git',
        },
        bugs: {
            url: 'https://github.com/izzqz/env/issues',
        },
    },
    postBuild() {
        Deno.copyFileSync('LICENSE', 'build/LICENSE');
        Deno.copyFileSync('README.md', 'build/README.md');
    },
});
