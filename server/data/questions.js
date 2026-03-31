/**
 * Sample questions for seeding the question database
 * These are DSA problems with complete test cases
 */

const questions = [
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
    """
    Args:
        nums: List of integers
        target: Target sum
    
    Returns:
        List of two indices [i, j] where nums[i] + nums[j] = target
    """
    pass`,
      "63": `function solution(nums, target) {
    /**
     * @param {number[]} nums
     * @param {number} target
     * @return {number[]} - Two indices where nums[i] + nums[j] = target
     */
    return [];
}`,
      "62": `class Solution {
    public int[] solution(int[] nums, int target) {
        // Return indices [i, j] where nums[i] + nums[j] = target
        return null;
    }
}`,
      "54": `#include <vector>
using namespace std;

vector<int> solution(vector<int>& nums, int target) {
    // Return indices [i, j] where nums[i] + nums[j] = target
    return {};
}`,
    },
    testCases: [
      {
        input: { nums: [2, 7, 11, 15], target: 9 },
        output: "0 1",
      },
      {
        input: { nums: [3, 2, 4], target: 6 },
        output: "1 2",
      },
      {
        input: { nums: [3, 3], target: 6 },
        output: "0 1",
      },
    ],
    hiddenTestCases: [
      {
        input: { nums: [2, 7, 11, 15, 3], target: 5 },
        output: "1 4",
      },
      {
        input: { nums: [1, 2, 3, 4, 5], target: 9 },
        output: "3 4",
      },
      {
        input: { nums: [-1, 0, 1, 2, -1, -4, -2], target: 0 },
        output: "0 4",
      },
    ],
    tags: ["array", "hash-map", "two-pointers"],
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
    """
    Args:
        s: List of characters
    
    Returns:
        List with reversed characters
    """
    pass`,
      "63": `function solution(s) {
    /**
     * @param {string[]} s
     * @return {string[]} - Reversed string as array of characters
     */
    return [];
}`,
      "62": `class Solution {
    public char[] solution(char[] s) {
        // Return reversed array
        return null;
    }
}`,
      "54": `#include <vector>
#include <string>
using namespace std;

vector<char> solution(vector<char>& s) {
    // Return reversed string as vector
    return {};
}`,
    },
    testCases: [
      {
        input: { s: ["h", "e", "l", "l", "o"] },
        output: "o l l e h",
      },
      {
        input: { s: ["H", "a", "n", "n", "a", "h"] },
        output: "h a n n a H",
      },
    ],
    hiddenTestCases: [
      {
        input: { s: ["a"] },
        output: "a",
      },
      {
        input: { s: ["0", "1", "2", "3", "4", "5"] },
        output: "5 4 3 2 1 0",
      },
    ],
    tags: ["string", "array", "two-pointers"],
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
    """
    Args:
        nums: Sorted list of integers
    
    Returns:
        Number of unique elements
    """
    pass`,
      "63": `function solution(nums) {
    /**
     * @param {number[]} nums - Sorted array
     * @return {number} - Count of unique elements
     */
    return 0;
}`,
      "62": `class Solution {
    public int solution(int[] nums) {
        // Return count of unique elements
        return 0;
    }
}`,
      "54": `#include <vector>
using namespace std;

int solution(vector<int>& nums) {
    // Return count of unique elements
    return 0;
}`,
    },
    testCases: [
      {
        input: { nums: [1, 1, 2] },
        output: "2",
      },
      {
        input: { nums: [0, 0, 1, 1, 1, 2, 2, 3, 3, 4] },
        output: "5",
      },
    ],
    hiddenTestCases: [
      {
        input: { nums: [1] },
        output: "1",
      },
      {
        input: { nums: [1, 2, 3, 4, 5] },
        output: "5",
      },
      {
        input: { nums: [1, 1, 1, 1] },
        output: "1",
      },
    ],
    tags: ["array", "two-pointers"],
  },
  {
    title: "Valid Palindrome",
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Alphanumeric characters include letters and numbers.

Given a string s, return true if it is a palindrome, or false otherwise.

Constraints:
- 1 ≤ s.length ≤ 10⁵
- s consists of printable ASCII characters.`,
    difficulty: "easy",
    functionName: "solution",
    starterCode: {
      "71": `def solution(s):
    """
    Args:
        s: String to check
    
    Returns:
        True if palindrome, False otherwise
    """
    pass`,
      "63": `function solution(s) {
    /**
     * @param {string} s
     * @return {boolean}
     */
    return true;
}`,
      "62": `class Solution {
    public boolean solution(String s) {
        // Check if palindrome
        return true;
    }
}`,
      "54": `#include <string>
using namespace std;

bool solution(string s) {
    // Check if palindrome
    return true;
}`,
    },
    testCases: [
      {
        input: { s: "A man, a plan, a canal: Panama" },
        output: "true",
      },
      {
        input: { s: "race a car" },
        output: "false",
      },
      {
        input: { s: " " },
        output: "true",
      },
    ],
    hiddenTestCases: [
      {
        input: { s: "0P" },
        output: "false",
      },
      {
        input: { s: ".,a" },
        output: "true",
      },
      {
        input: { s: "a." },
        output: "true",
      },
    ],
    tags: ["string", "two-pointers"],
  },
  {
    title: "Merge Sorted Array",
    description: `You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of valid elements in nums1 and nums2 respectively.

Merge nums2 into nums1 as one sorted array.

Note: You may assume that nums1 has a length of m + n, so it has a sufficient space to hold additional elements from nums2.

Constraints:
- nums1.length == m + n
- nums2.length == n
- 0 ≤ m, n ≤ 200
- 1 ≤ m + n ≤ 200
- -10⁹ ≤ nums1[i], nums2[j] ≤ 10⁹`,
    difficulty: "easy",
    functionName: "solution",
    starterCode: {
      "71": `def solution(nums1, m, nums2, n):
    """
    Args:
        nums1: First sorted array
        m: Number of valid elements in nums1
        nums2: Second sorted array
        n: Number of valid elements in nums2
    
    Returns:
        Merged sorted array
    """
    pass`,
      "63": `function solution(nums1, m, nums2, n) {
    /**
     * @param {number[]} nums1
     * @param {number} m
     * @param {number[]} nums2
     * @param {number} n
     * @return {number[]}
     */
    return [];
}`,
      "62": `class Solution {
    public int[] solution(int[] nums1, int m, int[] nums2, int n) {
        // Merge sorted arrays
        return null;
    }
}`,
      "54": `#include <vector>
using namespace std;

vector<int> solution(vector<int>& nums1, int m, vector<int>& nums2, int n) {
    // Merge sorted arrays
    return {};
}`,
    },
    testCases: [
      {
        input: { nums1: [1, 2, 3, 0, 0, 0], m: 3, nums2: [2, 5, 6], n: 3 },
        output: "1 2 2 3 5 6",
      },
      {
        input: { nums1: [1], m: 1, nums2: [], n: 0 },
        output: "1",
      },
      {
        input: { nums1: [0], m: 0, nums2: [1], n: 1 },
        output: "1",
      },
    ],
    hiddenTestCases: [
      {
        input: { nums1: [4, 5, 6, 0, 0, 0], m: 3, nums2: [1, 2, 3], n: 3 },
        output: "1 2 3 4 5 6",
      },
      {
        input: { nums1: [-1, 0, 0, 3, 3, 3, 0, 0, 0], m: 6, nums2: [1, 2, 2], n: 3 },
        output: "-1 0 0 1 2 2 3 3 3",
      },
    ],
    tags: ["array", "two-pointers", "sorting"],
  },
];

module.exports = questions;
