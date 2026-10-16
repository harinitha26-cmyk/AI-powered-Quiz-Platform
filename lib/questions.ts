import type { Difficulty, Question, TopicId } from './types'

type Draft = Omit<Question, 'id' | 'topicId' | 'difficulty'>

function group(topicId: TopicId, difficulty: Difficulty, drafts: Draft[]): Question[] {
  return drafts.map((d, i) => ({ ...d, id: `${topicId}-${difficulty}-${i + 1}`, topicId, difficulty }))
}

const python: Question[] = [
  ...group('python', 'easy', [
    {
      prompt: 'What is the output of this code?',
      code: 'print(type([]))',
      options: ["<class 'list'>", "<class 'tuple'>", "<class 'dict'>", "<class 'array'>"],
      answerIndex: 0,
      explanation: 'Square brackets create a list, so type([]) returns the list class.',
      concept: 'Data types',
    },
    {
      prompt: 'Which keyword is used to define a function in Python?',
      options: ['func', 'def', 'function', 'lambda'],
      answerIndex: 1,
      explanation: '`def` defines a named function. `lambda` creates small anonymous function expressions.',
      concept: 'Functions',
    },
    {
      prompt: 'What does len("hello") return?',
      options: ['4', '5', '6', 'An error'],
      answerIndex: 1,
      explanation: 'len() counts characters in a string. "hello" has 5 characters.',
      concept: 'Strings',
    },
    {
      prompt: 'Which of these built-in types is immutable?',
      options: ['list', 'dict', 'set', 'tuple'],
      answerIndex: 3,
      explanation: 'Tuples cannot be changed after creation. Lists, dicts and sets are mutable.',
      concept: 'Mutability',
    },
  ]),
  ...group('python', 'medium', [
    {
      prompt: 'What is printed?',
      code: 'print(3 // 2, 3 / 2)',
      options: ['1 1.5', '1.5 1.5', '1 1', '2 1.5'],
      answerIndex: 0,
      explanation: '`//` is floor division (1) while `/` is true division and always returns a float (1.5).',
      concept: 'Operators',
    },
    {
      prompt: 'What does this list comprehension produce?',
      code: '[x * 2 for x in range(3)]',
      options: ['[0, 2, 4]', '[2, 4, 6]', '[0, 1, 2]', '[1, 2, 3]'],
      answerIndex: 0,
      explanation: 'range(3) yields 0, 1, 2. Doubling each gives [0, 2, 4].',
      concept: 'Comprehensions',
    },
    {
      prompt: 'What does "a,b,c".split(",") return?',
      options: ["['a', 'b', 'c']", "'abc'", "['a,b,c']", "('a', 'b', 'c')"],
      answerIndex: 0,
      explanation: 'str.split() returns a list of substrings separated by the given delimiter.',
      concept: 'Strings',
    },
    {
      prompt: 'Which list method adds a single item to the end of a list?',
      options: ['push()', 'add()', 'append()', 'insert()'],
      answerIndex: 2,
      explanation: 'append() adds one item to the end. insert() needs an index; push/add are not list methods.',
      concept: 'Lists',
    },
  ]),
  ...group('python', 'hard', [
    {
      prompt: 'What does the final call print?',
      code: 'def f(x, items=[]):\n    items.append(x)\n    return items\n\nf(1)\nprint(f(2))',
      options: ['[2]', '[1, 2]', '[1]', 'An error'],
      answerIndex: 1,
      explanation:
        'Default arguments are evaluated once, so the same list is reused across calls. Use `items=None` and create a new list inside instead.',
      concept: 'Mutable defaults',
    },
    {
      prompt: 'What does the `is` operator compare?',
      options: ['Values', 'Object identity', 'Types', 'Hash values'],
      answerIndex: 1,
      explanation: '`is` checks whether two names point to the same object in memory. `==` compares values.',
      concept: 'Identity',
    },
    {
      prompt: 'What is the key advantage of a generator expression over a list comprehension?',
      options: [
        'Lazy evaluation uses less memory',
        'It is always faster',
        'It supports indexing',
        'It sorts results automatically',
      ],
      answerIndex: 0,
      explanation: 'Generators produce items on demand instead of building the full list in memory.',
      concept: 'Generators',
    },
    {
      prompt: 'What does the @functools.lru_cache decorator do?',
      options: [
        'Memoizes function results',
        'Logs every function call',
        'Makes a function asynchronous',
        'Limits recursion depth',
      ],
      answerIndex: 0,
      explanation: 'lru_cache stores results for previous arguments and returns them without recomputing.',
      concept: 'Decorators',
    },
  ]),
]

const sql: Question[] = [
  ...group('sql', 'easy', [
    {
      prompt: 'Which clause filters individual rows in a query?',
      options: ['WHERE', 'ORDER BY', 'GROUP BY', 'SELECT'],
      answerIndex: 0,
      explanation: 'WHERE filters rows before any grouping or ordering happens.',
      concept: 'Filtering',
    },
    {
      prompt: 'Which statement retrieves data from a table?',
      options: ['GET', 'SELECT', 'FETCH', 'READ'],
      answerIndex: 1,
      explanation: 'SELECT is the standard SQL statement for reading data.',
      concept: 'Basics',
    },
    {
      prompt: 'Which keyword removes duplicate rows from a result set?',
      options: ['UNIQUE', 'DISTINCT', 'DIFFERENT', 'SINGLE'],
      answerIndex: 1,
      explanation: 'SELECT DISTINCT returns only unique rows. UNIQUE is a constraint, not a query keyword.',
      concept: 'Basics',
    },
    {
      prompt: 'Which statement adds new rows to a table?',
      options: ['ADD ROW', 'INSERT INTO', 'UPDATE', 'CREATE'],
      answerIndex: 1,
      explanation: 'INSERT INTO adds rows. UPDATE modifies existing rows.',
      concept: 'Data modification',
    },
  ]),
  ...group('sql', 'medium', [
    {
      prompt: 'Which join returns every row from the left table plus matching rows from the right?',
      options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN'],
      answerIndex: 1,
      explanation: 'LEFT JOIN keeps all left-table rows and fills unmatched right columns with NULL.',
      concept: 'Joins',
    },
    {
      prompt: 'Which clause filters groups after aggregation?',
      options: ['WHERE', 'HAVING', 'LIMIT', 'ON'],
      answerIndex: 1,
      explanation: 'HAVING filters on aggregated values like COUNT() or SUM(); WHERE runs before grouping.',
      concept: 'Aggregation',
    },
    {
      prompt: 'What does COUNT(column) skip?',
      options: ['NULL values', 'Duplicate values', 'Zeros', 'Empty strings'],
      answerIndex: 0,
      explanation: 'COUNT(column) ignores NULLs. COUNT(*) counts every row regardless of NULLs.',
      concept: 'Aggregation',
    },
    {
      prompt: 'Which constraint guarantees a column never contains NULL?',
      options: ['NOT NULL', 'UNIQUE', 'CHECK', 'DEFAULT'],
      answerIndex: 0,
      explanation: 'NOT NULL rejects inserts or updates that would leave the column empty.',
      concept: 'Constraints',
    },
  ]),
  ...group('sql', 'hard', [
    {
      prompt: 'What does this window function do?',
      code: 'ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC)',
      options: [
        'Numbers rows within each department by salary',
        'Deletes duplicate salaries',
        'Collapses each department into one row',
        'Permanently sorts the table',
      ],
      answerIndex: 0,
      explanation: 'Window functions compute per-row values over a partition without collapsing rows.',
      concept: 'Window functions',
    },
    {
      prompt: 'Which isolation level prevents dirty reads but still allows non-repeatable reads?',
      options: ['READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE'],
      answerIndex: 1,
      explanation: 'READ COMMITTED only sees committed data, but a re-read can return a newer committed value.',
      concept: 'Transactions',
    },
    {
      prompt: 'What does SELECT NULL = NULL evaluate to?',
      options: ['TRUE', 'FALSE', 'NULL (unknown)', 'An error'],
      answerIndex: 2,
      explanation: 'Comparisons with NULL yield UNKNOWN. Use IS NULL to test for NULL values.',
      concept: 'NULL logic',
    },
    {
      prompt: 'An index on (last_name, first_name) best supports which filter?',
      options: [
        "WHERE first_name = 'Ana'",
        "WHERE last_name = 'Lee'",
        "WHERE first_name LIKE '%a'",
        'ORDER BY first_name only',
      ],
      answerIndex: 1,
      explanation: 'Composite indexes follow the leftmost-prefix rule, so filters must start with last_name.',
      concept: 'Indexes',
    },
  ]),
]

const aptitude: Question[] = [
  ...group('aptitude', 'easy', [
    {
      prompt: 'What is 25% of 240?',
      options: ['50', '60', '70', '80'],
      answerIndex: 1,
      explanation: '25% is one quarter. 240 ÷ 4 = 60.',
      concept: 'Percentages',
    },
    {
      prompt: 'What comes next in the series 2, 4, 8, 16, …?',
      options: ['24', '30', '32', '36'],
      answerIndex: 2,
      explanation: 'Each term doubles the previous one: 16 × 2 = 32.',
      concept: 'Number series',
    },
    {
      prompt: 'A car travels 120 km in 2 hours. What is its average speed?',
      options: ['50 km/h', '60 km/h', '70 km/h', '240 km/h'],
      answerIndex: 1,
      explanation: 'Speed = distance ÷ time = 120 ÷ 2 = 60 km/h.',
      concept: 'Speed & distance',
    },
    {
      prompt: 'If 5 pens cost $15, how much do 8 pens cost?',
      options: ['$20', '$24', '$25', '$40'],
      answerIndex: 1,
      explanation: 'One pen costs $3, so 8 pens cost 8 × $3 = $24.',
      concept: 'Unitary method',
    },
  ]),
  ...group('aptitude', 'medium', [
    {
      prompt: 'A shirt costs $80 after a 20% discount. What was the original price?',
      options: ['$96', '$100', '$64', '$110'],
      answerIndex: 1,
      explanation: '$80 is 80% of the original price, so original = 80 ÷ 0.8 = $100.',
      concept: 'Percentages',
    },
    {
      prompt: 'Boys to girls are in the ratio 3:5 in a class of 40. How many girls are there?',
      options: ['15', '20', '25', '24'],
      answerIndex: 2,
      explanation: 'Total parts = 8. Girls = 5/8 × 40 = 25.',
      concept: 'Ratios',
    },
    {
      prompt: 'What is the simple interest on $2,000 at 5% per year for 3 years?',
      options: ['$250', '$300', '$350', '$600'],
      answerIndex: 1,
      explanation: 'SI = P × R × T ÷ 100 = 2000 × 5 × 3 ÷ 100 = $300.',
      concept: 'Interest',
    },
    {
      prompt: 'A can finish a job in 6 days and B in 12 days. How long do they take together?',
      options: ['3 days', '4 days', '6 days', '9 days'],
      answerIndex: 1,
      explanation: 'Combined rate = 1/6 + 1/12 = 1/4 of the job per day, so 4 days.',
      concept: 'Time & work',
    },
  ]),
  ...group('aptitude', 'hard', [
    {
      prompt:
        'Trains of 150 m and 100 m run in opposite directions at 40 km/h and 50 km/h. How long do they take to cross each other?',
      options: ['8 seconds', '10 seconds', '12 seconds', '15 seconds'],
      answerIndex: 1,
      explanation: 'Relative speed = 90 km/h = 25 m/s. Total length 250 m ÷ 25 m/s = 10 s.',
      concept: 'Speed & distance',
    },
    {
      prompt: 'A price rises 25%. By what percent must consumption drop to keep spending unchanged?',
      options: ['20%', '25%', '15%', '30%'],
      answerIndex: 0,
      explanation: 'Reduction = 25 ÷ (100 + 25) × 100 = 20%.',
      concept: 'Percentages',
    },
    {
      prompt: 'A is twice as old as B. Ten years ago, A was three times as old as B. How old is A now?',
      options: ['30', '40', '50', '60'],
      answerIndex: 1,
      explanation: 'Let B = x, A = 2x. Then 2x − 10 = 3(x − 10), so x = 20 and A = 40.',
      concept: 'Ages',
    },
    {
      prompt: 'What is the probability of getting at least one head in three fair coin tosses?',
      options: ['1/2', '3/4', '7/8', '1/8'],
      answerIndex: 2,
      explanation: 'P(no heads) = (1/2)³ = 1/8, so P(at least one) = 1 − 1/8 = 7/8.',
      concept: 'Probability',
    },
  ]),
]

const dsa: Question[] = [
  ...group('dsa', 'easy', [
    {
      prompt: 'Which data structure follows Last-In, First-Out (LIFO)?',
      options: ['Queue', 'Stack', 'Array', 'Tree'],
      answerIndex: 1,
      explanation: 'A stack removes the most recently added item first, like a stack of plates.',
      concept: 'Stacks & queues',
    },
    {
      prompt: 'What is the time complexity of accessing an array element by index?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
      answerIndex: 0,
      explanation: 'Arrays use contiguous memory, so any index is computed directly in constant time.',
      concept: 'Complexity',
    },
    {
      prompt: 'Which data structure follows First-In, First-Out (FIFO)?',
      options: ['Stack', 'Queue', 'Heap', 'Graph'],
      answerIndex: 1,
      explanation: 'A queue serves items in the order they arrived.',
      concept: 'Stacks & queues',
    },
    {
      prompt: 'In a binary tree, each node has at most how many children?',
      options: ['1', '2', '3', 'Unlimited'],
      answerIndex: 1,
      explanation: 'Binary means two: each node has at most a left and a right child.',
      concept: 'Trees',
    },
  ]),
  ...group('dsa', 'medium', [
    {
      prompt: 'What is the time complexity of binary search on a sorted array?',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
      answerIndex: 1,
      explanation: 'Each step halves the search space, giving logarithmic time.',
      concept: 'Searching',
    },
    {
      prompt: 'Which traversal of a binary search tree visits nodes in sorted order?',
      options: ['Preorder', 'Inorder', 'Postorder', 'Level-order'],
      answerIndex: 1,
      explanation: 'Inorder visits left subtree, node, then right subtree — ascending order for a BST.',
      concept: 'Trees',
    },
    {
      prompt: 'What is the average time complexity of a hash table lookup?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      answerIndex: 0,
      explanation: 'A good hash function spreads keys evenly, so lookups take constant time on average.',
      concept: 'Hashing',
    },
    {
      prompt: 'Which algorithm finds shortest paths from one source when edge weights are non-negative?',
      options: ["Dijkstra's", "Kruskal's", 'Depth-first search', "Prim's"],
      answerIndex: 0,
      explanation: "Dijkstra's algorithm greedily expands the closest unvisited node. Kruskal and Prim build spanning trees.",
      concept: 'Graphs',
    },
  ]),
  ...group('dsa', 'hard', [
    {
      prompt: 'What is the worst-case time complexity of quicksort?',
      options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
      answerIndex: 1,
      explanation: 'Consistently poor pivots (e.g. already sorted input) create unbalanced partitions and O(n²) time.',
      concept: 'Sorting',
    },
    {
      prompt: 'Which structure returns the minimum in O(1) and inserts in O(log n)?',
      options: ['Min-heap', 'Linked list', 'Stack', 'Hash set'],
      answerIndex: 0,
      explanation: 'A min-heap keeps the smallest element at the root and restores order in O(log n) after inserts.',
      concept: 'Heaps',
    },
    {
      prompt: 'Which technique detects a cycle in a linked list using O(1) extra space?',
      options: ["Floyd's tortoise and hare", 'Binary search', 'A hash map of visited nodes', 'Recursion'],
      answerIndex: 0,
      explanation: 'Two pointers moving at different speeds will meet if and only if a cycle exists.',
      concept: 'Linked lists',
    },
    {
      prompt: 'What is the time complexity of building a heap from n elements with bottom-up heapify?',
      options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(n²)'],
      answerIndex: 0,
      explanation: 'Most nodes sit near the leaves and need little sifting, so the total work sums to O(n).',
      concept: 'Heaps',
    },
  ]),
]

const gk: Question[] = [
  ...group('gk', 'easy', [
    {
      prompt: 'What is the largest planet in our solar system?',
      options: ['Saturn', 'Jupiter', 'Neptune', 'Earth'],
      answerIndex: 1,
      explanation: 'Jupiter is more than twice as massive as all the other planets combined.',
      concept: 'Space',
    },
    {
      prompt: 'How many continents are there?',
      options: ['5', '6', '7', '8'],
      answerIndex: 2,
      explanation: 'The common model counts seven: Africa, Antarctica, Asia, Australia, Europe, North and South America.',
      concept: 'Geography',
    },
    {
      prompt: 'What is the chemical symbol for gold?',
      options: ['Ag', 'Au', 'Gd', 'Go'],
      answerIndex: 1,
      explanation: 'Au comes from the Latin word "aurum". Ag is silver.',
      concept: 'Chemistry',
    },
    {
      prompt: 'Which gas do plants absorb from the air for photosynthesis?',
      options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'],
      answerIndex: 2,
      explanation: 'Plants take in CO₂ and release oxygen as a by-product of photosynthesis.',
      concept: 'Biology',
    },
  ]),
  ...group('gk', 'medium', [
    {
      prompt: 'Who painted the Mona Lisa?',
      options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Vincent van Gogh'],
      answerIndex: 1,
      explanation: 'Leonardo da Vinci painted it in the early 1500s; it hangs in the Louvre in Paris.',
      concept: 'Art & culture',
    },
    {
      prompt: 'Which is the longest river in Africa?',
      options: ['Nile', 'Congo', 'Niger', 'Zambezi'],
      answerIndex: 0,
      explanation: 'The Nile runs about 6,650 km through northeastern Africa.',
      concept: 'Geography',
    },
    {
      prompt: 'What is the hardest naturally occurring substance?',
      options: ['Gold', 'Iron', 'Diamond', 'Quartz'],
      answerIndex: 2,
      explanation: 'Diamond scores 10 on the Mohs hardness scale.',
      concept: 'Science',
    },
    {
      prompt: 'Which country hosted the first modern Olympic Games in 1896?',
      options: ['France', 'Greece', 'United Kingdom', 'United States'],
      answerIndex: 1,
      explanation: 'The 1896 Games were held in Athens, honouring the ancient Olympics.',
      concept: 'History',
    },
  ]),
  ...group('gk', 'hard', [
    {
      prompt: 'What is the approximate speed of light in a vacuum?',
      options: ['300,000 km/s', '150,000 km/s', '30,000 km/s', '1,000,000 km/s'],
      answerIndex: 0,
      explanation: 'Light travels at about 299,792 km/s in a vacuum.',
      concept: 'Physics',
    },
    {
      prompt: 'Which element has the highest electronegativity?',
      options: ['Fluorine', 'Oxygen', 'Chlorine', 'Nitrogen'],
      answerIndex: 0,
      explanation: 'Fluorine tops the Pauling scale at about 3.98.',
      concept: 'Chemistry',
    },
    {
      prompt: 'In which year did the Berlin Wall fall?',
      options: ['1987', '1989', '1991', '1993'],
      answerIndex: 1,
      explanation: 'The wall opened on 9 November 1989, leading to German reunification in 1990.',
      concept: 'History',
    },
    {
      prompt: "Which layer of Earth's atmosphere contains the ozone layer?",
      options: ['Troposphere', 'Stratosphere', 'Mesosphere', 'Thermosphere'],
      answerIndex: 1,
      explanation: 'Most ozone sits in the stratosphere, roughly 15–35 km above the surface.',
      concept: 'Earth science',
    },
  ]),
]

export const QUESTION_BANK: Question[] = [...python, ...sql, ...aptitude, ...dsa, ...gk]

export function countQuestions(topicId: TopicId) {
  return QUESTION_BANK.filter((q) => q.topicId === topicId).length
}
