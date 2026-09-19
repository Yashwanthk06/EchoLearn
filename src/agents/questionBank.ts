import type { Difficulty } from './adaptiveEngine';

export interface AdaptiveQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
  difficulty: Difficulty;
}

export const questionBank: AdaptiveQuestion[] = [
  {
    id: 'sl-e1',
    question: 'Which of the following is an example of supervised learning?',
    options: [
      'Grouping customers without labels',
      'Predicting house prices using labeled data',
      'Finding hidden patterns',
      'Reducing dimensions using PCA',
    ],
    correctAnswer: 1,
    explanation: 'Supervised learning learns from labeled examples.',
    topic: 'Supervised Learning',
    difficulty: 'Easy',
  },

  {
    id: 'sl-m1',
    question: 'Which statement best describes supervised learning?',
    options: [
      'It always works without training data',
      'It learns a mapping from inputs to known outputs',
      'It only performs clustering',
      'It cannot be used for prediction',
    ],
    correctAnswer: 1,
    explanation: 'Supervised learning learns relationships between inputs and labeled outputs.',
    topic: 'Supervised Learning',
    difficulty: 'Medium',
  },

  {
    id: 'sl-h1',
    question: 'A model is trained using labeled examples of emails marked spam or not spam. What type of learning is being used?',
    options: [
      'Unsupervised learning',
      'Reinforcement learning',
      'Supervised learning',
      'Dimensionality reduction',
    ],
    correctAnswer: 2,
    explanation: 'The model learns from labeled examples, making this supervised learning.',
    topic: 'Supervised Learning',
    difficulty: 'Hard',
  },

  {
    id: 'ot-e1',
    question: 'What problem occurs when a model performs well on training data but poorly on unseen data?',
    options: [
      'Underfitting',
      'Overfitting',
      'Normalization',
      'Clustering',
    ],
    correctAnswer: 1,
    explanation: 'Overfitting occurs when a model learns the training data too closely.',
    topic: 'Overfitting',
    difficulty: 'Easy',
  },

  {
    id: 'ot-m1',
    question: 'Which technique can help reduce overfitting?',
    options: [
      'Increasing model complexity indefinitely',
      'Removing the test set',
      'Regularization',
      'Training on one example',
    ],
    correctAnswer: 2,
    explanation: 'Regularization discourages overly complex models and can reduce overfitting.',
    topic: 'Overfitting',
    difficulty: 'Medium',
  },

  {
    id: 'ot-h1',
    question: 'A decision tree has extremely high training accuracy but poor validation accuracy. What is the most likely explanation?',
    options: [
      'The model is underfitting',
      'The model is overfitting',
      'The dataset has no features',
      'The model cannot classify data',
    ],
    correctAnswer: 1,
    explanation: 'The large gap between training and validation performance is a common sign of overfitting.',
    topic: 'Overfitting',
    difficulty: 'Hard',
  },

  {
    id: 'tt-e1',
    question: 'Why do we split a dataset into training and testing sets?',
    options: [
      'To make the data disappear',
      'To evaluate performance on unseen data',
      'To remove all features',
      'To increase the number of labels',
    ],
    correctAnswer: 1,
    explanation: 'The test set evaluates how well the trained model generalizes.',
    topic: 'Training and Testing Data',
    difficulty: 'Easy',
  },

  {
    id: 'tt-m1',
    question: 'Which dataset should normally be used to train a machine learning model?',
    options: [
      'Training set',
      'Test set',
      'Only production data',
      'Validation labels only',
    ],
    correctAnswer: 0,
    explanation: 'The training set is used by the model to learn patterns.',
    topic: 'Training and Testing Data',
    difficulty: 'Medium',
  },

  {
    id: 'em-e1',
    question: 'Which metric is commonly used for classification?',
    options: [
      'Accuracy',
      'Mean Squared Error only',
      'R-squared only',
      'Variance',
    ],
    correctAnswer: 0,
    explanation: 'Accuracy measures the proportion of correct classification predictions.',
    topic: 'Evaluation Metrics',
    difficulty: 'Easy',
  },

  {
    id: 'lr-m1',
    question: 'What does logistic regression commonly predict?',
    options: [
      'Class probabilities',
      'Only continuous values',
      'Image pixels',
      'Database rows',
    ],
    correctAnswer: 0,
    explanation: 'Logistic regression is commonly used for classification and estimates class probabilities.',
    topic: 'Logistic Regression',
    difficulty: 'Medium',
  },
];

export function getQuestions(
  topic?: string,
  difficulty?: Difficulty
): AdaptiveQuestion[] {
  return questionBank.filter((question) => {
    const topicMatch = !topic || question.topic === topic;
    const difficultyMatch =
      !difficulty || question.difficulty === difficulty;

    return topicMatch && difficultyMatch;
  });
}
