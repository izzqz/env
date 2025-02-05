/**
 * @module @izzqz/env
 */

/**
 * List of environment variables without a value
 *
 * @example
 * ```ts
 * env.env_novalue; // Set<string>
 * env.env_novalue.has('FOO'); // false
 * ```
 *
 * @type {Set<string>}
 */
export const env_novalue = new Set<string>();

/**
 * Error thrown when environment variables are missing
 *
 * @example
 * ```ts
 * throw new env.EnvironmentVariableError(['FOO']);
 * ```
 *
 * @type {EnvironmentVariableError}
 */
export class EnvironmentVariableError extends Error {
  envs: Set<string>;

  constructor(envs: Set<string>) {
    let message: string;
    if (envs.size === 1) {
      const [env_name] = Array.from(envs);
      message = `Environment variable required: ${env_name}`;
    } else {
      message = `Environment variables required: ${
        Array.from(envs).join(", ")
      }`;
    }
    super(message);
    this.name = "EnvironmentVariableError";
    this.envs = envs;
  }

  override toString(): string {
    return `${this.name}\n  ${Array.from(this.envs).join("\n  ")}`;
  }
}

/**
 * Assert that environment variables are set and throw an error if they are not.
 *
 * @example
 * ```ts
 * env.assertAndThrow();
 * ```
 *
 * @returns {void}
 */
export function assertAndThrow(): void {
  if (env_novalue.size === 0) return;
  throw new EnvironmentVariableError(env_novalue);
}

interface GlobalWithEnv {
  process?: { env: Record<string, string | undefined> };
  Deno?: { env: { get(key: string): string | undefined } };
  Bun?: { env: Record<string, string | undefined> };
}

function get_env(key: string): string | undefined {
  const g = globalThis as GlobalWithEnv;

  if (g.process) {
    return g.process.env[key];
  }

  if (g.Deno) {
    return g.Deno.env.get(key);
  }

  if (g.Bun) {
    return g.Bun.env[key];
  }
}

/**
 * Environment function type with static properties
 */
export interface EnvFunction {
  (key: string, defaultValue?: string): string | undefined;
  env_novalue: Set<string>;
  EnvironmentVariableError: typeof EnvironmentVariableError;
  assertAndThrow: typeof assertAndThrow;
}

/**
 * Get an environment variable.
 *
 * @example
 * ```ts
 * env('FOO'); // 'bar'
 * env('FOO', 'default'); // 'bar'
 * env('BAR'); // undefined
 * env('BAR', 'default'); // 'default'
 * env('BAZ', undefined); // env not required
 * ```
 * @param {string} key - Environment variable name
 * @param {string} [defaultValue] - Default value if not set
 * @returns {string | undefined} Environment variable default value
 */
export function env(key: string, defaultValue?: string): string | undefined {
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

// Add static properties to env function
const envWithProps = Object.assign(env, {
  env_novalue,
  EnvironmentVariableError,
  assertAndThrow,
}) as EnvFunction;

// For CommonJS compatibility
// @ts-ignore: module is only available in CommonJS environments
if (typeof module !== "undefined") module.exports = envWithProps;

// For ESM
export default envWithProps;
