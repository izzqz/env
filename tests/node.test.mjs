import { test } from "node:test";
import assert from "node:assert";
import env from "@izzqz/env";

test("env - basic functionality", () => {
  // Set test environment variable
  process.env.TEST_VAR = "test_value";

  assert.strictEqual(env("TEST_VAR"), "test_value");
  assert.strictEqual(env("NON_EXISTENT"), undefined);
  assert.strictEqual(env("NON_EXISTENT", "default"), "default");
});

test("env - with default values", () => {
  assert.strictEqual(
    env("ANOTHER_NON_EXISTENT", "default_value"),
    "default_value",
  );
  assert.strictEqual(env("ANOTHER_NON_EXISTENT", ""), "");
  assert.strictEqual(env("ANOTHER_NON_EXISTENT", undefined), undefined);
});

test("env_novalue - tracking missing variables", async (t) => {
  env.env_novalue.clear(); // Reset the set

  // Access non-existent variables
  env("REQUIRED_VAR1");
  env("REQUIRED_VAR2");

  assert.strictEqual(env.env_novalue.size, 2);
  assert.strictEqual(env.env_novalue.has("REQUIRED_VAR1"), true);
  assert.strictEqual(env.env_novalue.has("REQUIRED_VAR2"), true);
});

test("EnvironmentVariableError - single variable", async (t) => {
  const error = new env.EnvironmentVariableError(new Set(["TEST_VAR"]));
  assert.strictEqual(
    error.message,
    "Environment variable required: TEST_VAR",
  );
  assert.strictEqual(error.name, "EnvironmentVariableError");
  assert.strictEqual(
    error.toString(),
    "EnvironmentVariableError\n  TEST_VAR",
  );
});

test("EnvironmentVariableError - multiple variables", async (t) => {
  const error = new env.EnvironmentVariableError(new Set(["VAR1", "VAR2"]));
  assert.strictEqual(
    error.message,
    "Environment variables required: VAR1, VAR2",
  );
  assert.strictEqual(error.name, "EnvironmentVariableError");
  assert.strictEqual(
    error.toString(),
    "EnvironmentVariableError\n  VAR1\n  VAR2",
  );
});

test("assertAndThrow - no missing variables", async (t) => {
  env.env_novalue.clear();
  env.assertAndThrow(); // Should not throw
});

test("assertAndThrow - with missing variables", () => {
  env.env_novalue.clear();
  env("MISSING_VAR1");
  env("MISSING_VAR2");

  assert.throws(
    () => env.assertAndThrow(),
    {
      name: "EnvironmentVariableError",
      message: "Environment variables required: MISSING_VAR1, MISSING_VAR2",
    },
  );
});

test("env - cleanup test environment", async (t) => {
  // Clean up any test environment variables
  delete process.env.TEST_VAR;
  env.env_novalue.clear();
});
