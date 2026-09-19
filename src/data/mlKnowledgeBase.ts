export interface KnowledgeChunk {
  id: string;
  topic: string;
  title: string;
  content: string;
  keywords: string[];
}

export const mlKnowledgeBase: KnowledgeChunk[] = [
  {
    id: 'ml-001',
    topic: 'Introduction to Machine Learning',
    title: 'What is Machine Learning?',
    keywords: ['machine learning', 'ml', 'definition', 'learning'],
    content: `
Machine Learning is a branch of Artificial Intelligence that allows computers
to learn patterns from data and make predictions or decisions without being
explicitly programmed for every individual task.

A machine learning system generally receives data, learns a pattern or model
from that data, and then uses the learned model to make predictions on new data.

Example:
A spam email classifier can learn from previous emails labeled as spam or
not spam and then predict whether a new email is spam.

Important idea:
Traditional programming commonly follows:
Data + Rules -> Output

Machine Learning commonly follows:
Data + Expected Outputs -> Learned Model
Then:
New Data + Learned Model -> Prediction
`
  },

  {
    id: 'ml-002',
    topic: 'Types of Machine Learning',
    title: 'Supervised, Unsupervised and Reinforcement Learning',
    keywords: [
      'supervised learning',
      'unsupervised learning',
      'reinforcement learning',
      'types of machine learning'
    ],
    content: `
The major types of Machine Learning include supervised learning,
unsupervised learning and reinforcement learning.

Supervised Learning:
The model learns from labeled data. Each training example has input features
and a known target or label.

Examples:
- Predicting house prices
- Classifying emails as spam or not spam
- Predicting whether a transaction is fraudulent

Common supervised tasks:
- Regression
- Classification

Unsupervised Learning:
The model receives data without predefined labels and attempts to discover
patterns or structures.

Examples:
- Customer clustering
- Grouping similar documents
- Finding hidden patterns in data

Reinforcement Learning:
An agent interacts with an environment and learns by receiving rewards or
penalties for its actions.

Examples:
- Game-playing agents
- Robot navigation
- Decision-making systems
`
  },

  {
    id: 'ml-003',
    topic: 'Features and Labels',
    title: 'Features vs Labels',
    keywords: ['features', 'labels', 'target', 'input', 'output'],
    content: `
Features are the input variables used by a machine learning model to make
predictions.

A label, also called a target in many supervised learning problems, is the
expected output that the model tries to predict.

Example:
Suppose we want to predict whether a student will pass.

Features could include:
- Attendance
- Study hours
- Previous marks

Label:
- Pass or Fail

In a house-price prediction problem:
Features might include area, number of bedrooms and location.
The label is the house price.

The distinction is important because the model learns a relationship between
features and the target.
`
  },

  {
    id: 'ml-004',
    topic: 'Training and Testing Data',
    title: 'Train-Test Split',
    keywords: [
      'training data',
      'testing data',
      'train test split',
      'test set',
      'generalization'
    ],
    content: `
Training data is the portion of the dataset used to learn the model's
parameters or patterns.

Testing data is held aside and used to evaluate how well the trained model
performs on previously unseen data.

A common workflow is:
1. Collect data.
2. Clean and prepare the data.
3. Split the data into training and testing sets.
4. Train the model using the training set.
5. Evaluate it using the test set.

The purpose of a test set is to estimate how well the model may perform on
new unseen examples.

A model that performs extremely well on training data but poorly on testing
data may be overfitting.
`
  },

  {
    id: 'ml-005',
    topic: 'Regression',
    title: 'What is Regression?',
    keywords: ['regression', 'continuous prediction', 'prediction'],
    content: `
Regression is a supervised learning task used to predict a continuous
numerical value.

Examples:
- Predicting house prices
- Predicting temperature
- Predicting sales
- Predicting electricity consumption

The output is generally a numerical value rather than a category.

For example, a regression model might predict:
House price = 7,250,000

This differs from classification, where the model predicts a category such
as spam/not spam or pass/fail.
`
  },

  {
    id: 'ml-006',
    topic: 'Classification',
    title: 'What is Classification?',
    keywords: [
      'classification',
      'binary classification',
      'multiclass classification',
      'class'
    ],
    content: `
Classification is a supervised learning task in which a model predicts a
category or class.

Binary classification has two possible classes.

Examples:
- Spam or not spam
- Fraud or not fraud
- Pass or fail

Multi-class classification has more than two possible classes.

Example:
An image classifier might classify an image as:
cat, dog, horse or bird.

The model learns patterns from labeled training examples and uses those
patterns to classify new examples.
`
  },

  {
    id: 'ml-007',
    topic: 'Linear Regression',
    title: 'Linear Regression',
    keywords: [
      'linear regression',
      'line',
      'cost function',
      'gradient descent'
    ],
    content: `
Linear Regression models the relationship between input variables and a
continuous numerical output using a linear relationship.

For a simple one-feature problem, the model can be represented as:

y = mx + b

where:
- x is the input feature
- y is the predicted value
- m is the slope
- b is the intercept

The model attempts to find parameters that minimize prediction error.

A cost function measures how different predictions are from actual values.
One commonly used loss for linear regression is Mean Squared Error.

Gradient Descent is an optimization technique that can be used to update
model parameters in a direction that reduces the cost function.
`
  },

  {
    id: 'ml-008',
    topic: 'Logistic Regression',
    title: 'Logistic Regression',
    keywords: [
      'logistic regression',
      'sigmoid',
      'probability',
      'classification'
    ],
    content: `
Logistic Regression is commonly used for classification problems, especially
binary classification.

Instead of directly producing an unrestricted numerical output, logistic
regression uses the logistic or sigmoid function to map a value into a range
between 0 and 1.

The resulting value can be interpreted as a probability under the model.

For example:
Probability of fraud = 0.92

A decision threshold can then be used to convert the probability into a class.

Logistic Regression is therefore different from Linear Regression even though
both have "regression" in their names.
`
  },

  {
    id: 'ml-009',
    topic: 'Decision Trees',
    title: 'Decision Trees',
    keywords: [
      'decision tree',
      'tree',
      'splitting',
      'nodes',
      'pruning'
    ],
    content: `
A Decision Tree makes predictions by repeatedly splitting data according to
features.

A tree contains:
- Root node
- Internal decision nodes
- Branches
- Leaf nodes

Each decision asks a question about the data.

Example:
Is income greater than 50,000?
Yes -> continue down one branch.
No -> continue down another branch.

The process continues until reaching a leaf that represents a prediction.

Decision trees can be used for both classification and regression.

Trees can become too complex and overfit the training data. Pruning or other
complexity-control techniques can help reduce this problem.
`
  },

  {
    id: 'ml-010',
    topic: 'Evaluation Metrics',
    title: 'Accuracy, Precision, Recall and F1 Score',
    keywords: [
      'accuracy',
      'precision',
      'recall',
      'f1',
      'evaluation metrics'
    ],
    content: `
Evaluation metrics help measure how well a machine learning model performs.

Accuracy is the proportion of predictions that are correct among all
predictions.

Precision answers:
Of the examples predicted as positive, how many were actually positive?

Recall answers:
Of all actual positive examples, how many did the model correctly identify?

F1 Score combines precision and recall into a single metric using their
harmonic mean.

Accuracy can be misleading for highly imbalanced datasets. For example, if
99% of transactions are legitimate and only 1% are fraudulent, a model that
always predicts "legitimate" can have very high accuracy while detecting no
fraud.
`
  },

  {
    id: 'ml-011',
    topic: 'Confusion Matrix',
    title: 'Understanding a Confusion Matrix',
    keywords: [
      'confusion matrix',
      'true positive',
      'true negative',
      'false positive',
      'false negative'
    ],
    content: `
A confusion matrix summarizes classification predictions.

The four common outcomes are:

True Positive (TP):
The model predicts positive and the actual class is positive.

True Negative (TN):
The model predicts negative and the actual class is negative.

False Positive (FP):
The model predicts positive but the actual class is negative.

False Negative (FN):
The model predicts negative but the actual class is positive.

For fraud detection:
TP = fraudulent transaction correctly detected.
TN = legitimate transaction correctly identified.
FP = legitimate transaction incorrectly flagged as fraud.
FN = fraudulent transaction missed by the model.

Precision and recall can be calculated using these quantities.
`
  },

  {
    id: 'ml-012',
    topic: 'Overfitting',
    title: 'Understanding Overfitting',
    keywords: [
      'overfitting',
      'training performance',
      'testing performance',
      'generalization'
    ],
    content: `
Overfitting occurs when a model learns the training data too closely,
including patterns that do not generalize well to unseen data.

A typical sign is:
High training performance + significantly lower validation or test
performance.

An overfitted model may have learned noise or overly specific patterns in the
training dataset.

Possible ways to reduce overfitting include:
- Using more representative training data
- Reducing model complexity
- Regularization
- Cross-validation
- Early stopping for suitable algorithms
- Pruning decision trees

The goal is not simply to maximize training accuracy. The goal is to build a
model that generalizes well to unseen data.
`
  },

  {
    id: 'ml-013',
    topic: 'Underfitting',
    title: 'Understanding Underfitting',
    keywords: ['underfitting', 'model complexity', 'bias', 'poor performance'],
    content: `
Underfitting occurs when a model is too simple to capture important patterns
in the data.

A typical sign is poor performance on both training and testing data.

Possible approaches to reduce underfitting include:
- Using a more expressive model
- Adding useful features
- Reducing excessive regularization
- Training for an appropriate amount of time
- Improving the representation of the data

The model should have enough capacity to capture meaningful relationships
without simply memorizing the training data.
`
  },

  {
    id: 'ml-014',
    topic: 'Regularization',
    title: 'L1 and L2 Regularization',
    keywords: [
      'regularization',
      'l1',
      'l2',
      'model complexity',
      'overfitting'
    ],
    content: `
Regularization is a technique used to discourage unnecessarily complex
models and help reduce overfitting.

L1 regularization adds a penalty related to the absolute values of model
parameters.

L2 regularization adds a penalty related to the squared values of model
parameters.

Regularization encourages the model to avoid excessively large parameter
values and can improve generalization.

The strength of regularization is controlled by a parameter in many machine
learning algorithms. Too much regularization can contribute to underfitting.
`
  },

  {
    id: 'ml-015',
    topic: 'Cross Validation',
    title: 'K-Fold Cross Validation',
    keywords: [
      'cross validation',
      'k fold',
      'validation',
      'stratified'
    ],
    content: `
Cross-validation is a model evaluation technique that repeatedly divides the
available data into training and validation portions.

In K-Fold Cross Validation:
1. The dataset is divided into K folds.
2. One fold is used for validation.
3. The remaining folds are used for training.
4. The process is repeated so each fold is used for validation.
5. The validation results can be averaged to obtain an overall estimate.

Cross-validation can provide a more reliable estimate of model performance
than relying on a single train-validation split.

For classification problems with imbalanced classes, Stratified K-Fold can
help preserve the approximate class distribution in each fold.
`
  }
];
