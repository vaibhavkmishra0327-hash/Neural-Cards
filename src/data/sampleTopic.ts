import { Topic, Flashcard, FAQ } from '../types';

// Sample topic: Backpropagation - fully written with SEO optimization
export const backpropagationTopic: Topic = {
  id: 'backpropagation',
  slug: 'backpropagation',
  title: 'Backpropagation in Neural Networks',
  description: 'Learn how backpropagation algorithm works, the math behind it, and why it\'s fundamental to training deep learning models',
  category: 'Deep Learning',
  difficulty: 'intermediate',
  metaTitle: 'Backpropagation Explained: How Neural Networks Learn | NeuralCards',
  metaDescription: 'Master backpropagation with clear explanations, formulas, Python code examples, and interactive flashcards. Learn the algorithm that powers deep learning.',
  keywords: [
    'backpropagation',
    'neural network training',
    'gradient descent',
    'chain rule',
    'deep learning optimization',
    'how neural networks learn',
    'backpropagation algorithm',
    'backprop explained'
  ],
  learningPath: 'deep-learning',
  estimatedMinutes: 45,
  prerequisites: ['neural-networks', 'derivatives-gradients', 'chain-rule'],
  relatedTopics: ['gradient-descent', 'optimization-algorithms', 'activation-functions']
};

export const backpropagationFlashcards: Flashcard[] = [
  {
    id: 'bp-001',
    topicId: 'backpropagation',
    front: 'What is backpropagation?',
    back: 'Backpropagation (backward propagation of errors) is an algorithm for computing gradients of the loss function with respect to the weights of a neural network. It uses the chain rule to efficiently calculate how each weight contributes to the total error.',
    difficulty: 'easy',
    type: 'concept',
    tags: ['definition', 'basics'],
    realWorldExample: 'When training a neural network to recognize cats, backpropagation calculates how much each neuron\'s weight needs to change to reduce prediction errors.'
  },
  {
    id: 'bp-002',
    topicId: 'backpropagation',
    front: 'What is the chain rule in backpropagation?',
    back: 'The chain rule allows us to compute the derivative of composite functions. In backpropagation, it lets us calculate how the loss changes with respect to early layer weights by multiplying gradients backward through the network.',
    difficulty: 'medium',
    type: 'concept',
    tags: ['mathematics', 'chain-rule'],
    codeExample: `# Chain rule in action
# If z = f(y) and y = g(x), then:
# dz/dx = (dz/dy) * (dy/dx)

# In neural networks:
# ∂L/∂w1 = (∂L/∂a2) * (∂a2/∂z2) * (∂z2/∂a1) * (∂a1/∂z1) * (∂z1/∂w1)`
  },
  {
    id: 'bp-003',
    topicId: 'backpropagation',
    front: 'What are the main steps in backpropagation?',
    back: '1. Forward pass: Compute predictions and loss\n2. Backward pass: Calculate gradients starting from output layer\n3. Update weights: Use gradients to adjust weights (gradient descent)\n4. Repeat: Iterate until convergence',
    difficulty: 'easy',
    type: 'concept',
    tags: ['algorithm', 'steps']
  },
  {
    id: 'bp-004',
    topicId: 'backpropagation',
    front: 'Write the gradient calculation for a single neuron',
    back: 'For neuron with activation a = σ(z) where z = wx + b:\n\n∂L/∂w = ∂L/∂a × ∂a/∂z × ∂z/∂w\n       = δ × σ\'(z) × x\n\nWhere δ is the error signal from the next layer.',
    difficulty: 'hard',
    type: 'formula',
    tags: ['mathematics', 'gradients'],
    codeExample: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def sigmoid_derivative(z):
    return sigmoid(z) * (1 - sigmoid(z))

# Backward pass for one neuron
z = w * x + b
a = sigmoid(z)
delta_next = 0.5  # error from next layer

# Gradient of loss w.r.t weight
dL_dw = delta_next * sigmoid_derivative(z) * x
dL_db = delta_next * sigmoid_derivative(z)`
  },
  {
    id: 'bp-005',
    topicId: 'backpropagation',
    front: 'Why is backpropagation computationally efficient?',
    back: 'Backpropagation computes all gradients in O(n) time (where n = number of weights) by reusing intermediate calculations. Without it, computing each gradient independently would require O(n²) forward passes.',
    difficulty: 'medium',
    type: 'concept',
    tags: ['efficiency', 'complexity'],
    pitfalls: [
      'Don\'t confuse backpropagation (gradient computation) with gradient descent (weight update)',
      'Backprop doesn\'t update weights - it only calculates gradients'
    ]
  },
  {
    id: 'bp-006',
    topicId: 'backpropagation',
    front: 'What is the vanishing gradient problem?',
    back: 'When gradients become extremely small as they propagate backward through many layers, early layers learn very slowly or stop learning entirely. This happens with sigmoid/tanh activations whose derivatives are small.',
    difficulty: 'medium',
    type: 'concept',
    tags: ['problems', 'deep-learning'],
    realWorldExample: 'In a 100-layer network with sigmoid activations, gradients might shrink to 10⁻⁴⁰, making the first layers essentially untrainable.',
    pitfalls: [
      'ReLU activation helps mitigate this',
      'Skip connections (ResNet) provide gradient highways',
      'Batch normalization also helps gradient flow'
    ]
  },
  {
    id: 'bp-007',
    topicId: 'backpropagation',
    front: 'Implement backpropagation for a 2-layer network',
    back: 'Complete implementation with forward and backward pass',
    difficulty: 'hard',
    type: 'code',
    tags: ['implementation', 'coding'],
    codeExample: `import numpy as np

class TwoLayerNetwork:
    def __init__(self, input_size, hidden_size, output_size):
        # Initialize weights
        self.W1 = np.random.randn(input_size, hidden_size) * 0.01
        self.b1 = np.zeros((1, hidden_size))
        self.W2 = np.random.randn(hidden_size, output_size) * 0.01
        self.b2 = np.zeros((1, output_size))
    
    def forward(self, X):
        # Forward pass
        self.z1 = X.dot(self.W1) + self.b1
        self.a1 = np.tanh(self.z1)
        self.z2 = self.a1.dot(self.W2) + self.b2
        self.a2 = 1 / (1 + np.exp(-self.z2))  # sigmoid
        return self.a2
    
    def backward(self, X, y, learning_rate=0.01):
        m = X.shape[0]
        
        # Backward pass - output layer
        dz2 = self.a2 - y
        dW2 = (1/m) * self.a1.T.dot(dz2)
        db2 = (1/m) * np.sum(dz2, axis=0, keepdims=True)
        
        # Backward pass - hidden layer
        da1 = dz2.dot(self.W2.T)
        dz1 = da1 * (1 - np.power(self.a1, 2))  # tanh derivative
        dW1 = (1/m) * X.T.dot(dz1)
        db1 = (1/m) * np.sum(dz1, axis=0, keepdims=True)
        
        # Update weights
        self.W2 -= learning_rate * dW2
        self.b2 -= learning_rate * db2
        self.W1 -= learning_rate * dW1
        self.b1 -= learning_rate * db1

# Usage
nn = TwoLayerNetwork(input_size=3, hidden_size=4, output_size=1)
X = np.array([[1, 2, 3], [4, 5, 6]])
y = np.array([[0], [1]])

for epoch in range(1000):
    predictions = nn.forward(X)
    nn.backward(X, y, learning_rate=0.1)`
  },
  {
    id: 'bp-008',
    topicId: 'backpropagation',
    front: 'What is the difference between backpropagation and gradient descent?',
    back: 'Backpropagation is the algorithm for COMPUTING gradients using the chain rule. Gradient descent is the OPTIMIZATION algorithm that uses those gradients to UPDATE weights. Backprop calculates ∂L/∂w, gradient descent does w = w - η∂L/∂w',
    difficulty: 'medium',
    type: 'concept',
    tags: ['comparison', 'interview'],
    pitfalls: [
      'They\'re often confused but serve different purposes',
      'You can compute gradients without updating weights',
      'You need backprop to get gradients for gradient descent'
    ]
  },
  {
    id: 'bp-009',
    topicId: 'backpropagation',
    front: 'How does backpropagation handle batch training?',
    back: 'For mini-batch training, backpropagation computes gradients for each sample in the batch, then averages them before the weight update. This provides a balance between computation speed and gradient accuracy.',
    difficulty: 'medium',
    type: 'concept',
    tags: ['batching', 'training'],
    codeExample: `# Batch gradient calculation
batch_size = 32
total_dW = 0
total_db = 0

for sample in batch:
    # Forward pass
    prediction = forward(sample)
    
    # Backward pass for this sample
    dW, db = backward(sample, prediction)
    
    # Accumulate gradients
    total_dW += dW
    total_db += db

# Average gradients over batch
avg_dW = total_dW / batch_size
avg_db = total_db / batch_size

# Update weights once per batch
W -= learning_rate * avg_dW
b -= learning_rate * avg_db`
  },
  {
    id: 'bp-010',
    topicId: 'backpropagation',
    front: 'Why do we need the derivative of the activation function?',
    back: 'The activation function derivative (σ\'(z)) determines how much the neuron\'s output changes with respect to its input. This is crucial for the chain rule - we need to know how the activation affects the final loss to properly propagate errors backward.',
    difficulty: 'medium',
    type: 'concept',
    tags: ['activation', 'derivatives'],
    realWorldExample: 'If using ReLU, the derivative is 1 for positive inputs and 0 for negative. This means gradients pass through unchanged for active neurons but are blocked for inactive ones.'
  }
];

export const backpropagationFAQs: FAQ[] = [
  {
    question: 'What is backpropagation in deep learning?',
    answer: 'Backpropagation is the fundamental algorithm for training neural networks. It efficiently calculates how much each weight in the network contributes to the prediction error by propagating gradients backward from the output layer to the input layer using the chain rule of calculus.'
  },
  {
    question: 'How does backpropagation work step by step?',
    answer: 'Backpropagation works in four steps: (1) Forward pass - compute predictions layer by layer, (2) Calculate loss - compare predictions to actual values, (3) Backward pass - compute gradients by applying chain rule from output to input, (4) Update weights - use gradients with an optimizer like gradient descent to adjust weights.'
  },
  {
    question: 'What is the difference between backpropagation and gradient descent?',
    answer: 'Backpropagation computes the gradients (derivatives of loss with respect to weights), while gradient descent uses those gradients to update the weights. Backpropagation is the "how to calculate" and gradient descent is the "how to update". They work together but serve different purposes.'
  },
  {
    question: 'Why is backpropagation important for neural networks?',
    answer: 'Before backpropagation, training deep neural networks was computationally infeasible. Backpropagation made it possible by providing an efficient O(n) algorithm to compute all gradients in one backward pass, enabling the deep learning revolution.'
  },
  {
    question: 'What are common problems with backpropagation?',
    answer: 'The main problems are: (1) Vanishing gradients - gradients become too small in deep networks, (2) Exploding gradients - gradients become too large and cause instability, (3) Slow convergence in poorly initialized networks, (4) Dead neurons (especially with ReLU). Solutions include proper initialization, batch normalization, gradient clipping, and using ReLU/modern activations.'
  },
  {
    question: 'Can you implement backpropagation in Python?',
    answer: 'Yes, backpropagation can be implemented from scratch using NumPy. The key steps are: compute forward pass activations, calculate output layer error, propagate error backward using chain rule, compute gradients for each layer, and update weights. Modern frameworks like PyTorch and TensorFlow handle this automatically with autograd.'
  }
];
