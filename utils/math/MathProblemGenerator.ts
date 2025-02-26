/**
 * Utility for generating challenging math problems
 * Problems are designed to be calculator-resistant and require thinking
 */

export interface MathProblem {
  question: string;
  answer: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Generates operation-based math problems 
 */
function generateOperationProblem(difficulty: 'easy' | 'medium' | 'hard'): MathProblem {
  // Define ranges based on difficulty
  let numRange, operands, operations;
  
  switch (difficulty) {
    case 'easy':
      numRange = { min: 10, max: 50 };
      operands = 3;
      operations = ['+', '-', '*'];
      break;
    case 'medium':
      numRange = { min: 10, max: 100 };
      operands = 4;
      operations = ['+', '-', '*', '/'];
      break;
    case 'hard':
      numRange = { min: 20, max: 200 };
      operands = 5;
      operations = ['+', '-', '*', '/', '%'];
      break;
  }
  
  // Generate random numbers
  const numbers: number[] = [];
  for (let i = 0; i < operands; i++) {
    let num = Math.floor(Math.random() * (numRange.max - numRange.min + 1)) + numRange.min;
    // For division, make sure it results in whole numbers most of the time
    if (i > 0 && operations.includes('/')) {
      // Occasionally allow decimals
      if (Math.random() > 0.7) {
        numbers.push(num);
      } else {
        // Find a divisor for the previous number
        const divisors = [];
        for (let j = 2; j <= Math.min(20, numbers[i-1]); j++) {
          if (numbers[i-1] % j === 0) {
            divisors.push(j);
          }
        }
        num = divisors.length > 0 
          ? divisors[Math.floor(Math.random() * divisors.length)]
          : num;
        numbers.push(num);
      }
    } else {
      numbers.push(num);
    }
  }

  // Generate the expression
  let expression = String(numbers[0]);
  let computedValue = numbers[0];
  
  for (let i = 1; i < numbers.length; i++) {
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    // For division, ensure we don't divide by zero
    if (operation === '/' && numbers[i] === 0) {
      numbers[i] = Math.floor(Math.random() * 10) + 1;
    }
    
    // Update expression and computed value
    expression += ` ${operation} ${numbers[i]}`;
    
    // Compute new value
    switch (operation) {
      case '+':
        computedValue += numbers[i];
        break;
      case '-':
        computedValue -= numbers[i];
        break;
      case '*':
        computedValue *= numbers[i];
        break;
      case '/':
        computedValue = Math.round((computedValue / numbers[i]) * 100) / 100; // Round to 2 decimal places
        break;
      case '%':
        computedValue %= numbers[i];
        break;
    }
  }
  
  return {
    question: `Calculate: ${expression}`,
    answer: computedValue,
    difficulty
  };
}

/**
 * Generates pattern-based problems
 */
function generatePatternProblem(difficulty: 'easy' | 'medium' | 'hard'): MathProblem {
  // Define complexity based on difficulty
  let sequenceLength, patternComplexity;
  
  switch (difficulty) {
    case 'easy':
      sequenceLength = 5;
      patternComplexity = 1;
      break;
    case 'medium':
      sequenceLength = 6;
      patternComplexity = 2;
      break;
    case 'hard':
      sequenceLength = 7;
      patternComplexity = 3;
      break;
  }
  
  // Choose a pattern type
  const patternTypes = ['arithmetic', 'geometric', 'fibonacci', 'custom'];
  const patternType = patternTypes[Math.floor(Math.random() * patternTypes.length)];
  
  let sequence: number[] = [];
  let nextNumber: number = 0; // Initialize with default value
  
  switch (patternType) {
    case 'arithmetic':
      // Arithmetic sequence: a, a+d, a+2d, a+3d, ...
      const start = Math.floor(Math.random() * 10) + 1;
      const difference = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 0; i < sequenceLength; i++) {
        sequence.push(start + i * difference);
      }
      nextNumber = start + sequenceLength * difference;
      break;
      
    case 'geometric':
      // Geometric sequence: a, a*r, a*r^2, a*r^3, ...
      const firstTerm = Math.floor(Math.random() * 5) + 1;
      const ratio = Math.floor(Math.random() * 3) + 2;
      
      sequence.push(firstTerm);
      for (let i = 1; i < sequenceLength; i++) {
        sequence.push(sequence[i-1] * ratio);
      }
      nextNumber = sequence[sequenceLength-1] * ratio;
      break;
      
    case 'fibonacci':
      // Fibonacci-like sequence: a, b, a+b, a+2b, 2a+3b, ...
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      
      sequence = [a, b];
      for (let i = 2; i < sequenceLength; i++) {
        sequence.push(sequence[i-1] + sequence[i-2]);
      }
      nextNumber = sequence[sequenceLength-1] + sequence[sequenceLength-2];
      break;
      
    case 'custom':
      // Custom sequence with more complex patterns
      const baseNum = Math.floor(Math.random() * 5) + 1;
      
      switch (patternComplexity) {
        case 1:
          // Example: n², n³, n⁴, ...
          for (let i = 0; i < sequenceLength; i++) {
            sequence.push(Math.pow(baseNum + i, 2));
          }
          nextNumber = Math.pow(baseNum + sequenceLength, 2);
          break;
          
        case 2:
          // Example: n²+1, n²+2, n²+3, ...
          for (let i = 0; i < sequenceLength; i++) {
            sequence.push(Math.pow(baseNum + i, 2) + i);
          }
          nextNumber = Math.pow(baseNum + sequenceLength, 2) + sequenceLength;
          break;
          
        case 3:
          // Example: n×(n+1), n×(n+2), n×(n+3), ...
          for (let i = 0; i < sequenceLength; i++) {
            sequence.push((baseNum + i) * (baseNum + i + 1));
          }
          nextNumber = (baseNum + sequenceLength) * (baseNum + sequenceLength + 1);
          break;
      }
      break;
  }
  
  return {
    question: `Find the next number in the sequence: ${sequence.join(', ')}, ?`,
    answer: nextNumber,
    difficulty
  };
}

/**
 * Generates word problems based on real-world scenarios
 */
function generateWordProblem(difficulty: 'easy' | 'medium' | 'hard'): MathProblem {
  const problems: Record<'easy' | 'medium' | 'hard', Array<{question: string, answer: number}>> = {
    'easy': [
      {
        question: "A train travels 120 km in 2 hours. What is its average speed in km/h?",
        answer: 60
      },
      {
        question: "If 3 shirts cost $60, how much would 5 shirts cost?",
        answer: 100
      },
      {
        question: "A recipe requires 2.5 cups of flour for 20 cookies. How many cups are needed for 32 cookies?",
        answer: 4
      }
    ],
    'medium': [
      {
        question: "A car depreciates by 15% each year. If it costs $20,000 new, what will be its value after 2 years? Round to the nearest dollar.",
        answer: 14450
      },
      {
        question: "If 8 workers can build a wall in 10 days, how many days would it take 5 workers to build the same wall?",
        answer: 16
      },
      {
        question: "A phone costs $800 with a 30% discount. What was the original price?",
        answer: 1143
      }
    ],
    'hard': [
      {
        question: "If a ball is thrown upward with an initial velocity of 15 m/s, its height (in meters) after t seconds is h = 15t - 5t². What is the maximum height reached?",
        answer: 11.25
      },
      {
        question: "A water tank is 2/3 full. When 20 liters of water are removed, it becomes 1/2 full. What is the capacity of the tank in liters?",
        answer: 120
      },
      {
        question: "An investment grows at 8% compound interest per year. How many years will it take for the investment to triple? Round to the nearest year. (Hint: Use the formula A = P(1+r)^t and solve for t where A/P = 3)",
        answer: 15
      }
    ]
  };
  
  // Select a random problem based on difficulty
  const selectedProblems = problems[difficulty];
  const randomProblem = selectedProblems[Math.floor(Math.random() * selectedProblems.length)];
  
  return {
    ...randomProblem,
    difficulty
  };
}

/**
 * Main function to generate a random math problem
 */
export function generateMathProblem(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): MathProblem {
  const problemTypes = [
    { type: 'operation', generator: generateOperationProblem, weight: 0.5 },
    { type: 'pattern', generator: generatePatternProblem, weight: 0.3 },
    { type: 'word', generator: generateWordProblem, weight: 0.2 }
  ];
  
  // Choose problem type based on weights
  const random = Math.random();
  let cumulativeWeight = 0;
  let selectedGenerator;
  
  for (const type of problemTypes) {
    cumulativeWeight += type.weight;
    if (random <= cumulativeWeight) {
      selectedGenerator = type.generator;
      break;
    }
  }
  
  // Default to operation if somehow none is selected
  if (!selectedGenerator) {
    selectedGenerator = generateOperationProblem;
  }
  
  return selectedGenerator(difficulty);
} 