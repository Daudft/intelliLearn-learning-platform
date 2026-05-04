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

// PYTHON QUESTIONS (300 questions)
const pythonQuestions = [
  // ===== VARIABLES (40 questions) =====
  { language: 'python', questionNumber: 1, questionType: 'code_output', topic: 'Variables', difficulty: 'easy', question: 'What is the output of the following code?', code: "x = 5\nx = x + 2\nprint(x)", options: ['5', '7', 'Error', 'None'], correctAnswer: '7', explanation: 'x is incremented by 2 then printed' },
  { language: 'python', questionNumber: 2, questionType: 'mcq', topic: 'Syntax', difficulty: 'easy', question: 'What happens when this code is executed?', code: "def foo():\nprint('hi')", options: ['Prints hi', 'IndentationError', 'SyntaxError', 'Nothing'], correctAnswer: 'IndentationError', explanation: 'The print is not indented inside the function body' },
  { language: 'python', questionNumber: 3, questionType: 'code_output', topic: 'Lists', difficulty: 'easy', question: 'What is the output of the following code?', code: "a = [1,2]\nb = a\nb.append(3)\nprint(a)", options: ['[1, 2]', '[1, 2, 3]', '[3]', 'Error'], correctAnswer: '[1, 2, 3]', explanation: 'b references same list as a; append mutates list' },
  { language: 'python', questionNumber: 4, questionType: 'code_output', topic: 'Strings', difficulty: 'easy', question: 'What does this print?', code: "s = 'hello'\nprint(s[1:-1])", options: ['hel', 'ell', 'el', 'ello'], correctAnswer: 'ell', explanation: 'Slice [1:-1] returns characters from index 1 to second-last' },
  { language: 'python', questionNumber: 5, questionType: 'code_output', topic: 'Operations', difficulty: 'easy', question: 'What is the output?', code: "print(5/2)", options: ['2', '2.5', '2.0', 'Error'], correctAnswer: '2.5', explanation: '/ produces float division' },
  { language: 'python', questionNumber: 6, questionType: 'mcq', topic: 'Syntax', difficulty: 'medium', question: 'What is wrong with this snippet?', code: "for i in range(3)\n  print(i)", options: ['Missing colon after range(3)', 'Indentation too deep', 'print spelled incorrectly', 'Nothing wrong'], correctAnswer: 'Missing colon after range(3)', explanation: 'for loop requires a colon at the end of the declaration' },
  { language: 'python', questionNumber: 7, questionType: 'code_output', topic: 'Tuples', difficulty: 'medium', question: 'What is printed?', code: "a, b = 5, 10\na, b = b, a\nprint(a, b)", options: ['5 10', '10 5', 'Error', '5 5'], correctAnswer: '10 5', explanation: 'Tuple unpacking swaps values' },
  { language: 'python', questionNumber: 8, questionType: 'code_output', topic: 'Mutability', difficulty: 'medium', question: 'What is the output?', code: "x = [1,2]\ny = x\ny[0] = 99\nprint(x)", options: ['[1,2]', '[99,2]', 'Error', '[1,99]'], correctAnswer: '[99,2]', explanation: 'Lists are mutable and both names reference same object' },
  { language: 'python', questionNumber: 9, questionType: 'mcq', topic: 'Tricky', difficulty: 'hard', question: 'What does this print?', code: "def f(a, L=[]):\n  L.append(a)\n  return L\nprint(f(1))\nprint(f(2))", options: ['[1]\n[2]', '[1]\n[1,2]', '[1,2]\n[1,2]', 'Error'], correctAnswer: '[1]\n[1,2]', explanation: 'Mutable default argument persists across calls' },
  { language: 'python', questionNumber: 10, questionType: 'code_output', topic: 'Indexing', difficulty: 'medium', question: 'What is the output?', code: "lst = [0,1,2]\nprint(lst[-1])", options: ['0', '1', '2', 'Error'], correctAnswer: '2', explanation: 'Negative index -1 returns last element' },
  { language: 'python', questionNumber: 11, questionType: 'mcq', topic: 'Syntax', difficulty: 'medium', question: 'What error will this raise (if any)?', code: "print('Hello' + 5)", options: ['Hello5', 'TypeError', 'SyntaxError', 'None'], correctAnswer: 'TypeError', explanation: "Can't concatenate str and int" },
  { language: 'python', questionNumber: 12, questionType: 'code_output', topic: 'Comprehension', difficulty: 'hard', question: 'What is the result?', code: "print([x for x in 'hello' if x != 'l'])", options: ['[h,e,o]', '["h","e","o"]', '["h","e","l","l","o"]', 'Error'], correctAnswer: '["h","e","o"]', explanation: 'List comprehension filters out "l" characters' },
  { language: 'python', questionNumber: 13, questionType: 'code_output', topic: 'Operators', difficulty: 'medium', question: 'What prints?', code: "print('2' + '3')", options: ['5', '23', 'Error', '2 3'], correctAnswer: '23', explanation: 'String concatenation' },
  { language: 'python', questionNumber: 14, questionType: 'mcq', topic: 'Tricky', difficulty: 'hard', question: 'What is printed and why?', code: "a = '5'\nprint(int(a) * 2)", options: ['10', '55', 'Error', 'None'], correctAnswer: '10', explanation: 'int(a) converts string to integer before multiplication' },
  { language: 'python', questionNumber: 15, questionType: 'mcq', topic: 'Syntax', difficulty: 'hard', question: 'Which line produces an error?', code: "x = (1,2,3)\nx[0] = 5\nprint(x)", options: ['First line', 'Second line', 'Third line', 'No error'], correctAnswer: 'Second line', explanation: 'Tuples are immutable; assignment to element raises TypeError' },
  { language: 'python', questionNumber: 16, questionType: 'mcq', topic: 'Variables', difficulty: 'easy', question: 'In Python, what is the naming style for constants?', options: ['lowercase', 'UPPERCASE', 'camelCase', 'no convention'], correctAnswer: 'UPPERCASE', explanation: 'MAX_SIZE, PI are constant naming style' },
  { language: 'python', questionNumber: 17, questionType: 'mcq', topic: 'Variables', difficulty: 'medium', question: 'What is the result of: x = 5; y = x; y = 10?', options: ['x = 5, y = 10', 'x = 10, y = 10', 'Error', 'x = 5, y = 5'], correctAnswer: 'x = 5, y = 10', explanation: 'Primitives are copied, not referenced' },
  { language: 'python', questionNumber: 18, questionType: 'mcq', topic: 'Variables', difficulty: 'hard', question: 'What is variable shadowing?', options: ['Deleting a variable', 'Inner scope variable hiding outer scope', 'Encryption', 'Memory management'], correctAnswer: 'Inner scope variable hiding outer scope', explanation: 'Local variables hide outer scope variables with same name' },
  { language: 'python', questionNumber: 19, questionType: 'mcq', topic: 'Variables', difficulty: 'easy', question: 'Can you use reserved keywords as variable names?', options: ['Yes', 'No', 'Only in strings', 'Only functions'], correctAnswer: 'No', explanation: 'Keywords like if, for cannot be variable names' },
  { language: 'python', questionNumber: 20, questionType: 'mcq', topic: 'Variables', difficulty: 'medium', question: 'What is the output of: x = [1,2,3]; y = x; y[0] = 99?', options: ['x = [1,2,3]', 'x = [99,2,3]', 'Error', 'x = [1,99,3]'], correctAnswer: 'x = [99,2,3]', explanation: 'Lists are mutable, both x and y reference same list' },
  { language: 'python', questionNumber: 21, questionType: 'mcq', topic: 'Variables', difficulty: 'easy', question: 'How do you delete a variable in Python?', options: ['delete x', 'del x', 'remove x', 'clear x'], correctAnswer: 'del x', explanation: 'del keyword removes variable from scope' },
  { language: 'python', questionNumber: 22, questionType: 'mcq', topic: 'Variables', difficulty: 'medium', question: 'What is the difference between = and ==?', options: ['Same operator', '= assigns, == compares', 'Opposite', 'No difference'], correctAnswer: '= assigns, == compares', explanation: '= for assignment, == for comparison' },
  { language: 'python', questionNumber: 23, questionType: 'mcq', topic: 'Variables', difficulty: 'easy', question: 'Can underscore _ be used alone as a variable?', options: ['No', 'Yes, as a dummy variable', 'Only in loops', 'Only in functions'], correctAnswer: 'Yes, as a dummy variable', explanation: '_ is often used for throwaway values' },
  { language: 'python', questionNumber: 24, questionType: 'mcq', topic: 'Variables', difficulty: 'hard', question: 'What happens with: x = y = z = 5?', options: ['Only z is assigned', 'All assigned to 5', 'Error', 'Only x and z'], correctAnswer: 'All assigned to 5', explanation: 'Chained assignment works left to right' },
  { language: 'python', questionNumber: 25, questionType: 'mcq', topic: 'Variables', difficulty: 'medium', question: 'What is the output of: x = 5; x *= 2?', options: ['5', '10', '25', 'Error'], correctAnswer: '10', explanation: 'Compound assignment operator *= multiplies and assigns' },
  { language: 'python', questionNumber: 26, questionType: 'mcq', topic: 'Variables', difficulty: 'easy', question: 'Which Python keyword checks variable existence?', options: ['exists', 'in', 'has', 'check'], correctAnswer: 'in', explanation: 'in operator checks if variable/item exists' },
  { language: 'python', questionNumber: 27, questionType: 'mcq', topic: 'Variables', difficulty: 'medium', question: 'What is a local variable?', options: ['Global variable', 'Inside a function', 'Always mutable', 'Permanent'], correctAnswer: 'Inside a function', explanation: 'Local variables exist within function scope' },
  { language: 'python', questionNumber: 28, questionType: 'mcq', topic: 'Variables', difficulty: 'easy', question: 'Can you have spaces in variable names?', options: ['Yes', 'No', 'Only with underscore', 'In strings only'], correctAnswer: 'No', explanation: 'Spaces are not allowed in variable names' },
  { language: 'python', questionNumber: 29, questionType: 'mcq', topic: 'Variables', difficulty: 'hard', question: 'What is the memory address of a variable accessed by?', options: ['id() function', 'address() function', 'mem() function', 'pointer()'], correctAnswer: 'id() function', explanation: 'id() returns memory address/identity of object' },
  { language: 'python', questionNumber: 30, questionType: 'mcq', topic: 'Variables', difficulty: 'medium', question: 'What is the output of: x = 10; print(type(x))?', options: ['<class \'int\'>', 'integer', 'int', '<int>'], correctAnswer: '<class \'int\'>', explanation: 'type() returns the class of the object' },
  { language: 'python', questionNumber: 31, questionType: 'mcq', topic: 'Variables', difficulty: 'easy', question: 'Are Python variables strongly typed?', options: ['Yes', 'No', 'Sometimes', 'Only functions'], correctAnswer: 'No', explanation: 'Python is dynamically typed' },
  { language: 'python', questionNumber: 32, questionType: 'mcq', topic: 'Variables', difficulty: 'medium', question: 'What happens if you reference a variable before assignment?', options: ['Returns None', 'Returns 0', 'NameError', 'Returns False'], correctAnswer: 'NameError', explanation: 'Uninitialized variables cause NameError' },
  { language: 'python', questionNumber: 33, questionType: 'mcq', topic: 'Variables', difficulty: 'easy', question: 'How do you check if a variable is defined?', options: ['defined(x)', 'x in locals()', 'exists(x)', 'check(x)'], correctAnswer: 'x in locals()', explanation: 'locals() returns dict of local variables' },
  { language: 'python', questionNumber: 34, questionType: 'mcq', topic: 'Variables', difficulty: 'hard', question: 'What is variable annotation?', options: ['Comment about variable', 'Type hint for variable', 'Decoration', 'Same as comment'], correctAnswer: 'Type hint for variable', explanation: 'x: int = 5 adds type hint' },
  { language: 'python', questionNumber: 35, questionType: 'mcq', topic: 'Variables', difficulty: 'medium', question: 'Can you have a variable with the same name as a function?', options: ['Yes, overwrites function', 'No', 'Only in classes', 'Only globally'], correctAnswer: 'Yes, overwrites function', explanation: 'Variables can overwrite function names in scope' },
  { language: 'python', questionNumber: 36, questionType: 'mcq', topic: 'Variables', difficulty: 'easy', question: 'What is the purpose of the globals() function?', options: ['Check if variable is global', 'Returns dict of global variables', 'Make variable global', 'Delete globals'], correctAnswer: 'Returns dict of global variables', explanation: 'globals() returns all global variables' },
  { language: 'python', questionNumber: 37, questionType: 'mcq', topic: 'Variables', difficulty: 'medium', question: 'What is variable unpacking?', options: ['Deleting a variable', 'Assigning multiple values from sequence', 'Copying variable', 'Memory operation'], correctAnswer: 'Assigning multiple values from sequence', explanation: 'x, y = [1, 2] unpacks list to variables' },
  { language: 'python', questionNumber: 38, questionType: 'mcq', topic: 'Variables', difficulty: 'hard', question: 'What is the difference between is and ==?', options: ['Same', '== compares value, is compares identity', 'Opposite', 'Only for strings'], correctAnswer: '== compares value, is compares identity', explanation: 'is checks if same object, == checks value equality' },
  { language: 'python', questionNumber: 39, questionType: 'mcq', topic: 'Variables', difficulty: 'easy', question: 'Can Python variables store different types?', options: ['No, must be consistent', 'Yes, anytime', 'Only in lists', 'Only in tuples'], correctAnswer: 'Yes, anytime', explanation: 'Python variables are dynamically typed' },
  { language: 'python', questionNumber: 40, questionType: 'mcq', topic: 'Variables', difficulty: 'medium', question: 'What is the output of: x = 5; y = x; del x; print(y)?', options: ['Error', '5', 'None', 'undefined'], correctAnswer: '5', explanation: 'y still holds value 5, x is just deleted from scope' },

  // ===== DATA TYPES & STRINGS (40 questions) =====
  { language: 'python', questionNumber: 41, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'easy', question: 'Which of the following is a string in Python?', options: ['123', '"hello"', '[1,2,3]', '(1,2)'], correctAnswer: '"hello"', explanation: 'Strings are enclosed in quotes' },
  { language: 'python', questionNumber: 42, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'easy', question: 'What is the output of: x = "Hello" + " " + "World"?', options: ['Hello World', 'Error', 'HelloWorld', 'Hello  World'], correctAnswer: 'Hello World', explanation: 'String concatenation adds strings together' },
  { language: 'python', questionNumber: 43, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'easy', question: 'How do you get the length of a string "hello"?', options: ['len("hello")', 'length("hello")', 'size("hello")', '"hello".length'], correctAnswer: 'len("hello")', explanation: 'len() function returns string length' },
  { language: 'python', questionNumber: 44, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'easy', question: 'What is the output of: "hello"[0]?', options: ['h', 'e', 'Error', 'hello'], correctAnswer: 'h', explanation: 'String indexing starts at 0' },
  { language: 'python', questionNumber: 45, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'easy', question: 'How do you convert an integer to string?', options: ['string(5)', 'str(5)', 'int("5")', 'convert(5)'], correctAnswer: 'str(5)', explanation: 'str() converts value to string' },
  { language: 'python', questionNumber: 46, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'medium', question: 'What is the output of: "hello"[1:4]?', options: ['hell', 'ello', 'ell', 'llo'], correctAnswer: 'ell', explanation: 'String slicing [1:4] gives characters from index 1 to 3' },
  { language: 'python', questionNumber: 47, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'medium', question: 'Are strings mutable in Python?', options: ['Yes', 'No', 'Sometimes', 'In functions'], correctAnswer: 'No', explanation: 'Strings are immutable in Python' },
  { language: 'python', questionNumber: 48, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'easy', question: 'What is an f-string in Python?', options: ['Formatted string', 'Float string', 'Function string', 'Final string'], correctAnswer: 'Formatted string', explanation: 'f"Name: {name}" is f-string for formatting' },
  { language: 'python', questionNumber: 49, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'medium', question: 'How do you split a string "a,b,c" by comma?', options: ['"a,b,c".split(",")', 'split("a,b,c", ",")', 'string.split(",")', '"a,b,c".split()'], correctAnswer: '"a,b,c".split(",")', explanation: '.split() method splits string by delimiter' },
  { language: 'python', questionNumber: 50, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'medium', question: 'What is the output of: "hello".upper()?', options: ['HELLO', 'Hello', 'hello', 'HeLLo'], correctAnswer: 'HELLO', explanation: '.upper() converts string to uppercase' },
  { language: 'python', questionNumber: 51, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'easy', question: 'Which data type stores decimal numbers?', options: ['int', 'float', 'double', 'decimal'], correctAnswer: 'float', explanation: 'float type stores decimal numbers' },
  { language: 'python', questionNumber: 52, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'easy', question: 'What is the output of: int("42")?', options: ['42', '"42"', 'Error', '4 and 2'], correctAnswer: '42', explanation: 'int() converts string to integer' },
  { language: 'python', questionNumber: 53, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'medium', question: 'What is the output of: "hello".replace("l", "L")?', options: ['heLLo', 'hello', 'heLlo', 'HELLO'], correctAnswer: 'heLLo', explanation: '.replace() substitutes characters' },
  { language: 'python', questionNumber: 54, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'medium', question: 'How do you check if "lo" is in "hello"?', options: ['"lo" in "hello"', '"hello".contains("lo")', 'find("lo")', 'search("lo")'], correctAnswer: '"lo" in "hello"', explanation: 'in operator checks substring existence' },
  { language: 'python', questionNumber: 55, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'hard', question: 'What is the output of: "hello"[-1]?', options: ['h', 'o', 'l', 'Error'], correctAnswer: 'o', explanation: 'Negative indexing starts from end, -1 is last character' },
  { language: 'python', questionNumber: 56, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'easy', question: 'Which is a boolean value in Python?', options: ['1', '0', 'True', '"true"'], correctAnswer: 'True', explanation: 'Boolean values are True or False (capitalized)' },
  { language: 'python', questionNumber: 57, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'medium', question: 'What is the output of: "hello".find("l")?', options: ['2', '3', '1', '0'], correctAnswer: '2', explanation: '.find() returns index of first occurrence' },
  { language: 'python', questionNumber: 58, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'easy', question: 'How do you create a multiline string?', options: ['Single quotes', 'Triple quotes', 'Double backslash', 'Not possible'], correctAnswer: 'Triple quotes', explanation: '"""multiline""" creates multiline string' },
  { language: 'python', questionNumber: 59, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'medium', question: 'What is escape sequence \\n?', options: ['Null character', 'Newline', 'Backslash', 'Space'], correctAnswer: 'Newline', explanation: '\\n represents newline character' },
  { language: 'python', questionNumber: 60, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'hard', question: 'What is the output of: len([1, "hello", 3.14])?', options: ['2', '3', '4', 'Error'], correctAnswer: '3', explanation: 'List has 3 elements of mixed types' },
  { language: 'python', questionNumber: 61, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'easy', question: 'What does the list data type store?', options: ['Single value', 'Ordered collection of items', 'Key-value pairs', 'Unique items'], correctAnswer: 'Ordered collection of items', explanation: 'Lists store ordered mutable sequences' },
  { language: 'python', questionNumber: 62, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'medium', question: 'What is the difference between list and tuple?', options: ['Same thing', 'Lists are mutable, tuples immutable', 'Tuples are faster', 'Lists hold strings'], correctAnswer: 'Lists are mutable, tuples immutable', explanation: 'Lists can be modified, tuples cannot' },
  { language: 'python', questionNumber: 63, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'easy', question: 'How do you create an empty dictionary?', options: ['{}', '[]', '()', 'dict()'], correctAnswer: '{}', explanation: '{} creates an empty dictionary' },
  { language: 'python', questionNumber: 64, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'medium', question: 'What is the output of: "hello".strip()?', options: ['"ello"', '"hello"', 'Error', '"ell"'], correctAnswer: '"hello"', explanation: '.strip() removes whitespace, "hello" has none' },
  { language: 'python', questionNumber: 65, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'hard', question: 'What is the output of: [x for x in "hello" if x != "l"]?', options: ['"heo"', '["h","e","o"]', '"hl"', 'Error'], correctAnswer: '["h","e","o"]', explanation: 'List comprehension filters "l" characters' },
  { language: 'python', questionNumber: 66, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'easy', question: 'What is the type of 3.14?', options: ['int', 'float', 'double', 'decimal'], correctAnswer: 'float', explanation: '3.14 is a floating-point number' },
  { language: 'python', questionNumber: 67, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'medium', question: 'What is the output of: "2" + "3"?', options: ['5', '"23"', 'Error', '23'], correctAnswer: '"23"', explanation: 'String concatenation, not arithmetic' },
  { language: 'python', questionNumber: 68, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'hard', question: 'What is a set in Python?', options: ['Ordered collection', 'Unordered unique collection', 'String type', 'Number type'], correctAnswer: 'Unordered unique collection', explanation: 'Sets contain unique unordered items' },
  { language: 'python', questionNumber: 69, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'medium', question: 'How do you convert string "123" to integer?', options: ['integer("123")', 'int("123")', 'convert("123")', '(int)"123"'], correctAnswer: 'int("123")', explanation: 'int() function converts strings to integers' },
  { language: 'python', questionNumber: 70, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'easy', question: 'What is immutability?', options: ['Can be changed', 'Cannot be changed', 'Very fast', 'Memory efficient'], correctAnswer: 'Cannot be changed', explanation: 'Immutable objects cannot be modified' },
  { language: 'python', questionNumber: 71, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'hard', question: 'What is the output of: bytes("hello", "utf-8")?', options: ["b'hello'", '"hello"', 'Error', 'hello'], correctAnswer: "b'hello'", explanation: 'bytes() creates bytes object' },
  { language: 'python', questionNumber: 72, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'medium', question: 'What is the output of: complex(2, 3)?', options: ['(2, 3)', '2+3j', '5', 'Error'], correctAnswer: '2+3j', explanation: 'complex() creates complex number' },
  { language: 'python', questionNumber: 73, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'easy', question: 'Can you perform arithmetic on strings?', options: ['Yes', 'No', 'Only addition', 'Only multiplication'], correctAnswer: 'No', explanation: 'Arithmetic operations require numbers' },
  { language: 'python', questionNumber: 74, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'hard', question: 'What is the output of: "hello" * 3?', options: ['"hellohellohello"', 'Error', '15', '"hello3"'], correctAnswer: '"hellohellohello"', explanation: 'String multiplication repeats string' },
  { language: 'python', questionNumber: 75, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'medium', question: 'What method converts all characters to lowercase?', options: ['.lower()', '.lowercase()', '.small()', '.minimize()'], correctAnswer: '.lower()', explanation: '.lower() returns lowercase string' },
  { language: 'python', questionNumber: 76, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'easy', question: 'What is the None data type?', options: ['Empty string', 'Zero', 'Represents absence of value', 'False'], correctAnswer: 'Represents absence of value', explanation: 'None is Python null value' },
  { language: 'python', questionNumber: 77, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'medium', question: 'What is the output of: "hello"[::-1]?', options: ['"olleh"', '"hello"', '"hell"', 'Error'], correctAnswer: '"olleh"', explanation: '[::-1] reverses the string' },
  { language: 'python', questionNumber: 78, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'hard', question: 'What is string interpolation with %?', options: ['Modulo operation', 'Old string formatting', 'Division', 'Remainder'], correctAnswer: 'Old string formatting', explanation: '"Hello %s" % name is old formatting style' },
  { language: 'python', questionNumber: 79, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'easy', question: 'What data type is {"a": 1}?', options: ['Set', 'List', 'Dictionary', 'Tuple'], correctAnswer: 'Dictionary', explanation: 'Curly braces with key:value pairs create dict' },
  { language: 'python', questionNumber: 80, questionType: 'mcq', topic: 'DataTypes_String', difficulty: 'medium', question: 'How do you check if "a" is key in dict {"a": 1}?', options: ['"a" in {"a": 1}', '"a".exists()', 'has("a")', 'find("a")'], correctAnswer: '"a" in {"a": 1}', explanation: 'in operator checks if key exists in dictionary' },

  // ===== LOOPS (40 questions) =====
  { language: 'python', questionNumber: 81, questionType: 'mcq', topic: 'Loops', difficulty: 'easy', question: 'What is the output of: for i in range(3): print(i)?', options: ['0 1 2', '1 2 3', '0 1 2 3', '3'], correctAnswer: '0 1 2', explanation: 'range(3) generates 0, 1, 2' },
  { language: 'python', questionNumber: 82, questionType: 'mcq', topic: 'Loops', difficulty: 'easy', question: 'How do you create a loop that runs 5 times?', options: ['for i in range(5)', 'while i < 5', 'for i = 0; i < 5', 'All of above'], correctAnswer: 'for i in range(5)', explanation: 'for loop with range(5) runs 5 times' },
  { language: 'python', questionNumber: 83, questionType: 'mcq', topic: 'Loops', difficulty: 'easy', question: 'What is the output of: i = 0; while i < 3: print(i); i += 1?', options: ['0 1 2', '0 1 2 3', '1 2 3', 'Error'], correctAnswer: '0 1 2', explanation: 'while loop continues while i < 3' },
  { language: 'python', questionNumber: 84, questionType: 'mcq', topic: 'Loops', difficulty: 'medium', question: 'What does break do in a loop?', options: ['Skips iteration', 'Exits loop', 'Pauses loop', 'Restarts loop'], correctAnswer: 'Exits loop', explanation: 'break statement exits loop completely' },
  { language: 'python', questionNumber: 85, questionType: 'mcq', topic: 'Loops', difficulty: 'medium', question: 'What does continue do in a loop?', options: ['Exits loop', 'Skips current iteration', 'Pauses loop', 'Restarts loop'], correctAnswer: 'Skips current iteration', explanation: 'continue skips to next iteration' },
  { language: 'python', questionNumber: 86, questionType: 'mcq', topic: 'Loops', difficulty: 'medium', question: 'What is the output of: for i in range(1, 5): print(i)?', options: ['1 2 3 4', '1 2 3 4 5', '0 1 2 3 4', 'Error'], correctAnswer: '1 2 3 4', explanation: 'range(1, 5) generates 1, 2, 3, 4' },
  { language: 'python', questionNumber: 87, questionType: 'mcq', topic: 'Loops', difficulty: 'medium', question: 'What is the output of: for i in range(0, 10, 2): print(i)?', options: ['0 2 4 6 8', '0 1 2 3 4 5 6 7 8 9', '2 4 6 8', '0 2 4 6 8 10'], correctAnswer: '0 2 4 6 8', explanation: 'range(0, 10, 2) generates every 2nd number' },
  { language: 'python', questionNumber: 88, questionType: 'mcq', topic: 'Loops', difficulty: 'hard', question: 'What is the output of: for i in "hello": print(i)?', options: ['hello', 'h e l l o', '0 1 2 3 4', 'Error'], correctAnswer: 'h e l l o', explanation: 'for loop iterates over string characters' },
  { language: 'python', questionNumber: 89, questionType: 'mcq', topic: 'Loops', difficulty: 'medium', question: 'Can you have nested loops?', options: ['No', 'Yes', 'Only in functions', 'Only once'], correctAnswer: 'Yes', explanation: 'Loops can be nested inside other loops' },
  { language: 'python', questionNumber: 90, questionType: 'mcq', topic: 'Loops', difficulty: 'hard', question: 'What is enumerate() used for?', options: ['Loop over list', 'Get index and value', 'Count items', 'Remove duplicates'], correctAnswer: 'Get index and value', explanation: 'enumerate() provides index and value in loop' },
  { language: 'python', questionNumber: 91, questionType: 'mcq', topic: 'Loops', difficulty: 'easy', question: 'What happens if while condition never becomes false?', options: ['Loop ends', 'Infinite loop', 'Error', 'Returns None'], correctAnswer: 'Infinite loop', explanation: 'Loop runs forever if condition always true' },
  { language: 'python', questionNumber: 92, questionType: 'mcq', topic: 'Loops', difficulty: 'medium', question: 'What is the output of: x = 0; while x < 5: x += 1; if x == 3: break?', options: ['0', '1 2', 'Error', '1'], correctAnswer: '1 2', explanation: 'break exits when x becomes 3' },
  { language: 'python', questionNumber: 93, questionType: 'mcq', topic: 'Loops', difficulty: 'medium', question: 'What is the output of: for i in range(5): if i == 2: continue; print(i)?', options: ['0 1 2 3 4', '0 1 3 4', '2', 'Error'], correctAnswer: '0 1 3 4', explanation: 'continue skips when i == 2' },
  { language: 'python', questionNumber: 94, questionType: 'mcq', topic: 'Loops', difficulty: 'hard', question: 'What is zip() used for?', options: ['Extract files', 'Iterate multiple sequences', 'Compress data', 'Join lists'], correctAnswer: 'Iterate multiple sequences', explanation: 'zip() combines multiple sequences for iteration' },
  { language: 'python', questionNumber: 95, questionType: 'mcq', topic: 'Loops', difficulty: 'easy', question: 'What is the output of: for i in [1, 2, 3]: print(i)?', options: ['1 2 3', '[1, 2, 3]', 'Error', '3'], correctAnswer: '1 2 3', explanation: 'for loop iterates over list items' },
  { language: 'python', questionNumber: 96, questionType: 'mcq', topic: 'Loops', difficulty: 'hard', question: 'What does else clause in loop do?', options: ['Runs if break is used', 'Runs if break is not used', 'Catches errors', 'Never runs'], correctAnswer: 'Runs if break is not used', explanation: 'else runs after normal loop completion' },
  { language: 'python', questionNumber: 97, questionType: 'mcq', topic: 'Loops', difficulty: 'medium', question: 'What is the output of: for i in range(3, 0, -1): print(i)?', options: ['3 2 1', '1 2 3', '0 -1 -2', 'Error'], correctAnswer: '3 2 1', explanation: 'Negative step counts down' },
  { language: 'python', questionNumber: 98, questionType: 'mcq', topic: 'Loops', difficulty: 'easy', question: 'Can you modify list while iterating?', options: ['Yes, always', 'No, never', 'Yes, but risky', 'Only in while'], correctAnswer: 'Yes, but risky', explanation: 'Modifying list during iteration can cause issues' },
  { language: 'python', questionNumber: 99, questionType: 'mcq', topic: 'Loops', difficulty: 'hard', question: 'What is list comprehension?', options: ['Comments in list', 'Concise way to create lists', 'Comparing lists', 'Sorting lists'], correctAnswer: 'Concise way to create lists', explanation: '[x*2 for x in range(5)] is list comprehension' },
  { language: 'python', questionNumber: 100, questionType: 'mcq', topic: 'Loops', difficulty: 'medium', question: 'What is the output of: sum([1, 2, 3, 4])?', options: ['[1, 2, 3, 4]', '10', '4', 'Error'], correctAnswer: '10', explanation: 'sum() adds all list elements' },
  { language: 'python', questionNumber: 101, questionType: 'mcq', topic: 'Loops', difficulty: 'easy', question: 'How do you get count of items in list?', options: ['len(list)', 'count(list)', 'size(list)', 'count()'], correctAnswer: 'len(list)', explanation: 'len() returns number of items' },
  { language: 'python', questionNumber: 102, questionType: 'mcq', topic: 'Loops', difficulty: 'medium', question: 'What is filter() used for?', options: ['Purify water', 'Remove elements matching condition', 'Sort items', 'Duplicate items'], correctAnswer: 'Remove elements matching condition', explanation: 'filter() removes items not matching condition' },
  { language: 'python', questionNumber: 103, questionType: 'mcq', topic: 'Loops', difficulty: 'hard', question: 'What is map() used for?', options: ['Navigation', 'Apply function to items', 'Find items', 'Count items'], correctAnswer: 'Apply function to items', explanation: 'map() applies function to each item' },
  { language: 'python', questionNumber: 104, questionType: 'mcq', topic: 'Loops', difficulty: 'medium', question: 'What is the output of: max([1, 5, 3, 2])?', options: ['1', '5', '3', '[1, 5, 3, 2]'], correctAnswer: '5', explanation: 'max() returns largest element' },
  { language: 'python', questionNumber: 105, questionType: 'mcq', topic: 'Loops', difficulty: 'easy', question: 'What is the output of: min([1, 5, 3, 2])?', options: ['1', '5', '3', '[1, 5, 3, 2]'], correctAnswer: '1', explanation: 'min() returns smallest element' },
  { language: 'python', questionNumber: 106, questionType: 'mcq', topic: 'Loops', difficulty: 'medium', question: 'Can you use for loop with dictionary?', options: ['No', 'Yes, iterates keys', 'Only values', 'Only in Python 3'], correctAnswer: 'Yes, iterates keys', explanation: 'for loop over dict iterates keys' },
  { language: 'python', questionNumber: 107, questionType: 'mcq', topic: 'Loops', difficulty: 'hard', question: 'What is the output of: [x*2 for x in range(3)]?', options: ['[0, 2, 4]', '[0, 1, 2]', '[1, 2, 3]', 'Error'], correctAnswer: '[0, 2, 4]', explanation: 'List comprehension multiplies each by 2' },
  { language: 'python', questionNumber: 108, questionType: 'mcq', topic: 'Loops', difficulty: 'medium', question: 'What is any() used for?', options: ['Any number', 'Returns True if any True', 'Gets random item', 'Checks length'], correctAnswer: 'Returns True if any True', explanation: 'any() checks if any element is truthy' },
  { language: 'python', questionNumber: 109, questionType: 'mcq', topic: 'Loops', difficulty: 'easy', question: 'What is all() used for?', options: ['Everything', 'Returns True if all True', 'Gets total', 'Checks size'], correctAnswer: 'Returns True if all True', explanation: 'all() checks if all elements are truthy' },
  { language: 'python', questionNumber: 110, questionType: 'mcq', topic: 'Loops', difficulty: 'hard', question: 'What is generator expression?', options: ['Mathematical formula', 'Creates generator with (...)', 'Creates list', 'For loop'], correctAnswer: 'Creates generator with (...)', explanation: '(x for x in range(5)) is generator expression' },
  { language: 'python', questionNumber: 111, questionType: 'mcq', topic: 'Loops', difficulty: 'medium', question: 'What is reversed() used for?', options: ['Delete sequence', 'Create reversed copy', 'Sort items', 'Find item'], correctAnswer: 'Create reversed copy', explanation: 'reversed() gives reverse iteration' },
  { language: 'python', questionNumber: 112, questionType: 'mcq', topic: 'Loops', difficulty: 'easy', question: 'What is sorted() used for?', options: ['Delete items', 'Create sorted copy', 'Find largest', 'Count items'], correctAnswer: 'Create sorted copy', explanation: 'sorted() returns new sorted list' },
  { language: 'python', questionNumber: 113, questionType: 'mcq', topic: 'Loops', difficulty: 'hard', question: 'What is the output of: list(range(5))?', options: ['range(5)', '[0, 1, 2, 3, 4]', '[1, 2, 3, 4, 5]', 'Error'], correctAnswer: '[0, 1, 2, 3, 4]', explanation: 'list() converts range to list' },
  { language: 'python', questionNumber: 114, questionType: 'mcq', topic: 'Loops', difficulty: 'medium', question: 'What is the output of: for i, x in enumerate([10,20,30]): print(i, x)?', options: ['10 20 30', '0 10 1 20 2 30', '[0, 10]', 'Error'], correctAnswer: '0 10 1 20 2 30', explanation: 'enumerate provides index and value' },
  { language: 'python', questionNumber: 115, questionType: 'mcq', topic: 'Loops', difficulty: 'hard', question: 'What is nested loop?', options: ['Loop inside loop', 'Complex loop', 'Multiple conditions', 'Sequential loops'], correctAnswer: 'Loop inside loop', explanation: 'for loop inside another for loop' },
  { language: 'python', questionNumber: 116, questionType: 'mcq', topic: 'Loops', difficulty: 'medium', question: 'What is the output of: for i in range(2): for j in range(2): print(i, j)?', options: ['0 0 0 1 1 0 1 1', '[0, 0]', 'Error', '2'], correctAnswer: '0 0 0 1 1 0 1 1', explanation: 'Nested loops iterate combinations' },
  { language: 'python', questionNumber: 117, questionType: 'mcq', topic: 'Loops', difficulty: 'easy', question: 'Do you need to initialize counter in for loop?', options: ['Yes', 'No', 'Only sometimes', 'Only in while'], correctAnswer: 'No', explanation: 'for loop handles iteration automatically' },
  { language: 'python', questionNumber: 118, questionType: 'mcq', topic: 'Loops', difficulty: 'medium', question: 'What is difference between break and continue?', options: ['Same thing', 'break exits, continue skips', 'Opposite meaning', 'No difference'], correctAnswer: 'break exits, continue skips', explanation: 'break ends loop, continue skips iteration' },
  { language: 'python', questionNumber: 119, questionType: 'mcq', topic: 'Loops', difficulty: 'hard', question: 'What is the output of: x = 0; while True: if x > 2: break; x += 1; print(x)?', options: ['1 2 3', '1 2', '0 1 2', 'Error'], correctAnswer: '1 2', explanation: 'Breaks when x > 2' },
  { language: 'python', questionNumber: 120, questionType: 'mcq', topic: 'Loops', difficulty: 'medium', question: 'Can you access loop variable after loop ends?', options: ['No', 'Yes, still in scope', 'Only in while', 'Only in nested'], correctAnswer: 'Yes, still in scope', explanation: 'Loop variable persists after loop completes' },

  // ===== OPERATIONS (40 questions) =====
  { language: 'python', questionNumber: 121, questionType: 'mcq', topic: 'Operations', difficulty: 'easy', question: 'What is the output of: 5 + 3?', options: ['8', '53', 'Error', '2'], correctAnswer: '8', explanation: 'Addition operator + adds numbers' },
  { language: 'python', questionNumber: 122, questionType: 'mcq', topic: 'Operations', difficulty: 'easy', question: 'What is the output of: 10 - 3?', options: ['7', '13', 'Error', '30'], correctAnswer: '7', explanation: 'Subtraction operator - subtracts numbers' },
  { language: 'python', questionNumber: 123, questionType: 'mcq', topic: 'Operations', difficulty: 'easy', question: 'What is the output of: 4 * 5?', options: ['9', '20', '1', '45'], correctAnswer: '20', explanation: 'Multiplication operator * multiplies numbers' },
  { language: 'python', questionNumber: 124, questionType: 'mcq', topic: 'Operations', difficulty: 'easy', question: 'What is the output of: 15 / 3?', options: ['5.0', '5', '0.2', 'Error'], correctAnswer: '5.0', explanation: 'Division operator / returns float' },
  { language: 'python', questionNumber: 125, questionType: 'mcq', topic: 'Operations', difficulty: 'easy', question: 'What is the output of: 15 // 3?', options: ['5.0', '5', '0.2', 'Error'], correctAnswer: '5', explanation: 'Floor division // returns integer' },
  { language: 'python', questionNumber: 126, questionType: 'mcq', topic: 'Operations', difficulty: 'easy', question: 'What is the output of: 10 % 3?', options: ['3', '1', '10', '0'], correctAnswer: '1', explanation: 'Modulo operator % returns remainder' },
  { language: 'python', questionNumber: 127, questionType: 'mcq', topic: 'Operations', difficulty: 'easy', question: 'What is the output of: 2 ** 3?', options: ['6', '8', '5', '23'], correctAnswer: '8', explanation: 'Exponentiation ** raises to power' },
  { language: 'python', questionNumber: 128, questionType: 'mcq', topic: 'Operations', difficulty: 'medium', question: 'What is operator precedence?', options: ['Random order', 'Mathematical order (PEMDAS)', 'Left to right', 'Right to left'], correctAnswer: 'Mathematical order (PEMDAS)', explanation: '* and / before + and -' },
  { language: 'python', questionNumber: 129, questionType: 'mcq', topic: 'Operations', difficulty: 'easy', question: 'What is the output of: 2 + 3 * 4?', options: ['20', '14', '11', 'Error'], correctAnswer: '14', explanation: 'Multiplication before addition' },
  { language: 'python', questionNumber: 130, questionType: 'mcq', topic: 'Operations', difficulty: 'easy', question: 'What is the output of: (2 + 3) * 4?', options: ['14', '20', '11', '2'], correctAnswer: '20', explanation: 'Parentheses override precedence' },
  { language: 'python', questionNumber: 131, questionType: 'mcq', topic: 'Operations', difficulty: 'medium', question: 'What is compound assignment operator +=?', options: ['Add and assign', 'Add to assignment', 'Only for strings', 'Comparison'], correctAnswer: 'Add and assign', explanation: 'x += 5 means x = x + 5' },
  { language: 'python', questionNumber: 132, questionType: 'mcq', topic: 'Operations', difficulty: 'medium', question: 'What is the output of: x = 5; x += 3?', options: ['5', '8', '3', 'Error'], correctAnswer: '8', explanation: 'x becomes 5 + 3 = 8' },
  { language: 'python', questionNumber: 133, questionType: 'mcq', topic: 'Operations', difficulty: 'medium', question: 'What is the output of: x = 10; x -= 3?', options: ['7', '10', '13', 'Error'], correctAnswer: '7', explanation: 'x becomes 10 - 3 = 7' },
  { language: 'python', questionNumber: 134, questionType: 'mcq', topic: 'Operations', difficulty: 'medium', question: 'What is the output of: x = 5; x *= 2?', options: ['5', '10', '7', 'Error'], correctAnswer: '10', explanation: 'x becomes 5 * 2 = 10' },
  { language: 'python', questionNumber: 135, questionType: 'mcq', topic: 'Operations', difficulty: 'medium', question: 'What is the output of: x = 10; x /= 2?', options: ['5', '5.0', '0.2', 'Error'], correctAnswer: '5.0', explanation: 'Division returns float' },
  { language: 'python', questionNumber: 136, questionType: 'mcq', topic: 'Operations', difficulty: 'hard', question: 'What is the output of: x = 10; x //= 3?', options: ['3.333', '3', '1', 'Error'], correctAnswer: '3', explanation: 'Floor division returns integer' },
  { language: 'python', questionNumber: 137, questionType: 'mcq', topic: 'Operations', difficulty: 'hard', question: 'What is the output of: x = 10; x %= 3?', options: ['3', '1', '0', 'Error'], correctAnswer: '1', explanation: 'Remainder of 10 / 3 is 1' },
  { language: 'python', questionNumber: 138, questionType: 'mcq', topic: 'Operations', difficulty: 'hard', question: 'What is the output of: x = 2; x **= 3?', options: ['6', '8', '5', 'Error'], correctAnswer: '8', explanation: 'x becomes 2^3 = 8' },
  { language: 'python', questionNumber: 139, questionType: 'mcq', topic: 'Operations', difficulty: 'easy', question: 'What is the output of: 5 > 3?', options: ['True', 'False', '2', 'Error'], correctAnswer: 'True', explanation: '5 is greater than 3' },
  { language: 'python', questionNumber: 140, questionType: 'mcq', topic: 'Operations', difficulty: 'easy', question: 'What is the output of: 5 < 3?', options: ['True', 'False', '2', 'Error'], correctAnswer: 'False', explanation: '5 is not less than 3' },
  { language: 'python', questionNumber: 141, questionType: 'mcq', topic: 'Operations', difficulty: 'easy', question: 'What is the output of: 5 == 5?', options: ['True', 'False', '10', 'Error'], correctAnswer: 'True', explanation: '5 equals 5' },
  { language: 'python', questionNumber: 142, questionType: 'mcq', topic: 'Operations', difficulty: 'easy', question: 'What is the output of: 5 != 3?', options: ['True', 'False', '2', 'Error'], correctAnswer: 'True', explanation: '5 not equals 3' },
  { language: 'python', questionNumber: 143, questionType: 'mcq', topic: 'Operations', difficulty: 'medium', question: 'What is the output of: 5 >= 5?', options: ['True', 'False', '10', 'Error'], correctAnswer: 'True', explanation: '5 greater or equal to 5' },
  { language: 'python', questionNumber: 144, questionType: 'mcq', topic: 'Operations', difficulty: 'medium', question: 'What is the output of: 3 <= 5?', options: ['True', 'False', '2', 'Error'], correctAnswer: 'True', explanation: '3 less or equal to 5' },
  { language: 'python', questionNumber: 145, questionType: 'mcq', topic: 'Operations', difficulty: 'medium', question: 'What is logical AND operator?', options: ['+', 'and', '&', '||'], correctAnswer: 'and', explanation: 'and returns True if both True' },
  { language: 'python', questionNumber: 146, questionType: 'mcq', topic: 'Operations', difficulty: 'medium', question: 'What is the output of: True and False?', options: ['True', 'False', 'Error', '1'], correctAnswer: 'False', explanation: 'True AND False is False' },
  { language: 'python', questionNumber: 147, questionType: 'mcq', topic: 'Operations', difficulty: 'medium', question: 'What is logical OR operator?', options: ['+', 'or', '&', '||'], correctAnswer: 'or', explanation: 'or returns True if any True' },
  { language: 'python', questionNumber: 148, questionType: 'mcq', topic: 'Operations', difficulty: 'medium', question: 'What is the output of: True or False?', options: ['True', 'False', 'Error', '1'], correctAnswer: 'True', explanation: 'True OR False is True' },
  { language: 'python', questionNumber: 149, questionType: 'mcq', topic: 'Operations', difficulty: 'medium', question: 'What is logical NOT operator?', options: ['!', 'not', '~', '-'], correctAnswer: 'not', explanation: 'not reverses boolean value' },
  { language: 'python', questionNumber: 150, questionType: 'mcq', topic: 'Operations', difficulty: 'medium', question: 'What is the output of: not True?', options: ['True', 'False', 'Error', '1'], correctAnswer: 'False', explanation: 'not True is False' },
  { language: 'python', questionNumber: 151, questionType: 'mcq', topic: 'Operations', difficulty: 'hard', question: 'What is the output of: (5 > 3) and (2 < 4)?', options: ['True', 'False', 'Error', '1'], correctAnswer: 'True', explanation: 'Both conditions are True' },
  { language: 'python', questionNumber: 152, questionType: 'mcq', topic: 'Operations', difficulty: 'hard', question: 'What is the output of: (5 < 3) or (2 < 4)?', options: ['True', 'False', 'Error', '1'], correctAnswer: 'True', explanation: 'Second condition is True' },
  { language: 'python', questionNumber: 153, questionType: 'mcq', topic: 'Operations', difficulty: 'hard', question: 'What is bitwise AND operator?', options: ['and', 'AND', '&', '&&'], correctAnswer: '&', explanation: '& performs bitwise AND' },
  { language: 'python', questionNumber: 154, questionType: 'mcq', topic: 'Operations', difficulty: 'hard', question: 'What is bitwise OR operator?', options: ['or', 'OR', '|', '||'], correctAnswer: '|', explanation: '| performs bitwise OR' },
  { language: 'python', questionNumber: 155, questionType: 'mcq', topic: 'Operations', difficulty: 'hard', question: 'What is bitwise XOR operator?', options: ['^', '^', 'xor', 'XOR'], correctAnswer: '^', explanation: '^ performs bitwise XOR' },
  { language: 'python', questionNumber: 156, questionType: 'mcq', topic: 'Operations', difficulty: 'hard', question: 'What is the output of: 5 & 3?', options: ['1', '3', '5', '7'], correctAnswer: '1', explanation: 'Bitwise AND: 101 & 011 = 001' },
  { language: 'python', questionNumber: 157, questionType: 'mcq', topic: 'Operations', difficulty: 'hard', question: 'What is the output of: 5 | 3?', options: ['1', '3', '5', '7'], correctAnswer: '7', explanation: 'Bitwise OR: 101 | 011 = 111' },
  { language: 'python', questionNumber: 158, questionType: 'mcq', topic: 'Operations', difficulty: 'medium', question: 'What is abs() function?', options: ['Abstract', 'Absolute value', 'Absorption', 'Abstract base'], correctAnswer: 'Absolute value', explanation: 'abs(-5) returns 5' },
  { language: 'python', questionNumber: 159, questionType: 'mcq', topic: 'Operations', difficulty: 'easy', question: 'What is the output of: abs(-10)?', options: ['-10', '10', '0', 'Error'], correctAnswer: '10', explanation: 'Absolute value of -10 is 10' },
  { language: 'python', questionNumber: 160, questionType: 'mcq', topic: 'Operations', difficulty: 'medium', question: 'What is the output of: round(3.7)?', options: ['3', '4', '3.7', 'Error'], correctAnswer: '4', explanation: 'round() rounds to nearest integer' },

  // ===== FUNCTIONS (40 questions) =====
  { language: 'python', questionNumber: 161, questionType: 'mcq', topic: 'Functions', difficulty: 'easy', question: 'How do you define a function in Python?', options: ['func name():', 'function name():', 'def name():', 'define name():'], correctAnswer: 'def name():', explanation: 'def keyword defines a function' },
  { language: 'python', questionNumber: 162, questionType: 'mcq', topic: 'Functions', difficulty: 'easy', question: 'What is the output of: def greet(): return "Hello"; print(greet())?', options: ['"Hello"', 'Hello', 'Error', 'None'], correctAnswer: 'Hello', explanation: 'Function returns string and prints it' },
  { language: 'python', questionNumber: 163, questionType: 'mcq', topic: 'Functions', difficulty: 'easy', question: 'What are parameters in a function?', options: ['Return values', 'Input values', 'Function body', 'Function name'], correctAnswer: 'Input values', explanation: 'Parameters are inputs to function' },
  { language: 'python', questionNumber: 164, questionType: 'mcq', topic: 'Functions', difficulty: 'easy', question: 'What are arguments in a function?', options: ['Function definition', 'Values passed to function', 'Return type', 'Function body'], correctAnswer: 'Values passed to function', explanation: 'Arguments are actual values passed' },
  { language: 'python', questionNumber: 165, questionType: 'mcq', topic: 'Functions', difficulty: 'medium', question: 'What is the output of: def add(a, b): return a + b; print(add(3, 4))?', options: ['3', '7', '34', 'Error'], correctAnswer: '7', explanation: 'Function returns sum of arguments' },
  { language: 'python', questionNumber: 166, questionType: 'mcq', topic: 'Functions', difficulty: 'medium', question: 'What is default parameter?', options: ['Always required', 'Parameter with default value', 'Optional', 'None'], correctAnswer: 'Parameter with default value', explanation: 'def func(x=5): x has default value 5' },
  { language: 'python', questionNumber: 167, questionType: 'mcq', topic: 'Functions', difficulty: 'medium', question: 'What is the output of: def greet(name="John"): return f"Hi {name}"; print(greet())?', options: ['"Hi "', '"Hi John"', 'Error', 'None'], correctAnswer: '"Hi John"', explanation: 'Default parameter name="John" used' },
  { language: 'python', questionNumber: 168, questionType: 'mcq', topic: 'Functions', difficulty: 'medium', question: 'Can function return multiple values?', options: ['No', 'Yes, as tuple', 'Only one', 'Only with list'], correctAnswer: 'Yes, as tuple', explanation: 'return a, b returns tuple' },
  { language: 'python', questionNumber: 169, questionType: 'mcq', topic: 'Functions', difficulty: 'hard', question: 'What is *args?', options: ['Asterisk argument', 'Variable number of arguments', 'Pointer', 'All arguments'], correctAnswer: 'Variable number of arguments', explanation: '*args allows flexible number of arguments' },
  { language: 'python', questionNumber: 170, questionType: 'mcq', topic: 'Functions', difficulty: 'hard', question: 'What is **kwargs?', options: ['Double asterisk', 'Keyword arguments', 'Multiple arguments', 'Power operator'], correctAnswer: 'Keyword arguments', explanation: '**kwargs for keyword arguments' },
  { language: 'python', questionNumber: 171, questionType: 'mcq', topic: 'Functions', difficulty: 'medium', question: 'What is return statement?', options: ['Sends data back', 'Ends function', 'Both', 'Prints value'], correctAnswer: 'Both', explanation: 'return exits function and sends value' },
  { language: 'python', questionNumber: 172, questionType: 'mcq', topic: 'Functions', difficulty: 'medium', question: 'What if function has no return statement?', options: ['Error', 'Returns None', 'Returns 0', 'Returns False'], correctAnswer: 'Returns None', explanation: 'No return means function returns None' },
  { language: 'python', questionNumber: 173, questionType: 'mcq', topic: 'Functions', difficulty: 'easy', question: 'Can you call function before defining it?', options: ['Yes', 'No', 'Depends on context', 'Only in main'], correctAnswer: 'No', explanation: 'Function must be defined before calling' },
  { language: 'python', questionNumber: 174, questionType: 'mcq', topic: 'Functions', difficulty: 'medium', question: 'What is scope inside function?', options: ['Global', 'Local', 'Both', 'Module'], correctAnswer: 'Local', explanation: 'Variables in function have local scope' },
  { language: 'python', questionNumber: 175, questionType: 'mcq', topic: 'Functions', difficulty: 'medium', question: 'What is recursive function?', options: ['Repeating function', 'Function calling itself', 'Complex function', 'Nested function'], correctAnswer: 'Function calling itself', explanation: 'Recursive function calls itself' },
  { language: 'python', questionNumber: 176, questionType: 'mcq', topic: 'Functions', difficulty: 'hard', question: 'What is base case in recursion?', options: ['First case', 'Stopping condition', 'Default case', 'Main case'], correctAnswer: 'Stopping condition', explanation: 'Base case prevents infinite recursion' },
  { language: 'python', questionNumber: 177, questionType: 'mcq', topic: 'Functions', difficulty: 'medium', question: 'What is factorial(5) in recursion?', options: ['5! = 120', '5! = 24', '5! = 1', 'Error'], correctAnswer: '5! = 120', explanation: 'factorial(5) = 5*4*3*2*1 = 120' },
  { language: 'python', questionNumber: 178, questionType: 'mcq', topic: 'Functions', difficulty: 'hard', question: 'What is lambda function?', options: ['Greek letter', 'Anonymous function', 'Error', 'Type of variable'], correctAnswer: 'Anonymous function', explanation: 'lambda x: x*2 is anonymous function' },
  { language: 'python', questionNumber: 179, questionType: 'mcq', topic: 'Functions', difficulty: 'hard', question: 'What is the output of: (lambda x: x*2)(5)?', options: ['5', '10', 'Error', '25'], correctAnswer: '10', explanation: 'Lambda function multiplies by 2' },
  { language: 'python', questionNumber: 180, questionType: 'mcq', topic: 'Functions', difficulty: 'medium', question: 'What is docstring in function?', options: ['Comments', 'Documentation string', 'Error', 'Parameter'], correctAnswer: 'Documentation string', explanation: '"""This is docstring""" documents function' },
  { language: 'python', questionNumber: 181, questionType: 'mcq', topic: 'Functions', difficulty: 'medium', question: 'Can functions have optional parameters?', options: ['No', 'Yes with default values', 'Only in methods', 'Never'], correctAnswer: 'Yes with default values', explanation: 'def func(x=5): x has optional default value' },
  { language: 'python', questionNumber: 182, questionType: 'mcq', topic: 'Functions', difficulty: 'easy', question: 'What is function signature?', options: ['Authors name', 'Function definition line', 'Return type', 'Body'], correctAnswer: 'Function definition line', explanation: 'def name(params): is signature' },
  { language: 'python', questionNumber: 183, questionType: 'mcq', topic: 'Functions', difficulty: 'medium', question: 'What is positional argument?', options: ['By position order', 'By name', 'Optional', 'Default'], correctAnswer: 'By position order', explanation: 'Arguments matched by position' },
  { language: 'python', questionNumber: 184, questionType: 'mcq', topic: 'Functions', difficulty: 'medium', question: 'What is keyword argument?', options: ['By position', 'By name', 'Optional', 'Default'], correctAnswer: 'By name', explanation: 'func(name="John") uses keyword' },
  { language: 'python', questionNumber: 185, questionType: 'mcq', topic: 'Functions', difficulty: 'hard', question: 'Can positional arg follow keyword arg?', options: ['Yes', 'No', 'Sometimes', 'Only in Python 2'], correctAnswer: 'No', explanation: 'Positional must come before keyword' },
  { language: 'python', questionNumber: 186, questionType: 'mcq', topic: 'Functions', difficulty: 'medium', question: 'What is type hints in function?', options: ['Comments', 'Variable type specifications', 'Errors', 'Warnings'], correctAnswer: 'Variable type specifications', explanation: 'def func(x: int) -> int: specifies types' },
  { language: 'python', questionNumber: 187, questionType: 'mcq', topic: 'Functions', difficulty: 'hard', question: 'What is decorator in function?', options: ['Beautification', 'Modifies function behavior', 'Comment', 'Annotation'], correctAnswer: 'Modifies function behavior', explanation: '@decorator modifies function' },
  { language: 'python', questionNumber: 188, questionType: 'mcq', topic: 'Functions', difficulty: 'medium', question: 'What is closure in Python?', options: ['Closing function', 'Inner function accessing outer scope', 'End of program', 'Final value'], correctAnswer: 'Inner function accessing outer scope', explanation: 'Inner function can access outer variables' },
  { language: 'python', questionNumber: 189, questionType: 'mcq', topic: 'Functions', difficulty: 'hard', question: 'What is higher-order function?', options: ['Main function', 'Function taking/returning functions', 'Async function', 'Error handling'], correctAnswer: 'Function taking/returning functions', explanation: 'map, filter, reduce are higher-order' },
  { language: 'python', questionNumber: 190, questionType: 'mcq', topic: 'Functions', difficulty: 'hard', question: 'What is pure function?', options: ['No parameters', 'No side effects', 'Always returns', 'No recursion'], correctAnswer: 'No side effects', explanation: 'Pure function same input = same output' },
  { language: 'python', questionNumber: 191, questionType: 'mcq', topic: 'Functions', difficulty: 'medium', question: 'What is mutable default argument?', options: ['Constant default', 'List/dict as default', 'String default', 'None default'], correctAnswer: 'List/dict as default', explanation: 'Mutable defaults can cause bugs' },
  { language: 'python', questionNumber: 192, questionType: 'mcq', topic: 'Functions', difficulty: 'easy', question: 'Can you define function inside function?', options: ['No', 'Yes', 'Only in class', 'Only globally'], correctAnswer: 'Yes', explanation: 'Nested functions are valid' },
  { language: 'python', questionNumber: 193, questionType: 'mcq', topic: 'Functions', difficulty: 'medium', question: 'What is the output of: def outer(): def inner(): return "Hi"; return inner(); print(outer())?', options: ['"Hi"', 'None', 'Error', 'inner'], correctAnswer: '"Hi"', explanation: 'outer returns inner() which returns "Hi"' },
  { language: 'python', questionNumber: 194, questionType: 'mcq', topic: 'Functions', difficulty: 'hard', question: 'What is unpacking in function call?', options: ['Extracting', 'Opening', '*args use', 'List to arguments'], correctAnswer: '*args use', explanation: 'func(*[1,2]) unpacks list as arguments' },
  { language: 'python', questionNumber: 195, questionType: 'mcq', topic: 'Functions', difficulty: 'medium', question: 'What is the output of: def func(a, b=5): return a + b; print(func(3))?', options: ['3', '8', 'Error', '5'], correctAnswer: '8', explanation: 'b uses default value 5' },
  { language: 'python', questionNumber: 196, questionType: 'mcq', topic: 'Functions', difficulty: 'hard', question: 'What is staticmethod?', options: ['Static variable', 'Method without self', 'Class variable', 'Global method'], correctAnswer: 'Method without self', explanation: '@staticmethod creates static method' },
  { language: 'python', questionNumber: 197, questionType: 'mcq', topic: 'Functions', difficulty: 'hard', question: 'What is classmethod?', options: ['Regular method', 'Method taking class as arg', 'Instance method', 'Static method'], correctAnswer: 'Method taking class as arg', explanation: '@classmethod receives class as first arg' },
  { language: 'python', questionNumber: 198, questionType: 'mcq', topic: 'Functions', difficulty: 'easy', question: 'What keyword calls a function?', options: ['call', 'invoke', 'name()', 'execute'], correctAnswer: 'name()', explanation: 'Function name with () calls function' },
  { language: 'python', questionNumber: 199, questionType: 'mcq', topic: 'Functions', difficulty: 'medium', question: 'What is built-in function?', options: ['User defined', 'Provided by Python', 'From library', 'Custom'], correctAnswer: 'Provided by Python', explanation: 'len, print, range are built-in' },
  { language: 'python', questionNumber: 200, questionType: 'mcq', topic: 'Functions', difficulty: 'hard', question: 'What is the output of: (lambda x, y: x*y)(3, 4)?', options: ['7', '12', 'Error', '34'], correctAnswer: '12', explanation: 'Lambda returns 3 * 4 = 12' },

  // ===== ARRAYS (40 questions) =====
  { language: 'python', questionNumber: 201, questionType: 'mcq', topic: 'Arrays', difficulty: 'easy', question: 'How do you create a list in Python?', options: ['[1, 2, 3]', '{1, 2, 3}', '(1, 2, 3)', 'list(1, 2, 3)'], correctAnswer: '[1, 2, 3]', explanation: 'Square brackets create lists' },
  { language: 'python', questionNumber: 202, questionType: 'mcq', topic: 'Arrays', difficulty: 'easy', question: 'What is the output of: list = [1, 2, 3]; print(list[0])?', options: ['0', '1', '2', 'Error'], correctAnswer: '1', explanation: 'Index 0 is first element' },
  { language: 'python', questionNumber: 203, questionType: 'mcq', topic: 'Arrays', difficulty: 'easy', question: 'How do you add element to list?', options: ['.add()', '.append()', '.push()', '.insert()'], correctAnswer: '.append()', explanation: '.append() adds element to end' },
  { language: 'python', questionNumber: 204, questionType: 'mcq', topic: 'Arrays', difficulty: 'easy', question: 'What is the output of: [1, 2, 3].append(4); print([1, 2, 3, 4])?', options: ['[1, 2, 3]', '[1, 2, 3, 4]', 'Error', '[4]'], correctAnswer: '[1, 2, 3, 4]', explanation: '.append(4) adds 4 to list' },
  { language: 'python', questionNumber: 205, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'How do you remove element from list?', options: ['.delete()', '.remove()', '.pop()', '.clear()'], correctAnswer: '.remove()', explanation: '.remove(item) removes element' },
  { language: 'python', questionNumber: 206, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'What is the output of: [1, 2, 3, 2].remove(2); print([1, 3, 2])?', options: ['[1, 3, 2]', '[1, 2, 3]', '[1, 2, 2, 3]', 'Error'], correctAnswer: '[1, 3, 2]', explanation: '.remove(2) removes first 2' },
  { language: 'python', questionNumber: 207, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'How do you get length of list?', options: ['size(list)', 'length(list)', 'len(list)', 'count(list)'], correctAnswer: 'len(list)', explanation: 'len() returns number of elements' },
  { language: 'python', questionNumber: 208, questionType: 'mcq', topic: 'Arrays', difficulty: 'easy', question: 'What is the output of: len([1, 2, 3, 4])?', options: ['0', '3', '4', '5'], correctAnswer: '4', explanation: 'List has 4 elements' },
  { language: 'python', questionNumber: 209, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'How do you access last element of list?', options: ['list[-1]', 'list[last]', 'list.last()', 'list[len(list)]'], correctAnswer: 'list[-1]', explanation: 'Negative indexing accesses from end' },
  { language: 'python', questionNumber: 210, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'What is the output of: [1, 2, 3][-1]?', options: ['1', '2', '3', 'Error'], correctAnswer: '3', explanation: '-1 is last element' },
  { language: 'python', questionNumber: 211, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'How do you slice list [1,2,3,4,5][1:3]?', options: ['[1, 3]', '[2, 3]', '[1, 2, 3]', '[2, 3, 4]'], correctAnswer: '[2, 3]', explanation: '[1:3] gets indices 1 and 2' },
  { language: 'python', questionNumber: 212, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'What is the output of: [1, 2, 3, 4][::2]?', options: ['[1, 3]', '[2, 4]', '[1, 2, 3, 4]', '[1, 3, 5]'], correctAnswer: '[1, 3]', explanation: '[::2] every 2nd element' },
  { language: 'python', questionNumber: 213, questionType: 'mcq', topic: 'Arrays', difficulty: 'hard', question: 'How do you reverse list [1,2,3][::-1]?', options: ['[3, 2, 1]', '[1, 2, 3]', '[2, 1, 3]', 'Error'], correctAnswer: '[3, 2, 1]', explanation: '[::-1] reverses list' },
  { language: 'python', questionNumber: 214, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'How do you sort list?', options: ['.sort()', '.sorted()', 'sort(list)', 'sorted(list)'], correctAnswer: 'sorted(list)', explanation: 'sorted() returns sorted list' },
  { language: 'python', questionNumber: 215, questionType: 'mcq', topic: 'Arrays', difficulty: 'easy', question: 'What is the output of: sorted([3, 1, 4, 1, 5])?', options: ['[3, 1, 4, 1, 5]', '[1, 1, 3, 4, 5]', '[5, 4, 3, 1, 1]', 'Error'], correctAnswer: '[1, 1, 3, 4, 5]', explanation: 'sorted() returns sorted list' },
  { language: 'python', questionNumber: 216, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'Can list contain different types?', options: ['No', 'Yes', 'Only 2 types', 'Only strings'], correctAnswer: 'Yes', explanation: '[1, "hello", 3.14] is valid' },
  { language: 'python', questionNumber: 217, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'How do you join two lists?', options: ['.join()', '+', '.extend()', '.concat()'], correctAnswer: '+', explanation: '[1,2] + [3,4] = [1,2,3,4]' },
  { language: 'python', questionNumber: 218, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'What is the output of: [1, 2] + [3, 4]?', options: ['[1, 2, 3, 4]', '[1, 3, 2, 4]', 'Error', '[6]'], correctAnswer: '[1, 2, 3, 4]', explanation: '+ concatenates lists' },
  { language: 'python', questionNumber: 219, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'How do you repeat list [1]*3?', options: ['[3]', '[1, 1, 1]', '[1, 1, 3]', 'Error'], correctAnswer: '[1, 1, 1]', explanation: '*3 repeats list 3 times' },
  { language: 'python', questionNumber: 220, questionType: 'mcq', topic: 'Arrays', difficulty: 'hard', question: 'What is difference between .sort() and sorted()? ', options: ['Same', '.sort() modifies, sorted() copies', 'sorted() faster', 'Different input'], correctAnswer: '.sort() modifies, sorted() copies', explanation: '.sort() is in-place, sorted() returns new' },
  { language: 'python', questionNumber: 221, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'How do you check if item in list?', options: ['item.in(list)', 'item in list', 'list.contains(item)', 'find(item)'], correctAnswer: 'item in list', explanation: 'in operator checks membership' },
  { language: 'python', questionNumber: 222, questionType: 'mcq', topic: 'Arrays', difficulty: 'easy', question: 'What is the output of: 2 in [1, 2, 3]?', options: ['True', 'False', 'Error', '2'], correctAnswer: 'True', explanation: '2 is in list' },
  { language: 'python', questionNumber: 223, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'How do you find index of item?', options: ['.find()', '.index()', '.indexOf()', '.search()'], correctAnswer: '.index()', explanation: '.index(item) returns first index' },
  { language: 'python', questionNumber: 224, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'What is the output of: [1, 2, 3, 2].index(2)?', options: ['0', '1', '3', 'Error'], correctAnswer: '1', explanation: '.index(2) returns first index of 2' },
  { language: 'python', questionNumber: 225, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'How do you count occurrences?', options: ['.count()', '.occurrences()', '.frequency()', '.size()'], correctAnswer: '.count()', explanation: '.count(item) counts occurrences' },
  { language: 'python', questionNumber: 226, questionType: 'mcq', topic: 'Arrays', difficulty: 'easy', question: 'What is the output of: [1, 2, 2, 2, 3].count(2)?', options: ['2', '3', '4', 'Error'], correctAnswer: '3', explanation: '.count(2) returns 3' },
  { language: 'python', questionNumber: 227, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'How do you insert at specific index?', options: ['.add()', '.insert()', '.place()', '.set()'], correctAnswer: '.insert()', explanation: '.insert(index, item) inserts at index' },
  { language: 'python', questionNumber: 228, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'What is the output of: [1, 2, 3].insert(1, 99)?', options: ['[1, 99, 2, 3]', '[1, 2, 99, 3]', '[99, 1, 2, 3]', '[1, 2, 3, 99]'], correctAnswer: '[1, 99, 2, 3]', explanation: '.insert(1, 99) inserts 99 at index 1' },
  { language: 'python', questionNumber: 229, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'What is tuple in Python?', options: ['Same as list', 'Immutable sequence', 'String type', 'Dictionary'], correctAnswer: 'Immutable sequence', explanation: 'Tuples cannot be modified after creation' },
  { language: 'python', questionNumber: 230, questionType: 'mcq', topic: 'Arrays', difficulty: 'easy', question: 'How do you create a tuple?', options: ['[1, 2, 3]', '{1, 2, 3}', '(1, 2, 3)', 'tuple(1, 2, 3)'], correctAnswer: '(1, 2, 3)', explanation: 'Parentheses create tuples' },
  { language: 'python', questionNumber: 231, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'Can you modify tuple after creation?', options: ['Yes', 'No', 'Only elements', 'Only length'], correctAnswer: 'No', explanation: 'Tuples are immutable' },
  { language: 'python', questionNumber: 232, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'What is difference between list and tuple?', options: ['Same', 'List mutable, tuple immutable', 'Tuple faster', 'List has methods'], correctAnswer: 'List mutable, tuple immutable', explanation: 'Key difference is mutability' },
  { language: 'python', questionNumber: 233, questionType: 'mcq', topic: 'Arrays', difficulty: 'hard', question: 'What is unpacking tuple (a, b) = (1, 2)?', options: ['Error', 'Assigns a=1, b=2', 'Comparison', 'None'], correctAnswer: 'Assigns a=1, b=2', explanation: 'Tuple unpacking assigns values' },
  { language: 'python', questionNumber: 234, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'What is .pop() method?', options: ['Inserts element', 'Removes and returns element', 'Adds element', 'Finds element'], correctAnswer: 'Removes and returns element', explanation: '.pop() removes last element' },
  { language: 'python', questionNumber: 235, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'What is the output of: [1, 2, 3].pop()?', options: ['3', '[1, 2]', '[1, 2, 3]', 'Error'], correctAnswer: '3', explanation: '.pop() removes and returns 3' },
  { language: 'python', questionNumber: 236, questionType: 'mcq', topic: 'Arrays', difficulty: 'hard', question: 'What is .extend() method?', options: ['Lengthens list', 'Adds items from iterable', 'Extends elements', 'Merges lists'], correctAnswer: 'Adds items from iterable', explanation: '.extend() adds multiple items' },
  { language: 'python', questionNumber: 237, questionType: 'mcq', topic: 'Arrays', difficulty: 'hard', question: 'What is difference between .extend() and .append()?', options: ['Same', '.extend() adds items, .append() adds item', 'Opposite', 'Speed'], correctAnswer: '.extend() adds items, .append() adds item', explanation: '.extend([1,2]) vs .append([1,2])' },
  { language: 'python', questionNumber: 238, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'What is .clear() method?', options: ['Clears variable', 'Removes all elements', 'Clears memory', 'Deletes list'], correctAnswer: 'Removes all elements', explanation: '.clear() empties the list' },
  { language: 'python', questionNumber: 239, questionType: 'mcq', topic: 'Arrays', difficulty: 'medium', question: 'What is list comprehension [x*2 for x in [1,2,3]]?', options: ['Error', '[2, 4, 6]', '[1, 2, 3, 2]', '[6]'], correctAnswer: '[2, 4, 6]', explanation: 'Creates new list with doubled values' },
  { language: 'python', questionNumber: 240, questionType: 'mcq', topic: 'Arrays', difficulty: 'hard', question: 'What is the output of: [x for x in range(5) if x > 2]?', options: ['[0, 1, 2, 3, 4]', '[3, 4]', '[1, 2, 3, 4]', 'Error'], correctAnswer: '[3, 4]', explanation: 'List comprehension with if condition' },

  // ===== OBJECTS (30 questions) - Python focused on classes/objects =====
  { language: 'python', questionNumber: 241, questionType: 'mcq', topic: 'Objects', difficulty: 'easy', question: 'What is a class in Python?', options: ['Function', 'Blueprint for objects', 'Variable type', 'Import statement'], correctAnswer: 'Blueprint for objects', explanation: 'Class defines object structure' },
  { language: 'python', questionNumber: 242, questionType: 'mcq', topic: 'Objects', difficulty: 'easy', question: 'How do you define a class?', options: ['class Name:', 'def Name:', 'object Name:', 'type Name:'], correctAnswer: 'class Name:', explanation: 'class keyword defines class' },
  { language: 'python', questionNumber: 243, questionType: 'mcq', topic: 'Objects', difficulty: 'easy', question: 'What is __init__ method?', options: ['Initialization', 'Constructor method', 'Both', 'Destructor'], correctAnswer: 'Both', explanation: '__init__ initializes objects' },
  { language: 'python', questionNumber: 244, questionType: 'mcq', topic: 'Objects', difficulty: 'medium', question: 'What is self parameter?', options: ['Self reference', 'Current object', 'Both', 'Function parameter'], correctAnswer: 'Both', explanation: 'self refers to instance' },
  { language: 'python', questionNumber: 245, questionType: 'mcq', topic: 'Objects', difficulty: 'medium', question: 'What is object instance?', options: ['Class definition', 'Variable of class type', 'Blueprint', 'Method'], correctAnswer: 'Variable of class type', explanation: 'obj = MyClass() creates instance' },
  { language: 'python', questionNumber: 246, questionType: 'mcq', topic: 'Objects', difficulty: 'medium', question: 'What is attribute?', options: ['Method', 'Property of object', 'Function', 'Parameter'], correctAnswer: 'Property of object', explanation: 'obj.name is attribute' },
  { language: 'python', questionNumber: 247, questionType: 'mcq', topic: 'Objects', difficulty: 'medium', question: 'What is method?', options: ['Variable', 'Function in class', 'Property', 'Parameter'], correctAnswer: 'Function in class', explanation: 'def func(self): is method' },
  { language: 'python', questionNumber: 248, questionType: 'mcq', topic: 'Objects', difficulty: 'hard', question: 'What is inheritance?', options: ['Getting attribute', 'Class inheriting from another', 'Creating object', 'Function call'], correctAnswer: 'Class inheriting from another', explanation: 'class Child(Parent): inherits' },
  { language: 'python', questionNumber: 249, questionType: 'mcq', topic: 'Objects', difficulty: 'hard', question: 'What is encapsulation?', options: ['Wrapping code', 'Hiding internal details', 'Both', 'Creating class'], correctAnswer: 'Both', explanation: 'Encapsulation hides implementation' },
  { language: 'python', questionNumber: 250, questionType: 'mcq', topic: 'Objects', difficulty: 'hard', question: 'What is polymorphism?', options: ['Many forms', 'Same interface different behavior', 'Both', 'Inheritance'], correctAnswer: 'Both', explanation: 'Polymorphism means many forms' },
  { language: 'python', questionNumber: 251, questionType: 'mcq', topic: 'Objects', difficulty: 'medium', question: 'What is __str__ method?', options: ['String conversion', 'Returns object string', 'Both', 'Initialization'], correctAnswer: 'Both', explanation: '__str__() defines string representation' },
  { language: 'python', questionNumber: 252, questionType: 'mcq', topic: 'Objects', difficulty: 'medium', question: 'What is __repr__ method?', options: ['Representation', 'Developer string', 'Both', 'Initialization'], correctAnswer: 'Both', explanation: '__repr__() for debugging' },
  { language: 'python', questionNumber: 253, questionType: 'mcq', topic: 'Objects', difficulty: 'hard', question: 'What is @property decorator?', options: ['Decorates property', 'Makes getter method', 'Both', 'Marks attribute'], correctAnswer: 'Both', explanation: '@property allows attribute-like access' },
  { language: 'python', questionNumber: 254, questionType: 'mcq', topic: 'Objects', difficulty: 'medium', question: 'What is super() function?', options: ['Superior function', 'Accesses parent class', 'Creates superclass', 'Override method'], correctAnswer: 'Accesses parent class', explanation: 'super() calls parent methods' },
  { language: 'python', questionNumber: 255, questionType: 'mcq', topic: 'Objects', difficulty: 'hard', question: 'What is abstract class?', options: ['Empty class', 'Cannot be instantiated', 'Parent class', 'Template class'], correctAnswer: 'Cannot be instantiated', explanation: 'Abstract classes define interface' },
  { language: 'python', questionNumber: 256, questionType: 'mcq', topic: 'Objects', difficulty: 'medium', question: 'What is class variable?', options: ['Instance variable', 'Shared by class', 'Local variable', 'Global variable'], correctAnswer: 'Shared by class', explanation: 'Defined in class body' },
  { language: 'python', questionNumber: 257, questionType: 'mcq', topic: 'Objects', difficulty: 'easy', question: 'What is instance variable?', options: ['Class variable', 'Unique to object', 'Method', 'Function'], correctAnswer: 'Unique to object', explanation: 'self.name is instance variable' },
  { language: 'python', questionNumber: 258, questionType: 'mcq', topic: 'Objects', difficulty: 'hard', question: 'What is method overriding?', options: ['Replacing method', 'Redefining parent method', 'Both', 'Calling method'], correctAnswer: 'Both', explanation: 'Child redefines parent method' },
  { language: 'python', questionNumber: 259, questionType: 'mcq', topic: 'Objects', difficulty: 'hard', question: 'What is method overloading?', options: ['Multiple methods same name', 'Not supported in Python', 'Parameter variation', 'Not possible'], correctAnswer: 'Not supported in Python', explanation: 'Python uses default args instead' },
  { language: 'python', questionNumber: 260, questionType: 'mcq', topic: 'Objects', difficulty: 'medium', question: 'What is __del__ method?', options: ['Deletion', 'Destructor', 'Both', 'Cleanup'], correctAnswer: 'Both', explanation: '__del__() called on object deletion' },
  { language: 'python', questionNumber: 261, questionType: 'mcq', topic: 'Objects', difficulty: 'hard', question: 'What is multiple inheritance?', options: ['One parent', 'Multiple parents', 'Complex inheritance', 'Not supported'], correctAnswer: 'Multiple parents', explanation: 'class Child(Parent1, Parent2):' },
  { language: 'python', questionNumber: 262, questionType: 'mcq', topic: 'Objects', difficulty: 'hard', question: 'What is MRO (Method Resolution Order)?', options: ['Order of methods', 'Resolution of method calls', 'Both', 'Ordering'], correctAnswer: 'Both', explanation: 'MRO defines inheritance order' },
  { language: 'python', questionNumber: 263, questionType: 'mcq', topic: 'Objects', difficulty: 'medium', question: 'What is composition?', options: ['Writing code', 'Object containing objects', 'Class definition', 'Function call'], correctAnswer: 'Object containing objects', explanation: 'HAS-A relationship' },
  { language: 'python', questionNumber: 264, questionType: 'mcq', topic: 'Objects', difficulty: 'medium', question: 'What is interface?', options: ['User interface', 'Contract for implementation', 'Class', 'Method'], correctAnswer: 'Contract for implementation', explanation: 'Defines what methods must exist' },
  { language: 'python', questionNumber: 265, questionType: 'mcq', topic: 'Objects', difficulty: 'easy', question: 'How do you create object from class?', options: ['obj = Class', 'obj = Class()', 'obj.create()', 'new Class()'], correctAnswer: 'obj = Class()', explanation: 'Class() creates instance' },
  { language: 'python', questionNumber: 266, questionType: 'mcq', topic: 'Objects', difficulty: 'medium', question: 'What is __name__ attribute?', options: ['Object name', 'Module name', 'Class name', 'Method name'], correctAnswer: 'Module name', explanation: '__name__ is module identifier' },
  { language: 'python', questionNumber: 267, questionType: 'mcq', topic: 'Objects', difficulty: 'medium', question: 'What is isinstance() function?', options: ['Checks similarity', 'Checks type/class', 'Creates instance', 'Compares objects'], correctAnswer: 'Checks type/class', explanation: 'isinstance(obj, Class) checks' },
  { language: 'python', questionNumber: 268, questionType: 'mcq', topic: 'Objects', difficulty: 'medium', question: 'What is hasattr() function?', options: ['Has attribute', 'Checks attribute existence', 'Both', 'Creates attribute'], correctAnswer: 'Both', explanation: 'hasattr(obj, "name") checks' },
  { language: 'python', questionNumber: 269, questionType: 'mcq', topic: 'Objects', difficulty: 'hard', question: 'What is dataclass?', options: ['Regular class', 'Auto-generated __init__ class', 'Database class', 'Abstract class'], correctAnswer: 'Auto-generated __init__ class', explanation: '@dataclass decorator creates class' },
  { language: 'python', questionNumber: 270, questionType: 'mcq', topic: 'Objects', difficulty: 'hard', question: 'What is namedtuple?', options: ['Regular tuple', 'Tuple with named fields', 'Dictionary', 'List subclass'], correctAnswer: 'Tuple with named fields', explanation: 'namedtuple creates typed tuple' },
];

// Generate JAVA QUESTIONS (270 questions) - Unique Java-specific questions
const generateJavaQuestions = () => {
  const javaQuestions = [];
  let questionNum = 1;

  // VARIABLES (40 unique Java questions)
  const javaVariableTopics = [
    { q: 'Which keyword declares a variable in Java?', opts: ['var', 'int x = 5;', 'let', 'declare x'], ans: 'int x = 5;', diff: 'easy' },
    { q: 'What is the correct way to initialize a variable?', opts: ['int x = 5;', 'int x == 5;', 'x = 5;', 'initialize x = 5;'], ans: 'int x = 5;', diff: 'easy' },
    { q: 'Can you reassign a variable in Java?', opts: ['No', 'Yes', 'Only primitives', 'Only once'], ans: 'Yes', diff: 'easy' },
    { q: 'What is variable scope?', opts: ['Visibility range', 'Memory allocation', 'Type checking', 'Compilation'], ans: 'Visibility range', diff: 'easy' },
    { q: 'What is local variable?', opts: ['Global scope', 'Inside method/block', 'Static scope', 'Public scope'], ans: 'Inside method/block', diff: 'easy' },
    { q: 'What is instance variable?', opts: ['Local variable', 'Belongs to object', 'Static variable', 'Final variable'], ans: 'Belongs to object', diff: 'medium' },
    { q: 'What is static variable?', opts: ['Local variable', 'Belongs to object', 'Belongs to class', 'Private variable'], ans: 'Belongs to class', diff: 'medium' },
    { q: 'What keyword makes variable constant?', opts: ['static', 'const', 'final', 'immutable'], ans: 'final', diff: 'medium' },
    { q: 'Can you change final variable?', opts: ['Yes', 'No', 'Only once', 'In constructor'], ans: 'Only once', diff: 'medium' },
    { q: 'What is camelCase naming?', opts: ['UPPERCASE', 'first_word secondWord', 'firstWordSecondWord', 'FirstWordSecondWord'], ans: 'firstWordSecondWord', diff: 'easy' },
    { q: 'What is PascalCase naming?', opts: ['firstWord', 'FirstWord', 'first_word', 'FIRST_WORD'], ans: 'FirstWord', diff: 'easy' },
    { q: 'What is CONSTANT naming?', opts: ['camelCase', 'PascalCase', 'UPPER_CASE', 'lowercase'], ans: 'UPPER_CASE', diff: 'easy' },
    { q: 'Can variable start with number?', opts: ['Yes', 'No', 'Only if underscore', 'In strings'], ans: 'No', diff: 'easy' },
    { q: 'Can variable use underscore?', opts: ['No', 'Yes', 'Only at end', 'Only start'], ans: 'Yes', diff: 'easy' },
    { q: 'Can variable be keyword?', opts: ['Yes', 'No', 'Some keywords', 'With escape'], ans: 'No', diff: 'medium' },
    { q: 'What is variable shadowing?', opts: ['Hiding local variable', 'Inner variable hiding outer', 'Compilation error', 'Type mismatch'], ans: 'Inner variable hiding outer', diff: 'hard' },
    { q: 'What is null value?', opts: ['Zero', 'Absence of value', 'Empty string', 'False'], ans: 'Absence of value', diff: 'easy' },
    { q: 'Can primitive be null?', opts: ['Yes', 'No', 'Only int', 'Only with wrapper'], ans: 'No', diff: 'medium' },
    { q: 'What is boxing in Java?', opts: ['Packaging', 'Primitive to wrapper', 'Wrapper to primitive', 'Both'], ans: 'Primitive to wrapper', diff: 'medium' },
    { q: 'What is unboxing?', opts: ['Remove wrapping', 'Wrapper to primitive', 'Primitive conversion', 'Boxing reverse'], ans: 'Wrapper to primitive', diff: 'medium' },
  ];

  javaVariableTopics.forEach(t => {
    javaQuestions.push({
      language: 'java',
      questionNumber: questionNum++,
      questionType: 'mcq',
      topic: 'Variables',
      difficulty: t.diff || 'medium',
      question: t.q,
      options: t.opts,
      correctAnswer: t.ans,
      explanation: `Java variable basics - ${t.q}`
    });
  });

  // DATA TYPES & STRINGS (40)
  const javaDataTypeTopics = [
    { q: 'How many primitive types in Java?', opts: ['4', '6', '8', '12'], ans: '8', diff: 'easy' },
    { q: 'What are primitive types?', opts: ['Classes', 'byte, short, int, long, float, double, boolean, char', 'Objects', 'Strings'], ans: 'byte, short, int, long, float, double, boolean, char', diff: 'medium' },
    { q: 'Is String a primitive?', opts: ['Yes', 'No (Object)', 'Sometimes', 'Only in Java 8'], ans: 'No (Object)', diff: 'easy' },
    { q: 'How do you create String?', opts: ['String s = new String("hi");', 'String s = "hi";', 'Both are valid', 'new "hi"'], ans: 'Both are valid', diff: 'medium' },
    { q: 'Are Strings mutable?', opts: ['Yes', 'No', 'Sometimes', 'In functions'], ans: 'No', diff: 'medium' },
    { q: 'What is String Pool?', opts: ['Array of strings', 'Memory area storing string literals', 'String collection', 'String interface'], ans: 'Memory area storing string literals', diff: 'hard' },
    { q: 'What is int range?', opts: ['-128 to 127', '-32768 to 32767', '-2^31 to 2^31-1', 'No limit'], ans: '-2^31 to 2^31-1', diff: 'medium' },
    { q: 'What is byte range?', opts: ['-128 to 127', '-32768 to 32767', 'Same as int', '0 to 255'], ans: '-128 to 127', diff: 'medium' },
    { q: 'What is long data type?', opts: ['32-bit integer', '64-bit integer', 'Large number', 'Floating point'], ans: '64-bit integer', diff: 'easy' },
    { q: 'What is boolean?', opts: ['0 or 1', 'true or false', 'yes or no', 'on or off'], ans: 'true or false', diff: 'easy' },
    { q: 'What is char?', opts: ['String', 'Single character (16-bit)', 'Number', 'Symbol'], ans: 'Single character (16-bit)', diff: 'easy' },
    { q: 'What is float precision?', opts: ['32-bit (single)', '64-bit (double)', '16-bit', '128-bit'], ans: '32-bit (single)', diff: 'medium' },
    { q: 'What is double precision?', opts: ['32-bit', '64-bit (double)', '16-bit', '80-bit'], ans: '64-bit (double)', diff: 'medium' },
    { q: 'What is wrapper class?', opts: ['String wrapper', 'Object for primitive', 'Collection', 'Generic class'], ans: 'Object for primitive', diff: 'medium' },
    { q: 'What is Integer wrapper for?', opts: ['int primitive', 'Long values', 'Object representation of int', 'All'], ans: 'All', diff: 'hard' },
    { q: 'What is Math.PI?', opts: ['Method', 'Constant', 'Variable', 'Function'], ans: 'Constant', diff: 'easy' },
    { q: 'What is NumberFormatException?', opts: ['Number error', 'String to number conversion error', 'Division error', 'Overflow'], ans: 'String to number conversion error', diff: 'medium' },
    { q: 'Can you add String to number?', opts: ['No', 'Yes (concatenation)', 'Error', 'Only int'], ans: 'Yes (concatenation)', diff: 'easy' },
    { q: 'What is type casting?', opts: ['Throwing', 'Type conversion', 'Binding', 'Interface'], ans: 'Type conversion', diff: 'medium' },
    { q: 'What is implicit conversion?', opts: ['Manual cast', 'Automatic widening', 'Error', 'Not in Java'], ans: 'Automatic widening', diff: 'hard' },
  ];

  javaDataTypeTopics.forEach(t => {
    javaQuestions.push({
      language: 'java',
      questionNumber: questionNum++,
      questionType: 'mcq',
      topic: 'DataTypes_String',
      difficulty: t.diff || 'medium',
      question: t.q,
      options: t.opts,
      correctAnswer: t.ans,
      explanation: `Java data types - ${t.q}`
    });
  });

  // LOOPS (40)
  const javaLoopTopics = [
    { q: 'What loop types in Java?', opts: ['for', 'while', 'do-while', 'All'], ans: 'All', diff: 'easy' },
    { q: 'What is for loop syntax?', opts: ['for(;;)', 'for(init; cond; incr)', 'Both valid', 'while'], ans: 'for(init; cond; incr)', diff: 'easy' },
    { q: 'What is enhanced for loop?', opts: ['Traditional for', 'for-each loop', 'while loop', 'do-while'], ans: 'for-each loop', diff: 'medium' },
    { q: 'What is while loop?', opts: ['Fixed iterations', 'Condition-based iteration', 'Counter loop', 'Infinite'], ans: 'Condition-based iteration', diff: 'easy' },
    { q: 'What is do-while difference?', opts: ['Like while', 'Executes at least once', 'Like for', 'Never runs'], ans: 'Executes at least once', diff: 'medium' },
    { q: 'What does break do?', opts: ['Continue', 'Exit loop', 'Skip iteration', 'Pause'], ans: 'Exit loop', diff: 'easy' },
    { q: 'What does continue do?', opts: ['Exit loop', 'Skip iteration', 'Restart loop', 'Pause'], ans: 'Skip iteration', diff: 'easy' },
    { q: 'Can you nest loops?', opts: ['No', 'Yes', 'Max 2 levels', 'Only for loops'], ans: 'Yes', diff: 'easy' },
    { q: 'What is infinite loop?', opts: ['Never ends', 'Ends quickly', 'One iteration', 'Error'], ans: 'Never ends', diff: 'easy' },
    { q: 'Can modify array in loop?', opts: ['Always', 'Never', 'Risky/ConcurrentModificationException', 'Only size'], ans: 'Risky/ConcurrentModificationException', diff: 'hard' },
    { q: 'What is for(;;)?', opts: ['Syntax error', 'Infinite loop', 'Empty loop', 'Loops 0 times'], ans: 'Infinite loop', diff: 'medium' },
    { q: 'How exit nested loop?', opts: ['break', 'break outer', 'Label break', 'return'], ans: 'Label break', diff: 'hard' },
    { q: 'Can break exit nested loop?', opts: ['Yes', 'No (inner only)', 'With label', 'Never'], ans: 'No (inner only)', diff: 'hard' },
    { q: 'What is loop body?', opts: ['Loop header', 'Statements inside', 'Condition', 'Counter'], ans: 'Statements inside', diff: 'easy' },
    { q: 'Can loop variable be modified?', opts: ['No', 'Yes', 'Dangerous', 'Causes error'], ans: 'Yes', diff: 'medium' },
    { q: 'What is iterator in Java?', opts: ['Loop', 'Interface to traverse', 'For loop', 'Array'], ans: 'Interface to traverse', diff: 'hard' },
    { q: 'What is forEach loop?', opts: ['Traditional for', 'for-each over collection', 'while loop', 'Java 4'], ans: 'for-each over collection', diff: 'medium' },
    { q: 'Can you modify during forEach?', opts: ['Yes', 'No (throws exception)', 'Only add', 'Only remove'], ans: 'No (throws exception)', diff: 'hard' },
    { q: 'How many times runs for(int i=0;i<3;i++)?', opts: ['2', '3', '4', 'Infinite'], ans: '3', diff: 'easy' },
    { q: 'What is loop condition?', opts: ['Loop body', 'Check before loop', 'Variable declaration', 'Iteration'], ans: 'Check before loop', diff: 'easy' },
  ];

  javaLoopTopics.forEach(t => {
    javaQuestions.push({
      language: 'java',
      questionNumber: questionNum++,
      questionType: 'mcq',
      topic: 'Loops',
      difficulty: t.diff || 'medium',
      question: t.q,
      options: t.opts,
      correctAnswer: t.ans,
      explanation: `Java loops - ${t.q}`
    });
  });

  // OPERATIONS (40)
  const javaOperationTopics = [
    { q: 'What is 10 + 5?', opts: ['15', '10', '5', 'Error'], ans: '15', diff: 'easy' },
    { q: 'What is 10 - 5?', opts: ['15', '5', '0', 'Error'], ans: '5', diff: 'easy' },
    { q: 'What is 10 * 5?', opts: ['15', '50', '2', 'Error'], ans: '50', diff: 'easy' },
    { q: 'What is 10 / 5?', opts: ['2', '2.0', '5', 'Error'], ans: '2', diff: 'easy' },
    { q: 'What is 10 % 3?', opts: ['3', '1', '10', 'Error'], ans: '1', diff: 'easy' },
    { q: 'What is operator precedence order?', opts: ['* then +', '+ then *', 'Left to right', 'Unpredictable'], ans: '* then +', diff: 'medium' },
    { q: 'What is += operator?', opts: ['Add and assign', 'Add only', 'Assign only', 'Comparison'], ans: 'Add and assign', diff: 'medium' },
    { q: 'What is ++ operator?', opts: ['Add 2', 'Increment by 1', 'Double value', 'Power'], ans: 'Increment by 1', diff: 'easy' },
    { q: 'What is -- operator?', opts: ['Subtract 2', 'Decrement by 1', 'Half value', 'Power'], ans: 'Decrement by 1', diff: 'easy' },
    { q: 'What is == operator?', opts: ['Assignment', 'Comparison', 'Equality check', 'Same as ='], ans: 'Equality check', diff: 'easy' },
    { q: 'What is != operator?', opts: ['Not assign', 'Not equal', 'Subtract', 'Factorial'], ans: 'Not equal', diff: 'easy' },
    { q: 'What is && operator?', opts: ['Bitwise AND', 'Logical AND', 'Address', 'Both'], ans: 'Logical AND', diff: 'easy' },
    { q: 'What is || operator?', opts: ['Bitwise OR', 'Logical OR', 'Pipe', 'Comment'], ans: 'Logical OR', diff: 'easy' },
    { q: 'What is ! operator?', opts: ['Factorial', 'NOT operator', 'Pointer', 'Dereference'], ans: 'NOT operator', diff: 'easy' },
    { q: 'What is ? : operator?', opts: ['Comparison', 'Ternary operator', 'For loop', 'Macro'], ans: 'Ternary operator', diff: 'medium' },
    { q: 'What is & operator?', opts: ['AND', 'Bitwise AND', 'Address of', 'All'], ans: 'Bitwise AND', diff: 'hard' },
    { q: 'What is | operator?', opts: ['OR', 'Bitwise OR', 'Pipe', 'Both'], ans: 'Both', diff: 'hard' },
    { q: 'What is ^ operator?', opts: ['XOR', 'Power', 'Pointer', 'Bitwise XOR'], ans: 'Bitwise XOR', diff: 'medium' },
    { q: 'What is ~ operator?', opts: ['Bitwise NOT', 'Complement', 'Tilde', 'All'], ans: 'All', diff: 'hard' },
    { q: 'What is > vs >=?', opts: ['Same', '> excludes, >= includes', 'Opposite', 'No difference'], ans: '> excludes, >= includes', diff: 'easy' },
  ];

  javaOperationTopics.forEach(t => {
    javaQuestions.push({
      language: 'java',
      questionNumber: questionNum++,
      questionType: 'mcq',
      topic: 'Operations',
      difficulty: t.diff || 'medium',
      question: t.q,
      options: t.opts,
      correctAnswer: t.ans,
      explanation: `Java operations - ${t.q}`
    });
  });

  // FUNCTIONS/METHODS (40)
  const javaFunctionTopics = [
    { q: 'How do you define method?', opts: ['method name()', 'return_type name()', 'function name()', 'void name()'], ans: 'return_type name()', diff: 'easy' },
    { q: 'What is return type?', opts: ['No type', 'Type method returns', 'Array', 'String'], ans: 'Type method returns', diff: 'easy' },
    { q: 'What does void mean?', opts: ['Nothing', 'No return value', 'Null', 'Empty'], ans: 'No return value', diff: 'easy' },
    { q: 'What are parameters?', opts: ['Return values', 'Method inputs', 'Variables', 'Constants'], ans: 'Method inputs', diff: 'easy' },
    { q: 'Can method have no parameters?', opts: ['No', 'Yes', 'Only main', 'Only constructors'], ans: 'Yes', diff: 'easy' },
    { q: 'Can method have multiple parameters?', opts: ['No', 'Yes', 'Max 2', 'Max 5'], ans: 'Yes', diff: 'easy' },
    { q: 'What is method overloading?', opts: ['Too much', 'Same name different params', 'Inheritance', 'Abstraction'], ans: 'Same name different params', diff: 'hard' },
    { q: 'Can overload by return type?', opts: ['Yes', 'No', 'Only primitives', 'Only objects'], ans: 'No', diff: 'hard' },
    { q: 'What is recursive method?', opts: ['Repeating', 'Calling itself', 'Complex', 'Nested'], ans: 'Calling itself', diff: 'hard' },
    { q: 'What is main method?', opts: ['Important', 'Entry point', 'Required', 'All'], ans: 'All', diff: 'easy' },
    { q: 'What is static method?', opts: ['Instance method', 'Class method', 'Local method', 'Final method'], ans: 'Class method', diff: 'medium' },
    { q: 'What is public method?', opts: ['Private', 'Accessible everywhere', 'Same package', 'Same class'], ans: 'Accessible everywhere', diff: 'easy' },
    { q: 'What is private method?', opts: ['All can access', 'Only same class', 'Same package', 'Subclass'], ans: 'Only same class', diff: 'medium' },
    { q: 'What is method signature?', opts: ['Method body', 'Name and parameters', 'Return type', 'Documentation'], ans: 'Name and parameters', diff: 'medium' },
    { q: 'Can method return multiple values?', opts: ['Yes', 'No', 'With array', 'With object'], ans: 'With array', diff: 'medium' },
    { q: 'What is pass by value?', opts: ['Reference', 'Copy of value', 'Pointer', 'Address'], ans: 'Copy of value', diff: 'medium' },
    { q: 'Are objects pass by value?', opts: ['Yes (copy)', 'No (reference copy)', 'Pointer', 'Always'], ans: 'No (reference copy)', diff: 'hard' },
    { q: 'What is varargs?', opts: ['Multiple params', 'Variable arguments', 'Array params', 'All'], ans: 'All', diff: 'hard' },
    { q: 'What is default parameter?', opts: ['Optional', 'Not in Java', 'Constructor', 'Required'], ans: 'Not in Java', diff: 'hard' },
    { q: 'What is toString method?', opts: ['Return string', 'Object string representation', 'Print method', 'All'], ans: 'All', diff: 'medium' },
  ];

  javaFunctionTopics.forEach(t => {
    javaQuestions.push({
      language: 'java',
      questionNumber: questionNum++,
      questionType: 'mcq',
      topic: 'Functions',
      difficulty: t.diff || 'medium',
      question: t.q,
      options: t.opts,
      correctAnswer: t.ans,
      explanation: `Java methods/functions - ${t.q}`
    });
  });

  // ARRAYS (40)
  const javaArrayTopics = [
    { q: 'How declare array in Java?', opts: ['int arr[5]', 'int[] arr', 'Both valid', 'array[5]'], ans: 'int[] arr', diff: 'easy' },
    { q: 'How initialize array?', opts: ['int[] arr = new int[5]', 'int[] arr = {1,2,3}', 'Both', 'int arr[5] = ...'], ans: 'Both', diff: 'medium' },
    { q: 'What is array index?', opts: ['Array size', 'Element position', 'Element value', 'Array name'], ans: 'Element position', diff: 'easy' },
    { q: 'Does indexing start at 0?', opts: ['No', 'Yes', 'Sometimes', 'Depends'], ans: 'Yes', diff: 'easy' },
    { q: 'What out of bounds error?', opts: ['Large value', 'Index >= length', 'Negative index', 'ArrayIndexOutOfBoundsException'], ans: 'ArrayIndexOutOfBoundsException', diff: 'medium' },
    { q: 'How get array length?', opts: ['arr.size()', 'arr.length', 'len(arr)', 'arr.count()'], ans: 'arr.length', diff: 'easy' },
    { q: 'Can array store mixed types?', opts: ['Yes', 'No', 'With Object', 'With casting'], ans: 'No', diff: 'medium' },
    { q: 'What is 2D array?', opts: ['Array of arrays', 'Array of pointers', 'Matrix', 'Table'], ans: 'Array of arrays', diff: 'medium' },
    { q: 'How declare 2D array?', opts: ['int[][] arr', 'int[] arr[]', 'Both', 'int arr[][]'], ans: 'int[][] arr', diff: 'medium' },
    { q: 'Can change array size?', opts: ['Yes', 'No', 'With resize', 'With copy'], ans: 'No', diff: 'easy' },
    { q: 'What is dynamic array?', opts: ['ArrayList', 'Fixed size array', 'New array', 'Array reference'], ans: 'ArrayList', diff: 'medium' },
    { q: 'What is ArrayList?', opts: ['Array', 'Resizable array', 'List interface', 'Collection'], ans: 'Resizable array', diff: 'medium' },
    { q: 'Can array be null?', opts: ['No', 'Yes', 'Only elements', 'Only reference'], ans: 'Yes', diff: 'easy' },
    { q: 'What is array clone?', opts: ['Copy reference', 'Deep copy', 'Shallow copy', 'New array'], ans: 'Shallow copy', diff: 'hard' },
    { q: 'Can pass array to method?', opts: ['No', 'Yes (reference)', 'Yes (copy)', 'Both'], ans: 'Yes (reference)', diff: 'medium' },
    { q: 'Can return array from method?', opts: ['No', 'Yes', 'Only size', 'Only primitive'], ans: 'Yes', diff: 'medium' },
    { q: 'What is array type?', opts: ['Reference', 'Primitive', 'Class', 'Interface'], ans: 'Reference', diff: 'medium' },
    { q: 'Can compare arrays with ==?', opts: ['Yes', 'No (compares reference)', 'Returns true', 'Syntax error'], ans: 'No (compares reference)', diff: 'hard' },
    { q: 'How compare array contents?', opts: ['==', 'Arrays.equals()', 'Manual loop', 'Both B&C'], ans: 'Both B&C', diff: 'hard' },
    { q: 'What is jagged array?', opts: ['Irregular 2D', 'Different row lengths', 'Not rectangular', 'All'], ans: 'All', diff: 'hard' },
  ];

  javaArrayTopics.forEach(t => {
    javaQuestions.push({
      language: 'java',
      questionNumber: questionNum++,
      questionType: 'mcq',
      topic: 'Arrays',
      difficulty: t.diff || 'medium',
      question: t.q,
      options: t.opts,
      correctAnswer: t.ans,
      explanation: `Java arrays - ${t.q}`
    });
  });

  // OBJECTS/OOP (30)
  const javaObjectTopics = [
    { q: 'What is object in Java?', opts: ['Class', 'Instance of class', 'Variable', 'Type'], ans: 'Instance of class', diff: 'easy' },
    { q: 'How create object?', opts: ['new', 'create', 'make', 'Class()'], ans: 'new', diff: 'easy' },
    { q: 'What is constructor?', opts: ['Special method', 'Initializes object', 'Both', 'Destructor'], ans: 'Both', diff: 'medium' },
    { q: 'Constructor must match class name?', opts: ['Any name', 'Class name', 'main', 'init'], ans: 'Class name', diff: 'easy' },
    { q: 'Can have multiple constructors?', opts: ['No', 'Yes (overload)', 'Max 2', 'Only 1'], ans: 'Yes (overload)', diff: 'medium' },
    { q: 'What is default constructor?', opts: ['No parameters', 'Auto-generated', 'Takes arguments', 'Both'], ans: 'Both', diff: 'medium' },
    { q: 'What is inheritance?', opts: ['Getting', 'Class extending class', 'Copying', 'Extending'], ans: 'Class extending class', diff: 'hard' },
    { q: 'What keyword for inheritance?', opts: ['extends', 'implements', 'inherits', 'parent'], ans: 'extends', diff: 'medium' },
    { q: 'What is method override?', opts: ['Skip method', 'Redefine in child', 'Call parent', 'Both'], ans: 'Redefine in child', diff: 'hard' },
    { q: 'What is super keyword?', opts: ['Good', 'Access parent class', 'Power', 'Main class'], ans: 'Access parent class', diff: 'hard' },
    { q: 'What is this keyword?', opts: ['Current', 'This object reference', 'Reference', 'All'], ans: 'This object reference', diff: 'medium' },
    { q: 'What is polymorphism?', opts: ['Many forms', 'Method override', 'Inheritance', 'All'], ans: 'All', diff: 'hard' },
    { q: 'What is encapsulation?', opts: ['Bundle data', 'Data hiding', 'Control access', 'All'], ans: 'All', diff: 'hard' },
    { q: 'What is abstraction?', opts: ['Hide details', 'Show interface', 'Complex', 'All'], ans: 'All', diff: 'hard' },
    { q: 'What is abstract class?', opts: ['Cannot instantiate', 'Has abstract methods', 'Blueprint', 'All'], ans: 'All', diff: 'hard' },
    { q: 'What is interface?', opts: ['GUI', 'Contract/Blueprint', 'Implementation', 'Class'], ans: 'Contract/Blueprint', diff: 'hard' },
    { q: 'Can class extend multiple?', opts: ['Yes', 'No (only 1)', 'With interface', 'In Java 8'], ans: 'No (only 1)', diff: 'medium' },
    { q: 'Can implement multiple interfaces?', opts: ['No', 'Yes', 'Only 2', 'Not allowed'], ans: 'Yes', diff: 'medium' },
    { q: 'What is final class?', opts: ['Cannot extend', 'Constant', 'Last class', 'End marker'], ans: 'Cannot extend', diff: 'medium' },
    { q: 'What is static method call?', opts: ['On object', 'On class', 'Both', 'Only private'], ans: 'On class', diff: 'medium' },
  ];

  javaObjectTopics.forEach(t => {
    javaQuestions.push({
      language: 'java',
      questionNumber: questionNum++,
      questionType: 'mcq',
      topic: 'Objects',
      difficulty: t.diff || 'medium',
      question: t.q,
      options: t.opts,
      correctAnswer: t.ans,
      explanation: `Java OOP - ${t.q}`
    });
  });

  // Convert some MCQs to code-output for variety (about 30%)
  const numToConvert = Math.floor(javaQuestions.length / 3);
  let converted = 0;
  for (let i = 0; i < javaQuestions.length && converted < numToConvert; i++) {
    if (i % 7 === 0) {
      const q = javaQuestions[i];
      const topic = q.topic;
      let code, options, correct;

      if (topic === 'Variables') {
        const val = (i % 5) + 1;
        code = `int x = ${val};\nSystem.out.println(x + 1);`;
        correct = `${val + 1}`;
        options = [correct, `${val}`, 'Error', 'undefined'];
      } else if (topic === 'DataTypes_String') {
        code = `String s = "hello";\nSystem.out.println(s);`;
        correct = 'hello';
        options = ['hello', 'null', 'Error', 'undefined'];
      } else if (topic === 'Loops') {
        code = `for(int i=0; i<2; i++) System.out.print(i);`;
        correct = '01';
        options = ['01', '0 1', '2', 'Error'];
      } else if (topic === 'Operations') {
        code = `System.out.println(5 + 3);`;
        correct = '8';
        options = ['8', '53', '15', 'Error'];
      } else if (topic === 'Functions') {
        code = `System.out.println(Math.max(3, 5));`;
        correct = '5';
        options = ['5', '3', '8', 'Error'];
      } else if (topic === 'Arrays') {
        code = `int[] a = {10, 20, 30};\nSystem.out.println(a[1]);`;
        correct = '20';
        options = ['20', '10', '30', 'Error'];
      } else {
        code = `System.out.println("ok");`;
        correct = 'ok';
        options = ['ok', 'error', 'null', 'Error'];
      }

      q.questionType = 'code_output';
      q.code = code;
      q.question = 'What is the output of the following Java code?';
      q.options = options;
      q.correctAnswer = correct;
      q.explanation = `Code output example for Java ${topic}`;
      converted++;
    }
  }

  return javaQuestions;
};

// Generate C QUESTIONS (270 questions) - Unique C-specific questions
const generateCQuestions = () => {
  const cQuestions = [];
  let questionNum = 1;

  // VARIABLES (40 unique C questions)
  const cVariableTopics = [
    { q: 'Which data type is used to declare integer in C?', opts: ['int', 'integer', 'num', 'var'], ans: 'int', diff: 'easy' },
    { q: 'What is the size of int in C?', opts: ['1 byte', '2 bytes', '4 bytes', 'Depends on compiler'], ans: 'Depends on compiler', diff: 'medium' },
    { q: 'How do you declare pointer in C?', opts: ['*ptr', 'ptr*', '&ptr', 'pointer ptr'], ans: '*ptr', diff: 'medium' },
    { q: 'What does & operator do?', opts: ['Address of', 'Reference', 'Pointer', 'All'], ans: 'Address of', diff: 'easy' },
    { q: 'What does * operator do with pointers?', opts: ['Dereference', 'Multiply', 'Declare', 'Both'], ans: 'Dereference', diff: 'medium' },
    { q: 'Can you declare variables without initialization?', opts: ['No', 'Yes', 'Only global', 'Only local'], ans: 'Yes', diff: 'easy' },
    { q: 'What is global variable scope?', opts: ['Function', 'File', 'Entire program', 'Block'], ans: 'Entire program', diff: 'medium' },
    { q: 'What is local variable?', opts: ['Outside function', 'Inside function/block', 'Static', 'External'], ans: 'Inside function/block', diff: 'easy' },
    { q: 'What keyword makes variable constant?', opts: ['const', 'final', 'fixed', 'static'], ans: 'const', diff: 'medium' },
    { q: 'Can you modify const variable?', opts: ['Yes', 'No', 'Only once', 'With cast'], ans: 'No', diff: 'medium' },
    { q: 'What is static variable?', opts: ['Fixed size', 'Persists between calls', 'Global', 'Local'], ans: 'Persists between calls', diff: 'hard' },
    { q: 'What is extern variable?', opts: ['Internal', 'External/Global', 'Local', 'Static'], ans: 'External/Global', diff: 'hard' },
    { q: 'How many bytes does float use?', opts: ['2', '4', '8', 'Variable'], ans: '4', diff: 'easy' },
    { q: 'How many bytes does double use?', opts: ['4', '8', '16', 'Variable'], ans: '8', diff: 'easy' },
    { q: 'What is char data type?', opts: ['String', 'Single character', 'Number', 'Boolean'], ans: 'Single character', diff: 'easy' },
    { q: 'What is range of char?', opts: ['-128 to 127', '0 to 255', '0 to 127', '-256 to 255'], ans: '-128 to 127', diff: 'medium' },
    { q: 'What is unsigned int?', opts: ['Negative allowed', 'Only positive', 'Float', 'Pointer'], ans: 'Only positive', diff: 'medium' },
    { q: 'What is variable shadowing?', opts: ['Local hiding global', 'Global hiding local', 'Compilation error', 'Same scope'], ans: 'Local hiding global', diff: 'hard' },
    { q: 'Can you assign int to float?', opts: ['No', 'Yes', 'Implicit cast', 'Explicit only'], ans: 'Yes', diff: 'easy' },
    { q: 'What is implicit conversion?', opts: ['Manual cast', 'Automatic type change', 'Error', 'Not allowed'], ans: 'Automatic type change', diff: 'medium' },
    { q: 'What is auto keyword in C?', opts: ['Automatic variable', 'Storage class', 'Local variable', 'All'], ans: 'All', diff: 'hard' },
    { q: 'What is register keyword?', opts: ['Memory', 'CPU register', 'Storage class', 'All'], ans: 'All', diff: 'hard' },
    { q: 'Can variable name be reserved word?', opts: ['Yes', 'No', 'Some', 'With escape'], ans: 'No', diff: 'easy' },
    { q: 'What is volatile keyword?', opts: ['Variable can change', 'Value unstable', 'Compiler directive', 'All'], ans: 'All', diff: 'hard' },
    { q: 'Can you initialize global variables?', opts: ['No', 'Yes (to 0)', 'Yes', 'Only zero'], ans: 'Yes', diff: 'medium' },
    { q: 'What is lifetime of variable?', opts: ['Name duration', 'Memory duration', 'When exists', 'All'], ans: 'All', diff: 'hard' },
    { q: 'What is storage class?', opts: ['Memory', 'Variable class', 'Scope&lifetime', 'Type'], ans: 'Scope&lifetime', diff: 'hard' },
    { q: 'Can pointer be void*?', opts: ['No', 'Yes (generic)', 'Only arrays', 'Only functions'], ans: 'Yes (generic)', diff: 'hard' },
    { q: 'What is NULL pointer?', opts: ['Zero', 'Invalid pointer', 'Null address', 'All'], ans: 'All', diff: 'medium' },
    { q: 'What is array decay?', opts: ['Array to pointer', 'Loses data', 'Function', 'Compilation'], ans: 'Array to pointer', diff: 'hard' },
    { q: 'Can get address of register variable?', opts: ['Yes', 'No', 'Maybe', 'Compiler choice'], ans: 'No', diff: 'hard' },
    { q: 'What is forward declaration?', opts: ['Declare later', 'Early declaration', 'Function prototype', 'Variable promise'], ans: 'Early declaration', diff: 'hard' },
    { q: 'What is variable name mangling?', opts: ['Changing name', 'Not in C', 'C++ feature', 'Compiler optimization'], ans: 'Not in C', diff: 'hard' },
    { q: 'Can variable be modified after const?', opts: ['Yes', 'No', 'With cast', 'Compiler error'], ans: 'With cast', diff: 'hard' },
    { q: 'What is bit field?', opts: ['Array of bits', 'Partial integer', 'Optimize struct', 'All'], ans: 'All', diff: 'hard' },
    { q: 'Can struct member be function?', opts: ['No', 'Yes (pointer)', 'Only in C++', 'Not possible'], ans: 'Yes (pointer)', diff: 'hard' },
    { q: 'What is union in C?', opts: ['Like struct', 'Share memory', 'One value at time', 'All'], ans: 'All', diff: 'hard' },
    { q: 'What is enum in C?', opts: ['List of values', 'Integer constants', 'Named constants', 'All'], ans: 'All', diff: 'hard' },
    { q: 'Can typedef multiple times?', opts: ['No', 'Yes', 'Error', 'Redefine'], ans: 'No', diff: 'hard' },
    { q: 'What is #define vs const?', opts: ['Same', 'Different', '#define preprocessor', 'const variable'], ans: '#define preprocessor', diff: 'hard' },
  ];

  cVariableTopics.forEach(t => {
    cQuestions.push({
      language: 'c',
      questionNumber: questionNum++,
      questionType: 'mcq',
      topic: 'Variables',
      difficulty: t.diff || 'medium',
      question: t.q,
      options: t.opts,
      correctAnswer: t.ans,
      explanation: `C variable basics - ${t.q}`
    });
  });

  // DATA TYPES & STRINGS (40 unique C questions)
  const cDataTypeTopics = [
    { q: 'What is a string in C?', opts: ['Single char', 'Array of chars', 'String type', 'Pointer'], ans: 'Array of chars', diff: 'easy' },
    { q: 'How do you declare string in C?', opts: ['char* s', 'char s[]', 'string s', 'All'], ans: 'char* s', diff: 'medium' },
    { q: 'What is null terminator?', opts: ['end marker', '\\0', 'String end', 'All'], ans: 'All', diff: 'medium' },
    { q: 'What is strlen() function?', opts: ['Size', 'Length without null', 'Array size', 'Allocation'], ans: 'Length without null', diff: 'easy' },
    { q: 'What is struct in C?', opts: ['String', 'Collection of variables', 'Array', 'Pointer'], ans: 'Collection of variables', diff: 'medium' },
    { q: 'How do you declare struct?', opts: ['struct Name {}', 'structure Name {}', 'class Name {}', 'type Name {}'], ans: 'struct Name {}', diff: 'easy' },
    { q: 'How do you access struct member?', opts: ['var.member', 'var->member', 'var[member]', 'member(var)'], ans: 'var.member', diff: 'easy' },
    { q: 'What is typedef in C?', opts: ['Define type', 'Type alias', 'New datatype', 'All'], ans: 'All', diff: 'hard' },
    { q: 'What is enum in C?', opts: ['Enumeration type', 'List of constants', 'Integer type', 'All'], ans: 'All', diff: 'medium' },
    { q: 'How many bytes is size_t?', opts: ['1', '4', 'Platform dependent', '8'], ans: 'Platform dependent', diff: 'hard' },
    { q: 'What is void pointer?', opts: ['No value', 'Generic pointer', 'Null pointer', 'Empty pointer'], ans: 'Generic pointer', diff: 'medium' },
    { q: 'What is NULL?', opts: ['Zero', 'Null pointer', 'Invalid pointer', 'All'], ans: 'Null pointer', diff: 'easy' },
    { q: 'What is casting in C?', opts: ['Throwing', 'Type conversion', 'String conversion', 'Array conversion'], ans: 'Type conversion', diff: 'medium' },
    { q: 'What is array in C?', opts: ['Linked list', 'Collection of same type', 'Dynamic array', 'Pointer'], ans: 'Collection of same type', diff: 'easy' },
    { q: 'Is array mutable in C?', opts: ['No', 'Yes', 'Partially', 'With pointer'], ans: 'Yes', diff: 'easy' },
    { q: 'What is array index limit?', opts: ['No limit', 'Size - 1', 'Platform limit', 'Size + 1'], ans: 'Size - 1', diff: 'medium' },
    { q: 'What happens with out of bounds access?', opts: ['Error', 'Undefined behavior', 'Segfault', 'Random data'], ans: 'Undefined behavior', diff: 'hard' },
    { q: 'Can you return array from function?', opts: ['No', 'Yes', 'Only pointers', 'Only main'], ans: 'Only pointers', diff: 'hard' },
    { q: 'What is sizeof operator?', opts: ['Size of value', 'Size of type', 'Memory', 'All'], ans: 'All', diff: 'medium' },
    { q: 'What is #define?', opts: ['Define variable', 'Macro preprocessor', 'Comment', 'Include'], ans: 'Macro preprocessor', diff: 'hard' },
  ];

  cDataTypeTopics.forEach(t => {
    cQuestions.push({
      language: 'c',
      questionNumber: questionNum++,
      questionType: 'mcq',
      topic: 'DataTypes_String',
      difficulty: t.diff || 'medium',
      question: t.q,
      options: t.opts,
      correctAnswer: t.ans,
      explanation: `C data types - ${t.q}`
    });
  });

  // LOOPS (40 unique C questions)
  const cLoopTopics = [
    { q: 'What loop types exist in C?', opts: ['for', 'while', 'do-while', 'All'], ans: 'All', diff: 'easy' },
    { q: 'What is for loop syntax?', opts: ['for(;;)', 'for(init; cond; incr)', 'Both', 'while'], ans: 'for(init; cond; incr)', diff: 'easy' },
    { q: 'What is while loop?', opts: ['Fixed iterations', 'Condition-based', 'Counter', 'Infinite'], ans: 'Condition-based', diff: 'easy' },
    { q: 'What is do-while loop?', opts: ['Like while', 'Executes at least once', 'Like for', 'Never runs'], ans: 'Executes at least once', diff: 'medium' },
    { q: 'What does break do?', opts: ['Continue', 'Exit loop', 'Skip', 'Pause'], ans: 'Exit loop', diff: 'easy' },
    { q: 'What does continue do?', opts: ['Exit', 'Skip iteration', 'Loop again', 'Pause'], ans: 'Skip iteration', diff: 'easy' },
    { q: 'Can you nest loops in C?', opts: ['No', 'Yes', 'Max 2', 'Only for'], ans: 'Yes', diff: 'easy' },
    { q: 'What is infinite loop?', opts: ['Never ends', 'Ends fast', 'One iteration', 'Error'], ans: 'Never ends', diff: 'easy' },
    { q: 'Can you use break in nested loop?', opts: ['No', 'Yes (breaks inner)', 'Yes (breaks outer)', 'Both'], ans: 'Yes (breaks inner)', diff: 'medium' },
    { q: 'What is for(;;)?', opts: ['Syntax error', 'Infinite loop', 'Empty loop', 'Loop 0 times'], ans: 'Infinite loop', diff: 'medium' },
    { q: 'How do you exit loop early?', opts: ['return', 'break', 'exit()', 'All'], ans: 'break', diff: 'easy' },
    { q: 'Can loop variable be modified inside?', opts: ['No', 'Yes', 'Dangerous', 'Causes error'], ans: 'Yes', diff: 'medium' },
    { q: 'What is loop counter?', opts: ['Loop size', 'Iteration variable', 'Count variable', 'Both'], ans: 'Iteration variable', diff: 'easy' },
    { q: 'Do arrays use 0-based indexing?', opts: ['No', 'Yes', 'Optional', 'Compiler choice'], ans: 'Yes', diff: 'easy' },
    { q: 'Can you access array beyond size?', opts: ['No', 'Yes (dangerous)', 'Error', 'Returns null'], ans: 'Yes (dangerous)', diff: 'medium' },
    { q: 'What is off-by-one error?', opts: ['Math error', 'Loop boundary mistake', 'Type error', 'Pointer error'], ans: 'Loop boundary mistake', diff: 'hard' },
    { q: 'How do you avoid infinite loop?', opts: ['Use while', 'Update condition', 'Use break', 'Both'], ans: 'Update condition', diff: 'medium' },
    { q: 'Can you have multiple break statements?', opts: ['No', 'Yes', 'Only in switch', 'Syntax error'], ans: 'Yes', diff: 'medium' },
    { q: 'What is labeled break?', opts: ['Named break', 'String break', 'goto', 'Not in C'], ans: 'Not in C', diff: 'hard' },
    { q: 'How do you skip to next iteration?', opts: ['break', 'next', 'continue', 'skip'], ans: 'continue', diff: 'easy' },
  ];

  cLoopTopics.forEach(t => {
    cQuestions.push({
      language: 'c',
      questionNumber: questionNum++,
      questionType: 'mcq',
      topic: 'Loops',
      difficulty: t.diff || 'medium',
      question: t.q,
      options: t.opts,
      correctAnswer: t.ans,
      explanation: `C loops - ${t.q}`
    });
  });

  // OPERATIONS (40)
  const cOperationTopics = [
    { q: 'What is +?', opts: ['Pointer', 'Addition', 'Increment', 'String concat'], ans: 'Addition', diff: 'easy' },
    { q: 'What is -?', opts: ['Negative', 'Subtraction', 'Decrement', 'Pointer'], ans: 'Subtraction', diff: 'easy' },
    { q: 'What is *?', opts: ['Pointer', 'Multiplication', 'Dereference', 'All'], ans: 'All', diff: 'easy' },
    { q: 'What is /?', opts: ['Comment', 'Division', 'Regex', 'Include'], ans: 'Division', diff: 'easy' },
    { q: 'What is %?', opts: ['Modulo', 'Percentage', 'Pointer', 'Format'], ans: 'Modulo', diff: 'easy' },
    { q: 'What operator has highest precedence?', opts: ['*+', '*()*', 'Function call', 'Arithmetic'], ans: 'Function call', diff: 'medium' },
    { q: 'What is &&?', opts: ['Bitwise AND', 'Logical AND', 'Address', 'Both'], ans: 'Logical AND', diff: 'easy' },
    { q: 'What is ||?', opts: ['Bitwise OR', 'Logical OR', 'Pipe', 'Comment'], ans: 'Logical OR', diff: 'easy' },
    { q: 'What is !?', opts: ['Factorial', 'NOT operator', 'Pointer', 'Dereference'], ans: 'NOT operator', diff: 'easy' },
    { q: 'What is ==?', opts: ['Assignment', 'Equality', 'Comparison', 'Both'], ans: 'Equality', diff: 'easy' },
    { q: 'What is !=?', opts: ['Not assign', 'Not equal', 'Subtract', 'Factorial'], ans: 'Not equal', diff: 'easy' },
    { q: 'What is <?', opts: ['Less than', 'Bitwise', 'Include', 'Stream'], ans: 'Less than', diff: 'easy' },
    { q: 'What is >?', opts: ['Greater than', 'Pointer', 'Bitwise', 'Stream'], ans: 'Greater than', diff: 'easy' },
    { q: 'What is ?:', opts: ['Comment', 'Ternary operator', 'Include', 'Macro'], ans: 'Ternary operator', diff: 'medium' },
    { q: 'What is &?', opts: ['AND', 'Address-of', 'Bitwise AND', 'All'], ans: 'All', diff: 'medium' },
    { q: 'What is |?', opts: ['OR', 'Bitwise OR', 'Pipe', 'Both'], ans: 'Both', diff: 'medium' },
    { q: 'What is ^?', opts: ['XOR', 'Power', 'Pointer', 'Comment'], ans: 'XOR', diff: 'medium' },
    { q: 'What is ~?', opts: ['Bitwise NOT', 'Complement', 'Tilde', 'All'], ans: 'All', diff: 'medium' },
    { q: 'What is <<?' , opts: ['Less than', 'Left shift', 'Include', 'Stream'], ans: 'Left shift', diff: 'medium' },
    { q: 'What is >>?', opts: ['Greater than', 'Right shift', 'Stream', 'Pointer'], ans: 'Right shift', diff: 'medium' },
  ];

  cOperationTopics.forEach(t => {
    cQuestions.push({
      language: 'c',
      questionNumber: questionNum++,
      questionType: 'mcq',
      topic: 'Operations',
      difficulty: t.diff || 'medium',
      question: t.q,
      options: t.opts,
      correctAnswer: t.ans,
      explanation: `C operations - ${t.q}`
    });
  });

  // FUNCTIONS (40)
  const cFunctionTopics = [
    { q: 'How do you declare function?', opts: ['func(){}', 'return_type name()', 'function name', 'def name()'], ans: 'return_type name()', diff: 'easy' },
    { q: 'What is return type?', opts: ['No type', 'Function result type', 'Parameter', 'Variable'], ans: 'Function result type', diff: 'easy' },
    { q: 'What does void return type mean?', opts: ['Nothing', 'No value returned', 'Null', 'All'], ans: 'All', diff: 'easy' },
    { q: 'What are parameters?', opts: ['Return values', 'Function inputs', 'Variables', 'Constants'], ans: 'Function inputs', diff: 'easy' },
    { q: 'Can function have no return?', opts: ['No', 'Yes (void)', 'Only main', 'Error'], ans: 'Yes (void)', diff: 'easy' },
    { q: 'Can function have multiple return?', opts: ['No', 'Only one', 'Yes', 'Max 2'], ans: 'Yes', diff: 'medium' },
    { q: 'What is recursion?', opts: ['Loop', 'Function calling itself', 'Pointer', 'Array'], ans: 'Function calling itself', diff: 'medium' },
    { q: 'What is base case in recursion?', opts: ['First call', 'Termination condition', 'Initial value', 'Loop start'], ans: 'Termination condition', diff: 'hard' },
    { q: 'What is function declaration?', opts: ['Function body', 'Function prototype', 'Function call', 'Function end'], ans: 'Function prototype', diff: 'medium' },
    { q: 'What is function definition?', opts: ['Declaration', 'Implementation', 'Call', 'Return'], ans: 'Implementation', diff: 'medium' },
    { q: 'What is main() function?', opts: ['Entry point', 'Most important', 'Required', 'All'], ans: 'All', diff: 'easy' },
    { q: 'What does main() return?', opts: ['Nothing', 'Int (status)', 'Void', 'Error'], ans: 'Int (status)', diff: 'easy' },
    { q: 'What is function prototype?', opts: ['Function body', 'Function declaration', 'Function call', 'Implementation'], ans: 'Function declaration', diff: 'medium' },
    { q: 'Can you pass array to function?', opts: ['No', 'Yes (as pointer)', 'Only size', 'Copy array'], ans: 'Yes (as pointer)', diff: 'medium' },
    { q: 'What is pass by value?', opts: ['Reference', 'Copy of value', 'Pointer', 'Address'], ans: 'Copy of value', diff: 'medium' },
    { q: 'What is pass by reference?', opts: ['Copy', 'Address/pointer', 'Value', 'Variable name'], ans: 'Address/pointer', diff: 'hard' },
    { q: 'Can function return pointer?', opts: ['No', 'Yes', 'Only arrays', 'Dangerous'], ans: 'Yes', diff: 'hard' },
    { q: 'What is static function?', opts: ['Global', 'File scope', 'Local scope', 'Not in C'], ans: 'File scope', diff: 'hard' },
    { q: 'Can function be nested?', opts: ['Yes', 'No', 'With macro', 'In C++'], ans: 'No', diff: 'medium' },
    { q: 'What is variable argument?', opts: ['Multiple params', 'va_args', 'Different types', 'All'], ans: 'Multiple params', diff: 'hard' },
  ];

  cFunctionTopics.forEach(t => {
    cQuestions.push({
      language: 'c',
      questionNumber: questionNum++,
      questionType: 'mcq',
      topic: 'Functions',
      difficulty: t.diff || 'medium',
      question: t.q,
      options: t.opts,
      correctAnswer: t.ans,
      explanation: `C functions - ${t.q}`
    });
  });

  // ARRAYS (40)
  const cArrayTopics = [
    { q: 'How do you declare array?', opts: ['int arr[5]', 'arr[5]', 'array[5]', 'new arr[5]'], ans: 'int arr[5]', diff: 'easy' },
    { q: 'How do you initialize array?', opts: ['int a[3] = {1,2,3}', 'int a[] = {1,2,3}', 'Both', 'int a[3]{1,2,3}'], ans: 'Both', diff: 'medium' },
    { q: 'What is array index?', opts: ['Array size', 'Element position', 'Element value', 'Array name'], ans: 'Element position', diff: 'easy' },
    { q: 'Does indexing start at 0?', opts: ['No', 'Yes', 'Sometimes', 'Depends'], ans: 'Yes', diff: 'easy' },
    { q: 'What is out of bounds?', opts: ['Large value', 'Index >= size', 'Negative', 'Undefined'], ans: 'Index >= size', diff: 'easy' },
    { q: 'What happens out of bounds?', opts: ['Error', 'Undefined behavior', 'Returns 0', 'Null'], ans: 'Undefined behavior', diff: 'medium' },
    { q: 'Can array store mixed types?', opts: ['Yes', 'No', 'With union', 'With cast'], ans: 'No', diff: 'medium' },
    { q: 'What is 2D array?', opts: ['Array of arrays', 'Array of pointers', 'Matrix', 'Both'], ans: 'Matrix', diff: 'medium' },
    { q: 'How declare 2D array?', opts: ['int[][] arr', 'int arr[3][3]', 'int *arr[]', 'Both'], ans: 'int arr[3][3]', diff: 'medium' },
    { q: 'Can you change array size?', opts: ['Yes', 'No', 'With realloc', 'Only pointers'], ans: 'No', diff: 'easy' },
    { q: 'What is array name?', opts: ['Variable', 'Pointer to first element', 'Address', 'Both'], ans: 'Pointer to first element', diff: 'hard' },
    { q: 'Can you reassign array?', opts: ['Yes', 'No', 'With pointer', 'In function'], ans: 'No', diff: 'medium' },
    { q: 'How do you pass array to function?', opts: ['Copy array', 'Decay to pointer', 'Reference', 'Value'], ans: 'Decay to pointer', diff: 'hard' },
    { q: 'What is element size?', opts: ['Byte', 'sizeof(type)', 'Array size', 'Count'], ans: 'sizeof(type)', diff: 'medium' },
    { q: 'What is array bound checking?', opts: ['Automatic', 'Manual', 'Compiler', 'Not in C'], ans: 'Not in C', diff: 'medium' },
    { q: 'Can you use negative index?', opts: ['No', 'Yes (undefined)', 'Error', 'Special'], ans: 'Yes (undefined)', diff: 'hard' },
    { q: 'What is memcpy?', opts: ['Memory copy', 'Copy array', 'Copy memory', 'All'], ans: 'All', diff: 'medium' },
    { q: 'What is array iteration?', opts: ['Access each element', 'Loop through', 'Both', 'For loop'], ans: 'Both', diff: 'easy' },
    { q: 'Can string be array?', opts: ['No', 'Yes (char array)', 'Only pointer', 'With struct'], ans: 'Yes (char array)', diff: 'medium' },
    { q: 'What is array capacity?', opts: ['Used space', 'Total size', 'Elements', 'Bytes'], ans: 'Total size', diff: 'easy' },
  ];

  cArrayTopics.forEach(t => {
    cQuestions.push({
      language: 'c',
      questionNumber: questionNum++,
      questionType: 'mcq',
      topic: 'Arrays',
      difficulty: t.diff || 'medium',
      question: t.q,
      options: t.opts,
      correctAnswer: t.ans,
      explanation: `C arrays - ${t.q}`
    });
  });

  // OBJECTS/Structures (30)
  const cObjectTopics = [
    { q: 'What is struct in C?', opts: ['Class', 'Collection of members', 'Pointer', 'Array'], ans: 'Collection of members', diff: 'easy' },
    { q: 'How define struct?', opts: ['struct Name {}', 'struct name()', 'typedef struct', 'Both A&C'], ans: 'struct Name {}', diff: 'easy' },
    { q: 'How access struct member?', opts: ['var->member', 'var.member', 'Both', 'member(var)'], ans: 'var.member', diff: 'easy' },
    { q: 'How access via pointer?', opts: ['var.member', 'var->member', '*var.member', 'ptr(member)'], ans: 'var->member', diff: 'medium' },
    { q: 'What is sizeof struct?', opts: ['One member', 'All members sum', 'With padding', 'Compiler choice'], ans: 'With padding', diff: 'medium' },
    { q: 'What is struct padding?', opts: ['Wasted space', 'Alignment', 'Performance', 'All'], ans: 'All', diff: 'hard' },
    { q: 'What is union in C?', opts: ['Like struct', 'Share memory', 'Same size', 'All'], ans: 'All', diff: 'hard' },
    { q: 'What is enum?', opts: ['List of values', 'Constants', 'Integer', 'All'], ans: 'All', diff: 'medium' },
    { q: 'Can struct contain struct?', opts: ['No', 'Yes', 'Only pointer', 'With typedef'], ans: 'Yes', diff: 'medium' },
    { q: 'Can struct have function?', opts: ['Yes', 'No', 'As pointer', 'C++'], ans: 'As pointer', diff: 'medium' },
    { q: 'What is typedef?', opts: ['Define type', 'Create alias', 'New type', 'All'], ans: 'All', diff: 'hard' },
    { q: 'What is bit field?', opts: ['Array of bits', 'Partial member', 'Optimize', 'All'], ans: 'All', diff: 'hard' },
    { q: 'Can initialize struct?', opts: ['No', 'Yes (designated)', 'At creation', 'All'], ans: 'All', diff: 'medium' },
    { q: 'What is anonymous struct?', opts: ['No name', 'Unnamed', 'Embedded', 'All'], ans: 'All', diff: 'hard' },
    { q: 'Can compare struct?', opts: ['No', 'With ==', 'Manual compare', 'Via member'], ans: 'Manual compare', diff: 'medium' },
    { q: 'What is struct copy?', opts: ['Pointer', 'Member by member', 'Shallow', 'All'], ans: 'Member by member', diff: 'medium' },
    { q: 'Can pass struct to function?', opts: ['No', 'Yes (copy)', 'Pointer only', 'Reference'], ans: 'Yes (copy)', diff: 'medium' },
    { q: 'Can return struct?', opts: ['No', 'Yes', 'Pointer only', 'With typedef'], ans: 'Yes', diff: 'medium' },
    { q: 'What is self referential struct?', opts: ['Contains self', 'Has pointer to self', 'Recursive', 'Both'], ans: 'Has pointer to self', diff: 'hard' },
    { q: 'What use of struct?', opts: ['Data grouping', 'Organization', 'Type creation', 'All'], ans: 'All', diff: 'easy' },
  ];

  cObjectTopics.forEach(t => {
    cQuestions.push({
      language: 'c',
      questionNumber: questionNum++,
      questionType: 'mcq',
      topic: 'Objects',
      difficulty: t.diff || 'medium',
      question: t.q,
      options: t.opts,
      correctAnswer: t.ans,
      explanation: `C structures - ${t.q}`
    });
  });

  // Convert some MCQs to code-output for variety (about 30%)
  const numToConvert = Math.floor(cQuestions.length / 3);
  let converted = 0;
  for (let i = 0; i < cQuestions.length && converted < numToConvert; i++) {
    if (i % 7 === 0) {
      const q = cQuestions[i];
      const topic = q.topic;
      let code, options, correct;

      if (topic === 'Variables') {
        const val = (i % 5) + 1;
        code = `int x = ${val};\nprintf("%d", x + 1);`;
        correct = `${val + 1}`;
        options = [correct, `${val}`, 'Error', 'undefined'];
      } else if (topic === 'DataTypes_String') {
        code = `printf("%s", "test");`;
        correct = 'test';
        options = ['test', 'test', 'Error', 'NULL'];
      } else if (topic === 'Loops') {
        code = `for(int i=0; i<2; i++) printf("%d", i);`;
        correct = '01';
        options = ['01', '0 1', '2', 'Error'];
      } else if (topic === 'Operations') {
        code = `printf("%d", 5 + 3);`;
        correct = '8';
        options = ['8', '53', '15', 'Error'];
      } else if (topic === 'Functions') {
        code = `int add(int a, int b) { return a + b; }\nprintf("%d", add(2, 3));`;
        correct = '5';
        options = ['5', '23', '2', 'Error'];
      } else if (topic === 'Arrays') {
        code = `int a[] = {10, 20, 30};\nprintf("%d", a[1]);`;
        correct = '20';
        options = ['20', '10', '30', 'Error'];
      } else {
        code = `printf("ok");`;
        correct = 'ok';
        options = ['ok', 'error', 'NULL', ''];
      }

      q.questionType = 'code_output';
      q.code = code;
      q.question = 'What is the output of the following C code?';
      q.options = options;
      q.correctAnswer = correct;
      q.explanation = `Code output example for C ${topic}`;
      converted++;
    }
  }

  return cQuestions;
};

// Combine all questions
const allPythonQuestions = pythonQuestions;
const allJavaQuestions = generateJavaQuestions();
const allCQuestions = generateCQuestions();
const totalQuestions = [...allPythonQuestions, ...allJavaQuestions, ...allCQuestions];

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing questions
    await Assessment.deleteMany({});
    console.log('✓ Cleared existing questions');
    
    console.log(`Attempting to insert ${totalQuestions.length} questions...`);
    console.log(`  - Python: ${allPythonQuestions.length}`);
    console.log(`  - Java: ${allJavaQuestions.length}`);
    console.log(`  - C: ${allCQuestions.length}`);
    
    // Check for any invalid questions
    console.log('\nChecking for invalid questions...');
    let validCount = 0, invalidCount = 0;
    const invalidQuestions = [];
    
    for (let i = 0; i < totalQuestions.length; i++) {
      const q = totalQuestions[i];
      if (!q.language || !q.questionType || !q.topic || !q.question) {
        invalidCount++;
        invalidQuestions.push({ index: i, q });
      } else {
        validCount++;
      }
    }
    
    console.log(`Valid: ${validCount}, Invalid: ${invalidCount}`);
    if (invalidCount > 0) {
      console.error('Invalid questions found:', invalidQuestions.slice(0, 3));
    }
    
    // Insert in smaller batches to avoid timeout
    const batchSize = 50;
    for (let i = 0; i < totalQuestions.length; i += batchSize) {
      const batch = totalQuestions.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      console.log(`Inserting batch ${batchNum} (${batch.length} questions)...`);
      try {
        await Assessment.insertMany(batch, { ordered: false });
        console.log(`✓ Batch ${batchNum} complete`);
      } catch (batchError) {
        console.error(`Error in batch ${batchNum}:`, batchError.message);
        if (batchError.writeErrors) {
          console.error('Write errors:', batchError.writeErrors.slice(0, 3));
        }
        throw batchError;
      }
    }
    
    console.log(`✓ Successfully seeded ${totalQuestions.length} questions`);
    console.log(`  - Python: ${allPythonQuestions.length} questions`);
    console.log(`  - Java: ${allJavaQuestions.length} questions`);
    console.log(`  - C: ${allCQuestions.length} questions`);
    console.log('✓ Database seeding complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

// Run the seed
seedDatabase();
