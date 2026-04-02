/**
 * Sample questions for seeding the question database
 * These are DSA problems with complete test cases
 * 30 Total: 10 Easy, 10 Medium, 10 Hard
 */

const questions = [
  // ===== EASY QUESTIONS (1-10) =====
  {
    title: "Two Sum",
    description: `Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.

You may assume that each input has exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Constraints:
- 2 ≤ nums.length ≤ 10⁴
- -10⁹ ≤ nums[i] ≤ 10⁹
- -10⁹ ≤ target ≤ 10⁹
- Only one valid answer exists.`,
    difficulty: "easy",
    functionName: "solution",
    starterCode: {
      "71": `def solution(nums, target):
    pass`,
      "63": `function solution(nums, target) {
    return [];
}`,
      "62": `class Solution {
    public int[] solution(int[] nums, int target) {
        return null;
    }
}`,
      "54": `vector<int> solution(vector<int>& nums, int target) {
    return {};
}`,
    },
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, output: "0 1" },
      { input: { nums: [3, 2, 4], target: 6 }, output: "1 2" },
      { input: { nums: [3, 3], target: 6 }, output: "0 1" },
    ],
    hiddenTestCases: [
      { input: { nums: [2, 7, 11, 15, 3], target: 5 }, output: "1 4" },
      { input: { nums: [1, 2, 3, 4, 5], target: 9 }, output: "3 4" },
      { input: { nums: [-1, 0, 1, 2, -1, -4, -2], target: 0 }, output: "0 4" },
    ],
    tags: ["array", "hash-map", "two-pointers"],
    acceptanceRate: 48.5,
    totalSubmissions: 50000,
    acceptedSubmissions: 24250,
  },
  {
    title: "Reverse String",
    description: `Write a function that reverses a string. The input string is given as an array of characters.

You must do this by modifying the input array in-place with O(1) extra memory.

Constraints:
- 1 ≤ s.length ≤ 10⁵
- s[i] is a printable ascii character.`,
    difficulty: "easy",
    functionName: "solution",
    starterCode: {
      "71": `def solution(s):
    pass`,
      "63": `function solution(s) {
    return [];
}`,
      "62": `class Solution {
    public char[] solution(char[] s) {
        return null;
    }
}`,
      "54": `vector<char> solution(vector<char>& s) {
    return {};
}`,
    },
    testCases: [
      { input: { s: ["h", "e", "l", "l", "o"] }, output: "o l l e h" },
      { input: { s: ["H", "a", "n", "n", "a", "h"] }, output: "h a n n a H" },
      { input: { s: ["a"] }, output: "a" },
    ],
    hiddenTestCases: [
      { input: { s: ["1", "2", "3"] }, output: "3 2 1" },
      { input: { s: ["0", "1", "2", "3", "4", "5"] }, output: "5 4 3 2 1 0" },
      { input: { s: ["!", "@", "#"] }, output: "# @ !" },
    ],
    tags: ["string", "array", "two-pointers"],
    acceptanceRate: 79.2,
    totalSubmissions: 40000,
    acceptedSubmissions: 31680,
  },
  {
    title: "Remove Duplicates from Sorted Array",
    description: `Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same.

Return the number of unique elements in nums.

Constraints:
- 1 ≤ nums.length ≤ 10⁴
- -10⁹ ≤ nums[i] ≤ 10⁹
- nums is sorted in non-decreasing order.`,
    difficulty: "easy",
    functionName: "solution",
    starterCode: {
      "71": `def solution(nums):
    pass`,
      "63": `function solution(nums) {
    return 0;
}`,
      "62": `class Solution {
    public int solution(int[] nums) {
        return 0;
    }
}`,
      "54": `int solution(vector<int>& nums) {
    return 0;
}`,
    },
    testCases: [
      { input: { nums: [1, 1, 2] }, output: "2" },
      { input: { nums: [0, 0, 1, 1, 1, 2, 2, 3, 3, 4] }, output: "5" },
      { input: { nums: [1, 2, 3, 4, 5] }, output: "5" },
    ],
    hiddenTestCases: [
      { input: { nums: [1] }, output: "1" },
      { input: { nums: [1, 1, 1] }, output: "1" },
      { input: { nums: [-1, 0, 0, 1, 1, 2] }, output: "4" },
    ],
    tags: ["array", "two-pointers"],
    acceptanceRate: 52.8,
    totalSubmissions: 45000,
    acceptedSubmissions: 23760,
  },
  {
    title: "Valid Palindrome",
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string s, return true if it is a palindrome, or false otherwise.

Constraints:
- 1 ≤ s.length ≤ 2 × 10⁵
- s consists of printable ASCII characters.`,
    difficulty: "easy",
    functionName: "solution",
    starterCode: {
      "71": `def solution(s):
    pass`,
      "63": `function solution(s) {
    return true;
}`,
      "62": `class Solution {
    public boolean solution(String s) {
        return true;
    }
}`,
      "54": `bool solution(string s) {
    return true;
}`,
    },
    testCases: [
      { input: { s: "A man, a plan, a canal: Panama" }, output: "true" },
      { input: { s: "race a car" }, output: "false" },
      { input: { s: " " }, output: "true" },
    ],
    hiddenTestCases: [
      { input: { s: "0P" }, output: "false" },
      { input: { s: ".,a" }, output: "true" },
      { input: { s: "a." }, output: "true" },
    ],
    tags: ["string", "two-pointers"],
    acceptanceRate: 45.3,
    totalSubmissions: 35000,
    acceptedSubmissions: 15855,
  },
  {
    title: "Merge Sorted Array",
    description: `You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n.

Merge nums2 into nums1 as one sorted array. You may assume that nums1 has a length of m + n.

Constraints:
- nums1.length == m + n
- nums2.length == n
- 0 ≤ m, n ≤ 200
- -10⁹ ≤ nums1[i], nums2[j] ≤ 10⁹`,
    difficulty: "easy",
    functionName: "solution",
    starterCode: {
      "71": `def solution(nums1, m, nums2, n):
    pass`,
      "63": `function solution(nums1, m, nums2, n) {
    return [];
}`,
      "62": `class Solution {
    public int[] solution(int[] nums1, int m, int[] nums2, int n) {
        return null;
    }
}`,
      "54": `vector<int> solution(vector<int>& nums1, int m, vector<int>& nums2, int n) {
    return {};
}`,
    },
    testCases: [
      { input: { nums1: [1, 2, 3, 0, 0, 0], m: 3, nums2: [2, 5, 6], n: 3 }, output: "1 2 2 3 5 6" },
      { input: { nums1: [1], m: 1, nums2: [], n: 0 }, output: "1" },
      { input: { nums1: [0], m: 0, nums2: [1], n: 1 }, output: "1" },
    ],
    hiddenTestCases: [
      { input: { nums1: [4, 5, 6, 0, 0, 0], m: 3, nums2: [1, 2, 3], n: 3 }, output: "1 2 3 4 5 6" },
      { input: { nums1: [-1, 0, 0, 3, 3, 3, 0, 0, 0], m: 6, nums2: [1, 2, 2], n: 3 }, output: "-1 0 0 1 2 2 3 3 3" },
      { input: { nums1: [2, 0], m: 1, nums2: [1], n: 1 }, output: "1 2" },
    ],
    tags: ["array", "two-pointers", "sorting"],
    acceptanceRate: 38.9,
    totalSubmissions: 55000,
    acceptedSubmissions: 21395,
  },
  {
    title: "Contains Duplicate",
    description: `Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.

Constraints:
- 1 ≤ nums.length ≤ 10⁵
- -10⁹ ≤ nums[i] ≤ 10⁹`,
    difficulty: "easy",
    functionName: "solution",
    starterCode: {
      "71": `def solution(nums):
    pass`,
      "63": `function solution(nums) {
    return false;
}`,
      "62": `class Solution {
    public boolean solution(int[] nums) {
        return false;
    }
}`,
      "54": `bool solution(vector<int>& nums) {
    return false;
}`,
    },
    testCases: [
      { input: { nums: [1, 2, 3, 1] }, output: "true" },
      { input: { nums: [1, 2, 3, 4] }, output: "false" },
      { input: { nums: [99, 99] }, output: "true" },
    ],
    hiddenTestCases: [
      { input: { nums: [1] }, output: "false" },
      { input: { nums: [1, 2, 3, 4, 5, 6, 7, 8, 8] }, output: "true" },
      { input: { nums: [-1, -2, -3, -1] }, output: "true" },
    ],
    tags: ["array", "hash-map"],
    acceptanceRate: 61.2,
    totalSubmissions: 42000,
    acceptedSubmissions: 25704,
  },
  {
    title: "Best Time to Buy and Sell Stock",
    description: `You are given an array prices where prices[i] is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy one stock and a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.

Constraints:
- 1 ≤ prices.length ≤ 10⁵
- 0 ≤ prices[i] ≤ 10⁴`,
    difficulty: "easy",
    functionName: "solution",
    starterCode: {
      "71": `def solution(prices):
    pass`,
      "63": `function solution(prices) {
    return 0;
}`,
      "62": `class Solution {
    public int solution(int[] prices) {
        return 0;
    }
}`,
      "54": `int solution(vector<int>& prices) {
    return 0;
}`,
    },
    testCases: [
      { input: { prices: [7, 1, 5, 3, 6, 4] }, output: "5" },
      { input: { prices: [7, 6, 4, 3, 1] }, output: "0" },
      { input: { prices: [2, 4, 1] }, output: "2" },
    ],
    hiddenTestCases: [
      { input: { prices: [1, 2, 3, 4, 5] }, output: "4" },
      { input: { prices: [5, 4, 3, 2, 1] }, output: "0" },
      { input: { prices: [2, 1, 2, 0, 4, 4, 3, 3, 5] }, output: "4" },
    ],
    tags: ["array", "dynamic-programming"],
    acceptanceRate: 55.7,
    totalSubmissions: 60000,
    acceptedSubmissions: 33420,
  },
  {
    title: "Single Number",
    description: `Given a non-empty array of integers nums, every element appears twice except for one element that appears once. Find that single element.

You must implement a solution with a linear runtime complexity and use only constant extra space.

Constraints:
- 1 ≤ nums.length ≤ 3 × 10⁴
- -3 × 10⁴ ≤ nums[i] ≤ 3 × 10⁴
- Each element in the array appears twice except for one element which appears once.`,
    difficulty: "easy",
    functionName: "solution",
    starterCode: {
      "71": `def solution(nums):
    pass`,
      "63": `function solution(nums) {
    return 0;
}`,
      "62": `class Solution {
    public int solution(int[] nums) {
        return 0;
    }
}`,
      "54": `int solution(vector<int>& nums) {
    return 0;
}`,
    },
    testCases: [
      { input: { nums: [2, 2, 1] }, output: "1" },
      { input: { nums: [4, 1, 2, 1, 2] }, output: "4" },
      { input: { nums: [1] }, output: "1" },
    ],
    hiddenTestCases: [
      { input: { nums: [2, 2, 3, 3, 4] }, output: "4" },
      { input: { nums: [1, 2, 1, 3, 2] }, output: "3" },
      { input: { nums: [-1, -1, 0, 1, 1] }, output: "0" },
    ],
    tags: ["array", "bit-manipulation"],
    acceptanceRate: 74.1,
    totalSubmissions: 48000,
    acceptedSubmissions: 35568,
  },
  {
    title: "Plus One",
    description: `You are given a large integer represented as an integer array digits, where each digits[i] is the ith digit of the integer. The digits are ordered from most significant to least significant in left-to-right order.

The large integer does not contain a 0 at the front. Increment the large integer by one and return the resulting array of digits.

Constraints:
- 1 ≤ digits.length ≤ 100
- 0 ≤ digits[i] ≤ 9
- digits does not contain any 0's at the front.`,
    difficulty: "easy",
    functionName: "solution",
    starterCode: {
      "71": `def solution(digits):
    pass`,
      "63": `function solution(digits) {
    return [];
}`,
      "62": `class Solution {
    public int[] solution(int[] digits) {
        return null;
    }
}`,
      "54": `vector<int> solution(vector<int>& digits) {
    return {};
}`,
    },
    testCases: [
      { input: { digits: [1, 2, 3] }, output: "1 2 4" },
      { input: { digits: [4, 3, 2, 1] }, output: "4 3 2 2" },
      { input: { digits: [9] }, output: "1 0" },
    ],
    hiddenTestCases: [
      { input: { digits: [1, 9, 9] }, output: "2 0 0" },
      { input: { digits: [9, 9, 9] }, output: "1 0 0 0" },
      { input: { digits: [1, 2, 3, 4, 5] }, output: "1 2 3 4 6" },
    ],
    tags: ["array", "math"],
    acceptanceRate: 43.2,
    totalSubmissions: 38000,
    acceptedSubmissions: 16416,
  },
  {
    title: "Pascal's Triangle",
    description: `Given an integer numRows, return the first numRows of Pascal's triangle.

In Pascal's triangle, each number is the sum of the two numbers above it.

Constraints:
- 1 ≤ numRows ≤ 30`,
    difficulty: "easy",
    functionName: "solution",
    starterCode: {
      "71": `def solution(numRows):
    pass`,
      "63": `function solution(numRows) {
    return [];
}`,
      "62": `class Solution {
    public int[][] solution(int numRows) {
        return null;
    }
}`,
      "54": `vector<vector<int>> solution(int numRows) {
    return {};
}`,
    },
    testCases: [
      { input: { numRows: 1 }, output: "[[1]]" },
      { input: { numRows: 2 }, output: "[[1],[1,1]]" },
      { input: { numRows: 3 }, output: "[[1],[1,1],[1,2,1]]" },
    ],
    hiddenTestCases: [
      { input: { numRows: 4 }, output: "[[1],[1,1],[1,2,1],[1,3,3,1]]" },
      { input: { numRows: 5 }, output: "[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]" },
      { input: { numRows: 6 }, output: "[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1],[1,5,10,10,5,1]]" },
    ],
    tags: ["array", "dynamic-programming"],
    acceptanceRate: 68.9,
    totalSubmissions: 32000,
    acceptedSubmissions: 22048,
  },

  // ===== MEDIUM QUESTIONS (11-20) =====
  {
    title: "3Sum",
    description: `Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.

Notice that the solution set must not contain duplicate triplets.

Constraints:
- 3 ≤ nums.length ≤ 3000
- -10⁵ ≤ nums[i] ≤ 10⁵`,
    difficulty: "medium",
    functionName: "solution",
    starterCode: {
      "71": `def solution(nums):
    pass`,
      "63": `function solution(nums) {
    return [];
}`,
      "62": `class Solution {
    public int[][] solution(int[] nums) {
        return null;
    }
}`,
      "54": `vector<vector<int>> solution(vector<int>& nums) {
    return {};
}`,
    },
    testCases: [
      { input: { nums: [-1, 0, 1, 2, -1, -4] }, output: "[[-1,-1,2],[-1,0,1]]" },
      { input: { nums: [0, 0, 0, 0] }, output: "[[0,0,0]]" },
      { input: { nums: [-2, 0, 1, 1, 2] }, output: "[[-2,0,2],[-2,1,1]]" },
    ],
    hiddenTestCases: [
      { input: { nums: [-1, -1, -1, 0, 1, 1, 1] }, output: "[[-1,0,0],[-1,0,1]]" },
      { input: { nums: [-4, -2, -2, -2, 0, 1, 2, 2, 2] }, output: "[[-4,0,4],[-4,2,2],[-2,-2,4],[-2,0,2]]" },
      { input: { nums: [0, 0, 0] }, output: "[[0,0,0]]" },
    ],
    tags: ["array", "two-pointers", "sorting"],
    acceptanceRate: 35.3,
    totalSubmissions: 90000,
    acceptedSubmissions: 31770,
  },
  {
    title: "Longest Substring Without Repeating Characters",
    description: `Given a string s, find the length of the longest substring without repeating characters.

Constraints:
- 0 ≤ s.length ≤ 5 × 10⁴
- s consists of English letters, digits, symbols and spaces.`,
    difficulty: "medium",
    functionName: "solution",
    starterCode: {
      "71": `def solution(s):
    pass`,
      "63": `function solution(s) {
    return 0;
}`,
      "62": `class Solution {
    public int solution(String s) {
        return 0;
    }
}`,
      "54": `int solution(string s) {
    return 0;
}`,
    },
    testCases: [
      { input: { s: "abcabcbb" }, output: "3" },
      { input: { s: "bbbbb" }, output: "1" },
      { input: { s: "pwwkew" }, output: "3" },
    ],
    hiddenTestCases: [
      { input: { s: "" }, output: "0" },
      { input: { s: "au" }, output: "2" },
      { input: { s: "dvdf" }, output: "3" },
    ],
    tags: ["string", "sliding-window", "hash-map"],
    acceptanceRate: 38.8,
    totalSubmissions: 120000,
    acceptedSubmissions: 46560,
  },
  {
    title: "Container With Most Water",
    description: `You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum area of water a container can store.

Constraints:
- n == height.length
- 2 ≤ n ≤ 10⁵
- 0 ≤ height[i] ≤ 10⁴`,
    difficulty: "medium",
    functionName: "solution",
    starterCode: {
      "71": `def solution(height):
    pass`,
      "63": `function solution(height) {
    return 0;
}`,
      "62": `class Solution {
    public int solution(int[] height) {
        return 0;
    }
}`,
      "54": `int solution(vector<int>& height) {
    return 0;
}`,
    },
    testCases: [
      { input: { height: [1, 8, 6, 2, 5, 4, 8, 3, 7] }, output: "49" },
      { input: { height: [1, 1] }, output: "1" },
      { input: { height: [4, 3, 2, 1, 4] }, output: "16" },
    ],
    hiddenTestCases: [
      { input: { height: [2, 3, 4, 5, 18, 17, 6] }, output: "17" },
      { input: { height: [1, 2, 4, 3] }, output: "4" },
      { input: { height: [0, 0] }, output: "0" },
    ],
    tags: ["array", "two-pointers", "greedy"],
    acceptanceRate: 52.6,
    totalSubmissions: 110000,
    acceptedSubmissions: 57860,
  },
  {
    title: "Letter Combinations of a Phone Number",
    description: `Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent. Return the answer in any order.

A mapping of digit to letters (just like on the telephone buttons) is given below:
2: abc, 3: def, 4: ghi, 5: jkl, 6: mno, 7: pqrs, 8: tuv, 9: wxyz

Constraints:
- 0 ≤ digits.length ≤ 4
- digits[i] is a digit in the range ['2', '9'].`,
    difficulty: "medium",
    functionName: "solution",
    starterCode: {
      "71": `def solution(digits):
    pass`,
      "63": `function solution(digits) {
    return [];
}`,
      "62": `class Solution {
    public String[] solution(String digits) {
        return null;
    }
}`,
      "54": `vector<string> solution(string digits) {
    return {};
}`,
    },
    testCases: [
      { input: { digits: "23" }, output: '["ad","ae","af","bd","be","bf","cd","ce","cf"]' },
      { input: { digits: "" }, output: "[]" },
      { input: { digits: "2" }, output: '["a","b","c"]' },
    ],
    hiddenTestCases: [
      { input: { digits: "234" }, output: '["adg","adh","adi","aeg","aeh","aei","afg","afh","afi","bdg","bdh","bdi","beg","beh","bei","bfg","bfh","bfi","cdg","cdh","cdi","ceg","ceh","cei","cfg","cfh","cfi"]' },
      { input: { digits: "42" }, output: '["ga","gb","gc","ha","hb","hc","ia","ib","ic"]' },
      { input: { digits: "9" }, output: '["w","x","y","z"]' },
    ],
    tags: ["string", "backtracking"],
    acceptanceRate: 58.7,
    totalSubmissions: 95000,
    acceptedSubmissions: 55765,
  },
  {
    title: "Generate Parentheses",
    description: `Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.

Constraints:
- 1 ≤ n ≤ 8`,
    difficulty: "medium",
    functionName: "solution",
    starterCode: {
      "71": `def solution(n):
    pass`,
      "63": `function solution(n) {
    return [];
}`,
      "62": `class Solution {
    public String[] solution(int n) {
        return null;
    }
}`,
      "54": `vector<string> solution(int n) {
    return {};
}`,
    },
    testCases: [
      { input: { n: 1 }, output: '["()"]' },
      { input: { n: 2 }, output: '["(())","()()"]' },
      { input: { n: 3 }, output: '["((()))","(()())","(())()","()(())","()()()"]' },
    ],
    hiddenTestCases: [
      { input: { n: 0 }, output: '[""]' },
      { input: { n: 4 }, output: '["(((())))","((()()))","((())())","((()))()","(())(())","(()()())","(()())()","()(())()","()()()()","()((()))","()(()())"]' },
      { input: { n: 2 }, output: '["(())","()()"]' },
    ],
    tags: ["string", "backtracking", "recursion"],
    acceptanceRate: 72.5,
    totalSubmissions: 88000,
    acceptedSubmissions: 63800,
  },
  {
    title: "Permutations",
    description: `Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order.

Constraints:
- 1 ≤ nums.length ≤ 6
- -10 ≤ nums[i] ≤ 10
- All the integers of nums are unique.`,
    difficulty: "medium",
    functionName: "solution",
    starterCode: {
      "71": `def solution(nums):
    pass`,
      "63": `function solution(nums) {
    return [];
}`,
      "62": `class Solution {
    public List<List<Integer>> solution(int[] nums) {
        return null;
    }
}`,
      "54": `vector<vector<int>> solution(vector<int>& nums) {
    return {};
}`,
    },
    testCases: [
      { input: { nums: [0, 1] }, output: "[[0,1],[1,0]]" },
      { input: { nums: [0, 1, 2] }, output: "[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]]" },
      { input: { nums: [1] }, output: "[[1]]" },
    ],
    hiddenTestCases: [
      { input: { nums: [1, 2] }, output: "[[1,2],[2,1]]" },
      { input: { nums: [1, 2, 3] }, output: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]" },
      { input: { nums: [0] }, output: "[[0]]" },
    ],
    tags: ["array", "backtracking", "recursion"],
    acceptanceRate: 68.3,
    totalSubmissions: 82000,
    acceptedSubmissions: 56004,
  },
  {
    title: "Subsets",
    description: `Given an integer array nums of unique elements, return all possible subsets (the power set).

The solution set must not contain duplicate subsets. Return the solution in any order.

Constraints:
- 1 ≤ nums.length ≤ 10
- -10 ≤ nums[i] ≤ 10
- All the integers of nums are unique.`,
    difficulty: "medium",
    functionName: "solution",
    starterCode: {
      "71": `def solution(nums):
    pass`,
      "63": `function solution(nums) {
    return [];
}`,
      "62": `class Solution {
    public List<List<Integer>> solution(int[] nums) {
        return null;
    }
}`,
      "54": `vector<vector<int>> solution(vector<int>& nums) {
    return {};
}`,
    },
    testCases: [
      { input: { nums: [0] }, output: "[[],[0]]" },
      { input: { nums: [1, 2] }, output: "[[],[1],[2],[1,2]]" },
      { input: { nums: [1, 2, 3] }, output: "[[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]" },
    ],
    hiddenTestCases: [
      { input: { nums: [0, 1, 2] }, output: "[[],[0],[1],[0,1],[2],[0,2],[1,2],[0,1,2]]" },
      { input: { nums: [1] }, output: "[[],[1]]" },
      { input: { nums: [0, 1] }, output: "[[],[0],[1],[0,1]]" },
    ],
    tags: ["array", "backtracking", "recursion"],
    acceptanceRate: 77.4,
    totalSubmissions: 75000,
    acceptedSubmissions: 58050,
  },
  {
    title: "Word Search",
    description: `Given an m x n grid of characters board and a string word, return true if word exists in the grid.

The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once in a word.

Constraints:
- m == board.length
- n = board[i].length
- 1 ≤ m, n ≤ 6
- 1 ≤ word.length ≤ 15
- board and word consists of only lowercase and uppercase English letters.`,
    difficulty: "medium",
    functionName: "solution",
    starterCode: {
      "71": `def solution(board, word):
    pass`,
      "63": `function solution(board, word) {
    return false;
}`,
      "62": `class Solution {
    public boolean solution(char[][] board, String word) {
        return false;
    }
}`,
      "54": `bool solution(vector<vector<char>>& board, string word) {
    return false;
}`,
    },
    testCases: [
      { input: { board: [["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]], word: "ABCCED" }, output: "true" },
      { input: { board: [["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]], word: "SEE" }, output: "true" },
      { input: { board: [["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]], word: "ABCB" }, output: "false" },
    ],
    hiddenTestCases: [
      { input: { board: [["A"]], word: "A" }, output: "true" },
      { input: { board: [["A"]], word: "B" }, output: "false" },
      { input: { board: [["a", "b"], ["c", "d"]], word: "acdb" }, output: "true" },
    ],
    tags: ["array", "backtracking", "matrix"],
    acceptanceRate: 41.2,
    totalSubmissions: 105000,
    acceptedSubmissions: 43260,
  },
  {
    title: "Coin Change",
    description: `You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.

You may assume that you have an infinite number of each kind of coin.

Constraints:
- 1 ≤ coins.length ≤ 12
- 1 ≤ coins[i] ≤ 2³¹ - 1
- 0 ≤ amount ≤ 10⁴`,
    difficulty: "medium",
    functionName: "solution",
    starterCode: {
      "71": `def solution(coins, amount):
    pass`,
      "63": `function solution(coins, amount) {
    return 0;
}`,
      "62": `class Solution {
    public int solution(int[] coins, int amount) {
        return 0;
    }
}`,
      "54": `int solution(vector<int>& coins, int amount) {
    return 0;
}`,
    },
    testCases: [
      { input: { coins: [1, 2, 5], amount: 5 }, output: "1" },
      { input: { coins: [2], amount: 3 }, output: "-1" },
      { input: { coins: [10], amount: 10 }, output: "1" },
    ],
    hiddenTestCases: [
      { input: { coins: [1, 3, 4], amount: 6 }, output: "2" },
      { input: { coins: [2, 5, 10], amount: 27 }, output: "4" },
      { input: { coins: [1, 2, 5], amount: 0 }, output: "0" },
    ],
    tags: ["array", "dynamic-programming"],
    acceptanceRate: 43.9,
    totalSubmissions: 95000,
    acceptedSubmissions: 41705,
  },

  // ===== HARD QUESTIONS (21-30) =====
  {
    title: "Median of Two Sorted Arrays",
    description: `Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).

Constraints:
- nums1.length == m
- nums2.length == n
- 0 ≤ m ≤ 1000
- 0 ≤ n ≤ 1000
- 1 ≤ m + n ≤ 2000
- -10⁶ ≤ nums1[i], nums2[j] ≤ 10⁶`,
    difficulty: "hard",
    functionName: "solution",
    starterCode: {
      "71": `def solution(nums1, nums2):
    pass`,
      "63": `function solution(nums1, nums2) {
    return 0.0;
}`,
      "62": `class Solution {
    public double solution(int[] nums1, int[] nums2) {
        return 0.0;
    }
}`,
      "54": `double solution(vector<int>& nums1, vector<int>& nums2) {
    return 0.0;
}`,
    },
    testCases: [
      { input: { nums1: [1, 3], nums2: [2] }, output: "2.0" },
      { input: { nums1: [1, 2], nums2: [3, 4] }, output: "2.5" },
      { input: { nums1: [], nums2: [1] }, output: "1.0" },
    ],
    hiddenTestCases: [
      { input: { nums1: [1, 3], nums2: [2, 4] }, output: "2.5" },
      { input: { nums1: [0, 0], nums2: [0, 0] }, output: "0.0" },
      { input: { nums1: [2], nums2: [] }, output: "2.0" },
    ],
    tags: ["array", "binary-search", "divide-and-conquer"],
    acceptanceRate: 27.8,
    totalSubmissions: 75000,
    acceptedSubmissions: 20850,
  },
  {
    title: "Regular Expression Matching",
    description: `Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where:
- '.' Matches any single character.
- '*' Matches zero or more of the preceding element.

The matching should cover the entire input string (not partial).

Constraints:
- 1 ≤ s.length ≤ 20
- 1 ≤ p.length ≤ 30
- s contains only lowercase English letters.
- p contains only lowercase English letters, '.', and '*'.`,
    difficulty: "hard",
    functionName: "solution",
    starterCode: {
      "71": `def solution(s, p):
    pass`,
      "63": `function solution(s, p) {
    return false;
}`,
      "62": `class Solution {
    public boolean solution(String s, String p) {
        return false;
    }
}`,
      "54": `bool solution(string s, string p) {
    return false;
}`,
    },
    testCases: [
      { input: { s: "aa", p: "a" }, output: "false" },
      { input: { s: "aa", p: "a*" }, output: "true" },
      { input: { s: "ab", p: ".*" }, output: "true" },
    ],
    hiddenTestCases: [
      { input: { s: "aab", p: "c*a*b" }, output: "true" },
      { input: { s: "mississippi", p: "mis*is*p*." }, output: "false" },
      { input: { s: "a", p: ".*" }, output: "true" },
    ],
    tags: ["string", "dynamic-programming", "regex"],
    acceptanceRate: 25.3,
    totalSubmissions: 82000,
    acceptedSubmissions: 20746,
  },
  {
    title: "Merge k Sorted Lists",
    description: `You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.

Constraints:
- k == lists.length
- 0 ≤ k ≤ 10⁴
- 0 ≤ lists[i].length ≤ 500
- -10⁴ ≤ lists[i][j] ≤ 10⁴`,
    difficulty: "hard",
    functionName: "solution",
    starterCode: {
      "71": `def solution(lists):
    pass`,
      "63": `function solution(lists) {
    return null;
}`,
      "62": `class Solution {
    public ListNode solution(ListNode[] lists) {
        return null;
    }
}`,
      "54": `ListNode* solution(vector<ListNode*>& lists) {
    return nullptr;
}`,
    },
    testCases: [
      { input: { lists: [[1, 4, 5], [1, 3, 4], [2, 6]] }, output: "[1,1,2,1,3,4,4,5,6]" },
      { input: { lists: [] }, output: "[]" },
      { input: { lists: [[]] }, output: "[]" },
    ],
    hiddenTestCases: [
      { input: { lists: [[1, 2], [1, 3, 4]] }, output: "[1,1,2,3,4]" },
      { input: { lists: [[1], [2], [3]] }, output: "[1,2,3]" },
      { input: { lists: [[5, 7], [1, 2, 3, 4]] }, output: "[1,2,3,4,5,7]" },
    ],
    tags: ["linked-list", "divide-and-conquer", "heap"],
    acceptanceRate: 36.4,
    totalSubmissions: 120000,
    acceptedSubmissions: 43680,
  },
  {
    title: "Trapping Rain Water",
    description: `Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much rain water it can trap after raining.

Constraints:
- n == height.length
- 1 ≤ n ≤ 2 × 10⁴
- 0 ≤ height[i] ≤ 10⁵`,
    difficulty: "hard",
    functionName: "solution",
    starterCode: {
      "71": `def solution(height):
    pass`,
      "63": `function solution(height) {
    return 0;
}`,
      "62": `class Solution {
    public int solution(int[] height) {
        return 0;
    }
}`,
      "54": `int solution(vector<int>& height) {
    return 0;
}`,
    },
    testCases: [
      { input: { height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] }, output: "6" },
      { input: { height: [4, 2, 0, 3, 2, 5] }, output: "9" },
      { input: { height: [0] }, output: "0" },
    ],
    hiddenTestCases: [
      { input: { height: [4, 2, 3] }, output: "1" },
      { input: { height: [2, 0, 2] }, output: "2" },
      { input: { height: [3, 0, 2, 0, 4] }, output: "7" },
    ],
    tags: ["array", "two-pointers", "dynamic-programming"],
    acceptanceRate: 53.1,
    totalSubmissions: 110000,
    acceptedSubmissions: 58410,
  },
  {
    title: "Word Ladder",
    description: `Given two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord, or 0 if no such sequence exists.

You may assume that beginWord does not exist in wordList, and all words in wordList have the same length and contain only lowercase English letters.

Constraints:
- 1 ≤ beginWord.length ≤ 10
- endWord.length == beginWord.length
- 1 ≤ wordList.length ≤ 5000
- wordList[i].length == beginWord.length
- beginWord, endWord, and wordList[i] consist of lowercase English letters
- beginWord != endWord
- All the words in wordList are unique.`,
    difficulty: "hard",
    functionName: "solution",
    starterCode: {
      "71": `def solution(beginWord, endWord, wordList):
    pass`,
      "63": `function solution(beginWord, endWord, wordList) {
    return 0;
}`,
      "62": `class Solution {
    public int solution(String beginWord, String endWord, List<String> wordList) {
        return 0;
    }
}`,
      "54": `int solution(string beginWord, string endWord, vector<string>& wordList) {
    return 0;
}`,
    },
    testCases: [
      { input: { beginWord: "hit", endWord: "cog", wordList: ["hot", "dot", "dog", "lot", "log", "cog"] }, output: "5" },
      { input: { beginWord: "hit", endWord: "cog", wordList: ["hot", "dot", "dog", "lot", "log"] }, output: "0" },
      { input: { beginWord: "a", endWord: "c", wordList: ["a", "b", "c"] }, output: "2" },
    ],
    hiddenTestCases: [
      { input: { beginWord: "hit", endWord: "hot", wordList: ["hot"] }, output: "2" },
      { input: { beginWord: "cold", endWord: "warm", wordList: ["cold", "cord", "card", "ward", "warm"] }, output: "3" },
      { input: { beginWord: "a", endWord: "b", wordList: ["b"] }, output: "2" },
    ],
    tags: ["string", "graph", "bfs"],
    acceptanceRate: 34.2,
    totalSubmissions: 92000,
    acceptedSubmissions: 31464,
  },
  {
    title: "Binary Tree Maximum Path Sum",
    description: `A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence at most once. Note that the path does not need to pass through the root.

The path sum of a path is the sum of the node's values in the path.

Given the root of a binary tree, return the maximum path sum of any non-empty path.

Constraints:
- The number of nodes in the tree is in the range [1, 3000].
- -1000 ≤ Node.val ≤ 1000`,
    difficulty: "hard",
    functionName: "solution",
    starterCode: {
      "71": `def solution(root):
    pass`,
      "63": `function solution(root) {
    return 0;
}`,
      "62": `class Solution {
    public int solution(TreeNode root) {
        return 0;
    }
}`,
      "54": `int solution(TreeNode* root) {
    return 0;
}`,
    },
    testCases: [
      { input: { root: [1, 2, 3] }, output: "6" },
      { input: { root: [-10] }, output: "-10" },
      { input: { root: [-3] }, output: "-3" },
    ],
    hiddenTestCases: [
      { input: { root: [9, 6, -3, null, null, -6, 2, null, null, 2, null, -6, -6, -6] }, output: "16" },
      { input: { root: [-2, 1] }, output: "1" },
      { input: { root: [2, -1, -2] }, output: "2" },
    ],
    tags: ["tree", "dynamic-programming", "binary-tree"],
    acceptanceRate: 37.5,
    totalSubmissions: 88000,
    acceptedSubmissions: 33000,
  },
  {
    title: "Wildcard Matching",
    description: `Given an input string s and a pattern p, implement wildcard pattern matching with support for '?' and '*' where:
- '?' Matches any single character.
- '*' Matches any sequence of characters (including the empty sequence).

The matching should cover the entire input string (not partial).

Constraints:
- 1 ≤ s.length ≤ 20
- 1 ≤ p.length ≤ 30
- s contains only lowercase English letters.
- p contains only lowercase English letters, '?', and '*'.`,
    difficulty: "hard",
    functionName: "solution",
    starterCode: {
      "71": `def solution(s, p):
    pass`,
      "63": `function solution(s, p) {
    return false;
}`,
      "62": `class Solution {
    public boolean solution(String s, String p) {
        return false;
    }
}`,
      "54": `bool solution(string s, string p) {
    return false;
}`,
    },
    testCases: [
      { input: { s: "aa", p: "a" }, output: "false" },
      { input: { s: "aa", p: "*" }, output: "true" },
      { input: { s: "cb", p: "?a" }, output: "false" },
    ],
    hiddenTestCases: [
      { input: { s: "aab", p: "c*a*b" }, output: "false" },
      { input: { s: "adceb", p: "*a*b" }, output: "true" },
      { input: { s: "a", p: "*" }, output: "true" },
    ],
    tags: ["string", "dynamic-programming", "greedy"],
    acceptanceRate: 28.2,
    totalSubmissions: 95000,
    acceptedSubmissions: 26790,
  },
  {
    title: "First Missing Positive",
    description: `Given an unsorted integer array nums, return the smallest missing positive integer.

You must implement an algorithm that runs in O(n) time and uses O(1) auxiliary space.

Constraints:
- 1 ≤ nums.length ≤ 10⁵
- -2³¹ ≤ nums[i] ≤ 2³¹ - 1`,
    difficulty: "hard",
    functionName: "solution",
    starterCode: {
      "71": `def solution(nums):
    pass`,
      "63": `function solution(nums) {
    return 0;
}`,
      "62": `class Solution {
    public int solution(int[] nums) {
        return 0;
    }
}`,
      "54": `int solution(vector<int>& nums) {
    return 0;
}`,
    },
    testCases: [
      { input: { nums: [1, 2, 0] }, output: "3" },
      { input: { nums: [3, 4, -1, 1] }, output: "2" },
      { input: { nums: [7, 8, 9, 11, 12] }, output: "1" },
    ],
    hiddenTestCases: [
      { input: { nums: [1] }, output: "2" },
      { input: { nums: [2] }, output: "1" },
      { input: { nums: [-1, -2, -3] }, output: "1" },
    ],
    tags: ["array", "hash-table"],
    acceptanceRate: 32.3,
    totalSubmissions: 78000,
    acceptedSubmissions: 25194,
  },
  {
    title: "Edit Distance",
    description: `Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.

You have the following three operations permitted on a word:
- Insert a character
- Delete a character
- Replace a character

Constraints:
- 0 ≤ word1.length, word2.length ≤ 500
- word1 and word2 consist of lowercase English letters.`,
    difficulty: "hard",
    functionName: "solution",
    starterCode: {
      "71": `def solution(word1, word2):
    pass`,
      "63": `function solution(word1, word2) {
    return 0;
}`,
      "62": `class Solution {
    public int solution(String word1, String word2) {
        return 0;
    }
}`,
      "54": `int solution(string word1, string word2) {
    return 0;
}`,
    },
    testCases: [
      { input: { word1: "horse", word2: "ros" }, output: "3" },
      { input: { word1: "intention", word2: "execution" }, output: "5" },
      { input: { word1: "a", word2: "" }, output: "1" },
    ],
    hiddenTestCases: [
      { input: { word1: "ab", word2: "a" }, output: "1" },
      { input: { word1: "", word2: "a" }, output: "1" },
      { input: { word1: "abc", word2: "abc" }, output: "0" },
    ],
    tags: ["string", "dynamic-programming"],
    acceptanceRate: 54.2,
    totalSubmissions: 100000,
    acceptedSubmissions: 54200,
  },
  {
    title: "N-Queens",
    description: `The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.

Given an integer n, return all distinct solutions to the n-queens puzzle. You may return the answer in any order.

Each solution contains a distinct board configuration of the n-queens' placement, where 'Q' and '.' both indicate a queen and an empty space, respectively.

Constraints:
- 1 ≤ n ≤ 8`,
    difficulty: "hard",
    functionName: "solution",
    starterCode: {
      "71": `def solution(n):
    pass`,
      "63": `function solution(n) {
    return [];
}`,
      "62": `class Solution {
    public String[][] solution(int n) {
        return null;
    }
}`,
      "54": `vector<vector<string>> solution(int n) {
    return {};
}`,
    },
    testCases: [
      { input: { n: 1 }, output: '[["Q"]]' },
      { input: { n: 4 }, output: '[[".Q..",".Q..","...Q","Q..."],["..Q.","Q...","...Q",".Q.."]]' },
      { input: { n: 2 }, output: "[]" },
    ],
    hiddenTestCases: [
      { input: { n: 3 }, output: "[]" },
      { input: { n: 5 }, output: "10 solutions" },
      { input: { n: 8 }, output: "92 solutions" },
    ],
    tags: ["array", "backtracking", "recursion"],
    acceptanceRate: 58.6,
    totalSubmissions: 70000,
    acceptedSubmissions: 41020,
  },
];

module.exports = questions;
