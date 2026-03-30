export interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
  description?: string;
}

export interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string[];
  starterCode: {
    javascript: string;
    python: string;
  };
  testCases: TestCase[];
  /**
   * A JS function string used for mock execution:
   * receives the raw input string, returns expected output string.
   * This is the "answer" used to validate submissions.
   */
  solution: {
    javascript: string;
  };
}

export const PROBLEMS: Problem[] = [
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Array',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return **indices** of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]',
      },
    ],
    constraints: [
      '2 ≤ nums.length ≤ 10⁴',
      '-10⁹ ≤ nums[i] ≤ 10⁹',
      '-10⁹ ≤ target ≤ 10⁹',
      'Only one valid answer exists.',
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
      python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Write your solution here
        pass`,
    },
    testCases: [
      { id: 1, input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', description: 'Basic case' },
      { id: 2, input: '[3,2,4]\n6', expectedOutput: '[1,2]', description: 'Middle elements' },
      { id: 3, input: '[3,3]\n6', expectedOutput: '[0,1]', description: 'Duplicate values' },
      { id: 4, input: '[1,2,3,4,5]\n9', expectedOutput: '[3,4]', description: 'Last elements' },
    ],
    solution: {
      javascript: `
        const lines = input.trim().split('\\n');
        const nums = JSON.parse(lines[0]);
        const target = parseInt(lines[1]);
        const map = {};
        for (let i = 0; i < nums.length; i++) {
          const complement = target - nums[i];
          if (map[complement] !== undefined) return JSON.stringify([map[complement], i]);
          map[nums[i]] = i;
        }
        return '[]';
      `,
    },
  },
  {
    id: 2,
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    constraints: [
      '1 ≤ s.length ≤ 10⁴',
      's consists of parentheses only \'()[]{}\' ',
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Write your solution here

};`,
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        # Write your solution here
        pass`,
    },
    testCases: [
      { id: 1, input: '()', expectedOutput: 'true', description: 'Simple pair' },
      { id: 2, input: '()[]{}', expectedOutput: 'true', description: 'Multiple pairs' },
      { id: 3, input: '(]', expectedOutput: 'false', description: 'Mismatched' },
      { id: 4, input: '([)]', expectedOutput: 'false', description: 'Interleaved' },
      { id: 5, input: '{[]}', expectedOutput: 'true', description: 'Nested' },
    ],
    solution: {
      javascript: `
        const s = input.trim();
        const stack = [];
        const map = { ')': '(', '}': '{', ']': '[' };
        for (const ch of s) {
          if ('([{'.includes(ch)) stack.push(ch);
          else if (stack.pop() !== map[ch]) return 'false';
        }
        return stack.length === 0 ? 'true' : 'false';
      `,
    },
  },
  {
    id: 3,
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    category: 'Linked List',
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.

**Input format:** A comma-separated list of node values, e.g. \`1,2,3,4,5\`

**Output format:** The reversed list as comma-separated values, e.g. \`5,4,3,2,1\``,
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' },
      { input: 'head = []', output: '[]' },
    ],
    constraints: [
      'The number of nodes in the list is in the range [0, 5000].',
      '-5000 ≤ Node.val ≤ 5000',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} head  (represented as array for simplicity)
 * @return {number[]}
 */
function reverseList(head) {
  // Write your solution here

};`,
      python: `class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        # Write your solution here
        pass`,
    },
    testCases: [
      { id: 1, input: '1,2,3,4,5', expectedOutput: '5,4,3,2,1', description: 'Five elements' },
      { id: 2, input: '1,2', expectedOutput: '2,1', description: 'Two elements' },
      { id: 3, input: '1', expectedOutput: '1', description: 'Single element' },
      { id: 4, input: '5,4,3,2,1', expectedOutput: '1,2,3,4,5', description: 'Already reversed' },
    ],
    solution: {
      javascript: `
        const s = input.trim();
        if (!s) return '';
        return s.split(',').reverse().join(',');
      `,
    },
  },
  {
    id: 4,
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

**Input format:** Space-separated integers, e.g. \`-2 1 -3 4 -1 2 1 -5 4\``,
    examples: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'The subarray [4,-1,2,1] has the largest sum 6.',
      },
      { input: 'nums = [1]', output: '1' },
      { input: 'nums = [5,4,-1,7,8]', output: '23' },
    ],
    constraints: [
      '1 ≤ nums.length ≤ 10⁵',
      '-10⁴ ≤ nums[i] ≤ 10⁴',
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  // Write your solution here

};`,
      python: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        # Write your solution here
        pass`,
    },
    testCases: [
      { id: 1, input: '-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', description: 'Mixed negatives' },
      { id: 2, input: '1', expectedOutput: '1', description: 'Single element' },
      { id: 3, input: '5 4 -1 7 8', expectedOutput: '23', description: 'Mostly positive' },
      { id: 4, input: '-1 -2 -3', expectedOutput: '-1', description: 'All negative' },
    ],
    solution: {
      javascript: `
        const nums = input.trim().split(' ').map(Number);
        let maxSum = nums[0], cur = nums[0];
        for (let i = 1; i < nums.length; i++) {
          cur = Math.max(nums[i], cur + nums[i]);
          maxSum = Math.max(maxSum, cur);
        }
        return String(maxSum);
      `,
    },
  },
];
