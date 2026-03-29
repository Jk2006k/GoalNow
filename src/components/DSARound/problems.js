// Predefined DSA problems with test cases

export const problems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    category: "Array",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

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
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 6, we return [0, 1].",
      },
    ],
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "-10⁹ ≤ target ≤ 10⁹",
      "Only one valid answer exists.",
    ],
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
      { input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
      { input: { nums: [1, 5, 3, 7], target: 8 }, expected: [1, 3] },
      { input: { nums: [-1, -2, -3, -4, -5], target: -8 }, expected: [2, 4] },
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
    solutionValidator: `
      function validate(fn, input) {
        const result = fn(input.nums, input.target);
        return JSON.stringify(result.sort((a,b)=>a-b));
      }
      function expectedStr(expected) {
        return JSON.stringify(expected.sort((a,b)=>a-b));
      }
    `,
    functionName: "twoSum",
    inputArgs: ["nums", "target"],
  },
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stack",
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: "true", explanation: "" },
      { input: 's = "()[]{}"', output: "true", explanation: "" },
      { input: 's = "(]"', output: "false", explanation: "" },
    ],
    constraints: [
      "1 ≤ s.length ≤ 10⁴",
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
    functionName: "isValid",
    inputArgs: ["s"],
  },
  {
    id: 3,
    title: "Reverse Linked List",
    difficulty: "Easy",
    category: "Linked List",
    description: `Given the \`head\` of a singly linked list, reverse the list, and return the reversed list.

For this problem, the linked list is represented as an array for simplicity. Return the reversed array.`,
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]",
        explanation: "",
      },
      { input: "head = [1,2]", output: "[2,1]", explanation: "" },
      { input: "head = []", output: "[]", explanation: "" },
    ],
    constraints: [
      "The number of nodes in the list is the range [0, 5000].",
      "-5000 ≤ Node.val ≤ 5000",
    ],
    testCases: [
      { input: { head: [1, 2, 3, 4, 5] }, expected: [5, 4, 3, 2, 1] },
      { input: { head: [1, 2] }, expected: [2, 1] },
      { input: { head: [] }, expected: [] },
      { input: { head: [1] }, expected: [1] },
      { input: { head: [3, 1, 4, 1, 5, 9] }, expected: [9, 5, 1, 4, 1, 3] },
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} head - array representation of linked list
 * @return {number[]}
 */
function reverseList(head) {
  // Write your solution here
  
};`,
      python: `def reverseList(head):
    # Write your solution here
    pass`,
    },
    functionName: "reverseList",
    inputArgs: ["head"],
  },
  {
    id: 4,
    title: "Maximum Subarray",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

A **subarray** is a contiguous non-empty sequence of elements within an array.`,
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum 6.",
      },
      { input: "nums = [1]", output: "1", explanation: "" },
      {
        input: "nums = [5,4,-1,7,8]",
        output: "23",
        explanation: "The subarray [5,4,-1,7,8] has the largest sum 23.",
      },
    ],
    constraints: [
      "1 ≤ nums.length ≤ 10⁵",
      "-10⁴ ≤ nums[i] ≤ 10⁴",
    ],
    testCases: [
      { input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, expected: 6 },
      { input: { nums: [1] }, expected: 1 },
      { input: { nums: [5, 4, -1, 7, 8] }, expected: 23 },
      { input: { nums: [-1] }, expected: -1 },
      { input: { nums: [-2, -1] }, expected: -1 },
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
    functionName: "maxSubArray",
    inputArgs: ["nums"],
  },
  {
    id: 5,
    title: "Binary Search",
    difficulty: "Easy",
    category: "Binary Search",
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with **O(log n)** runtime complexity.`,
    examples: [
      {
        input: "nums = [-1,0,3,5,9,12], target = 9",
        output: "4",
        explanation: "9 exists in nums and its index is 4.",
      },
      {
        input: "nums = [-1,0,3,5,9,12], target = 2",
        output: "-1",
        explanation: "2 does not exist in nums so return -1.",
      },
    ],
    constraints: [
      "1 ≤ nums.length ≤ 10⁴",
      "-10⁴ < nums[i], target < 10⁴",
      "All the integers in nums are unique.",
      "nums is sorted in ascending order.",
    ],
    testCases: [
      { input: { nums: [-1, 0, 3, 5, 9, 12], target: 9 }, expected: 4 },
      { input: { nums: [-1, 0, 3, 5, 9, 12], target: 2 }, expected: -1 },
      { input: { nums: [5], target: 5 }, expected: 0 },
      { input: { nums: [5], target: 3 }, expected: -1 },
      { input: { nums: [1, 3, 5, 7, 9, 11], target: 7 }, expected: 3 },
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
  // Write your solution here
  
};`,
      python: `def search(nums, target):
    # Write your solution here
    pass`,
    },
    functionName: "search",
    inputArgs: ["nums", "target"],
  },
];

export default problems;
