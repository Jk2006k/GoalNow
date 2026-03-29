// Predefined DSA problems with test cases
export const problems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    category: "Array",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to target*.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10⁴",
      "-10⁹ <= nums[i] <= 10⁹",
      "-10⁹ <= target <= 10⁹",
      "Only one valid answer exists.",
    ],
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
      { input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
      { input: { nums: [1, 5, 3, 7], target: 8 }, expected: [1, 3] },
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your solution here
  
};`,
      python: `def twoSum(nums, target):
    # Write your solution here
    pass`,
    },
    solution: {
      javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
}`,
    },
    evaluator: (code, { nums, target }) => {
      try {
        // eslint-disable-next-line no-new-func
        const fn = new Function(
          "nums",
          "target",
          `${code}\nreturn twoSum(nums, target);`
        );
        return fn([...nums], target);
      } catch (e) {
        throw new Error(e.message);
      }
    },
    compareResults: (result, expected) => {
      if (!Array.isArray(result) || result.length !== 2) return false;
      return (
        (result[0] === expected[0] && result[1] === expected[1]) ||
        (result[0] === expected[1] && result[1] === expected[0])
      );
    },
  },
  {
    id: 2,
    title: "Reverse String",
    difficulty: "Easy",
    category: "String",
    description: `Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array **in-place** with O(1) extra memory.`,
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
      },
    ],
    constraints: [
      "1 <= s.length <= 10⁵",
      "s[i] is a printable ascii character.",
    ],
    testCases: [
      {
        input: { s: ["h", "e", "l", "l", "o"] },
        expected: ["o", "l", "l", "e", "h"],
      },
      {
        input: { s: ["H", "a", "n", "n", "a", "h"] },
        expected: ["h", "a", "n", "n", "a", "H"],
      },
      { input: { s: ["a"] }, expected: ["a"] },
      {
        input: { s: ["A", "B", "C"] },
        expected: ["C", "B", "A"],
      },
    ],
    starterCode: {
      javascript: `/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
function reverseString(s) {
  // Write your solution here
  
};`,
      python: `def reverseString(s):
    # Write your solution here (modify in-place)
    pass`,
    },
    evaluator: (code, { s }) => {
      try {
        const arr = [...s];
        // eslint-disable-next-line no-new-func
        const fn = new Function(
          "s",
          `${code}\nreverseString(s); return s;`
        );
        return fn(arr);
      } catch (e) {
        throw new Error(e.message);
      }
    },
    compareResults: (result, expected) => {
      if (!Array.isArray(result)) return false;
      return JSON.stringify(result) === JSON.stringify(expected);
    },
  },
  {
    id: 3,
    title: "Valid Parentheses",
    difficulty: "Medium",
    category: "Stack",
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: [
      "1 <= s.length <= 10⁴",
      "s consists of parentheses only '()[]{}'.",
    ],
    testCases: [
      { input: { s: "()" }, expected: true },
      { input: { s: "()[]{}" }, expected: true },
      { input: { s: "(]" }, expected: false },
      { input: { s: "([)]" }, expected: false },
      { input: { s: "{[]}" }, expected: true },
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Write your solution here
  
};`,
      python: `def isValid(s):
    # Write your solution here
    pass`,
    },
    evaluator: (code, { s }) => {
      try {
        // eslint-disable-next-line no-new-func
        const fn = new Function("s", `${code}\nreturn isValid(s);`);
        return fn(s);
      } catch (e) {
        throw new Error(e.message);
      }
    },
    compareResults: (result, expected) => result === expected,
  },
  {
    id: 4,
    title: "Maximum Subarray",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description: `Given an integer array \`nums\`, find the **subarray** with the largest sum, and return *its sum*.`,
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation:
          "The subarray [4,-1,2,1] has the largest sum 6.",
      },
      {
        input: "nums = [1]",
        output: "1",
      },
      {
        input: "nums = [5,4,-1,7,8]",
        output: "23",
      },
    ],
    constraints: [
      "1 <= nums.length <= 10⁵",
      "-10⁴ <= nums[i] <= 10⁴",
    ],
    testCases: [
      { input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, expected: 6 },
      { input: { nums: [1] }, expected: 1 },
      { input: { nums: [5, 4, -1, 7, 8] }, expected: 23 },
      { input: { nums: [-1, -2, -3] }, expected: -1 },
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  // Write your solution here
  
};`,
      python: `def maxSubArray(nums):
    # Write your solution here
    pass`,
    },
    evaluator: (code, { nums }) => {
      try {
        // eslint-disable-next-line no-new-func
        const fn = new Function(
          "nums",
          `${code}\nreturn maxSubArray(nums);`
        );
        return fn([...nums]);
      } catch (e) {
        throw new Error(e.message);
      }
    },
    compareResults: (result, expected) => result === expected,
  },
];
