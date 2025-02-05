import { expect, test } from "bun:test";
import env from "../dist/env.mjs";

test("env - basic functionality", () => {
    // Set test environment variable
    process.env.TEST_VAR = "test_value";

    expect(env("TEST_VAR")).toBe("test_value");
    expect(env("NON_EXISTENT")).toBe(undefined);
    expect(env("NON_EXISTENT", "default")).toBe("default");
});

test("env - with default values", () => {
    expect(env("ANOTHER_NON_EXISTENT", "default_value")).toBe("default_value");
    expect(env("ANOTHER_NON_EXISTENT", "")).toBe("");
    expect(env("ANOTHER_NON_EXISTENT", undefined)).toBe(undefined);
});

test("env_novalue - tracking missing variables", () => {
    env.env_novalue.clear(); // Reset the set

    // Access non-existent variables
    env("REQUIRED_VAR1");
    env("REQUIRED_VAR2");

    expect(env.env_novalue.size).toBe(2);
    expect(env.env_novalue.has("REQUIRED_VAR1")).toBe(true);
    expect(env.env_novalue.has("REQUIRED_VAR2")).toBe(true);
});

test("EnvironmentVariableError - single variable", () => {
    const error = new env.EnvironmentVariableError(new Set(["TEST_VAR"]));
    expect(error.message).toBe("Environment variable required: TEST_VAR");
    expect(error.name).toBe("EnvironmentVariableError");
    expect(error.toString()).toBe("EnvironmentVariableError\n  TEST_VAR");
});

test("EnvironmentVariableError - multiple variables", () => {
    const error = new env.EnvironmentVariableError(new Set(["VAR1", "VAR2"]));
    expect(error.message).toBe("Environment variables required: VAR1, VAR2");
    expect(error.name).toBe("EnvironmentVariableError");
    expect(error.toString()).toBe("EnvironmentVariableError\n  VAR1\n  VAR2");
});

test("assertAndThrow - no missing variables", () => {
    env.env_novalue.clear();
    expect(() => env.assertAndThrow()).not.toThrow();
});

test("assertAndThrow - with missing variables", () => {
    env.env_novalue.clear();
    env("MISSING_VAR1");
    env("MISSING_VAR2");

    expect(() => env.assertAndThrow()).toThrow(env.EnvironmentVariableError);
    expect(() => env.assertAndThrow()).toThrow(
        "Environment variables required: MISSING_VAR1, MISSING_VAR2",
    );
});

test("env - cleanup test environment", () => {
    // Clean up any test environment variables
    delete process.env.TEST_VAR;
    env.env_novalue.clear();
});
