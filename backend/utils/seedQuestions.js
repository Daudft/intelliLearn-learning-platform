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

// PYTHON QUESTIONS (15 questions)
const pythonQuestions = [
  {
    language: 'python',
    questionNumber: 1,
    questionType: 'mcq',
    topic: 'Variables',
    difficulty: 'easy',
    question: 'Which of the following is the correct way to declare a variable in Python?',
    options: ['int x = 5', 'x = 5', 'var x = 5', 'declare x = 5'],
    correctAnswer: 'x = 5',
    explanation: 'Python uses dynamic typing, no need to specify type'
  },
  {
    language: 'python',
    questionNumber: 2,
    questionType: 'code_output',
    topic: 'Data Types',
    difficulty: 'easy',
    question: 'What is the output of this code?',
    code: 'x = "Hello"\ny = "World"\nprint(x + y)',
    options: ['Hello World', 'HelloWorld', 'Error', 'Hello+World'],
    correctAnswer: 'HelloWorld',
    explanation: 'String concatenation without space'
  },
  {
    language: 'python',
    questionNumber: 3,
    questionType: 'mcq',
    topic: 'Lists',
    difficulty: 'easy',
    question: 'How do you create an empty list in Python?',
    options: ['list = ()', 'list = []', 'list = {}', 'list = empty()'],
    correctAnswer: 'list = []',
    explanation: 'Square brackets create a list'
  },
  {
    language: 'python',
    questionNumber: 4,
    questionType: 'code_output',
    topic: 'Loops',
    difficulty: 'medium',
    question: 'What is the output?',
    code: 'for i in range(3):\n    print(i, end="")',
    options: ['123', '012', '0123', '12'],
    correctAnswer: '012',
    explanation: 'range(3) generates 0, 1, 2'
  },
  {
    language: 'python',
    questionNumber: 5,
    questionType: 'mcq',
    topic: 'Functions',
    difficulty: 'easy',
    question: 'Which keyword is used to define a function in Python?',
    options: ['function', 'def', 'func', 'define'],
    correctAnswer: 'def',
    explanation: 'def is used to define functions in Python'
  },
  {
    language: 'python',
    questionNumber: 6,
    questionType: 'code_output',
    topic: 'Conditionals',
    difficulty: 'medium',
    question: 'What will be printed?',
    code: 'x = 10\nif x > 5:\n    print("A")\nelif x > 15:\n    print("B")\nelse:\n    print("C")',
    options: ['A', 'B', 'C', 'AB'],
    correctAnswer: 'A',
    explanation: 'First condition is true, so A is printed'
  },
  {
    language: 'python',
    questionNumber: 7,
    questionType: 'mcq',
    topic: 'Data Types',
    difficulty: 'easy',
    question: 'Which data type is mutable in Python?',
    options: ['tuple', 'string', 'list', 'integer'],
    correctAnswer: 'list',
    explanation: 'Lists can be modified after creation'
  },
  {
    language: 'python',
    questionNumber: 8,
    questionType: 'code_output',
    topic: 'Strings',
    difficulty: 'medium',
    question: 'What is the output?',
    code: 'text = "Python"\nprint(text[1:4])',
    options: ['Pyt', 'yth', 'ytho', 'Pyth'],
    correctAnswer: 'yth',
    explanation: 'Slicing from index 1 to 3 (4 is exclusive)'
  },
  {
    language: 'python',
    questionNumber: 9,
    questionType: 'mcq',
    topic: 'Operators',
    difficulty: 'easy',
    question: 'What does the // operator do in Python?',
    options: ['Regular division', 'Floor division', 'Modulo', 'Exponentiation'],
    correctAnswer: 'Floor division',
    explanation: '// performs integer division'
  },
  {
    language: 'python',
    questionNumber: 10,
    questionType: 'code_output',
    topic: 'Lists',
    difficulty: 'medium',
    question: 'What will be the output?',
    code: 'nums = [1, 2, 3]\nnums.append(4)\nprint(len(nums))',
    options: ['3', '4', '5', 'Error'],
    correctAnswer: '4',
    explanation: 'append adds one element, making length 4'
  },
  {
    language: 'python',
    questionNumber: 11,
    questionType: 'mcq',
    topic: 'Dictionaries',
    difficulty: 'medium',
    question: 'How do you access the value associated with key "name" in dictionary d?',
    options: ['d.name', 'd["name"]', 'd(name)', 'd->name'],
    correctAnswer: 'd["name"]',
    explanation: 'Square bracket notation for dictionary access'
  },
  {
    language: 'python',
    questionNumber: 12,
    questionType: 'code_output',
    topic: 'Functions',
    difficulty: 'hard',
    question: 'What is printed?',
    code: 'def func(x, y=5):\n    return x + y\nprint(func(3))',
    options: ['8', '3', '5', 'Error'],
    correctAnswer: '8',
    explanation: 'y defaults to 5, so 3 + 5 = 8'
  },
  {
    language: 'python',
    questionNumber: 13,
    questionType: 'mcq',
    topic: 'Loops',
    difficulty: 'medium',
    question: 'Which statement is used to exit a loop prematurely?',
    options: ['exit', 'break', 'stop', 'return'],
    correctAnswer: 'break',
    explanation: 'break exits the current loop'
  },
  {
    language: 'python',
    questionNumber: 14,
    questionType: 'code_output',
    topic: 'Boolean',
    difficulty: 'medium',
    question: 'What is the output?',
    code: 'print(bool(0))',
    options: ['True', 'False', '0', 'Error'],
    correctAnswer: 'False',
    explanation: '0 is considered False in Python'
  },
  {
    language: 'python',
    questionNumber: 15,
    questionType: 'mcq',
    topic: 'OOP',
    difficulty: 'hard',
    question: 'Which method is automatically called when an object is created?',
    options: ['__init__', '__new__', '__create__', '__start__'],
    correctAnswer: '__init__',
    explanation: '__init__ is the constructor method'
  }
];

// JAVA QUESTIONS (15 questions)
const javaQuestions = [
  {
    language: 'java',
    questionNumber: 1,
    questionType: 'mcq',
    topic: 'Variables',
    difficulty: 'easy',
    question: 'Which keyword is used to declare a constant in Java?',
    options: ['const', 'final', 'constant', 'static'],
    correctAnswer: 'final',
    explanation: 'final keyword makes a variable constant'
  },
  {
    language: 'java',
    questionNumber: 2,
    questionType: 'code_output',
    topic: 'Data Types',
    difficulty: 'easy',
    question: 'What is the output?',
    code: 'int x = 5;\nint y = 2;\nSystem.out.println(x / y);',
    options: ['2.5', '2', '3', 'Error'],
    correctAnswer: '2',
    explanation: 'Integer division truncates the decimal'
  },
  {
    language: 'java',
    questionNumber: 3,
    questionType: 'mcq',
    topic: 'Arrays',
    difficulty: 'easy',
    question: 'How do you declare an integer array of size 5 in Java?',
    options: ['int arr[5]', 'int[] arr = new int[5]', 'array int[5]', 'int arr = new array[5]'],
    correctAnswer: 'int[] arr = new int[5]',
    explanation: 'Standard array declaration syntax'
  },
  {
    language: 'java',
    questionNumber: 4,
    questionType: 'code_output',
    topic: 'Strings',
    difficulty: 'medium',
    question: 'What is printed?',
    code: 'String s = "Hello";\nSystem.out.println(s.length());',
    options: ['4', '5', '6', 'Error'],
    correctAnswer: '5',
    explanation: 'Hello has 5 characters'
  },
  {
    language: 'java',
    questionNumber: 5,
    questionType: 'mcq',
    topic: 'OOP',
    difficulty: 'easy',
    question: 'What is the correct way to create an object in Java?',
    options: ['ClassName obj = new ClassName()', 'new ClassName obj', 'ClassName obj', 'create ClassName obj'],
    correctAnswer: 'ClassName obj = new ClassName()',
    explanation: 'Standard object instantiation syntax'
  },
  {
    language: 'java',
    questionNumber: 6,
    questionType: 'code_output',
    topic: 'Loops',
    difficulty: 'medium',
    question: 'What is the output?',
    code: 'for(int i = 0; i < 3; i++) {\n    System.out.print(i);\n}',
    options: ['123', '012', '0123', '12'],
    correctAnswer: '012',
    explanation: 'Loop runs from 0 to 2'
  },
  {
    language: 'java',
    questionNumber: 7,
    questionType: 'mcq',
    topic: 'Access Modifiers',
    difficulty: 'medium',
    question: 'Which access modifier makes a member accessible only within its own class?',
    options: ['public', 'private', 'protected', 'default'],
    correctAnswer: 'private',
    explanation: 'private restricts access to the class'
  },
  {
    language: 'java',
    questionNumber: 8,
    questionType: 'code_output',
    topic: 'Conditionals',
    difficulty: 'medium',
    question: 'What will be printed?',
    code: 'int x = 10;\nif(x > 5 && x < 15) {\n    System.out.println("Yes");\n} else {\n    System.out.println("No");\n}',
    options: ['Yes', 'No', 'Both', 'Error'],
    correctAnswer: 'Yes',
    explanation: '10 is greater than 5 and less than 15'
  },
  {
    language: 'java',
    questionNumber: 9,
    questionType: 'mcq',
    topic: 'Inheritance',
    difficulty: 'medium',
    question: 'Which keyword is used to inherit a class in Java?',
    options: ['inherits', 'extends', 'implements', 'derives'],
    correctAnswer: 'extends',
    explanation: 'extends is used for class inheritance'
  },
  {
    language: 'java',
    questionNumber: 10,
    questionType: 'code_output',
    topic: 'Arrays',
    difficulty: 'medium',
    question: 'What is the output?',
    code: 'int[] arr = {1, 2, 3};\nSystem.out.println(arr.length);',
    options: ['2', '3', '4', 'Error'],
    correctAnswer: '3',
    explanation: 'Array has 3 elements'
  },
  {
    language: 'java',
    questionNumber: 11,
    questionType: 'mcq',
    topic: 'Exceptions',
    difficulty: 'hard',
    question: 'Which block is used to handle exceptions in Java?',
    options: ['catch', 'handle', 'exception', 'error'],
    correctAnswer: 'catch',
    explanation: 'catch block handles exceptions'
  },
  {
    language: 'java',
    questionNumber: 12,
    questionType: 'code_output',
    topic: 'Strings',
    difficulty: 'hard',
    question: 'What is printed?',
    code: 'String s1 = "Java";\nString s2 = "Java";\nSystem.out.println(s1 == s2);',
    options: ['true', 'false', '1', 'Error'],
    correctAnswer: 'true',
    explanation: 'String literals are stored in string pool'
  },
  {
    language: 'java',
    questionNumber: 13,
    questionType: 'mcq',
    topic: 'Static',
    difficulty: 'medium',
    question: 'What does the static keyword mean?',
    options: ['Variable cannot change', 'Belongs to the class, not instance', 'Private access', 'Final value'],
    correctAnswer: 'Belongs to the class, not instance',
    explanation: 'static members belong to the class'
  },
  {
    language: 'java',
    questionNumber: 14,
    questionType: 'code_output',
    topic: 'Operators',
    difficulty: 'medium',
    question: 'What is the output?',
    code: 'int x = 5;\nSystem.out.println(++x);',
    options: ['5', '6', '7', 'Error'],
    correctAnswer: '6',
    explanation: '++x increments before printing'
  },
  {
    language: 'java',
    questionNumber: 15,
    questionType: 'mcq',
    topic: 'Methods',
    difficulty: 'easy',
    question: 'What is the return type of a method that does not return any value?',
    options: ['null', 'void', 'empty', 'none'],
    correctAnswer: 'void',
    explanation: 'void indicates no return value'
  }
];

// C QUESTIONS (15 questions)
const cQuestions = [
  {
    language: 'c',
    questionNumber: 1,
    questionType: 'mcq',
    topic: 'Pointers',
    difficulty: 'medium',
    question: 'What does the & operator do in C?',
    options: ['Dereference', 'Address of', 'AND operation', 'Pointer declaration'],
    correctAnswer: 'Address of',
    explanation: '& returns the address of a variable'
  },
  {
    language: 'c',
    questionNumber: 2,
    questionType: 'code_output',
    topic: 'Variables',
    difficulty: 'easy',
    question: 'What is the output?',
    code: 'int x = 10;\nprintf("%d", x);',
    options: ['10', 'x', '0', 'Error'],
    correctAnswer: '10',
    explanation: '%d formats integer output'
  },
  {
    language: 'c',
    questionNumber: 3,
    questionType: 'mcq',
    topic: 'Arrays',
    difficulty: 'easy',
    question: 'How do you declare an integer array of size 10 in C?',
    options: ['int arr[10]', 'array int[10]', 'int[] arr = 10', 'int arr(10)'],
    correctAnswer: 'int arr[10]',
    explanation: 'Standard array declaration in C'
  },
  {
    language: 'c',
    questionNumber: 4,
    questionType: 'code_output',
    topic: 'Loops',
    difficulty: 'medium',
    question: 'What is printed?',
    code: 'for(int i=1; i<=3; i++) {\n    printf("%d", i);\n}',
    options: ['123', '012', '1234', '012'],
    correctAnswer: '123',
    explanation: 'Loop runs from 1 to 3 inclusive'
  },
  {
    language: 'c',
    questionNumber: 5,
    questionType: 'mcq',
    topic: 'Functions',
    difficulty: 'easy',
    question: 'What is the return type of the main function?',
    options: ['void', 'int', 'char', 'float'],
    correctAnswer: 'int',
    explanation: 'main typically returns int'
  },
  {
    language: 'c',
    questionNumber: 6,
    questionType: 'code_output',
    topic: 'Pointers',
    difficulty: 'hard',
    question: 'What is the output?',
    code: 'int x = 5;\nint *p = &x;\nprintf("%d", *p);',
    options: ['5', 'Address', '0', 'Error'],
    correctAnswer: '5',
    explanation: '*p dereferences the pointer to get value'
  },
  {
    language: 'c',
    questionNumber: 7,
    questionType: 'mcq',
    topic: 'Memory',
    difficulty: 'medium',
    question: 'Which function is used to allocate memory dynamically in C?',
    options: ['alloc()', 'malloc()', 'new()', 'memory()'],
    correctAnswer: 'malloc()',
    explanation: 'malloc allocates memory on heap'
  },
  {
    language: 'c',
    questionNumber: 8,
    questionType: 'code_output',
    topic: 'Operators',
    difficulty: 'easy',
    question: 'What is the output?',
    code: 'int x = 7 % 3;\nprintf("%d", x);',
    options: ['2', '1', '3', '0'],
    correctAnswer: '1',
    explanation: '7 modulo 3 equals 1'
  },
  {
    language: 'c',
    questionNumber: 9,
    questionType: 'mcq',
    topic: 'Strings',
    difficulty: 'medium',
    question: 'How are strings terminated in C?',
    options: ['null character', 'space', 'newline', 'semicolon'],
    correctAnswer: 'null character',
    explanation: 'Strings end with \\0'
  },
  {
    language: 'c',
    questionNumber: 10,
    questionType: 'code_output',
    topic: 'Conditionals',
    difficulty: 'medium',
    question: 'What will be printed?',
    code: 'int x = 10;\nif(x == 10) {\n    printf("A");\n} else {\n    printf("B");\n}',
    options: ['A', 'B', 'AB', 'Error'],
    correctAnswer: 'A',
    explanation: 'Condition is true, prints A'
  },
  {
    language: 'c',
    questionNumber: 11,
    questionType: 'mcq',
    topic: 'Structures',
    difficulty: 'medium',
    question: 'Which keyword is used to define a structure in C?',
    options: ['class', 'struct', 'type', 'record'],
    correctAnswer: 'struct',
    explanation: 'struct defines structures in C'
  },
  {
    language: 'c',
    questionNumber: 12,
    questionType: 'code_output',
    topic: 'Arrays',
    difficulty: 'medium',
    question: 'What is printed?',
    code: 'int arr[] = {1, 2, 3};\nprintf("%d", arr[1]);',
    options: ['1', '2', '3', 'Error'],
    correctAnswer: '2',
    explanation: 'Array indexing starts at 0'
  },
  {
    language: 'c',
    questionNumber: 13,
    questionType: 'mcq',
    topic: 'Preprocessor',
    difficulty: 'easy',
    question: 'What does #include do?',
    options: ['Defines a function', 'Includes a header file', 'Declares a variable', 'Creates a macro'],
    correctAnswer: 'Includes a header file',
    explanation: '#include adds header file contents'
  },
  {
    language: 'c',
    questionNumber: 14,
    questionType: 'code_output',
    topic: 'Functions',
    difficulty: 'hard',
    question: 'What is the output?',
    code: 'int add(int a, int b) {\n    return a + b;\n}\nint main() {\n    printf("%d", add(3, 4));\n    return 0;\n}',
    options: ['7', '34', '3+4', 'Error'],
    correctAnswer: '7',
    explanation: 'Function returns 3 + 4 = 7'
  },
  {
    language: 'c',
    questionNumber: 15,
    questionType: 'mcq',
    topic: 'Data Types',
    difficulty: 'easy',
    question: 'Which data type is used to store a single character in C?',
    options: ['string', 'char', 'character', 'text'],
    correctAnswer: 'char',
    explanation: 'char stores single characters'
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing questions
    await Assessment.deleteMany({});
    console.log('✓ Cleared existing questions');
    
    // Insert all questions
    const allQuestions = [...pythonQuestions, ...javaQuestions, ...cQuestions];
    await Assessment.insertMany(allQuestions);
    
    console.log('✓ Successfully seeded 45 questions (15 Python, 15 Java, 15 C)');
    console.log('✓ Database seeding complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed
seedDatabase();