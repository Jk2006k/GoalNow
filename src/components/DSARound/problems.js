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
    ],
    constraints: [
      "2 <= nums.length <= 10⁴",
      "-10⁹ <= nums[i] <= 10⁹",
      "-10⁹ <= target <= 10⁹",
      "Only one valid answer exists.",
    ],
    testCases: [
      {
        id: 1,
        input: { nums: [2, 7, 11, 15], target: 9 },
        expected: [0, 1],
        label: "Test Case 1",
      },
      {
        id: 2,
        input: { nums: [3, 2, 4], target: 6 },
        expected: [1, 2],
        label: "Test Case 2",
      },
      {
        id: 3,
        input: { nums: [3, 3], target: 6 },
        expected: [0, 1],
        label: "Test Case 3",
      },
      {
        id: 4,
        input: { nums: [1, 2, 3, 4, 5], target: 9 },
        expected: [3, 4],
        label: "Test Case 4",
      },
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your solution here
  
}`,
      python: `def twoSum(nums, target):
    # Write your solution here
    pass`,
    },
    functionName: "twoSum",
    argNames: ["nums", "target"],
  },
  {
    id: 2,
    title: "Reverse Linked List",
    difficulty: "Easy",
    category: "Linked List",
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.

For this problem, the linked list is represented as an array. Reverse the array and return it.`,
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]",
        explanation: "The list is reversed.",
      },
      {
        input: "head = [1,2]",
        output: "[2,1]",
        explanation: "The list is reversed.",
      },
    ],
    constraints: [
      "The number of nodes in the list is in the range [0, 5000].",
      "-5000 <= Node.val <= 5000",
    ],
    testCases: [
      {
        id: 1,
        input: { head: [1, 2, 3, 4, 5] },
        expected: [5, 4, 3, 2, 1],
        label: "Test Case 1",
      },
      {
        id: 2,
        input: { head: [1, 2] },
        expected: [2, 1],
        label: "Test Case 2",
      },
      {
        id: 3,
        input: { head: [] },
        expected: [],
        label: "Test Case 3 (Empty)",
      },
      {
        id: 4,
        input: { head: [5] },
        expected: [5],
        label: "Test Case 4 (Single)",
      },
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} head - Array representation of linked list
 * @return {number[]}
 */
function reverseList(head) {
  // Write your solution here
  
}`,
      python: `def reverseList(head):
    # Write your solution here
    pass`,
    },
    functionName: "reverseList",
    argNames: ["head"],
  },
  {
    id: 3,
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stack",
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      {
        input: 's = "()"',
        output: "true",
        explanation: "The string has valid matching parentheses.",
      },
      {
        input: 's = "()[]{}"',
        output: "true",
        explanation: "All brackets are properly matched.",
      },
      {
        input: 's = "(]"',
        output: "false",
        explanation: "Mismatched bracket types.",
      },
    ],
    constraints: [
      "1 <= s.length <= 10⁴",
      "s consists of parentheses only '()[]{}'.",
    ],
    testCases: [
      {
        id: 1,
        input: { s: "()" },
        expected: true,
        label: "Test Case 1",
      },
      {
        id: 2,
        input: { s: "()[]{}" },
        expected: true,
        label: "Test Case 2",
      },
      {
        id: 3,
        input: { s: "(]" },
        expected: false,
        label: "Test Case 3",
      },
      {
        id: 4,
        input: { s: "([)]" },
        expected: false,
        label: "Test Case 4",
      },
      {
        id: 5,
        input: { s: "{[]}" },
        expected: true,
        label: "Test Case 5",
      },
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Write your solution here
  
}`,
      python: `def isValid(s):
    # Write your solution here
    pass`,
    },
    functionName: "isValid",
    argNames: ["s"],
  },
  {
    id: 4,
    title: "Maximum Subarray",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

A **subarray** is a contiguous part of an array.`,
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation:
          "The subarray [4,-1,2,1] has the largest sum = 6.",
      },
      {
        input: "nums = [1]",
        output: "1",
        explanation: "Single element is the max subarray.",
      },
      {
        input: "nums = [5,4,-1,7,8]",
        output: "23",
        explanation: "The entire array is the max subarray.",
      },
    ],
    constraints: [
      "1 <= nums.length <= 10⁵",
      "-10⁴ <= nums[i] <= 10⁴",
    ],
    testCases: [
      {
        id: 1,
        input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
        expected: 6,
        label: "Test Case 1",
      },
      {
        id: 2,
        input: { nums: [1] },
        expected: 1,
        label: "Test Case 2",
      },
      {
        id: 3,
        input: { nums: [5, 4, -1, 7, 8] },
        expected: 23,
        label: "Test Case 3",
      },
      {
        id: 4,
        input: { nums: [-1, -2, -3] },
        expected: -1,
        label: "Test Case 4 (All Negative)",
      },
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  // Write your solution here
  
}`,
      python: `def maxSubArray(nums):
    # Write your solution here
    pass`,
    },
    functionName: "maxSubArray",
    argNames: ["nums"],
  },
];

export default problems;
