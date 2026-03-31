/**
 * Unit tests for output normalization
 * Tests various output formats to ensure they compare correctly
 */

const assert = require("assert");

// Copy of normalization functions (for testing)
const normalizeOutput = (output) => {
  if (!output) return ""
  
  let normalized = output
    .trim()                              // Remove leading/trailing whitespace
    .replace(/[\[\]()]/g, "")           // Remove brackets and parentheses: [], ()
    .replace(/,/g, " ")                 // Replace commas with spaces
    .replace(/\r\n/g, " ")              // Replace Windows newlines with spaces
    .replace(/\n/g, " ")                // Replace Unix newlines with spaces
    .replace(/\s+/g, " ")               // Replace multiple consecutive spaces with single space
    .trim()                              // Final trim
  
  return normalized
}

const deepNormalizeOutput = (output) => {
  const normalized = normalizeOutput(output)
  const tokens = normalized
    .split(/\s+/)
    .filter(token => token.length > 0)
    .join(" ")
  
  return tokens
}

const compareOutputs = (actual, expected) => {
  const normalizedActual = deepNormalizeOutput(actual)
  const normalizedExpected = deepNormalizeOutput(expected)
  
  return {
    passed: normalizedActual === normalizedExpected,
    normalizedExpected: normalizedExpected,
    normalizedActual: normalizedActual,
    raw: {
      expected: expected,
      actual: actual
    }
  }
}

// Test Suite
console.log("🧪 Running Output Normalization Tests...\n")

// Test 1: Array brackets with spaces
{
  const result = compareOutputs("[0, 1]", "0 1")
  assert.strictEqual(result.passed, true, "Should match: [0, 1] vs 0 1")
  console.log("✅ Test 1: Array brackets with spaces - [0, 1] ≈ 0 1")
}

// Test 2: Parentheses with commas
{
  const result = compareOutputs("(0,1)", "0 1")
  assert.strictEqual(result.passed, true, "Should match: (0,1) vs 0 1")
  console.log("✅ Test 2: Parentheses with commas - (0,1) ≈ 0 1")
}

// Test 3: Newline separated
{
  const result = compareOutputs("0\n1", "0 1")
  assert.strictEqual(result.passed, true, "Should match: 0\\n1 vs 0 1")
  console.log("✅ Test 3: Newline separated - 0\\n1 ≈ 0 1")
}

// Test 4: Multiple newlines
{
  const result = compareOutputs("0\n\n1", "0 1")
  assert.strictEqual(result.passed, true, "Should match: 0\\n\\n1 vs 0 1")
  console.log("✅ Test 4: Multiple newlines - 0\\n\\n1 ≈ 0 1")
}

// Test 5: Extra spaces
{
  const result = compareOutputs("  0  ,  1  ", "0 1")
  assert.strictEqual(result.passed, true, "Should match with extra spaces")
  console.log("✅ Test 5: Extra spaces - '  0  ,  1  ' ≈ 0 1")
}

// Test 6: Windows newlines
{
  const result = compareOutputs("0\r\n1", "0 1")
  assert.strictEqual(result.passed, true, "Should match: 0\\r\\n1 vs 0 1")
  console.log("✅ Test 6: Windows newlines - 0\\r\\n1 ≈ 0 1")
}

// Test 7: Complex array format
{
  const result = compareOutputs("[0, 1, 2, 3]", "0 1 2 3")
  assert.strictEqual(result.passed, true, "Should match: [0, 1, 2, 3] vs 0 1 2 3")
  console.log("✅ Test 7: Complex array - [0, 1, 2, 3] ≈ 0 1 2 3")
}

// Test 8: String tuple format
{
  const result = compareOutputs("(0, 1, 2)", "0 1 2")
  assert.strictEqual(result.passed, true, "Should match tuple format")
  console.log("✅ Test 8: Tuple format - (0, 1, 2) ≈ 0 1 2")
}

// Test 9: Single value
{
  const result = compareOutputs("[42]", "42")
  assert.strictEqual(result.passed, true, "Should match: [42] vs 42")
  console.log("✅ Test 9: Single value - [42] ≈ 42")
}

// Test 10: Mixed formatting
{
  const result = compareOutputs("[\n  0,\n  1\n]", "0 1")
  assert.strictEqual(result.passed, true, "Should match mixed formatting")
  console.log("✅ Test 10: Mixed formatting - [\\n  0,\\n  1\\n] ≈ 0 1")
}

// Test 11: Should NOT match - different values
{
  const result = compareOutputs("[0, 1]", "1 2")
  assert.strictEqual(result.passed, false, "Should NOT match: [0, 1] vs 1 2")
  console.log("✅ Test 11: Different values correctly fail - [0, 1] ≠ 1 2")
}

// Test 12: Empty string
{
  const result = compareOutputs("", "")
  assert.strictEqual(result.passed, true, "Should match: empty vs empty")
  console.log("✅ Test 12: Empty strings - '' ≈ ''")
}

// Test 13: Whitespace only (should match empty)
{
  const result = compareOutputs("   ", "")
  assert.strictEqual(result.passed, true, "Should match: whitespace only vs empty")
  console.log("✅ Test 13: Whitespace only - '   ' ≈ ''")
}

// Test 14: Multi-digit numbers
{
  const result = compareOutputs("[123, 456, 789]", "123 456 789")
  assert.strictEqual(result.passed, true, "Should match multi-digit numbers")
  console.log("✅ Test 14: Multi-digit numbers - [123, 456, 789] ≈ 123 456 789")
}

// Test 15: String outputs with array format
{
  const result = compareOutputs(`["hello", "world"]`, "hello world")
  assert.strictEqual(result.passed, true, "Should match string array format")
  console.log('✅ Test 15: String array - ["hello", "world"] ≈ hello world')
}

// Detailed example
console.log("\n📊 Detailed Example:")
const exampleResult = compareOutputs("[0, 1]", "(0,1)\n")
console.log("Input 1 (raw):         '[0, 1]'")
console.log("Input 2 (raw):         '(0,1)\\n'")
console.log("Result passed:         ", exampleResult.passed)
console.log("Normalized 1:          '", exampleResult.normalizedExpected, "'")
console.log("Normalized 2:          '", exampleResult.normalizedActual, "'")

console.log("\n✅ All tests passed!")
console.log("\n📝 Summary:")
console.log("- Handles brackets [] and parentheses ()")
console.log("- Removes commas")
console.log("- Normalizes newlines (\\n, \\r\\n)")
console.log("- Handles multiple spaces")
console.log("- Preserves values and ordering")
console.log("- Works with multi-digit numbers and strings")
