import { assertEquals, assertThrows } from "jsr:@std/assert";
import env from "../dist/env.mjs";

Deno.test("env - basic functionality", () => {
  // Set test environment variable
  Deno.env.set("TEST_VAR", "test_value");

  assertEquals(env("TEST_VAR"), "test_value");
  assertEquals(env("NON_EXISTENT"), undefined);
  assertEquals(env("NON_EXISTENT", "default"), "default");
});

Deno.test("env - with default values", () => {
  assertEquals(env("ANOTHER_NON_EXISTENT", "default_value"), "default_value");
  assertEquals(env("ANOTHER_NON_EXISTENT", ""), "");
  assertEquals(env("ANOTHER_NON_EXISTENT", undefined), undefined);
});

Deno.test("env_novalue - tracking missing variables", () => {
  env.env_novalue.clear(); // Reset the set

  // Access non-existent variables
  env("REQUIRED_VAR1");
  env("REQUIRED_VAR2");

  assertEquals(env.env_novalue.size, 2);
  assertEquals(env.env_novalue.has("REQUIRED_VAR1"), true);
  assertEquals(env.env_novalue.has("REQUIRED_VAR2"), true);
});

Deno.test("EnvironmentVariableError - single variable", () => {
  const error = new env.EnvironmentVariableError(new Set(["TEST_VAR"]));
  assertEquals(error.message, "Environment variable required: TEST_VAR");
  assertEquals(error.name, "EnvironmentVariableError");
  assertEquals(error.toString(), "EnvironmentVariableError\n  TEST_VAR");
});

Deno.test("EnvironmentVariableError - multiple variables", () => {
  const error = new env.EnvironmentVariableError(new Set(["VAR1", "VAR2"]));
  assertEquals(error.message, "Environment variables required: VAR1, VAR2");
  assertEquals(error.name, "EnvironmentVariableError");
  assertEquals(error.toString(), "EnvironmentVariableError\n  VAR1\n  VAR2");
});

Deno.test("assertAndThrow - no missing variables", () => {
  env.env_novalue.clear();
  env.assertAndThrow(); // Should not throw
});

Deno.test("assertAndThrow - with missing variables", () => {
  env.env_novalue.clear();
  env("MISSING_VAR1");
  env("MISSING_VAR2");

  assertThrows(
    () => env.assertAndThrow(),
    env.EnvironmentVariableError,
    "Environment variables required: MISSING_VAR1, MISSING_VAR2",
  );
});

Deno.test("env - cleanup test environment", () => {
  // Clean up any test environment variables
  try {
    Deno.env.delete("TEST_VAR");
  } catch {
    // Ignore if variable doesn't exist
  }
  env.env_novalue.clear();
});
