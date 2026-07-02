const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Assessment = require('../models/Assessment');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

/* ============================================================
   INITIAL ASSESSMENT QUESTION BANK
   Fixed topic order: Variables -> DataTypes -> Loops ->
   Functions -> Arrays. Each topic has a pool of easy/medium/hard
   questions. The adaptive flow serves 3 per topic, escalating
   difficulty on a correct answer and easing on a wrong one.
   ============================================================ */

// ---------------------- PYTHON ----------------------
const pythonQuestions = [
  // ===== VARIABLES =====
  { questionType: 'code_output', topic: 'Variables', difficulty: 'easy', question: 'What is the output?', code: 'x = 5\nx = x + 3\nprint(x)', options: ['5', '8', '3', '53'], correctAnswer: '8', explanation: 'x is increased by 3 before printing.' },
  { questionType: 'mcq', topic: 'Variables', difficulty: 'easy', question: 'Which of these is a valid variable name in Python?', options: ['2var', 'my_var', 'my var', 'class'], correctAnswer: 'my_var', explanation: 'Names cannot start with a digit, contain spaces, or be keywords.' },
  { questionType: 'mcq', topic: 'Variables', difficulty: 'easy', question: 'How do you assign the value 10 to a variable x?', options: ['x == 10', 'x = 10', 'x := 10', 'let x = 10'], correctAnswer: 'x = 10', explanation: '= is the assignment operator.' },
  { questionType: 'code_output', topic: 'Variables', difficulty: 'medium', question: 'What is the output?', code: 'x = 5\ny = x\ny = 10\nprint(x)', options: ['5', '10', '15', 'Error'], correctAnswer: '5', explanation: 'Integers are immutable; reassigning y does not change x.' },
  { questionType: 'code_output', topic: 'Variables', difficulty: 'medium', question: 'What is the output?', code: 'x = y = z = 2\nprint(x + y + z)', options: ['2', '6', '222', 'Error'], correctAnswer: '6', explanation: 'Chained assignment gives all three the value 2.' },
  { questionType: 'code_output', topic: 'Variables', difficulty: 'hard', question: 'What is printed on the two lines?', code: 'def f(a, L=[]):\n    L.append(a)\n    return L\nprint(f(1))\nprint(f(2))', options: ['[1], [1]', '[1], [1, 2]', '[1, 2], [1, 2]', 'Error'], correctAnswer: '[1], [1, 2]', explanation: 'A mutable default argument is shared across calls.' },
  { questionType: 'code_output', topic: 'Variables', difficulty: 'hard', question: 'What is the output?', code: 'a = [1, 2]\nb = a[:]\nb.append(3)\nprint(a)', options: ['[1, 2]', '[1, 2, 3]', '[3]', 'Error'], correctAnswer: '[1, 2]', explanation: 'a[:] makes a copy, so appending to b leaves a unchanged.' },

  // ===== DATA TYPES =====
  { questionType: 'mcq', topic: 'DataTypes', difficulty: 'easy', question: 'What is the data type of 3.14?', options: ['int', 'float', 'str', 'bool'], correctAnswer: 'float', explanation: 'Numbers with a decimal point are floats.' },
  { questionType: 'mcq', topic: 'DataTypes', difficulty: 'easy', question: 'What is the data type of "hello"?', options: ['str', 'char', 'text', 'word'], correctAnswer: 'str', explanation: 'Text in quotes is a string (str).' },
  { questionType: 'mcq', topic: 'DataTypes', difficulty: 'easy', question: 'Which is a valid boolean value in Python?', options: ['true', 'True', '1', 'yes'], correctAnswer: 'True', explanation: 'Python booleans are capitalized: True / False.' },
  { questionType: 'code_output', topic: 'DataTypes', difficulty: 'medium', question: 'What is the output?', code: 'print(type(5) == int)', options: ['True', 'False', 'int', 'Error'], correctAnswer: 'True', explanation: 'type(5) is int, so the comparison is True.' },
  { questionType: 'code_output', topic: 'DataTypes', difficulty: 'medium', question: 'What is the output?', code: 'print(int("10") + 5)', options: ['15', '105', 'Error', '"105"'], correctAnswer: '15', explanation: 'int("10") converts to 10, then adds 5.' },
  { questionType: 'code_output', topic: 'DataTypes', difficulty: 'hard', question: 'What is the output?', code: 'print(1 == 1.0)', options: ['True', 'False', 'Error', '1'], correctAnswer: 'True', explanation: 'int and float compare equal by value.' },
  { questionType: 'code_output', topic: 'DataTypes', difficulty: 'hard', question: 'What is the output?', code: 'print(bool(""))', options: ['True', 'False', '""', 'Error'], correctAnswer: 'False', explanation: 'An empty string is falsy.' },

  // ===== LOOPS =====
  { questionType: 'code_output', topic: 'Loops', difficulty: 'easy', question: 'What is the output?', code: 'for i in range(3):\n    print(i)', options: ['0 1 2', '1 2 3', '0 1 2 3', '3'], correctAnswer: '0 1 2', explanation: 'range(3) yields 0, 1, 2.' },
  { questionType: 'mcq', topic: 'Loops', difficulty: 'easy', question: 'Which loop runs exactly 5 times?', options: ['for i in range(5):', 'for i in range(1, 5):', 'while i > 5:', 'for i in 5:'], correctAnswer: 'for i in range(5):', explanation: 'range(5) produces 0..4 — five iterations.' },
  { questionType: 'mcq', topic: 'Loops', difficulty: 'easy', question: 'Which keyword exits a loop early?', options: ['stop', 'break', 'exit', 'end'], correctAnswer: 'break', explanation: 'break terminates the loop immediately.' },
  { questionType: 'code_output', topic: 'Loops', difficulty: 'medium', question: 'What is the output?', code: 'i = 0\ntotal = 0\nwhile i < 4:\n    total += i\n    i += 1\nprint(total)', options: ['6', '10', '4', '0'], correctAnswer: '6', explanation: '0 + 1 + 2 + 3 = 6.' },
  { questionType: 'code_output', topic: 'Loops', difficulty: 'medium', question: 'What is the output?', code: 'for i in range(1, 6, 2):\n    print(i)', options: ['1 3 5', '1 2 3 4 5', '2 4', '1 3 5 7'], correctAnswer: '1 3 5', explanation: 'Start 1, step 2, stop before 6.' },
  { questionType: 'code_output', topic: 'Loops', difficulty: 'hard', question: 'What is the output?', code: 'result = 0\nfor i in range(3):\n    for j in range(3):\n        result += 1\nprint(result)', options: ['3', '6', '9', '12'], correctAnswer: '9', explanation: 'Nested loops run 3 × 3 = 9 times.' },
  { questionType: 'code_output', topic: 'Loops', difficulty: 'hard', question: 'What is the output?', code: 'for i in range(5):\n    if i == 2:\n        continue\n    print(i)', options: ['0 1 2 3 4', '0 1 3 4', '2', '0 1'], correctAnswer: '0 1 3 4', explanation: 'continue skips printing when i is 2.' },

  // ===== FUNCTIONS =====
  { questionType: 'mcq', topic: 'Functions', difficulty: 'easy', question: 'Which keyword defines a function in Python?', options: ['func', 'def', 'function', 'define'], correctAnswer: 'def', explanation: 'Functions are declared with def.' },
  { questionType: 'code_output', topic: 'Functions', difficulty: 'easy', question: 'What is the output?', code: 'def greet():\n    return "hi"\nprint(greet())', options: ['hi', 'greet', 'None', 'Error'], correctAnswer: 'hi', explanation: 'The function returns and prints "hi".' },
  { questionType: 'mcq', topic: 'Functions', difficulty: 'easy', question: 'How do you call a function named foo?', options: ['call foo', 'foo()', 'foo', 'run foo'], correctAnswer: 'foo()', explanation: 'Parentheses invoke the function.' },
  { questionType: 'code_output', topic: 'Functions', difficulty: 'medium', question: 'What is the output?', code: 'def add(a, b=2):\n    return a + b\nprint(add(3))', options: ['5', '3', '32', 'Error'], correctAnswer: '5', explanation: 'b defaults to 2, so 3 + 2 = 5.' },
  { questionType: 'code_output', topic: 'Functions', difficulty: 'medium', question: 'What is the output?', code: 'def f(x):\n    return x * x\nprint(f(4))', options: ['8', '16', '4', '44'], correctAnswer: '16', explanation: '4 * 4 = 16.' },
  { questionType: 'code_output', topic: 'Functions', difficulty: 'hard', question: 'What is the output?', code: 'def f(*args):\n    return sum(args)\nprint(f(1, 2, 3, 4))', options: ['10', '4', '1234', 'Error'], correctAnswer: '10', explanation: '*args collects the arguments; their sum is 10.' },
  { questionType: 'code_output', topic: 'Functions', difficulty: 'hard', question: 'What is the output?', code: 'def fact(n):\n    return 1 if n <= 1 else n * fact(n - 1)\nprint(fact(4))', options: ['24', '12', '4', '16'], correctAnswer: '24', explanation: '4! = 4·3·2·1 = 24.' },

  // ===== ARRAYS (lists) =====
  { questionType: 'code_output', topic: 'Arrays', difficulty: 'easy', question: 'What is the output?', code: 'a = [1, 2, 3]\nprint(a[0])', options: ['1', '2', '3', '0'], correctAnswer: '1', explanation: 'Indexing starts at 0.' },
  { questionType: 'code_output', topic: 'Arrays', difficulty: 'easy', question: 'What is the output?', code: 'a = [1, 2, 3]\nprint(len(a))', options: ['2', '3', '4', '1'], correctAnswer: '3', explanation: 'The list has 3 elements.' },
  { questionType: 'mcq', topic: 'Arrays', difficulty: 'easy', question: 'How do you add 4 to the end of list a?', options: ['a.add(4)', 'a.append(4)', 'a.push(4)', 'a.insert(4)'], correctAnswer: 'a.append(4)', explanation: 'append() adds to the end of a list.' },
  { questionType: 'code_output', topic: 'Arrays', difficulty: 'medium', question: 'What is the output?', code: 'a = [1, 2, 3]\nprint(a[-1])', options: ['1', '3', '-1', 'Error'], correctAnswer: '3', explanation: 'Index -1 is the last element.' },
  { questionType: 'code_output', topic: 'Arrays', difficulty: 'medium', question: 'What is the output?', code: 'a = [1, 2, 3, 4]\nprint(a[1:3])', options: ['[2, 3]', '[1, 2]', '[2, 3, 4]', '[1, 2, 3]'], correctAnswer: '[2, 3]', explanation: 'Slice [1:3] takes indices 1 and 2.' },
  { questionType: 'code_output', topic: 'Arrays', difficulty: 'hard', question: 'What is the output?', code: 'a = [3, 1, 2]\na.sort()\nprint(a)', options: ['[1, 2, 3]', '[3, 2, 1]', '[3, 1, 2]', 'Error'], correctAnswer: '[1, 2, 3]', explanation: 'sort() orders the list in place.' },
  { questionType: 'code_output', topic: 'Arrays', difficulty: 'hard', question: 'What is the output?', code: 'a = [1, 2, 3]\nb = a\nb.append(4)\nprint(len(a))', options: ['3', '4', '1', 'Error'], correctAnswer: '4', explanation: 'b references the same list as a.' },
];

// ---------------------- JAVA ----------------------
const javaQuestions = [
  // ===== VARIABLES =====
  { questionType: 'mcq', topic: 'Variables', difficulty: 'easy', question: 'Which line correctly declares an integer variable?', options: ['int x = 5;', 'x = 5;', 'var x := 5', 'int x = 5'], correctAnswer: 'int x = 5;', explanation: 'Java needs a type and a terminating semicolon.' },
  { questionType: 'mcq', topic: 'Variables', difficulty: 'easy', question: 'Which keyword makes a variable constant in Java?', options: ['const', 'final', 'static', 'let'], correctAnswer: 'final', explanation: 'final marks a value that cannot be reassigned.' },
  { questionType: 'code_output', topic: 'Variables', difficulty: 'easy', question: 'What is the output?', code: 'int x = 10;\nx = x + 5;\nSystem.out.println(x);', options: ['10', '15', '5', '105'], correctAnswer: '15', explanation: 'x becomes 10 + 5 = 15.' },
  { questionType: 'mcq', topic: 'Variables', difficulty: 'medium', question: 'Which is a valid variable name in Java?', options: ['1num', '_count', 'my-var', 'int'], correctAnswer: '_count', explanation: 'Names may start with _ but not a digit, hyphen, or keyword.' },
  { questionType: 'code_output', topic: 'Variables', difficulty: 'medium', question: 'What is the output?', code: 'int a = 5;\nint b = a;\nb = 10;\nSystem.out.println(a);', options: ['5', '10', '15', 'Error'], correctAnswer: '5', explanation: 'Primitive ints are copied by value.' },
  { questionType: 'code_output', topic: 'Variables', difficulty: 'hard', question: 'What is the output?', code: 'int x = 5;\ndouble y = x / 2;\nSystem.out.println(y);', options: ['2.5', '2.0', '2', 'Error'], correctAnswer: '2.0', explanation: 'x / 2 is integer division (2), then stored as 2.0.' },
  { questionType: 'code_output', topic: 'Variables', difficulty: 'hard', question: 'What is the output?', code: "char c = 'A';\nint n = c + 1;\nSystem.out.println(n);", options: ['66', '65', 'A1', 'B'], correctAnswer: '66', explanation: "'A' is 65, so 65 + 1 = 66." },

  // ===== DATA TYPES =====
  { questionType: 'mcq', topic: 'DataTypes', difficulty: 'easy', question: 'Which type stores decimal numbers?', options: ['int', 'double', 'char', 'boolean'], correctAnswer: 'double', explanation: 'double holds floating-point values.' },
  { questionType: 'mcq', topic: 'DataTypes', difficulty: 'easy', question: 'Which type stores a single character?', options: ['String', 'char', 'int', 'text'], correctAnswer: 'char', explanation: 'char stores one 16-bit character.' },
  { questionType: 'mcq', topic: 'DataTypes', difficulty: 'easy', question: 'What are the two boolean values in Java?', options: ['true/false', 'True/False', '0/1', 'yes/no'], correctAnswer: 'true/false', explanation: 'Java booleans are lowercase true / false.' },
  { questionType: 'code_output', topic: 'DataTypes', difficulty: 'medium', question: 'What is the output?', code: 'System.out.println(5 + "5");', options: ['10', '55', '5', 'Error'], correctAnswer: '55', explanation: 'Adding a String triggers concatenation.' },
  { questionType: 'code_output', topic: 'DataTypes', difficulty: 'medium', question: 'What is the output?', code: 'System.out.println(10 / 3);', options: ['3', '3.33', '3.0', 'Error'], correctAnswer: '3', explanation: 'Integer division discards the remainder.' },
  { questionType: 'code_output', topic: 'DataTypes', difficulty: 'hard', question: 'What is the output?', code: 'System.out.println(10 % 4 + 2);', options: ['2', '4', '0', '6'], correctAnswer: '4', explanation: '10 % 4 = 2, then 2 + 2 = 4.' },
  { questionType: 'code_output', topic: 'DataTypes', difficulty: 'hard', question: 'What is the output?', code: 'System.out.println((int) 3.9);', options: ['4', '3', '3.9', 'Error'], correctAnswer: '3', explanation: 'Casting a double to int truncates toward zero.' },

  // ===== LOOPS =====
  { questionType: 'code_output', topic: 'Loops', difficulty: 'easy', question: 'What is the output?', code: 'for (int i = 0; i < 3; i++)\n    System.out.print(i);', options: ['012', '123', '0123', '3'], correctAnswer: '012', explanation: 'Prints 0, 1, 2 with no separator.' },
  { questionType: 'mcq', topic: 'Loops', difficulty: 'easy', question: 'Which is a valid for-loop header in Java?', options: ['for (int i = 0; i < 5; i++)', 'for i in range(5)', 'loop(5)', 'repeat 5'], correctAnswer: 'for (int i = 0; i < 5; i++)', explanation: 'Java uses init; condition; update.' },
  { questionType: 'mcq', topic: 'Loops', difficulty: 'easy', question: 'Which keyword skips to the next iteration?', options: ['break', 'continue', 'skip', 'pass'], correctAnswer: 'continue', explanation: 'continue jumps to the next loop iteration.' },
  { questionType: 'code_output', topic: 'Loops', difficulty: 'medium', question: 'What is the output?', code: 'int s = 0;\nfor (int i = 1; i <= 3; i++) s += i;\nSystem.out.println(s);', options: ['6', '3', '0', '9'], correctAnswer: '6', explanation: '1 + 2 + 3 = 6.' },
  { questionType: 'code_output', topic: 'Loops', difficulty: 'medium', question: 'What is the output?', code: 'int i = 0;\nwhile (i < 3) {\n    System.out.print(i);\n    i++;\n}', options: ['012', '123', '000', '0 1 2'], correctAnswer: '012', explanation: 'Prints 0, 1, 2 then stops.' },
  { questionType: 'code_output', topic: 'Loops', difficulty: 'hard', question: 'What is the output?', code: 'int c = 0;\nfor (int i = 0; i < 3; i++)\n    for (int j = 0; j < 3; j++)\n        c++;\nSystem.out.println(c);', options: ['3', '6', '9', '12'], correctAnswer: '9', explanation: 'Nested loops run 3 × 3 = 9 times.' },
  { questionType: 'code_output', topic: 'Loops', difficulty: 'hard', question: 'What is the output?', code: 'for (int i = 0; i < 5; i++) {\n    if (i == 2) continue;\n    System.out.print(i);\n}', options: ['01234', '0134', '2', '014'], correctAnswer: '0134', explanation: 'continue skips printing 2.' },

  // ===== FUNCTIONS (methods) =====
  { questionType: 'mcq', topic: 'Functions', difficulty: 'easy', question: 'Which method signature returns an int?', options: ['int add()', 'void add()', 'add() int', 'function add()'], correctAnswer: 'int add()', explanation: 'The return type comes before the method name.' },
  { questionType: 'mcq', topic: 'Functions', difficulty: 'easy', question: 'Which keyword marks a method that returns nothing?', options: ['void', 'null', 'empty', 'none'], correctAnswer: 'void', explanation: 'void means no return value.' },
  { questionType: 'mcq', topic: 'Functions', difficulty: 'easy', question: 'How do you call a method named greet?', options: ['greet;', 'greet()', 'call greet', 'greet[]'], correctAnswer: 'greet()', explanation: 'Parentheses invoke the method.' },
  { questionType: 'code_output', topic: 'Functions', difficulty: 'medium', question: 'Given int square(int n){ return n*n; }, what is square(5)?', options: ['10', '25', '5', '55'], correctAnswer: '25', explanation: '5 * 5 = 25.' },
  { questionType: 'code_output', topic: 'Functions', difficulty: 'medium', question: 'Given int add(int a, int b){ return a+b; }, what is add(3, 4)?', options: ['7', '12', '34', 'Error'], correctAnswer: '7', explanation: '3 + 4 = 7.' },
  { questionType: 'code_output', topic: 'Functions', difficulty: 'hard', question: 'Given int fact(int n){ return n<=1 ? 1 : n*fact(n-1); }, what is fact(4)?', options: ['24', '12', '16', '4'], correctAnswer: '24', explanation: '4! = 24 via recursion.' },
  { questionType: 'mcq', topic: 'Functions', difficulty: 'hard', question: 'What is method overloading?', options: ['Same name, different parameters', 'Same name, same parameters', 'A method with no name', 'Replacing a parent method'], correctAnswer: 'Same name, different parameters', explanation: 'Overloading = same name distinguished by parameter list.' },

  // ===== ARRAYS =====
  { questionType: 'code_output', topic: 'Arrays', difficulty: 'easy', question: 'What is the output?', code: 'int[] a = {1, 2, 3};\nSystem.out.println(a[0]);', options: ['1', '2', '3', '0'], correctAnswer: '1', explanation: 'Array indices start at 0.' },
  { questionType: 'mcq', topic: 'Arrays', difficulty: 'easy', question: 'How do you get the length of an array a?', options: ['a.length', 'a.length()', 'len(a)', 'a.size()'], correctAnswer: 'a.length', explanation: 'Arrays expose a length field (no parentheses).' },
  { questionType: 'code_output', topic: 'Arrays', difficulty: 'easy', question: 'What is the output?', code: 'int[] a = {5, 6, 7};\nSystem.out.println(a[2]);', options: ['5', '6', '7', 'Error'], correctAnswer: '7', explanation: 'a[2] is the third element.' },
  { questionType: 'code_output', topic: 'Arrays', difficulty: 'medium', question: 'What is the output?', code: 'int[] a = new int[3];\nSystem.out.println(a[0]);', options: ['0', 'null', 'Error', 'undefined'], correctAnswer: '0', explanation: 'int arrays default to 0.' },
  { questionType: 'code_output', topic: 'Arrays', difficulty: 'medium', question: 'What is the output?', code: 'int[] a = {1, 2, 3};\na[1] = 9;\nSystem.out.println(a[1]);', options: ['2', '9', '1', 'Error'], correctAnswer: '9', explanation: 'The element at index 1 was reassigned to 9.' },
  { questionType: 'code_output', topic: 'Arrays', difficulty: 'hard', question: 'What happens?', code: 'int[] a = {1, 2, 3};\nSystem.out.println(a[3]);', options: ['3', '0', 'ArrayIndexOutOfBoundsException', 'null'], correctAnswer: 'ArrayIndexOutOfBoundsException', explanation: 'Valid indices are 0..2; index 3 is out of bounds.' },
  { questionType: 'code_output', topic: 'Arrays', difficulty: 'hard', question: 'What is the output?', code: 'int[] a = {4, 2, 1};\nArrays.sort(a);\nSystem.out.println(a[0]);', options: ['4', '2', '1', '0'], correctAnswer: '1', explanation: 'After sorting ascending, the first element is 1.' },
];

// ---------------------- C ----------------------
const cQuestions = [
  // ===== VARIABLES =====
  { questionType: 'mcq', topic: 'Variables', difficulty: 'easy', question: 'Which line correctly declares an integer variable?', options: ['int x = 5;', 'x = 5;', 'int x = 5', 'declare x = 5'], correctAnswer: 'int x = 5;', explanation: 'C needs a type and a terminating semicolon.' },
  { questionType: 'code_output', topic: 'Variables', difficulty: 'easy', question: 'What is the output?', code: 'int x = 10;\nx = x + 5;\nprintf("%d", x);', options: ['10', '15', '5', '105'], correctAnswer: '15', explanation: 'x becomes 10 + 5 = 15.' },
  { questionType: 'mcq', topic: 'Variables', difficulty: 'easy', question: 'Which format specifier prints an int?', options: ['%d', '%s', '%f', '%c'], correctAnswer: '%d', explanation: '%d formats a signed integer.' },
  { questionType: 'code_output', topic: 'Variables', difficulty: 'medium', question: 'What is the output?', code: 'int a = 5, b = a;\nb = 10;\nprintf("%d", a);', options: ['5', '10', '15', 'Error'], correctAnswer: '5', explanation: 'b gets a copy; changing b does not affect a.' },
  { questionType: 'mcq', topic: 'Variables', difficulty: 'medium', question: 'Which is a valid variable name in C?', options: ['1num', 'num_1', 'num-1', 'int'], correctAnswer: 'num_1', explanation: 'Names cannot start with a digit, contain -, or be keywords.' },
  { questionType: 'code_output', topic: 'Variables', difficulty: 'hard', question: 'What is the output?', code: 'int x = 5;\nprintf("%d", x++);', options: ['5', '6', '4', 'Error'], correctAnswer: '5', explanation: 'Post-increment prints the old value (5) first.' },
  { questionType: 'code_output', topic: 'Variables', difficulty: 'hard', question: 'What is the output?', code: "char c = 'A';\nprintf(\"%d\", c);", options: ['65', 'A', '0', 'Error'], correctAnswer: '65', explanation: "'A' has ASCII code 65." },

  // ===== DATA TYPES =====
  { questionType: 'mcq', topic: 'DataTypes', difficulty: 'easy', question: 'Which type stores decimal numbers?', options: ['int', 'float', 'char', 'void'], correctAnswer: 'float', explanation: 'float holds floating-point values.' },
  { questionType: 'mcq', topic: 'DataTypes', difficulty: 'easy', question: 'Which type stores a single character?', options: ['char', 'string', 'int', 'text'], correctAnswer: 'char', explanation: 'char stores one byte / character.' },
  { questionType: 'mcq', topic: 'DataTypes', difficulty: 'easy', question: 'What is the typical size of an int on most systems?', options: ['1 byte', '2 bytes', '4 bytes', '8 bytes'], correctAnswer: '4 bytes', explanation: 'int is commonly 4 bytes (32 bits).' },
  { questionType: 'code_output', topic: 'DataTypes', difficulty: 'medium', question: 'What is the output?', code: 'printf("%d", 10 / 3);', options: ['3', '3.33', '3.0', 'Error'], correctAnswer: '3', explanation: 'Integer division discards the remainder.' },
  { questionType: 'code_output', topic: 'DataTypes', difficulty: 'medium', question: 'What is the output?', code: 'printf("%c", 66);', options: ['B', '66', 'A', 'Error'], correctAnswer: 'B', explanation: '%c prints the character for code 66, which is B.' },
  { questionType: 'code_output', topic: 'DataTypes', difficulty: 'hard', question: 'What is the output?', code: 'printf("%d", 7 / 2 * 2);', options: ['7', '6', '8', '3'], correctAnswer: '6', explanation: '7 / 2 = 3 (int), then 3 * 2 = 6.' },
  { questionType: 'code_output', topic: 'DataTypes', difficulty: 'hard', question: 'What is the output?', code: 'float x = 5 / 2;\nprintf("%.1f", x);', options: ['2.5', '2.0', '2', 'Error'], correctAnswer: '2.0', explanation: '5 / 2 is integer division (2), then stored as 2.0.' },

  // ===== LOOPS =====
  { questionType: 'code_output', topic: 'Loops', difficulty: 'easy', question: 'What is the output?', code: 'for (int i = 0; i < 3; i++)\n    printf("%d", i);', options: ['012', '123', '0123', '3'], correctAnswer: '012', explanation: 'Prints 0, 1, 2 with no separator.' },
  { questionType: 'mcq', topic: 'Loops', difficulty: 'easy', question: 'Which keyword exits a loop?', options: ['stop', 'break', 'exit', 'end'], correctAnswer: 'break', explanation: 'break leaves the loop immediately.' },
  { questionType: 'mcq', topic: 'Loops', difficulty: 'easy', question: 'Which is a valid for-loop header?', options: ['for (i = 0; i < 5; i++)', 'for i in 5', 'loop 5', 'repeat(5)'], correctAnswer: 'for (i = 0; i < 5; i++)', explanation: 'C uses init; condition; update.' },
  { questionType: 'code_output', topic: 'Loops', difficulty: 'medium', question: 'What is the output?', code: 'int s = 0;\nfor (int i = 1; i <= 3; i++) s += i;\nprintf("%d", s);', options: ['6', '3', '9', '0'], correctAnswer: '6', explanation: '1 + 2 + 3 = 6.' },
  { questionType: 'code_output', topic: 'Loops', difficulty: 'medium', question: 'What is the output?', code: 'int i = 0;\nwhile (i < 3) {\n    printf("%d", i);\n    i++;\n}', options: ['012', '123', '111', '0 1 2'], correctAnswer: '012', explanation: 'Prints 0, 1, 2 then stops.' },
  { questionType: 'code_output', topic: 'Loops', difficulty: 'hard', question: 'What is the output?', code: 'int c = 0;\nfor (int i = 0; i < 3; i++)\n    for (int j = 0; j < 2; j++)\n        c++;\nprintf("%d", c);', options: ['3', '5', '6', '9'], correctAnswer: '6', explanation: 'Nested loops run 3 × 2 = 6 times.' },
  { questionType: 'code_output', topic: 'Loops', difficulty: 'hard', question: 'What is the output?', code: 'for (int i = 0; i < 5; i++) {\n    if (i == 2) continue;\n    printf("%d", i);\n}', options: ['01234', '0134', '2', '014'], correctAnswer: '0134', explanation: 'continue skips printing 2.' },

  // ===== FUNCTIONS =====
  { questionType: 'mcq', topic: 'Functions', difficulty: 'easy', question: 'Which return type means a function returns nothing?', options: ['void', 'null', 'int', 'empty'], correctAnswer: 'void', explanation: 'void means no value is returned.' },
  { questionType: 'code_output', topic: 'Functions', difficulty: 'easy', question: 'Given int square(int n){ return n*n; }, what is square(4)?', options: ['8', '16', '4', '44'], correctAnswer: '16', explanation: '4 * 4 = 16.' },
  { questionType: 'mcq', topic: 'Functions', difficulty: 'easy', question: 'How do you call a function named foo?', options: ['foo;', 'foo()', 'call foo', 'foo[]'], correctAnswer: 'foo()', explanation: 'Parentheses invoke the function.' },
  { questionType: 'code_output', topic: 'Functions', difficulty: 'medium', question: 'Given int add(int a, int b){ return a+b; }, what is add(3, 4)?', options: ['7', '12', '34', 'Error'], correctAnswer: '7', explanation: '3 + 4 = 7.' },
  { questionType: 'mcq', topic: 'Functions', difficulty: 'medium', question: 'Which correctly declares a function prototype?', options: ['int add(int, int);', 'add(int, int)', 'function add()', 'int add(int, int)'], correctAnswer: 'int add(int, int);', explanation: 'A prototype needs return type, parameter types, and a semicolon.' },
  { questionType: 'code_output', topic: 'Functions', difficulty: 'hard', question: 'Given int fact(int n){ return n<=1 ? 1 : n*fact(n-1); }, what is fact(4)?', options: ['24', '12', '16', '4'], correctAnswer: '24', explanation: '4! = 24 via recursion.' },
  { questionType: 'code_output', topic: 'Functions', difficulty: 'hard', question: 'What is the output?', code: 'void inc(int x) { x++; }\nint a = 5;\ninc(a);\nprintf("%d", a);', options: ['5', '6', '4', 'Error'], correctAnswer: '5', explanation: 'C passes by value, so a is unchanged.' },

  // ===== ARRAYS =====
  { questionType: 'code_output', topic: 'Arrays', difficulty: 'easy', question: 'What is the output?', code: 'int a[3] = {1, 2, 3};\nprintf("%d", a[0]);', options: ['1', '2', '3', '0'], correctAnswer: '1', explanation: 'Array indices start at 0.' },
  { questionType: 'mcq', topic: 'Arrays', difficulty: 'easy', question: 'Array indices in C start at?', options: ['0', '1', '-1', 'depends'], correctAnswer: '0', explanation: 'The first element is at index 0.' },
  { questionType: 'code_output', topic: 'Arrays', difficulty: 'easy', question: 'What is the output?', code: 'int a[] = {5, 6, 7};\nprintf("%d", a[2]);', options: ['5', '6', '7', 'Error'], correctAnswer: '7', explanation: 'a[2] is the third element.' },
  { questionType: 'code_output', topic: 'Arrays', difficulty: 'medium', question: 'What is the output?', code: 'int a[3] = {1, 2, 3};\na[1] = 9;\nprintf("%d", a[1]);', options: ['2', '9', '1', 'Error'], correctAnswer: '9', explanation: 'The element at index 1 was reassigned to 9.' },
  { questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'How many elements does int a[5] hold?', options: ['4', '5', '6', 'depends'], correctAnswer: '5', explanation: 'The declared size is 5.' },
  { questionType: 'code_output', topic: 'Arrays', difficulty: 'hard', question: 'What is the output?', code: 'int a[] = {1, 2, 3};\nprintf("%d", a[1] + a[2]);', options: ['3', '5', '6', 'Error'], correctAnswer: '5', explanation: 'a[1] + a[2] = 2 + 3 = 5.' },
  { questionType: 'code_output', topic: 'Arrays', difficulty: 'hard', question: 'What is the output?', code: 'char s[] = "hi";\nprintf("%d", (int) sizeof(s));', options: ['2', '3', '4', '1'], correctAnswer: '3', explanation: 'The array includes the terminating \\0, so size is 3.' },
];

// Attach language + sequential questionNumber, then combine.
const withMeta = (list, language) =>
  list.map((q, i) => ({ ...q, language, questionNumber: i + 1 }));

const allQuestions = [
  ...withMeta(pythonQuestions, 'python'),
  ...withMeta(javaQuestions, 'java'),
  ...withMeta(cQuestions, 'c'),
];

const seed = async () => {
  await connectDB();

  try {
    const removed = await Assessment.deleteMany({});
    console.log(`🗑️  Removed ${removed.deletedCount} existing questions`);

    const inserted = await Assessment.insertMany(allQuestions);
    console.log(`✅ Inserted ${inserted.length} questions`);

    ['python', 'java', 'c'].forEach((lang) => {
      const count = allQuestions.filter((q) => q.language === lang).length;
      console.log(`   • ${lang}: ${count} questions (Variables, DataTypes, Loops, Functions, Arrays)`);
    });
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✓ Disconnected');
    process.exit(0);
  }
};

seed();
