import type { CheatSheet } from '../types';

/**
 * CHEAT SHEET DATABASE
 * Quick-reference sheets for AI/ML topics — matching the NeuralCards learning paths.
 */

export const cheatSheets: CheatSheet[] = [
  // ═══════════════════════════════════════════════════════
  // 1. Python for AI
  // ═══════════════════════════════════════════════════════
  {
    id: 'python-essentials',
    slug: 'python-essentials',
    title: 'Python Essentials',
    description: 'Core Python syntax, data structures, and built-in functions for AI development.',
    category: 'Programming',
    icon: '🐍',
    color: 'from-green-500 to-emerald-500',
    sections: [
      {
        title: 'Data Types & Variables',
        items: [
          { term: 'int / float', definition: 'Numeric types for integers and decimals.', syntax: 'x = 10\ny = 3.14' },
          { term: 'str', definition: 'Immutable text sequence.', syntax: "s = 'hello'" },
          { term: 'list', definition: 'Ordered, mutable collection.', syntax: 'nums = [1, 2, 3]' },
          { term: 'dict', definition: 'Key-value mapping.', syntax: "d = {'a': 1, 'b': 2}" },
          { term: 'tuple', definition: 'Ordered, immutable collection.', syntax: 't = (1, 2, 3)' },
          { term: 'set', definition: 'Unordered collection of unique elements.', syntax: 's = {1, 2, 3}' },
        ],
      },
      {
        title: 'List Comprehensions',
        items: [
          { term: 'Basic', definition: 'Create lists in one line.', syntax: '[x**2 for x in range(10)]' },
          { term: 'With condition', definition: 'Filter elements inline.', syntax: '[x for x in range(10) if x % 2 == 0]' },
          { term: 'Nested', definition: 'Flatten nested lists.', syntax: '[x for row in matrix for x in row]' },
        ],
      },
      {
        title: 'Functions & Lambda',
        items: [
          { term: 'def', definition: 'Define a reusable function.', syntax: 'def add(a, b):\n    return a + b' },
          { term: 'lambda', definition: 'Anonymous single-expression function.', syntax: 'square = lambda x: x ** 2' },
          { term: '*args', definition: 'Accept variable positional arguments.', syntax: 'def f(*args): ...' },
          { term: '**kwargs', definition: 'Accept variable keyword arguments.', syntax: 'def f(**kwargs): ...' },
        ],
      },
      {
        title: 'String Methods',
        items: [
          { term: 'split / join', definition: 'Split string into list, or join list into string.', syntax: "'a,b'.split(',')  # ['a','b']\n','.join(['a','b'])  # 'a,b'" },
          { term: 'f-strings', definition: 'Formatted string literals (Python 3.6+).', syntax: "f'Hello {name}, score={score:.2f}'" },
          { term: 'strip', definition: 'Remove leading/trailing whitespace.', syntax: "' hello '.strip()  # 'hello'" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // 2. NumPy
  // ═══════════════════════════════════════════════════════
  {
    id: 'numpy-cheatsheet',
    slug: 'numpy-cheatsheet',
    title: 'NumPy Quick Reference',
    description: 'Array creation, manipulation, math operations, and broadcasting rules.',
    category: 'Programming',
    icon: '🔢',
    color: 'from-blue-500 to-cyan-500',
    sections: [
      {
        title: 'Array Creation',
        items: [
          { term: 'np.array()', definition: 'Create array from list.', syntax: 'np.array([1, 2, 3])' },
          { term: 'np.zeros() / np.ones()', definition: 'Arrays filled with 0s or 1s.', syntax: 'np.zeros((3, 4))\nnp.ones((2, 3))' },
          { term: 'np.arange()', definition: 'Evenly spaced values in a range.', syntax: 'np.arange(0, 10, 2)  # [0,2,4,6,8]' },
          { term: 'np.linspace()', definition: 'N evenly spaced values between start and end.', syntax: 'np.linspace(0, 1, 5)' },
          { term: 'np.random.randn()', definition: 'Random samples from standard normal.', syntax: 'np.random.randn(3, 3)' },
        ],
      },
      {
        title: 'Array Operations',
        items: [
          { term: 'Reshape', definition: 'Change array shape without changing data.', syntax: 'arr.reshape(3, 4)' },
          { term: 'Transpose', definition: 'Swap rows and columns.', syntax: 'arr.T  # or arr.transpose()' },
          { term: 'Indexing', definition: 'Access elements with slicing.', syntax: 'arr[0, :]   # first row\narr[:, 1]   # second column' },
          { term: 'Boolean mask', definition: 'Filter elements by condition.', syntax: 'arr[arr > 5]' },
        ],
      },
      {
        title: 'Math & Stats',
        items: [
          { term: 'Element-wise ops', definition: 'Arithmetic works element-by-element.', syntax: 'a + b, a * b, a ** 2' },
          { term: 'Dot product', definition: 'Matrix multiplication.', syntax: 'np.dot(A, B)  # or A @ B' },
          { term: 'Aggregations', definition: 'Sum, mean, std, min, max along axes.', syntax: 'arr.mean(axis=0)  # column means' },
          { term: 'Broadcasting', definition: 'Auto-expand shapes for compatible ops.', tip: 'Shapes are compared right-to-left; dims must be equal or one must be 1.' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // 3. Pandas
  // ═══════════════════════════════════════════════════════
  {
    id: 'pandas-cheatsheet',
    slug: 'pandas-cheatsheet',
    title: 'Pandas Quick Reference',
    description: 'DataFrames, Series, groupby, merging, and data wrangling essentials.',
    category: 'Data Science',
    icon: '🐼',
    color: 'from-orange-500 to-amber-500',
    sections: [
      {
        title: 'Creating DataFrames',
        items: [
          { term: 'From dict', definition: 'Create from a dictionary of lists.', syntax: "pd.DataFrame({'col1': [1,2], 'col2': [3,4]})" },
          { term: 'Read CSV', definition: 'Load data from CSV file.', syntax: "df = pd.read_csv('data.csv')" },
          { term: 'Read Excel', definition: 'Load data from Excel file.', syntax: "df = pd.read_excel('data.xlsx')" },
        ],
      },
      {
        title: 'Selection & Filtering',
        items: [
          { term: 'Single column', definition: 'Returns a Series.', syntax: "df['col']  # or df.col" },
          { term: 'Multiple columns', definition: 'Returns a DataFrame.', syntax: "df[['col1', 'col2']]" },
          { term: 'loc / iloc', definition: 'Label-based vs integer-based indexing.', syntax: "df.loc[0:5, 'col1':'col3']\ndf.iloc[0:5, 0:3]" },
          { term: 'Boolean filter', definition: 'Filter rows by condition.', syntax: 'df[df["age"] > 25]' },
        ],
      },
      {
        title: 'Groupby & Aggregation',
        items: [
          { term: 'groupby', definition: 'Split-Apply-Combine pattern.', syntax: "df.groupby('category')['sales'].sum()" },
          { term: 'agg', definition: 'Multiple aggregations at once.', syntax: "df.groupby('cat').agg({'val': ['mean','sum']})" },
          { term: 'pivot_table', definition: 'Spreadsheet-style pivot.', syntax: "pd.pivot_table(df, values='sales', index='region', columns='product')" },
        ],
      },
      {
        title: 'Data Cleaning',
        items: [
          { term: 'dropna', definition: 'Remove rows/cols with missing values.', syntax: 'df.dropna()  # or df.dropna(axis=1)' },
          { term: 'fillna', definition: 'Fill missing values.', syntax: "df.fillna(0)  # or df.fillna(method='ffill')" },
          { term: 'apply', definition: 'Apply function to each row/column.', syntax: "df['col'].apply(lambda x: x*2)" },
          { term: 'merge', definition: 'SQL-style join of two DataFrames.', syntax: "pd.merge(df1, df2, on='key', how='left')" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // 4. Linear Algebra
  // ═══════════════════════════════════════════════════════
  {
    id: 'linear-algebra',
    slug: 'linear-algebra',
    title: 'Linear Algebra for ML',
    description: 'Vectors, matrices, eigenvalues, and key decompositions used in ML.',
    category: 'Mathematics',
    icon: '📐',
    color: 'from-blue-600 to-indigo-500',
    sections: [
      {
        title: 'Vectors',
        items: [
          { term: 'Dot Product', definition: 'Sum of element-wise products. Measures similarity.', syntax: 'a · b = Σ aᵢbᵢ' },
          { term: 'Norm (L2)', definition: 'Length / magnitude of a vector.', syntax: '‖x‖ = √(Σ xᵢ²)' },
          { term: 'Unit Vector', definition: 'Vector with magnitude 1.', syntax: 'û = x / ‖x‖' },
          { term: 'Cosine Similarity', definition: 'Angle between two vectors (used in NLP).', syntax: 'cos(θ) = (a · b) / (‖a‖ · ‖b‖)' },
        ],
      },
      {
        title: 'Matrices',
        items: [
          { term: 'Transpose', definition: 'Swap rows and columns.', syntax: '(Aᵀ)ᵢⱼ = Aⱼᵢ' },
          { term: 'Inverse', definition: 'Matrix that undoes multiplication.', syntax: 'A · A⁻¹ = I', tip: 'Only square, non-singular matrices have inverses.' },
          { term: 'Determinant', definition: 'Scalar value indicating matrix invertibility.', syntax: 'det(A) ≠ 0 → invertible' },
          { term: 'Matrix Multiplication', definition: 'Row × column dot products.', syntax: '(AB)ᵢⱼ = Σₖ AᵢₖBₖⱼ', tip: 'A(m×n) × B(n×p) = C(m×p)' },
        ],
      },
      {
        title: 'Eigenvalues & Decompositions',
        items: [
          { term: 'Eigenvalue equation', definition: 'Av = λv — vector unchanged in direction after transformation.', syntax: 'Av = λv' },
          { term: 'SVD', definition: 'Singular Value Decomposition — used in PCA, recommendation systems.', syntax: 'A = UΣVᵀ' },
          { term: 'PCA Connection', definition: 'PCA finds eigenvectors of the covariance matrix.', tip: 'Top-k eigenvectors = best k-dim projection.' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // 5. Calculus for ML
  // ═══════════════════════════════════════════════════════
  {
    id: 'calculus-for-ml',
    slug: 'calculus-for-ml',
    title: 'Calculus for ML',
    description: 'Derivatives, gradients, chain rule, and optimization concepts for training models.',
    category: 'Mathematics',
    icon: '∫',
    color: 'from-purple-500 to-violet-500',
    sections: [
      {
        title: 'Derivatives',
        items: [
          { term: 'Power Rule', definition: 'Derivative of xⁿ.', syntax: 'd/dx (xⁿ) = nxⁿ⁻¹' },
          { term: 'Chain Rule', definition: 'Derivative of composed functions.', syntax: 'd/dx f(g(x)) = f′(g(x)) · g′(x)', tip: 'The backbone of backpropagation!' },
          { term: 'Product Rule', definition: 'Derivative of a product.', syntax: '(fg)′ = f′g + fg′' },
          { term: 'Exponential', definition: 'Derivative of eˣ.', syntax: 'd/dx (eˣ) = eˣ' },
        ],
      },
      {
        title: 'Gradients & Optimization',
        items: [
          { term: 'Gradient', definition: 'Vector of partial derivatives — points uphill.', syntax: '∇f = [∂f/∂x₁, ∂f/∂x₂, ...]' },
          { term: 'Gradient Descent', definition: 'Iterative parameter update to minimize loss.', syntax: 'θ = θ − α · ∇L(θ)', tip: 'α = learning rate. Too high → diverge. Too low → slow.' },
          { term: 'Stochastic GD', definition: 'Update per mini-batch instead of full dataset.', tip: 'Faster per step; noisier but often finds better minima.' },
          { term: 'Learning Rate', definition: 'Step size for gradient descent.', tip: 'Common schedules: step decay, cosine annealing, warmup.' },
        ],
      },
      {
        title: 'Key Functions',
        items: [
          { term: 'Sigmoid', definition: 'Squashes values to (0, 1).', syntax: 'σ(x) = 1 / (1 + e⁻ˣ)' },
          { term: 'Softmax', definition: 'Converts logits to probabilities.', syntax: 'softmax(xᵢ) = eˣⁱ / Σⱼ eˣʲ' },
          { term: 'ReLU', definition: 'Most popular activation function.', syntax: 'ReLU(x) = max(0, x)', tip: 'Solves vanishing gradient; can cause "dead neurons".' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // 6. Machine Learning
  // ═══════════════════════════════════════════════════════
  {
    id: 'machine-learning',
    slug: 'machine-learning',
    title: 'Machine Learning',
    description: 'Supervised & unsupervised algorithms, evaluation metrics, and model selection.',
    category: 'Machine Learning',
    icon: '🤖',
    color: 'from-pink-500 to-rose-500',
    sections: [
      {
        title: 'Supervised Learning',
        items: [
          { term: 'Linear Regression', definition: 'Predict continuous target; minimize MSE.', syntax: 'ŷ = Xw + b' },
          { term: 'Logistic Regression', definition: 'Classification via sigmoid on linear output.', syntax: 'P(y=1) = σ(wᵀx + b)' },
          { term: 'Decision Tree', definition: 'Recursive binary splits to maximize info gain.', tip: 'Prone to overfitting; use pruning or forests.' },
          { term: 'Random Forest', definition: 'Ensemble of decision trees with bagging.', tip: 'Reduces variance; robust to noise.' },
          { term: 'SVM', definition: 'Find max-margin hyperplane separating classes.', tip: 'Kernel trick for non-linear boundaries.' },
          { term: 'KNN', definition: 'Classify by majority vote of k nearest neighbors.', tip: 'No training phase; slow at inference for large datasets.' },
        ],
      },
      {
        title: 'Unsupervised Learning',
        items: [
          { term: 'K-Means', definition: 'Partition data into k clusters by centroid distance.', tip: 'Use elbow method or silhouette score to pick k.' },
          { term: 'PCA', definition: 'Reduce dimensions by projecting onto top eigenvectors.', syntax: 'X_reduced = X @ V[:, :k]' },
          { term: 'DBSCAN', definition: 'Density-based clustering; finds arbitrary shapes.', tip: 'No need to specify k; sensitive to eps & min_samples.' },
        ],
      },
      {
        title: 'Evaluation Metrics',
        items: [
          { term: 'Accuracy', definition: 'Fraction of correct predictions.', syntax: '(TP + TN) / (TP + TN + FP + FN)', tip: 'Misleading for imbalanced datasets.' },
          { term: 'Precision', definition: 'Of predicted positives, how many are correct?', syntax: 'TP / (TP + FP)' },
          { term: 'Recall', definition: 'Of actual positives, how many did we catch?', syntax: 'TP / (TP + FN)' },
          { term: 'F1 Score', definition: 'Harmonic mean of precision and recall.', syntax: '2 · (P · R) / (P + R)' },
          { term: 'AUC-ROC', definition: 'Area under the ROC curve; measures ranking quality.', tip: '0.5 = random; 1.0 = perfect.' },
        ],
      },
      {
        title: 'Regularization',
        items: [
          { term: 'L1 (Lasso)', definition: 'Adds |w| penalty; promotes sparsity.', syntax: 'Loss + λΣ|wᵢ|' },
          { term: 'L2 (Ridge)', definition: 'Adds w² penalty; shrinks weights.', syntax: 'Loss + λΣwᵢ²' },
          { term: 'Elastic Net', definition: 'Combination of L1 and L2.', syntax: 'Loss + λ₁Σ|wᵢ| + λ₂Σwᵢ²' },
          { term: 'Cross-Validation', definition: 'K-fold CV to estimate generalization error.', tip: 'Standard: 5 or 10 folds. Stratified for classification.' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // 7. Deep Learning
  // ═══════════════════════════════════════════════════════
  {
    id: 'deep-learning',
    slug: 'deep-learning',
    title: 'Deep Learning',
    description: 'Neural network architectures, training tricks, and modern techniques.',
    category: 'Deep Learning',
    icon: '🧠',
    color: 'from-purple-600 to-pink-500',
    sections: [
      {
        title: 'Neural Network Basics',
        items: [
          { term: 'Perceptron', definition: 'Single neuron: weighted sum + activation.', syntax: 'y = σ(wᵀx + b)' },
          { term: 'MLP', definition: 'Multi-layer Perceptron; fully-connected layers.', tip: 'Universal approximation theorem: can fit any function.' },
          { term: 'Activation Functions', definition: 'Non-linearities between layers.', syntax: 'ReLU, Sigmoid, Tanh, GELU, Swish' },
          { term: 'Backpropagation', definition: 'Compute gradients via chain rule, layer by layer.', tip: 'Automatic differentiation handles this in modern frameworks.' },
        ],
      },
      {
        title: 'CNN (Convolutional Neural Networks)',
        items: [
          { term: 'Convolution', definition: 'Sliding filter extracts local features.', tip: 'Output size = (W - F + 2P) / S + 1' },
          { term: 'Pooling', definition: 'Downsamples feature maps (max or avg).', tip: 'Reduces spatial dimensions; adds translation invariance.' },
          { term: 'Common architectures', definition: 'LeNet, AlexNet, VGG, ResNet, EfficientNet.', tip: 'ResNet skip connections solve vanishing gradient.' },
        ],
      },
      {
        title: 'RNN & Sequence Models',
        items: [
          { term: 'RNN', definition: 'Hidden state carries info across time steps.', syntax: 'hₜ = f(Wₕhₜ₋₁ + Wₓxₜ)' },
          { term: 'LSTM', definition: 'Gated RNN that handles long-range dependencies.', tip: 'Gates: forget, input, output.' },
          { term: 'GRU', definition: 'Simplified LSTM with 2 gates (reset, update).', tip: 'Often comparable performance with fewer params.' },
        ],
      },
      {
        title: 'Transformers',
        items: [
          { term: 'Self-Attention', definition: 'Each token attends to all others.', syntax: 'Attention(Q,K,V) = softmax(QKᵀ/√dₖ)V' },
          { term: 'Multi-Head Attention', definition: 'Multiple attention heads capture different patterns.', tip: 'Head count × head dim = model dim.' },
          { term: 'Positional Encoding', definition: 'Injects sequence order info (sin/cos or learned).', tip: 'Required because self-attention is permutation-invariant.' },
          { term: 'Key Models', definition: 'BERT (encoder), GPT (decoder), T5 (enc-dec).', tip: 'BERT = fill-in-the-blank; GPT = next-token prediction.' },
        ],
      },
      {
        title: 'Training Tricks',
        items: [
          { term: 'Batch Normalization', definition: 'Normalize activations per mini-batch.', tip: 'Stabilizes training; allows higher learning rate.' },
          { term: 'Dropout', definition: 'Randomly zero out neurons during training.', syntax: 'nn.Dropout(p=0.5)', tip: 'Regularization technique; reduces overfitting.' },
          { term: 'Adam Optimizer', definition: 'Adaptive learning rate per parameter.', syntax: 'torch.optim.Adam(lr=3e-4)', tip: 'Default go-to optimizer; lr=3e-4 is "Karpathy constant".' },
          { term: 'Data Augmentation', definition: 'Artificially expand training data.', tip: 'Flips, rotations, crops for images; back-translation for NLP.' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // 8. Probability & Statistics
  // ═══════════════════════════════════════════════════════
  {
    id: 'probability-statistics',
    slug: 'probability-statistics',
    title: 'Probability & Statistics',
    description: 'Distributions, Bayes theorem, hypothesis testing, and statistical concepts for ML.',
    category: 'Mathematics',
    icon: '📊',
    color: 'from-teal-500 to-cyan-500',
    sections: [
      {
        title: 'Probability Basics',
        items: [
          { term: 'P(A)', definition: 'Probability of event A occurring.', syntax: '0 ≤ P(A) ≤ 1' },
          { term: 'Conditional', definition: 'Probability of A given B.', syntax: 'P(A|B) = P(A∩B) / P(B)' },
          { term: 'Independence', definition: 'A and B are independent if P(A∩B) = P(A)P(B).' },
          { term: "Bayes' Theorem", definition: 'Update belief with evidence.', syntax: 'P(A|B) = P(B|A)P(A) / P(B)', tip: 'Foundation of Bayesian ML and Naive Bayes classifier.' },
        ],
      },
      {
        title: 'Distributions',
        items: [
          { term: 'Normal (Gaussian)', definition: 'Bell curve; defined by μ and σ².', syntax: 'X ~ N(μ, σ²)', tip: '68-95-99.7 rule for std deviations.' },
          { term: 'Bernoulli', definition: 'Single trial with probability p.', syntax: 'X ~ Bernoulli(p)' },
          { term: 'Binomial', definition: 'Number of successes in n Bernoulli trials.', syntax: 'X ~ Binomial(n, p)' },
          { term: 'Poisson', definition: 'Count of events in fixed interval.', syntax: 'X ~ Poisson(λ)' },
        ],
      },
      {
        title: 'Descriptive Statistics',
        items: [
          { term: 'Mean', definition: 'Average of all values.', syntax: 'μ = Σxᵢ / n' },
          { term: 'Variance', definition: 'Average squared deviation from mean.', syntax: 'σ² = Σ(xᵢ - μ)² / n' },
          { term: 'Standard Deviation', definition: 'Square root of variance.', syntax: 'σ = √(σ²)' },
          { term: 'Correlation', definition: 'Linear relationship between two variables.', syntax: 'r = Cov(X,Y) / (σₓ · σᵧ)', tip: '-1 ≤ r ≤ 1; 0 = no linear relation.' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // 9. Scikit-Learn
  // ═══════════════════════════════════════════════════════
  {
    id: 'scikit-learn',
    slug: 'scikit-learn',
    title: 'Scikit-Learn',
    description: 'The essential ML library — fit, predict, transform API and common workflows.',
    category: 'Programming',
    icon: '⚙️',
    color: 'from-yellow-500 to-orange-500',
    sections: [
      {
        title: 'Core API Pattern',
        items: [
          { term: 'fit()', definition: 'Train the model on data.', syntax: 'model.fit(X_train, y_train)' },
          { term: 'predict()', definition: 'Make predictions on new data.', syntax: 'y_pred = model.predict(X_test)' },
          { term: 'transform()', definition: 'Apply learned transformation.', syntax: 'X_scaled = scaler.transform(X)' },
          { term: 'fit_transform()', definition: 'Fit and transform in one step.', syntax: 'X_scaled = scaler.fit_transform(X_train)' },
        ],
      },
      {
        title: 'Preprocessing',
        items: [
          { term: 'StandardScaler', definition: 'Zero mean, unit variance.', syntax: 'from sklearn.preprocessing import StandardScaler' },
          { term: 'MinMaxScaler', definition: 'Scale features to [0, 1].', syntax: 'MinMaxScaler().fit_transform(X)' },
          { term: 'OneHotEncoder', definition: 'Convert categorical to binary columns.', syntax: 'OneHotEncoder(sparse=False)' },
          { term: 'train_test_split', definition: 'Split data into train and test sets.', syntax: 'X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)' },
        ],
      },
      {
        title: 'Model Selection',
        items: [
          { term: 'GridSearchCV', definition: 'Exhaustive search over parameter grid.', syntax: "GridSearchCV(model, param_grid, cv=5, scoring='accuracy')" },
          { term: 'cross_val_score', definition: 'K-fold cross-validation scores.', syntax: 'cross_val_score(model, X, y, cv=5)' },
          { term: 'Pipeline', definition: 'Chain preprocessing + model.', syntax: "Pipeline([('scaler', StandardScaler()), ('clf', SVC())])" },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // 10. PyTorch Essentials
  // ═══════════════════════════════════════════════════════
  {
    id: 'pytorch-essentials',
    slug: 'pytorch-essentials',
    title: 'PyTorch Essentials',
    description: 'Tensors, autograd, nn.Module, and the training loop in PyTorch.',
    category: 'Deep Learning',
    icon: '🔥',
    color: 'from-red-500 to-orange-500',
    sections: [
      {
        title: 'Tensors',
        items: [
          { term: 'Create tensor', definition: 'Like NumPy arrays but GPU-compatible.', syntax: 'x = torch.tensor([1.0, 2.0, 3.0])' },
          { term: 'Shape & Reshape', definition: 'View tensor dimensions.', syntax: 'x.shape\nx.view(3, 1)  # or x.reshape(3, 1)' },
          { term: 'GPU transfer', definition: 'Move tensor to GPU.', syntax: "x = x.to('cuda')  # or x.cuda()" },
          { term: 'requires_grad', definition: 'Track operations for autograd.', syntax: 'x = torch.randn(3, requires_grad=True)' },
        ],
      },
      {
        title: 'Building Models',
        items: [
          { term: 'nn.Module', definition: 'Base class for all neural networks.', syntax: 'class Net(nn.Module):\n  def __init__(self):\n    super().__init__()\n    self.fc = nn.Linear(784, 10)\n  def forward(self, x):\n    return self.fc(x)' },
          { term: 'nn.Sequential', definition: 'Quick model from layer list.', syntax: 'model = nn.Sequential(\n  nn.Linear(784, 128),\n  nn.ReLU(),\n  nn.Linear(128, 10)\n)' },
          { term: 'Loss functions', definition: 'Common losses for training.', syntax: 'nn.CrossEntropyLoss()\nnn.MSELoss()\nnn.BCELoss()' },
        ],
      },
      {
        title: 'Training Loop',
        items: [
          { term: 'Forward pass', definition: 'Compute predictions.', syntax: 'output = model(X)' },
          { term: 'Loss', definition: 'Calculate loss.', syntax: 'loss = criterion(output, y)' },
          { term: 'Backward pass', definition: 'Compute gradients.', syntax: 'loss.backward()' },
          { term: 'Update weights', definition: 'Step the optimizer.', syntax: 'optimizer.step()' },
          { term: 'Zero gradients', definition: 'Reset gradients before next step.', syntax: 'optimizer.zero_grad()', tip: 'Always call before loss.backward()!' },
        ],
      },
    ],
  },
];

// Helper: get cheat sheet by slug
export function getCheatSheetBySlug(slug: string): CheatSheet | undefined {
  return cheatSheets.find((cs) => cs.slug === slug);
}

// Helper: get all unique categories
export function getCheatSheetCategories(): string[] {
  return [...new Set(cheatSheets.map((cs) => cs.category))];
}
