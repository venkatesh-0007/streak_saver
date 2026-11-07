export const PRESET_QUESTIONS = [
  {
    id: '2383',
    frontendId: '2235',
    slug: 'add-two-integers',
    title: '2235. Add Two Integers',
    difficulty: 'Easy',
    lang: 'python3',
    code: `class Solution:
    def sum(self, num1: int, num2: int) -> int:
        return num1 + num2
`,
  },
  {
    id: '2556',
    frontendId: '2469',
    slug: 'convert-the-temperature',
    title: '2469. Convert the Temperature',
    difficulty: 'Easy',
    lang: 'python3',
    code: `class Solution:
    def convertTemperature(self, celsius: float) -> list[float]:
        return [celsius + 273.15, celsius * 1.80 + 32.00]
`,
  },
  {
    id: '2058',
    frontendId: '1929',
    slug: 'concatenation-of-array',
    title: '1929. Concatenation of Array',
    difficulty: 'Easy',
    lang: 'python3',
    code: `class Solution:
    def getConcatenation(self, nums: list[int]) -> list[int]:
        return nums + nums
`,
  },
  {
    id: '2137',
    frontendId: '2011',
    slug: 'final-value-of-variable-after-performing-operations',
    title: '2011. Final Value of Variable After Performing Operations',
    difficulty: 'Easy',
    lang: 'python3',
    code: `class Solution:
    def finalValueAfterOperations(self, operations: list[str]) -> int:
        return sum(1 if '+' in op else -1 for op in operations)
`,
  },
  {
    id: '2384',
    frontendId: '2236',
    slug: 'root-equals-sum-of-children',
    title: '2236. Root Equals Sum of Children',
    difficulty: 'Easy',
    lang: 'python3',
    code: `class Solution:
    def checkTree(self, root: Optional[TreeNode]) -> bool:
        return root.val == (root.left.val + root.right.val)
`,
  },
];

