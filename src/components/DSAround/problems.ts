export interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
  description: string;
}

export interface Problem {
  id: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  starterCode: {
    javascript: string;
    python: string;
  };
  testCases: TestCase[];
  /** A sandboxed evaluator: given user code (string) + test input (string), returns output string */
  evaluate: (language: "javascript" | "python", code: string, input: string) => string;
}

/* ─────────────────────────────────────────────────────────────
   Problem 1 – Two Sum
───────────────────────────────────────────────────────────── */
const twoSumEvaluate = (
  language: "javascript" | "python",
  code: string,
  input: string
): string => {
  try {
    // input format: "nums=[2,7,11,15] target=9"
    const numsMatch = input.match(/nums=\[([^\]]*)\]/);
    const targetMatch = input.match(/target=(-?\d+)/);
    if (!numsMatch || !targetMatch) return "Invalid input format";

    const nums: number[] = numsMatch[1].split(",").map(Number);
    const target = parseInt(targetMatch[1], 10);

    if (language === "javascript") {
      // eslint-disable-next-line no-new-func
      const fn = new Function(
        "nums",
        "target",
        `
        ${code}
        return twoSum(nums, target);
      `
      );
      const result = fn(nums, target);
      return JSON.stringify(result);
    } else {
      // Python mock: run a JS equivalent of a brute-force solution
      // (real Python execution would need a backend; we simulate)
      const map: Record<number, number> = {};
      for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map[comp] !== undefined) return JSON.stringify([map[comp], i]);
        map[nums[i]] = i;
      }
      return "[]";
    }
  } catch (e: unknown) {
    return `Error: ${(e as Error).message}`;
  }
};

/* ─────────────────────────────────────────────────────────────
   Problem 2 – Valid Parentheses
───────────────────────────────────────────────────────────── */
const validParenEvaluate = (
  language: "javascript" | "python",
  code: string,
  input: string
): string => {
  try {
    const sMatch = input.match(/s="([^"]*)"/);
    if (!sMatch) return "Invalid input format";
    const s = sMatch[1];

    if (language === "javascript") {
      // eslint-disable-next-line no-new-func
      const fn = new Function(
        "s",
        `
        ${code}
        return isValid(s);
      `
      );
      const result = fn(s);
      return String(result);
    } else {
      const stack: string[] = [];
      const map: Record<string, string> = { ")": "(", "}": "{", "]": "[" };
      for (const ch of s) {
        if ("({[".includes(ch)) stack.push(ch);
        else {
          if (stack.pop() !== map[ch]) return "false";
        }
      }
      return stack.length === 0 ? "true" : "false";
    }
  } catch (e: unknown) {
    return `Error: ${(e as Error).message}`;
  }
};

/* ─────────────────────────────────────────────────────────────
   Problem 3 – Reverse a Linked List (array simulation)
───────────────────────────────────────────────────────────── */
const reverseListEvaluate = (
  language: "javascript" | "python",
  code: string,
  input: string
): string => {
  try {
    const headMatch = input.match(/head=\[([^\]]*)\]/);
    if (!headMatch) return "Invalid input format";
    const arr: number[] =
      headMatch[1].trim() === "" ? [] : headMatch[1].split(",").map(Number);

    if (language === "javascript") {
      // eslint-disable-next-line no-new-func
      const fn = new Function(
        "arr",
        `
        // Build linked list
        function ListNode(val, next) { this.val = val; this.next = next || null; }
        let head = null;
        for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);

        ${code}

        const result = reverseList(head);
        // Convert back to array
        const out = [];
        let cur = result;
        while (cur) { out.push(cur.val); cur = cur.next; }
        return out;
      `
      );
      return JSON.stringify(fn(arr));
    } else {
      return JSON.stringify([...arr].reverse());
    }
  } catch (e: unknown) {
    return `Error: ${(e as Error).message}`;
  }
};

/* ─────────────────────────────────────────────────────────────
   Problems export
───────────────────────────────────────────────────────────── */
export const PROBLEMS: Problem[] = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers* such that they add up to \`target\`.

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
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
      },
    ],
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "-10⁹ ≤ target ≤ 10⁹",
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
      python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Your code here
        pass`,
    },
    testCases: [
      {
        id: 1,
        input: 'nums=[2,7,11,15] target=9',
        expectedOutput: "[0,1]",
        description: "Basic case",
      },
      {
        id: 2,
        input: 'nums=[3,2,4] target=6',
        expectedOutput: "[1,2]",
        description: "Non-adjacent pair",
      },
      {
        id: 3,
        input: 'nums=[3,3] target=6',
        expectedOutput: "[0,1]",
        description: "Duplicate values",
      },
    ],
    evaluate: twoSumEvaluate,
  },
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "Easy",
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
      "1 ≤ s.length ≤ 10⁴",
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
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        # Your code here
        pass`,
    },
    testCases: [
      {
        id: 1,
        input: 's="()"',
        expectedOutput: "true",
        description: "Simple matching pair",
      },
      {
        id: 2,
        input: 's="()[]{}"',
        expectedOutput: "true",
        description: "Multiple valid pairs",
      },
      {
        id: 3,
        input: 's="(]"',
        expectedOutput: "false",
        description: "Mismatched brackets",
      },
      {
        id: 4,
        input: 's="([)]"',
        expectedOutput: "false",
        description: "Wrong order",
      },
    ],
    evaluate: validParenEvaluate,
  },
  {
    id: 3,
    title: "Reverse Linked List",
    difficulty: "Easy",
    description: `Given the \`head\` of a singly linked list, reverse the list, and return *the reversed list*.`,
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]",
        explanation: "Reverse the entire linked list.",
      },
      { input: "head = [1,2]", output: "[2,1]" },
      { input: "head = []", output: "[]" },
    ],
    constraints: [
      "The number of nodes in the list is in the range [0, 5000].",
      "-5000 ≤ Node.val ≤ 5000",
    ],
    starterCode: {
      javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *   this.val = (val===undefined ? 0 : val)
 *   this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
function reverseList(head) {
  // Your code here
};`,
      python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def reverseList(self, head):
        # Your code here
        pass`,
    },
    testCases: [
      {
        id: 1,
        input: "head=[1,2,3,4,5]",
        expectedOutput: "[5,4,3,2,1]",
        description: "Standard five-element list",
      },
      {
        id: 2,
        input: "head=[1,2]",
        expectedOutput: "[2,1]",
        description: "Two-element list",
      },
      {
        id: 3,
        input: "head=[]",
        expectedOutput: "[]",
        description: "Empty list",
      },
    ],
    evaluate: reverseListEvaluate,
  },
];
