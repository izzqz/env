export const env_novalue = new Set<string>();

export class EnvironmentVariableError extends Error {
    envs: Set<string>;

    constructor(envs: Set<string>) {
        let message: string;
        if (envs.size === 1) {
            const [env_name] = envs;
            message = `Environment variable required: ${env_name}`;
        } else {
            message = `Environment variables required: ${
                Array.from(envs).join(', ')
            }`;
        }
        super(message);
        this.name = 'EnvironmentVariableError';
        this.envs = envs;
    }

    override toString() {
        return `${this.name}\n  ${Array.from(this.envs).join('\n  ')}`;
    }
}

export function env(
    key: string,
    defaultValue?: string,
): string | undefined {
    const value = get_env(key);

    if (value === undefined) {
        if (defaultValue === undefined || Object.is(defaultValue, undefined)) {
            env_novalue.add(key);
            return;
        } else {
            return defaultValue;
        }
    }

    return value;
}

Object.defineProperties(env, {
    env_novalue: { get: () => env_novalue },
    EnvironmentVariableError: { value: EnvironmentVariableError },
    assertAndThrow: { value: assertAndThrow },
    assertAndPanic: { value: assertAndPanic },
});

export default env;

export function assertAndThrow() {
    if (env_novalue.size === 0) return;

    throw new EnvironmentVariableError(env_novalue);
}

export function assertAndPanic() {
    if (env_novalue.size === 0) return;

    if (env_novalue.size === 1) {
        console.error(
            `Environment variable required: ${env_novalue.keys()[0]}`,
        );
        panic();
    } else {
        console.error(
            `Environment variables required:\n  ${
                Array.from(env_novalue).join('\n  ')
            }`,
        );
        panic();
    }
}

function get_env(key: string) {
    if (globalThis.process) {
        return globalThis.process.env[key];
    }
    if (globalThis.Deno) {
        return globalThis.Deno.env.get(key);
    }
    if (globalThis.Bun) {
        return globalThis.Bun.env[key];
    }
}

function panic() {
    if (globalThis.process) {
        globalThis.process.exit(1);
    }
    if (globalThis.Deno) {
        globalThis.Deno.exit(1);
    }
    if (globalThis.Bun) {
        globalThis.Bun.exit(1);
    }
}
