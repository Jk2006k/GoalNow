export const problems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    category: "Array",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

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
        label: "Case 1",
      },
      {
        id: 2,
        input: { nums: [3, 2, 4], target: 6 },
        expected: [1, 2],
        label: "Case 2",
      },
      {
        id: 3,
        input: { nums: [3, 3], target: 6 },
        expected: [0, 1],
        label: "Case 3",
      },
      {
        id: 4,
        input: { nums: [1, 5, 8, 3], target: 11 },
        expected: [1, 2],
        label: "Case 4",
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
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
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
      { input: 's = "()"', output: "true", explanation: "" },
      { input: 's = "()[]{}"', output: "true", explanation: "" },
      {
        input: 's = "(]"',
        output: "false",
        explanation: "",
      },
    ],
    constraints: [
      "1 <= s.length <= 10⁴",
      "s consists of parentheses only '()[]{}'.",
    ],
    testCases: [
      { id: 1, input: { s: "()" }, expected: true, label: "Case 1" },
      { id: 2, input: { s: "()[]{}" }, expected: true, label: "Case 2" },
      { id: 3, input: { s: "(]" }, expected: false, label: "Case 3" },
      { id: 4, input: { s: "([)]" }, expected: false, label: "Case 4" },
      { id: 5, input: { s: "{[]}" }, expected: true, label: "Case 5" },
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
    solution: {
      javascript: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const ch of s) {
    if ('({['.includes(ch)) {
      stack.push(ch);
    } else {
      if (stack.pop() !== map[ch]) return false;
    }
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
    description: `Given the \`head\` of a singly linked list, reverse the list, and return the reversed list.

**Note:** For this problem, represent the linked list as an array of values. Your function should take an array and return the reversed array (simulating linked list reversal).`,
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
      "-5000 <= Node.val <= 5000",
    ],
    testCases: [
      {
        id: 1,
        input: { head: [1, 2, 3, 4, 5] },
        expected: [5, 4, 3, 2, 1],
        label: "Case 1",
      },
      { id: 2, input: { head: [1, 2] }, expected: [2, 1], label: "Case 2" },
      { id: 3, input: { head: [] }, expected: [], label: "Case 3" },
      {
        id: 4,
        input: { head: [1] },
        expected: [1],
        label: "Case 4",
      },
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} head - array representing linked list
 * @return {number[]}
 */
function reverseList(head) {
  // Write your solution here
  
};`,
      python: `def reverseList(head):
    # head is a list representing linked list values
    # Write your solution here
    pass`,
    },
    solution: {
      javascript: `function reverseList(head) {
  return head.reverse();
}`,
    },
  },
];
