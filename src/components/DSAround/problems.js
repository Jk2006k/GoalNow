// Predefined DSA problems with test cases
export const problems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    category: "Array",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to target.

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
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your code here
};`,
      python: `def twoSum(nums, target):
    # Your code here
    pass`,
    },
    testCases: [
      {
        id: 1,
        input: { nums: [2, 7, 11, 15], target: 9 },
        expected: [0, 1],
        inputDisplay: "nums = [2,7,11,15], target = 9",
        expectedDisplay: "[0,1]",
      },
      {
        id: 2,
        input: { nums: [3, 2, 4], target: 6 },
        expected: [1, 2],
        inputDisplay: "nums = [3,2,4], target = 6",
        expectedDisplay: "[1,2]",
      },
      {
        id: 3,
        input: { nums: [3, 3], target: 6 },
        expected: [0, 1],
        inputDisplay: "nums = [3,3], target = 6",
        expectedDisplay: "[0,1]",
      },
    ],
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
      {
        input: 's = "()"',
        output: "true",
      },
      {
        input: 's = "()[]{}"',
        output: "true",
      },
      {
        input: 's = "(]"',
        output: "false",
      },
    ],
    constraints: [
      "1 <= s.length <= 10⁴",
      "s consists of parentheses only '()[]{}'.",
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Your code here
};`,
      python: `def isValid(s):
    # Your code here
    pass`,
    },
    testCases: [
      {
        id: 1,
        input: { s: "()" },
        expected: true,
        inputDisplay: 's = "()"',
        expectedDisplay: "true",
      },
      {
        id: 2,
        input: { s: "()[]{}" },
        expected: true,
        inputDisplay: 's = "()[]{}"',
        expectedDisplay: "true",
      },
      {
        id: 3,
        input: { s: "(]" },
        expected: false,
        inputDisplay: 's = "(]"',
        expectedDisplay: "false",
      },
      {
        id: 4,
        input: { s: "([)]" },
        expected: false,
        inputDisplay: 's = "([)]"',
        expectedDisplay: "false",
      },
    ],
    solution: {
      javascript: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const c of s) {
    if ('([{'.includes(c)) stack.push(c);
    else if (stack.pop() !== map[c]) return false;
  }
  return stack.length === 0;
}`,
    },
  },
  {
    id: 3,
    title: "Reverse Linked List",
    difficulty: "Easy",
    category: "Linked List",
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.

For this problem, the list is represented as an array of values. Return the reversed array.`,
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]",
      },
      {
        input: "head = [1,2]",
        output: "[2,1]",
      },
      {
        input: "head = []",
        output: "[]",
      },
    ],
    constraints: [
      "The number of nodes in the list is in the range [0, 5000].",
      "-5000 <= Node.val <= 5000",
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} head - Array representing the linked list
 * @return {number[]}
 */
function reverseList(head) {
  // Your code here
};`,
      python: `def reverseList(head):
    # head is a list representing the linked list
    # Your code here
    pass`,
    },
    testCases: [
      {
        id: 1,
        input: { head: [1, 2, 3, 4, 5] },
        expected: [5, 4, 3, 2, 1],
        inputDisplay: "head = [1,2,3,4,5]",
        expectedDisplay: "[5,4,3,2,1]",
      },
      {
        id: 2,
        input: { head: [1, 2] },
        expected: [2, 1],
        inputDisplay: "head = [1,2]",
        expectedDisplay: "[2,1]",
      },
      {
        id: 3,
        input: { head: [] },
        expected: [],
        inputDisplay: "head = []",
        expectedDisplay: "[]",
      },
    ],
    solution: {
      javascript: `function reverseList(head) {
  return head.reverse();
}`,
    },
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
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  // Your code here
};`,
      python: `def maxSubArray(nums):
    # Your code here
    pass`,
    },
    testCases: [
      {
        id: 1,
        input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
        expected: 6,
        inputDisplay: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        expectedDisplay: "6",
      },
      {
        id: 2,
        input: { nums: [1] },
        expected: 1,
        inputDisplay: "nums = [1]",
        expectedDisplay: "1",
      },
      {
        id: 3,
        input: { nums: [5, 4, -1, 7, 8] },
        expected: 23,
        inputDisplay: "nums = [5,4,-1,7,8]",
        expectedDisplay: "23",
      },
    ],
    solution: {
      javascript: `function maxSubArray(nums) {
  let max = nums[0], cur = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    max = Math.max(max, cur);
  }
  return max;
}`,
    },
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
      "1 <= nums.length <= 10⁴",
      "-10⁴ < nums[i], target < 10⁴",
      "All the integers in nums are unique.",
      "nums is sorted in ascending order.",
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
  // Your code here
};`,
      python: `def search(nums, target):
    # Your code here
    pass`,
    },
    testCases: [
      {
        id: 1,
        input: { nums: [-1, 0, 3, 5, 9, 12], target: 9 },
        expected: 4,
        inputDisplay: "nums = [-1,0,3,5,9,12], target = 9",
        expectedDisplay: "4",
      },
      {
        id: 2,
        input: { nums: [-1, 0, 3, 5, 9, 12], target: 2 },
        expected: -1,
        inputDisplay: "nums = [-1,0,3,5,9,12], target = 2",
        expectedDisplay: "-1",
      },
      {
        id: 3,
        input: { nums: [5], target: 5 },
        expected: 0,
        inputDisplay: "nums = [5], target = 5",
        expectedDisplay: "0",
      },
    ],
    solution: {
      javascript: `function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    else if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
    },
  },
];
