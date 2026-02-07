/**
 * LOCAL FLASHCARD DATABASE — Complete coverage for all 7 learning paths
 * Each topic slug maps to an array of flashcards in DB-compatible format.
 * This serves as fallback when Supabase has no data for a topic.
 */

interface LocalFlashcard {
  id: string;
  topic_id: string;
  front_content: string;
  back_content: string;
  code_snippet: string | null;
  card_type: string;
  created_at: string;
}

const now = new Date().toISOString();
let cardIdx = 0;
const card = (
  slug: string,
  front: string,
  back: string,
  type = 'concept',
  code: string | null = null
): LocalFlashcard => ({
  id: `local-${slug}-${++cardIdx}`,
  topic_id: slug,
  front_content: front,
  back_content: back,
  code_snippet: code,
  card_type: type,
  created_at: now,
});

// ═══════════════════════════════════════════════════════
// PATH 1: MATH FOR MACHINE LEARNING (9 topics)
// ═══════════════════════════════════════════════════════

const vectorsMatrices: LocalFlashcard[] = [
  card('vectors-matrices', 'What is a vector?', 'A vector is an ordered array of numbers that represents both magnitude and direction. In ML, feature vectors represent data points in n-dimensional space.'),
  card('vectors-matrices', 'What is a matrix?', 'A matrix is a 2D array of numbers arranged in rows and columns. Used to represent datasets (rows = samples, cols = features) and linear transformations.'),
  card('vectors-matrices', 'What is the dot product of two vectors?', 'The dot product a·b = Σ(aᵢ × bᵢ). It measures similarity between vectors. Result is a scalar. If dot product = 0, vectors are orthogonal (perpendicular).'),
  card('vectors-matrices', 'What is vector norm?', 'The norm ‖v‖ measures the length/magnitude of a vector. L2 norm (Euclidean): √(Σvᵢ²). L1 norm (Manhattan): Σ|vᵢ|. Used in regularization and distance calculations.'),
  card('vectors-matrices', 'What is the shape of a matrix?', 'The shape is (rows, columns). A 3×4 matrix has 3 rows and 4 columns. In ML, a dataset matrix is typically (n_samples, n_features).', 'concept', 'import numpy as np\nA = np.array([[1,2,3],[4,5,6]])\nprint(A.shape)  # (2, 3)'),
  card('vectors-matrices', 'What is a unit vector?', 'A unit vector has magnitude 1. Computed by dividing a vector by its norm: û = v/‖v‖. Used in normalization and representing directions.'),
  card('vectors-matrices', 'Why are vectors important in ML?', 'Every data point is a vector. Word embeddings, image pixels, user features — all represented as vectors. Operations like similarity, distance, and transformations are all vector math.'),
  card('vectors-matrices', 'What is the cross product?', 'Cross product a×b produces a vector perpendicular to both a and b. Only defined in 3D. Magnitude = ‖a‖‖b‖sin(θ). Used in computer graphics and physics simulations.'),
];

const matrixOperations: LocalFlashcard[] = [
  card('matrix-operations', 'How do you multiply two matrices?', 'For A(m×n) × B(n×p) = C(m×p): Each element Cᵢⱼ = sum of row i of A × column j of B. The inner dimensions must match (n).'),
  card('matrix-operations', 'What is the transpose of a matrix?', 'Transpose (Aᵀ) flips a matrix over its diagonal — rows become columns. If A is m×n, Aᵀ is n×m. Property: (AB)ᵀ = BᵀAᵀ.'),
  card('matrix-operations', 'What is the identity matrix?', 'A square matrix with 1s on the diagonal and 0s elsewhere. A × I = A. It\'s the matrix equivalent of multiplying by 1.', 'concept', 'import numpy as np\nI = np.eye(3)  # 3x3 identity matrix'),
  card('matrix-operations', 'What is matrix inverse?', 'The inverse A⁻¹ satisfies A × A⁻¹ = I. Only exists for square matrices with non-zero determinant. Used to solve linear systems Ax = b → x = A⁻¹b.'),
  card('matrix-operations', 'What is the determinant?', 'A scalar value that encodes properties of a matrix. det(A) = 0 means the matrix is singular (no inverse). For 2×2: det = ad - bc.'),
  card('matrix-operations', 'What is broadcasting in matrix operations?', 'Broadcasting allows operations between arrays of different shapes. NumPy automatically expands the smaller array. Example: adding a vector to each row of a matrix.', 'code', 'A = np.array([[1,2],[3,4]])\nv = np.array([10,20])\nprint(A + v)  # [[11,22],[13,24]]'),
  card('matrix-operations', 'What is element-wise vs matrix multiplication?', 'Element-wise (Hadamard): multiply corresponding elements, same shape required. Matrix multiplication: dot product of rows and columns, inner dimensions must match.', 'code', 'A * B      # element-wise\nA @ B      # matrix multiplication\nnp.dot(A,B) # same as @'),
];

const eigenvaluesEigenvectors: LocalFlashcard[] = [
  card('eigenvalues-eigenvectors', 'What is an eigenvector?', 'A non-zero vector v that only gets scaled (not rotated) when a matrix A is applied: Av = λv. The direction stays the same, only magnitude changes.'),
  card('eigenvalues-eigenvectors', 'What is an eigenvalue?', 'The scalar λ in Av = λv. It tells you how much the eigenvector is scaled. An eigenvalue of 2 means the vector doubles in length.'),
  card('eigenvalues-eigenvectors', 'Why are eigenvalues important in ML?', 'PCA uses eigenvalues to find principal components. Larger eigenvalues = more variance = more important directions. They help reduce dimensionality while preserving information.'),
  card('eigenvalues-eigenvectors', 'How to compute eigenvalues?', 'Solve det(A - λI) = 0. This gives the characteristic polynomial. Roots of this polynomial are the eigenvalues.', 'formula'),
  card('eigenvalues-eigenvectors', 'What is eigendecomposition?', 'A = QΛQ⁻¹ where Q contains eigenvectors as columns and Λ is diagonal matrix of eigenvalues. Only works for square matrices with n linearly independent eigenvectors.'),
  card('eigenvalues-eigenvectors', 'How are eigenvectors used in PCA?', 'PCA computes eigenvectors of the covariance matrix. The top-k eigenvectors (by eigenvalue magnitude) form the new reduced feature space.', 'code', 'from sklearn.decomposition import PCA\npca = PCA(n_components=2)\nX_reduced = pca.fit_transform(X)'),
];

const derivativesGradients: LocalFlashcard[] = [
  card('derivatives-gradients', 'What is a derivative?', 'The derivative f\'(x) measures the rate of change of f at point x. It\'s the slope of the tangent line. In ML, it tells us how loss changes when we adjust a parameter.'),
  card('derivatives-gradients', 'What is a gradient?', 'The gradient ∇f is a vector of all partial derivatives. It points in the direction of steepest ascent. In ML, we move opposite to the gradient to minimize loss.'),
  card('derivatives-gradients', 'Why are gradients crucial for ML?', 'Gradient descent — the core optimization algorithm — uses gradients to update model parameters. Without gradients, neural networks can\'t learn.'),
  card('derivatives-gradients', 'What is the gradient descent update rule?', 'θ_new = θ_old - α × ∇L(θ), where α is the learning rate and ∇L is the gradient of the loss. We subtract because we want to minimize.', 'formula'),
  card('derivatives-gradients', 'What is a learning rate?', 'A hyperparameter α that controls step size in gradient descent. Too large → overshooting. Too small → slow convergence. Typical range: 0.001 to 0.01.'),
  card('derivatives-gradients', 'What is the difference between gradient and derivative?', 'Derivative is for single-variable functions (scalar). Gradient is for multi-variable functions (vector of partial derivatives). Gradient generalizes the derivative to higher dimensions.'),
];

const partialDerivatives: LocalFlashcard[] = [
  card('partial-derivatives', 'What is a partial derivative?', 'The derivative of a multi-variable function with respect to one variable, holding others constant. ∂f/∂x measures how f changes when only x changes.'),
  card('partial-derivatives', 'Why are partial derivatives important in ML?', 'Neural networks have millions of parameters. Partial derivatives tell us how the loss changes with respect to each individual weight, enabling targeted updates.'),
  card('partial-derivatives', 'What is the Jacobian matrix?', 'A matrix of all first-order partial derivatives of a vector-valued function. Jᵢⱼ = ∂fᵢ/∂xⱼ. Generalizes the gradient to vector-valued functions.'),
  card('partial-derivatives', 'What is the Hessian matrix?', 'A square matrix of second-order partial derivatives. Hᵢⱼ = ∂²f/∂xᵢ∂xⱼ. Describes curvature of the loss surface. Used in second-order optimization methods.'),
  card('partial-derivatives', 'How do you compute ∂/∂x of f(x,y) = x²y + 3xy?', '∂f/∂x = 2xy + 3y. Treat y as a constant and differentiate with respect to x using standard rules.', 'formula'),
];

const chainRule: LocalFlashcard[] = [
  card('chain-rule', 'What is the chain rule?', 'For composed functions f(g(x)): df/dx = (df/dg) × (dg/dx). Multiply derivatives along the computation path. This is the foundation of backpropagation.'),
  card('chain-rule', 'How does the chain rule enable backpropagation?', 'Neural networks are compositions of functions (layers). The chain rule lets us compute gradients layer by layer, propagating error backward through the network.'),
  card('chain-rule', 'What is the multivariate chain rule?', 'If z = f(x,y), x = g(t), y = h(t): dz/dt = (∂f/∂x)(dx/dt) + (∂f/∂y)(dy/dt). Sum over all paths from output to input.', 'formula'),
  card('chain-rule', 'What is computational graph and chain rule?', 'A computational graph shows operations as nodes. To find gradient, multiply derivatives along each path from output to input, then sum all paths. This is exactly what autograd does.'),
  card('chain-rule', 'Apply chain rule: d/dx of (3x² + 1)⁵', 'Let u = 3x² + 1. d/dx = 5u⁴ × 6x = 30x(3x² + 1)⁴. Outer derivative times inner derivative.', 'formula'),
];

const probabilityBasics: LocalFlashcard[] = [
  card('probability-basics', 'What is probability?', 'A measure between 0 and 1 of how likely an event is. P(A) = favorable outcomes / total outcomes. P = 0 (impossible), P = 1 (certain).'),
  card('probability-basics', 'What is conditional probability?', 'P(A|B) = probability of A given B has occurred = P(A ∩ B) / P(B). In ML: P(spam|words) = probability email is spam given certain words appear.'),
  card('probability-basics', 'What is the difference between independent and dependent events?', 'Independent: P(A|B) = P(A) — knowing B doesn\'t change A. Dependent: P(A|B) ≠ P(A). Example: drawing cards without replacement = dependent.'),
  card('probability-basics', 'What is expected value?', 'E[X] = Σ xᵢ × P(xᵢ). The weighted average of all possible values. In ML, expected loss is what we minimize during training.', 'formula'),
  card('probability-basics', 'What is variance?', 'Var(X) = E[(X - μ)²] = E[X²] - (E[X])². Measures spread of data. High variance = data points far from mean. Standard deviation = √Var.', 'formula'),
  card('probability-basics', 'What is the law of total probability?', 'P(A) = Σ P(A|Bᵢ) × P(Bᵢ) for a partition {B₁, B₂, ...}. Useful when you can\'t compute P(A) directly but know conditional probabilities.'),
];

const bayesTheorem: LocalFlashcard[] = [
  card('bayes-theorem', 'What is Bayes\' Theorem?', 'P(A|B) = P(B|A) × P(A) / P(B). Updates our belief about A after observing evidence B. Posterior = (Likelihood × Prior) / Evidence.', 'formula'),
  card('bayes-theorem', 'What are prior, likelihood, and posterior?', 'Prior P(A): belief before evidence. Likelihood P(B|A): probability of evidence given hypothesis. Posterior P(A|B): updated belief after evidence.'),
  card('bayes-theorem', 'How is Bayes used in Naive Bayes classifier?', 'Classifies by computing P(class|features) ∝ P(features|class) × P(class). Assumes features are independent given the class (the "naive" assumption).'),
  card('bayes-theorem', 'What is a Bayesian vs Frequentist approach?', 'Frequentist: probability = long-run frequency, parameters are fixed. Bayesian: probability = degree of belief, parameters have distributions. Bayesian updates beliefs with data.'),
  card('bayes-theorem', 'Example: medical test with Bayes', 'Disease prevalence 1%, test accuracy 99%. If positive: P(disease|positive) = (0.99 × 0.01) / (0.99×0.01 + 0.01×0.99) ≈ 50%! Shows base rate fallacy.'),
  card('bayes-theorem', 'What is Maximum A Posteriori (MAP)?', 'MAP estimation finds the parameter θ that maximizes P(θ|data) = P(data|θ) × P(θ). Unlike MLE, it includes the prior. Regularization in ML is a form of MAP with Gaussian prior.'),
];

const distributions: LocalFlashcard[] = [
  card('distributions', 'What is a probability distribution?', 'A function that describes the likelihood of each possible value of a random variable. Discrete: PMF. Continuous: PDF. Total probability always sums/integrates to 1.'),
  card('distributions', 'What is the Normal (Gaussian) distribution?', 'Bell-shaped, defined by mean μ and std σ. ~68% within 1σ, ~95% within 2σ, ~99.7% within 3σ. Central to ML — many algorithms assume normally distributed data.'),
  card('distributions', 'What is the Bernoulli distribution?', 'A distribution for binary outcomes (0 or 1). P(X=1) = p, P(X=0) = 1-p. Used in logistic regression and binary classification.'),
  card('distributions', 'What is the softmax distribution?', 'Converts a vector of scores into probabilities that sum to 1: softmax(zᵢ) = e^zᵢ / Σe^zⱼ. Used as the output layer for multi-class classification.', 'formula'),
  card('distributions', 'What is the Uniform distribution?', 'All outcomes equally likely. Continuous: f(x) = 1/(b-a) for a ≤ x ≤ b. Often used for weight initialization in neural networks.'),
  card('distributions', 'What is the Poisson distribution?', 'Models count of events in a fixed interval: P(k) = (λᵏ × e⁻λ) / k!. Mean = Variance = λ. Used for rare events like website visits per minute.', 'formula'),
];

// ═══════════════════════════════════════════════════════
// PATH 2: PYTHON FOR AI (7 topics)
// ═══════════════════════════════════════════════════════

const numpyBasics: LocalFlashcard[] = [
  card('numpy-basics', 'What is NumPy?', 'NumPy is the fundamental Python library for numerical computing. Provides n-dimensional arrays (ndarray) and vectorized operations that are 10-100x faster than Python lists.'),
  card('numpy-basics', 'How to create a NumPy array?', 'Use np.array(), np.zeros(), np.ones(), np.arange(), np.linspace(). Arrays are typed and fixed-size.', 'code', 'import numpy as np\na = np.array([1, 2, 3])\nz = np.zeros((3, 4))\nr = np.arange(0, 10, 2)  # [0,2,4,6,8]'),
  card('numpy-basics', 'What is vectorization?', 'Performing operations on entire arrays at once instead of looping. np.dot(a, b) is massively faster than a manual loop. NumPy uses C under the hood.', 'code', '# Slow\nresult = [a[i]*b[i] for i in range(len(a))]\n# Fast\nresult = a * b'),
  card('numpy-basics', 'What is array slicing in NumPy?', 'Access sub-arrays: a[start:stop:step]. 2D: a[row_slice, col_slice]. Fancy indexing: a[[0,2,4]] selects specific indices.', 'code', 'a = np.array([[1,2,3],[4,5,6],[7,8,9]])\nprint(a[0:2, 1:])  # [[2,3],[5,6]]'),
  card('numpy-basics', 'What is np.reshape()?', 'Changes array shape without changing data. Total elements must stay the same. -1 infers dimension automatically.', 'code', 'a = np.arange(12)\nb = a.reshape(3, 4)   # 3 rows, 4 cols\nc = a.reshape(-1, 2)  # auto: 6 rows, 2 cols'),
  card('numpy-basics', 'What are NumPy random functions?', 'np.random.rand() for uniform, np.random.randn() for normal, np.random.randint() for integers. Set seed for reproducibility.', 'code', 'np.random.seed(42)\nX = np.random.randn(100, 5)  # 100 samples, 5 features'),
];

const arrayOperations: LocalFlashcard[] = [
  card('array-operations', 'What is broadcasting?', 'NumPy\'s ability to operate on arrays of different shapes. Smaller array is "broadcast" across the larger one. Rules: dimensions compared right to left, must be equal or one of them is 1.'),
  card('array-operations', 'What is np.concatenate()?', 'Joins arrays along an existing axis. np.vstack() stacks vertically (axis=0), np.hstack() horizontally (axis=1).', 'code', 'a = np.array([1,2])\nb = np.array([3,4])\nnp.concatenate([a,b])  # [1,2,3,4]\nnp.vstack([a,b])  # [[1,2],[3,4]]'),
  card('array-operations', 'What is np.where()?', 'Conditional element selection: np.where(condition, x, y). Returns x where True, y where False. Like a vectorized if-else.', 'code', 'a = np.array([1,-2,3,-4])\nnp.where(a > 0, a, 0)  # [1,0,3,0]'),
  card('array-operations', 'What are aggregation functions?', 'np.sum(), np.mean(), np.std(), np.min(), np.max(), np.argmax(). Use axis parameter for row/column operations.', 'code', 'a = np.array([[1,2],[3,4]])\nnp.sum(a, axis=0)  # [4,6] column sums\nnp.sum(a, axis=1)  # [3,7] row sums'),
  card('array-operations', 'What is np.dot() vs @ operator?', 'Both compute matrix multiplication. np.dot(A, B) and A @ B are equivalent for 2D arrays. @ is more readable and Pythonic.', 'code', 'A = np.random.randn(3, 4)\nB = np.random.randn(4, 2)\nC = A @ B  # Shape: (3, 2)'),
];

const pandasDataframes: LocalFlashcard[] = [
  card('pandas-dataframes', 'What is a Pandas DataFrame?', 'A 2D labeled data structure with columns of potentially different types. Like a spreadsheet or SQL table in Python. The primary tool for data manipulation in ML.'),
  card('pandas-dataframes', 'How to create a DataFrame?', 'From dict, list of dicts, NumPy array, or CSV file. pd.DataFrame(data) or pd.read_csv(file).', 'code', 'import pandas as pd\ndf = pd.DataFrame({"name": ["Alice","Bob"], "age": [25,30]})\ndf = pd.read_csv("data.csv")'),
  card('pandas-dataframes', 'How to select data in a DataFrame?', 'df["col"] for column, df.loc[row, col] for label-based, df.iloc[row, col] for integer-based indexing.', 'code', 'df["age"]          # Column\ndf.loc[0, "name"]   # Label-based\ndf.iloc[0:3, 1:3]   # Integer-based'),
  card('pandas-dataframes', 'What is df.describe()?', 'Returns statistical summary: count, mean, std, min, 25%, 50%, 75%, max for each numeric column. Essential first step in EDA.', 'code', 'df.describe()\ndf.info()     # data types, non-null counts\ndf.shape      # (rows, cols)'),
  card('pandas-dataframes', 'How to handle missing values?', 'df.isnull().sum() to count. df.dropna() to remove rows. df.fillna(value) to fill. Strategy depends on data — mean, median, or mode imputation.', 'code', 'df.isnull().sum()       # count per column\ndf.fillna(df.mean())    # fill with mean\ndf.dropna(subset=["age"])  # drop if age is NaN'),
  card('pandas-dataframes', 'What is groupby()?', 'Split-apply-combine: group data by a column, apply aggregation, combine results. Essential for feature engineering.', 'code', 'df.groupby("category")["price"].mean()\ndf.groupby(["city","year"]).agg({"sales":"sum","count":"size"})'),
];

const dataManipulation: LocalFlashcard[] = [
  card('data-manipulation', 'How to merge DataFrames?', 'pd.merge(df1, df2, on="key") for SQL-style joins. Types: inner, left, right, outer. pd.concat() for stacking.', 'code', 'merged = pd.merge(orders, customers, on="customer_id", how="left")'),
  card('data-manipulation', 'What is feature scaling?', 'Normalizing features to similar ranges. Min-Max: (x-min)/(max-min) → [0,1]. Standardization: (x-μ)/σ → mean=0, std=1. Critical for distance-based algorithms.'),
  card('data-manipulation', 'How to encode categorical variables?', 'Label encoding: categories → integers. One-hot encoding: categories → binary columns. pd.get_dummies() or sklearn.preprocessing.', 'code', 'pd.get_dummies(df, columns=["color"])\n# color_red, color_blue, color_green'),
  card('data-manipulation', 'What is train-test split?', 'Divide data into training (70-80%) and test (20-30%) sets. Train on training data, evaluate on test data to check generalization.', 'code', 'from sklearn.model_selection import train_test_split\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)'),
  card('data-manipulation', 'What is the apply() function?', 'Apply a function along an axis of a DataFrame. More flexible than vectorized operations for complex transformations.', 'code', 'df["age_group"] = df["age"].apply(lambda x: "young" if x < 30 else "senior")'),
];

const matplotlibBasics: LocalFlashcard[] = [
  card('matplotlib-basics', 'What is Matplotlib?', 'The foundational plotting library in Python. Creates static, animated, and interactive visualizations. pyplot interface (plt) provides MATLAB-like plotting.'),
  card('matplotlib-basics', 'How to create a basic plot?', 'plt.plot(x, y) for line, plt.scatter() for points, plt.bar() for bars, plt.hist() for histograms. Always label axes!', 'code', 'import matplotlib.pyplot as plt\nplt.plot([1,2,3], [1,4,9])\nplt.xlabel("X"); plt.ylabel("Y")\nplt.title("My Plot")\nplt.show()'),
  card('matplotlib-basics', 'What is a subplot?', 'Multiple plots in one figure. fig, axes = plt.subplots(rows, cols) creates a grid. Use axes[i] to access each plot.', 'code', 'fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12,5))\nax1.plot(x, y1); ax1.set_title("Plot 1")\nax2.scatter(x, y2); ax2.set_title("Plot 2")'),
  card('matplotlib-basics', 'What plots are best for ML?', 'Scatter: relationships. Histogram: distributions. Heatmap: correlations. Box plot: outliers. Learning curve: training progress. Confusion matrix: classification results.'),
  card('matplotlib-basics', 'How to plot a confusion matrix?', 'Use sklearn metrics + seaborn heatmap for a clean visualization of classification results.', 'code', 'from sklearn.metrics import confusion_matrix\nimport seaborn as sns\ncm = confusion_matrix(y_true, y_pred)\nsns.heatmap(cm, annot=True, fmt="d")'),
];

const seabornVisualization: LocalFlashcard[] = [
  card('seaborn-visualization', 'What is Seaborn?', 'A statistical visualization library built on Matplotlib. Provides beautiful default styles and high-level functions for common statistical plots.'),
  card('seaborn-visualization', 'What is sns.pairplot()?', 'Creates a grid of scatter plots for every pair of features + histograms on diagonal. Best first-look at data relationships.', 'code', 'import seaborn as sns\nsns.pairplot(df, hue="target")  # color by target class'),
  card('seaborn-visualization', 'What is a correlation heatmap?', 'Visualizes correlation matrix as colors. Red=positive, Blue=negative. Helps identify multicollinearity and feature relationships.', 'code', 'sns.heatmap(df.corr(), annot=True, cmap="coolwarm", center=0)'),
  card('seaborn-visualization', 'What are distribution plots in Seaborn?', 'sns.histplot() for histograms, sns.kdeplot() for kernel density, sns.boxplot() for quartiles, sns.violinplot() for distribution shape.'),
  card('seaborn-visualization', 'When to use which plot type?', 'Numeric vs Numeric: scatter/line. Categorical vs Numeric: box/violin/bar. Distribution: hist/kde. Relationships: pairplot/heatmap.'),
];

const scikitLearnIntro: LocalFlashcard[] = [
  card('scikit-learn-intro', 'What is scikit-learn?', 'The most popular ML library in Python. Provides consistent API for classification, regression, clustering, preprocessing, and model evaluation.'),
  card('scikit-learn-intro', 'What is the scikit-learn API pattern?', 'All models follow: model = Estimator(). model.fit(X_train, y_train). model.predict(X_test). model.score(X_test, y_test). Beautifully consistent.', 'code', 'from sklearn.ensemble import RandomForestClassifier\nmodel = RandomForestClassifier(n_estimators=100)\nmodel.fit(X_train, y_train)\naccuracy = model.score(X_test, y_test)'),
  card('scikit-learn-intro', 'What is a Pipeline in sklearn?', 'Chains preprocessing and model steps. Prevents data leakage, simplifies code, and makes deployment easier.', 'code', 'from sklearn.pipeline import Pipeline\npipe = Pipeline([\n  ("scaler", StandardScaler()),\n  ("model", LogisticRegression())\n])\npipe.fit(X_train, y_train)'),
  card('scikit-learn-intro', 'What are sklearn metrics?', 'accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix, classification_report. Choose based on problem.', 'code', 'from sklearn.metrics import classification_report\nprint(classification_report(y_true, y_pred))'),
  card('scikit-learn-intro', 'What is cross-validation in sklearn?', 'cross_val_score() splits data k times, trains k models, returns k scores. More reliable than single train-test split.', 'code', 'from sklearn.model_selection import cross_val_score\nscores = cross_val_score(model, X, y, cv=5)\nprint(f"Accuracy: {scores.mean():.2f} ± {scores.std():.2f}")'),
];

// ═══════════════════════════════════════════════════════
// PATH 3: MACHINE LEARNING FUNDAMENTALS (12 topics)
// ═══════════════════════════════════════════════════════

const supervisedLearning: LocalFlashcard[] = [
  card('supervised-learning', 'What is supervised learning?', 'Learning from labeled data. Input X → Output Y mapping. Model learns patterns from training examples with known answers. Two types: Classification (categories) and Regression (continuous values).'),
  card('supervised-learning', 'What is the difference between classification and regression?', 'Classification: predict discrete labels (spam/not-spam, cat/dog). Regression: predict continuous values (price, temperature, age).'),
  card('supervised-learning', 'What is overfitting?', 'Model memorizes training data noise instead of learning the pattern. High training accuracy, low test accuracy. Solutions: more data, regularization, simpler model, dropout.'),
  card('supervised-learning', 'What is underfitting?', 'Model is too simple to capture the pattern. Low accuracy on both training and test data. Solutions: more features, complex model, less regularization.'),
  card('supervised-learning', 'What is the bias-variance decomposition?', 'Total Error = Bias² + Variance + Noise. High bias = underfitting. High variance = overfitting. The goal is the sweet spot (bias-variance tradeoff).'),
  card('supervised-learning', 'What is unsupervised learning?', 'Learning from unlabeled data. Finds hidden structure. Examples: clustering (K-Means), dimensionality reduction (PCA), anomaly detection.'),
];

const linearRegression: LocalFlashcard[] = [
  card('linear-regression', 'What is linear regression?', 'Predicts continuous output as a weighted sum of inputs: ŷ = w₁x₁ + w₂x₂ + ... + b. Finds the line (hyperplane) that minimizes squared errors.'),
  card('linear-regression', 'What is the cost function for linear regression?', 'Mean Squared Error (MSE) = (1/n) × Σ(yᵢ - ŷᵢ)². Measures average squared difference between predicted and actual values.', 'formula'),
  card('linear-regression', 'What is the normal equation?', 'Closed-form solution: θ = (XᵀX)⁻¹Xᵀy. Directly computes optimal weights without iteration. Not practical for large datasets (matrix inversion is O(n³)).', 'formula'),
  card('linear-regression', 'What is R² score?', 'R² = 1 - (SS_res / SS_tot). Measures how much variance the model explains. R² = 1 is perfect, R² = 0 means model = predicting mean.', 'formula'),
  card('linear-regression', 'What are assumptions of linear regression?', 'Linearity, independence of errors, homoscedasticity (constant variance), normality of residuals, no multicollinearity. Violations → unreliable predictions.'),
  card('linear-regression', 'Code: Linear Regression', 'Simple implementation with scikit-learn.', 'code', 'from sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\nprint(f"R²: {model.score(X_test, y_test):.3f}")\nprint(f"Coefficients: {model.coef_}")'),
];

const logisticRegression: LocalFlashcard[] = [
  card('logistic-regression', 'What is logistic regression?', 'A classification algorithm (despite the name). Uses sigmoid function to output probability: P(y=1|x) = σ(wᵀx + b) = 1/(1+e^(-z)). Threshold at 0.5 for binary decision.'),
  card('logistic-regression', 'What is the sigmoid function?', 'σ(z) = 1/(1+e^(-z)). Maps any real number to (0,1). S-shaped curve. At z=0: σ=0.5. Large positive z → 1. Large negative z → 0.', 'formula'),
  card('logistic-regression', 'What is the loss function for logistic regression?', 'Binary Cross-Entropy: L = -[y×log(ŷ) + (1-y)×log(1-ŷ)]. Penalizes confident wrong predictions heavily.', 'formula'),
  card('logistic-regression', 'When to use logistic vs linear regression?', 'Linear: continuous target (price, score). Logistic: binary/multi-class target (yes/no, spam/ham). Never use linear regression for classification!'),
  card('logistic-regression', 'What is the decision boundary?', 'The line/surface where P(y=1) = 0.5. Points on one side classified as 1, other side as 0. For logistic regression, it\'s always linear (a straight line/plane).'),
];

const decisionTrees: LocalFlashcard[] = [
  card('decision-trees', 'What is a decision tree?', 'A tree-like model that makes decisions by splitting data on feature values. Each node = a question, each branch = an answer, each leaf = a prediction. Intuitive and interpretable.'),
  card('decision-trees', 'What is information gain?', 'Measures how much a split reduces uncertainty (entropy). IG = Entropy(parent) - weighted_avg(Entropy(children)). The split with highest IG is chosen.', 'formula'),
  card('decision-trees', 'What is Gini impurity?', 'Gini = 1 - Σpᵢ². Measures probability of misclassification. Gini = 0 means pure node (all same class). Faster to compute than entropy.', 'formula'),
  card('decision-trees', 'What is pruning?', 'Cutting branches that don\'t improve performance. Prevents overfitting. Pre-pruning: stop early (max_depth). Post-pruning: grow full tree, then remove weak branches.'),
  card('decision-trees', 'What are advantages of decision trees?', 'Easy to understand and visualize. Handles both numeric and categorical data. No feature scaling needed. Captures non-linear relationships.'),
  card('decision-trees', 'What are disadvantages?', 'Prone to overfitting (especially deep trees). Unstable — small data changes = different tree. Biased toward features with more levels. Solution: ensembles (Random Forest).'),
];

const randomForests: LocalFlashcard[] = [
  card('random-forests', 'What is a Random Forest?', 'An ensemble of decision trees. Each tree trained on a random subset of data (bagging) and features. Final prediction = majority vote (classification) or average (regression).'),
  card('random-forests', 'What is bagging (Bootstrap Aggregating)?', 'Train multiple models on random subsets (with replacement) of data. Combine predictions. Reduces variance without increasing bias. Random Forest = bagging + feature randomness.'),
  card('random-forests', 'Why does Random Forest work?', 'Wisdom of crowds: individual trees overfit differently, but averaging cancels out the noise. Feature randomness ensures trees are diverse (decorrelated).'),
  card('random-forests', 'What is feature importance in Random Forest?', 'Measures how much each feature decreases impurity across all trees. model.feature_importances_ gives normalized importance scores.', 'code', 'model = RandomForestClassifier(n_estimators=100)\nmodel.fit(X_train, y_train)\nimportances = model.feature_importances_'),
  card('random-forests', 'What are key hyperparameters?', 'n_estimators: number of trees (more = better, slower). max_depth: tree depth. min_samples_split: min samples to split. max_features: features per split (sqrt for classification, n/3 for regression).'),
];

const svm: LocalFlashcard[] = [
  card('svm', 'What is SVM (Support Vector Machine)?', 'Finds the hyperplane that maximizes the margin between classes. Support vectors are the closest points to the boundary. Works well in high dimensions.'),
  card('svm', 'What is the kernel trick?', 'Maps data to higher dimensions where it becomes linearly separable, without actually computing the transformation. Common kernels: RBF, polynomial, sigmoid.'),
  card('svm', 'What is the margin in SVM?', 'Distance between the decision boundary and nearest data points (support vectors). SVM maximizes this margin. Wider margin = better generalization.'),
  card('svm', 'What is the C parameter?', 'Controls the trade-off between margin width and misclassification. High C: narrow margin, fewer errors (risk overfitting). Low C: wide margin, more errors (risk underfitting).'),
  card('svm', 'When to use SVM?', 'High-dimensional data. Small-medium datasets. Clear margin of separation exists. Binary classification. Text classification (SVM + TF-IDF is a classic combo).'),
];

const kmeansClustering: LocalFlashcard[] = [
  card('kmeans-clustering', 'What is K-Means clustering?', 'Unsupervised algorithm that groups data into K clusters. Steps: 1) Initialize K centroids, 2) Assign points to nearest centroid, 3) Update centroids to cluster means, 4) Repeat until convergence.'),
  card('kmeans-clustering', 'How to choose K?', 'Elbow method: plot inertia vs K, find the "elbow" point. Silhouette score: measures cluster quality (-1 to 1, higher = better). Domain knowledge also helps.'),
  card('kmeans-clustering', 'What is inertia?', 'Sum of squared distances from each point to its nearest centroid. Lower = tighter clusters. K-Means minimizes inertia.', 'formula'),
  card('kmeans-clustering', 'What are limitations of K-Means?', 'Requires specifying K. Assumes spherical clusters. Sensitive to initialization (use k-means++). Sensitive to outliers. Doesn\'t work well with varying cluster sizes.'),
  card('kmeans-clustering', 'What is K-Means++ initialization?', 'Smart initialization: first centroid random, subsequent centroids chosen with probability proportional to distance² from nearest existing centroid. Reduces bad initializations.'),
];

const pca: LocalFlashcard[] = [
  card('pca', 'What is PCA?', 'Principal Component Analysis — unsupervised method to reduce dimensionality. Finds directions (principal components) of maximum variance. Projects data onto these directions.'),
  card('pca', 'How does PCA work?', '1) Standardize data. 2) Compute covariance matrix. 3) Find eigenvectors/eigenvalues. 4) Sort by eigenvalue (importance). 5) Project data onto top-K eigenvectors.'),
  card('pca', 'What is explained variance ratio?', 'Fraction of total variance captured by each principal component. Sum of all = 1. Choose enough components to capture 95%+ variance.', 'code', 'pca = PCA(n_components=0.95)  # keep 95% variance\nX_reduced = pca.fit_transform(X)\nprint(pca.explained_variance_ratio_)'),
  card('pca', 'When to use PCA?', 'High dimensionality (curse of dimensionality). Feature visualization (reduce to 2-3D). Reduce noise. Speed up training. Handle multicollinearity.'),
  card('pca', 'What is the curse of dimensionality?', 'As dimensions increase: distances become meaningless, data becomes sparse, models need exponentially more data. PCA fights this by reducing dimensions.'),
];

const gradientDescent: LocalFlashcard[] = [
  card('gradient-descent', 'What is Gradient Descent?', 'Optimization algorithm to minimize a loss function. Iteratively moves parameters in the direction of steepest descent (negative gradient): θ = θ - α × ∇L.'),
  card('gradient-descent', 'What are the types of gradient descent?', 'Batch GD: uses all data (slow, stable). Stochastic GD: uses 1 sample (fast, noisy). Mini-batch GD: uses small batch (best of both, most common in practice).'),
  card('gradient-descent', 'What is the learning rate?', 'Step size α. Too large: overshoots minimum, diverges. Too small: very slow convergence. Common: start at 0.001, use learning rate scheduling.'),
  card('gradient-descent', 'What is a local minimum vs global minimum?', 'Local: lowest point in a neighborhood. Global: lowest point overall. In deep learning, local minima are less of a problem due to high dimensions — saddle points are the real challenge.'),
  card('gradient-descent', 'What is momentum in gradient descent?', 'Adds a fraction of the previous update to the current one: v = β×v - α×∇L, θ = θ + v. Helps escape saddle points and smooths noisy gradients. β typically 0.9.'),
  card('gradient-descent', 'What is Adam optimizer?', 'Combines momentum + RMSprop. Adapts learning rate per parameter. First/second moment estimates with bias correction. Default choice for most deep learning.', 'code', 'optimizer = torch.optim.Adam(model.parameters(), lr=0.001)'),
];

const regularization: LocalFlashcard[] = [
  card('regularization', 'What is regularization?', 'Adding a penalty term to the loss function to prevent overfitting. Discourages large weights. Loss = Original_Loss + λ × Penalty.'),
  card('regularization', 'What is L1 (Lasso) regularization?', 'Penalty = λ × Σ|wᵢ|. Pushes weights to exactly zero → feature selection. Produces sparse models. Good when you suspect many irrelevant features.', 'formula'),
  card('regularization', 'What is L2 (Ridge) regularization?', 'Penalty = λ × Σwᵢ². Pushes weights toward zero but not exactly zero. Prevents any single feature from dominating. More stable than L1.', 'formula'),
  card('regularization', 'What is Elastic Net?', 'Combines L1 + L2: λ₁Σ|wᵢ| + λ₂Σwᵢ². Gets both feature selection (L1) and stability (L2). Use when features are correlated.'),
  card('regularization', 'What is the λ (lambda) hyperparameter?', 'Controls regularization strength. λ = 0: no regularization. Large λ: heavy penalty, simpler model, risk underfitting. Tuned via cross-validation.'),
  card('regularization', 'What is dropout as regularization?', 'Randomly sets a fraction of neurons to 0 during training. Forces network to not rely on any single neuron. Like training an ensemble of sub-networks.'),
];

const crossValidation: LocalFlashcard[] = [
  card('cross-validation', 'What is cross-validation?', 'Technique to evaluate model performance by splitting data into K folds. Train on K-1 folds, test on 1 fold. Repeat K times. Average scores for reliable estimate.'),
  card('cross-validation', 'What is K-Fold cross-validation?', 'Split data into K equal parts. Each fold serves as test set once. K=5 or K=10 is standard. More reliable than single train-test split.'),
  card('cross-validation', 'What is stratified K-Fold?', 'Ensures each fold has the same proportion of each class as the full dataset. Essential for imbalanced datasets.', 'code', 'from sklearn.model_selection import StratifiedKFold\nskf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)'),
  card('cross-validation', 'What is Leave-One-Out (LOO)?', 'K = n (number of samples). Train on n-1, test on 1. Most thorough but computationally expensive. Best for very small datasets.'),
  card('cross-validation', 'Why not just use a single train-test split?', 'Results depend on which samples end up in test set. Cross-validation gives mean ± std, showing how stable the model performs across different splits.'),
];

const biasVarianceTradeoff: LocalFlashcard[] = [
  card('bias-variance-tradeoff', 'What is bias?', 'Error from wrong assumptions in the model. High bias = model too simple, misses patterns (underfitting). Example: linear model for non-linear data.'),
  card('bias-variance-tradeoff', 'What is variance?', 'Error from sensitivity to training data fluctuations. High variance = model too complex, memorizes noise (overfitting). Example: deep tree on small data.'),
  card('bias-variance-tradeoff', 'What is the bias-variance tradeoff?', 'Total Error = Bias² + Variance + Irreducible Noise. Decreasing bias typically increases variance and vice versa. Goal: minimize total error.', 'formula'),
  card('bias-variance-tradeoff', 'How to diagnose high bias?', 'Training accuracy is low. Training and validation accuracy are similar but both bad. Solution: more complex model, more features, less regularization.'),
  card('bias-variance-tradeoff', 'How to diagnose high variance?', 'Training accuracy is high but validation accuracy is low (big gap). Solution: more data, regularization, simpler model, dropout, early stopping.'),
  card('bias-variance-tradeoff', 'What is the sweet spot?', 'The model complexity where bias + variance is minimized. Found via cross-validation. Ensemble methods (Random Forest, Gradient Boosting) often achieve this.'),
];

// ═══════════════════════════════════════════════════════
// PATH 4: DEEP LEARNING (15 topics)
// ═══════════════════════════════════════════════════════

const neuralNetworks: LocalFlashcard[] = [
  card('neural-networks', 'What is a neural network?', 'A computational model inspired by the brain. Layers of interconnected neurons: Input → Hidden layers → Output. Each connection has a weight. Learns by adjusting weights.'),
  card('neural-networks', 'What is a perceptron?', 'Simplest neural network: single neuron. Output = activation(w₁x₁ + w₂x₂ + ... + b). Can only learn linearly separable functions. Stacking them creates MLPs.'),
  card('neural-networks', 'What is a hidden layer?', 'Layers between input and output. Each neuron computes: z = wx + b, then applies activation function. More hidden layers = deeper network = can learn more complex patterns.'),
  card('neural-networks', 'What is forward propagation?', 'Input flows through the network layer by layer. Each layer computes: output = activation(weight × input + bias). Final layer produces the prediction.'),
  card('neural-networks', 'What is a loss function in neural networks?', 'Measures how wrong the prediction is. MSE for regression, Cross-Entropy for classification. The goal of training is to minimize this loss.'),
  card('neural-networks', 'What is the universal approximation theorem?', 'A neural network with a single hidden layer of sufficient width can approximate any continuous function. This is why NNs are so powerful.'),
];

const backpropagation: LocalFlashcard[] = [
  card('backpropagation', 'What is backpropagation?', 'Algorithm to compute gradients efficiently. Propagates the error backward from output to input using the chain rule. Each layer computes its contribution to the total gradient.'),
  card('backpropagation', 'How does backprop work step by step?', '1) Forward pass: compute predictions. 2) Compute loss. 3) Backward pass: compute gradients using chain rule. 4) Update weights: w = w - lr × gradient.'),
  card('backpropagation', 'What is the vanishing gradient problem?', 'In deep networks, gradients become exponentially small in early layers (because of multiplying many small numbers < 1). Early layers stop learning. Solutions: ReLU, skip connections, better initialization.'),
  card('backpropagation', 'What is the exploding gradient problem?', 'Gradients become exponentially large, causing unstable training. Solutions: gradient clipping, weight initialization (Xavier/He), batch normalization.'),
  card('backpropagation', 'What is automatic differentiation?', 'Computing derivatives automatically via computational graphs. PyTorch uses dynamic autograd, TensorFlow uses static/dynamic. No manual gradient math needed.', 'code', 'x = torch.tensor(3.0, requires_grad=True)\ny = x**2 + 2*x\ny.backward()\nprint(x.grad)  # 8.0 (derivative: 2x + 2 at x=3)'),
];

const activationFunctions: LocalFlashcard[] = [
  card('activation-functions', 'What is an activation function?', 'Non-linear function applied to neuron output. Without it, the entire network would be a linear function regardless of depth. Introduces non-linearity for complex patterns.'),
  card('activation-functions', 'What is ReLU?', 'Rectified Linear Unit: f(x) = max(0, x). Most popular activation. Fast to compute. Solves vanishing gradient for positive values. Problem: "dying ReLU" for negative inputs.'),
  card('activation-functions', 'What is sigmoid?', 'σ(x) = 1/(1+e⁻ˣ). Output range (0,1). Used for binary classification output. Problem: vanishing gradients at extremes, not zero-centered.'),
  card('activation-functions', 'What is softmax?', 'Generalizes sigmoid to multiple classes: softmax(zᵢ) = eᶻⁱ/Σeᶻʲ. Outputs sum to 1 (probability distribution). Always used in last layer for multi-class.', 'formula'),
  card('activation-functions', 'What is Leaky ReLU?', 'f(x) = x if x > 0, αx if x ≤ 0 (α usually 0.01). Fixes dying ReLU by allowing small gradient for negative values.'),
  card('activation-functions', 'What is GELU?', 'Gaussian Error Linear Unit: x × Φ(x) where Φ = CDF of normal distribution. Used in Transformers (BERT, GPT). Smoother than ReLU, better for NLP tasks.'),
];

const optimizationAlgorithms: LocalFlashcard[] = [
  card('optimization-algorithms', 'What is SGD with Momentum?', 'Adds velocity: v = βv - α∇L, θ = θ + v. Accelerates convergence in consistent gradient directions. β (momentum) typically 0.9.'),
  card('optimization-algorithms', 'What is Adam?', 'Adaptive Moment Estimation. Combines momentum (first moment) + RMSprop (second moment) with bias correction. Default optimizer for most tasks. lr=0.001 typical.'),
  card('optimization-algorithms', 'What is RMSprop?', 'Divides learning rate by running average of gradient magnitudes. Adapts per-parameter. Good for non-stationary objectives like RNNs.'),
  card('optimization-algorithms', 'What is learning rate scheduling?', 'Changing learning rate during training. Step decay, exponential decay, cosine annealing, warmup + decay. Helps fine-tune convergence.'),
  card('optimization-algorithms', 'What is AdamW?', 'Adam with decoupled weight decay. Fixes L2 regularization issue in Adam. Standard in modern transformers. lr=3e-4 is a common starting point.'),
];

const batchNormalization: LocalFlashcard[] = [
  card('batch-normalization', 'What is Batch Normalization?', 'Normalizes layer inputs to have mean=0, std=1 within each mini-batch. Then applies learnable scale (γ) and shift (β). Stabilizes and accelerates training.'),
  card('batch-normalization', 'Why does BatchNorm work?', 'Reduces internal covariate shift (changing input distributions between layers). Allows higher learning rates. Acts as mild regularization. Smooths loss landscape.'),
  card('batch-normalization', 'Where to place BatchNorm?', 'Usually after the linear layer and before activation: Linear → BatchNorm → ReLU. Some papers argue after activation works too.'),
  card('batch-normalization', 'What is Layer Normalization?', 'Normalizes across features instead of across batch. Better for variable-length sequences (NLP). Used in Transformers instead of BatchNorm.'),
  card('batch-normalization', 'BatchNorm at inference time?', 'Uses running mean/variance computed during training (not batch statistics). Call model.eval() in PyTorch to switch to inference mode.'),
];

const dropout: LocalFlashcard[] = [
  card('dropout', 'What is Dropout?', 'Randomly sets neurons to 0 during training with probability p. Forces the network to distribute learned representations. Most effective regularization for NNs.'),
  card('dropout', 'What is the dropout rate?', 'Fraction of neurons to zero out. Common: p=0.5 for hidden layers, p=0.1-0.3 for input. Too high = underfitting. Too low = minimal effect.'),
  card('dropout', 'How does dropout work at test time?', 'No dropout at test time! Instead, multiply weights by (1-p) to compensate for the missing neurons. PyTorch handles this automatically (inverted dropout).'),
  card('dropout', 'Why is dropout like ensemble learning?', 'Each training step uses a different subnetwork. Effectively training 2ⁿ networks (n = neurons). At test time, you\'re averaging all these subnetworks.'),
  card('dropout', 'When NOT to use dropout?', 'BatchNorm already provides regularization. Very small datasets (use data augmentation instead). When using skip connections heavily (ResNets rarely use dropout).'),
];

const cnn: LocalFlashcard[] = [
  card('convolutional-neural-networks', 'What is a CNN?', 'Convolutional Neural Network — specialized for grid-like data (images). Uses convolutional layers that learn spatial patterns (edges, textures, objects) hierarchically.'),
  card('convolutional-neural-networks', 'What is a convolution operation?', 'Sliding a small filter (kernel) across the input, computing dot product at each position. Produces a feature map. Detects local patterns regardless of position.'),
  card('convolutional-neural-networks', 'What is a convolutional layer?', 'Has multiple learnable filters. Each filter detects a different pattern. Early layers: edges, textures. Later layers: parts, objects. Parameters shared across positions.'),
  card('convolutional-neural-networks', 'What is stride and padding?', 'Stride: step size of the filter. Stride 2 halves the output size. Padding: adding zeros around input to maintain spatial dimensions (usually "same" padding).'),
  card('convolutional-neural-networks', 'What is the architecture of a typical CNN?', 'Conv → ReLU → Pool → Conv → ReLU → Pool → ... → Flatten → Dense → Output. Each conv-pool block extracts higher-level features.'),
  card('convolutional-neural-networks', 'What are famous CNN architectures?', 'LeNet (1998): pioneer. AlexNet (2012): deep learning revolution. VGG (2014): very deep. ResNet (2015): skip connections. EfficientNet: scaling.'),
];

const poolingLayers: LocalFlashcard[] = [
  card('pooling-layers', 'What is pooling?', 'Downsampling operation that reduces spatial dimensions. Reduces computation and parameters. Provides translation invariance. Applied after convolution.'),
  card('pooling-layers', 'What is Max Pooling?', 'Takes the maximum value in each window. Most common pooling. Preserves strongest activations. Typical: 2×2 window, stride 2 → halves dimensions.'),
  card('pooling-layers', 'What is Average Pooling?', 'Takes the mean of each window. Smoother than max pooling. Global Average Pooling (GAP) averages entire feature map → used before final classifier.'),
  card('pooling-layers', 'Why is Global Average Pooling popular?', 'Replaces fully connected layers at the end of CNN. No parameters. Reduces overfitting. Network-in-Network paper introduced this idea.'),
  card('pooling-layers', 'Max Pooling vs Strided Convolution?', 'Strided conv is learnable (unlike fixed max pooling). Modern architectures increasingly use strided conv instead. But max pooling is simpler and still works well.'),
];

const transferLearning: LocalFlashcard[] = [
  card('transfer-learning', 'What is transfer learning?', 'Using a model trained on one task as a starting point for another. Pre-trained on large dataset (ImageNet), fine-tuned on your smaller dataset. Saves time and data.'),
  card('transfer-learning', 'What is fine-tuning?', 'Taking a pre-trained model and training it further on your data. Strategies: freeze early layers (general features), train later layers (task-specific). Gradually unfreeze.'),
  card('transfer-learning', 'When to use transfer learning?', 'Small dataset. Similar domain to pre-training data. Limited computational resources. Almost always beneficial — rarely hurts performance.'),
  card('transfer-learning', 'What is feature extraction vs fine-tuning?', 'Feature extraction: freeze all pretrained layers, only train the new classifier head. Fine-tuning: unfreeze some/all layers and train with very low learning rate.'),
  card('transfer-learning', 'Code: Transfer Learning with PyTorch', 'Load pretrained model and modify the final layer.', 'code', 'import torchvision.models as models\nmodel = models.resnet50(pretrained=True)\nfor param in model.parameters():\n    param.requires_grad = False\nmodel.fc = nn.Linear(2048, num_classes)'),
];

const rnn: LocalFlashcard[] = [
  card('recurrent-neural-networks', 'What is an RNN?', 'Recurrent Neural Network — processes sequences by maintaining hidden state. Same weights applied at each timestep. Output depends on current input AND previous hidden state.'),
  card('recurrent-neural-networks', 'What is the hidden state?', 'Memory of the RNN. Updated at each step: h_t = tanh(W_hh × h_{t-1} + W_xh × x_t + b). Captures information from all previous timesteps.'),
  card('recurrent-neural-networks', 'What are RNN applications?', 'Text generation, machine translation, speech recognition, sentiment analysis, time series prediction, music generation. Anything sequential.'),
  card('recurrent-neural-networks', 'What is the vanishing gradient problem in RNNs?', 'Gradients shrink exponentially over long sequences. RNN "forgets" early inputs. Solution: LSTM and GRU architectures with gating mechanisms.'),
  card('recurrent-neural-networks', 'What are bidirectional RNNs?', 'Process sequence in both directions (forward + backward). Captures context from both past and future. Used in NER, translation, and BERT-like models.'),
];

const lstm: LocalFlashcard[] = [
  card('lstm', 'What is LSTM?', 'Long Short-Term Memory — RNN variant that handles long-range dependencies. Uses cell state (highway) and three gates: forget, input, output. Solves vanishing gradient.'),
  card('lstm', 'What is the forget gate?', 'Decides what to remove from cell state: f_t = σ(W_f × [h_{t-1}, x_t] + b_f). Output 0 = forget completely, 1 = keep. "Should I remember or forget old info?"'),
  card('lstm', 'What is the input gate?', 'Decides what new info to store: i_t = σ(W_i × [h_{t-1}, x_t]). Creates candidate values: C̃_t = tanh(W_C × [h_{t-1}, x_t]). "What new info should I memorize?"'),
  card('lstm', 'What is the output gate?', 'Decides what to output from cell state: o_t = σ(W_o × [h_{t-1}, x_t]). Hidden state: h_t = o_t × tanh(C_t). "What should I share with the next layer?"'),
  card('lstm', 'Why does LSTM solve vanishing gradients?', 'Cell state provides an uninterrupted gradient highway. Forget gate allows gradient flow through many timesteps. Additive updates instead of multiplicative.'),
];

const gru: LocalFlashcard[] = [
  card('gru', 'What is GRU?', 'Gated Recurrent Unit — simplified LSTM. Two gates instead of three: reset gate and update gate. Fewer parameters, similar performance to LSTM on many tasks.'),
  card('gru', 'What is the update gate?', 'Combines LSTM\'s forget and input gates: z_t = σ(W_z × [h_{t-1}, x_t]). Controls how much of previous state to keep vs how much of new candidate to use.'),
  card('gru', 'What is the reset gate?', 'r_t = σ(W_r × [h_{t-1}, x_t]). Controls how much of previous state to use when computing candidate hidden state. Low reset = ignore history.'),
  card('gru', 'GRU vs LSTM — which to use?', 'GRU: fewer parameters, faster training, works well on smaller datasets. LSTM: slightly more powerful for very long sequences. In practice, performance is often similar.'),
  card('gru', 'Are RNN/LSTM/GRU still relevant?', 'Transformers have largely replaced them for NLP. But RNNs still useful for: real-time streaming, resource-constrained devices, simple sequence tasks, and certain time series.'),
];

const attentionMechanism: LocalFlashcard[] = [
  card('attention-mechanism', 'What is attention?', 'Mechanism that lets a model focus on relevant parts of the input. Instead of compressing everything into one vector, attention creates a weighted combination based on relevance.'),
  card('attention-mechanism', 'What is the attention formula?', 'Attention(Q, K, V) = softmax(QKᵀ/√d_k) × V. Query asks "what am I looking for?", Key answers "what do I contain?", Value provides "here\'s my content".', 'formula'),
  card('attention-mechanism', 'Why divide by √d_k?', 'Scaled dot-product attention. Without scaling, large dimensions cause very large dot products → very peaked softmax (near one-hot) → vanishing gradients.'),
  card('attention-mechanism', 'What is self-attention?', 'Q, K, V all come from the same sequence. Each word attends to all other words. Captures relationships regardless of distance. Foundation of Transformers.'),
  card('attention-mechanism', 'What problem does attention solve?', 'Eliminates the information bottleneck of fixed-size hidden state. Long sequences no longer suffer from vanishing gradients. Direct connections between any two positions.'),
];

const transformers: LocalFlashcard[] = [
  card('transformers', 'What is a Transformer?', 'Architecture based entirely on self-attention. No recurrence or convolution. Processes entire sequence in parallel. Foundation of GPT, BERT, and all modern NLP.'),
  card('transformers', 'What is the Transformer architecture?', 'Encoder-Decoder structure. Encoder: self-attention + feed-forward (×N). Decoder: masked self-attention + cross-attention + feed-forward (×N). Plus positional encoding.'),
  card('transformers', 'What is positional encoding?', 'Since Transformers process all positions simultaneously, they need position info. Original paper uses sin/cos functions. Modern models learn positions.'),
  card('transformers', 'What is multi-head attention?', 'Run attention multiple times in parallel with different learned projections. Each head can attend to different aspects. Outputs concatenated and projected.'),
  card('transformers', 'Why are Transformers better than RNNs?', 'Parallel processing (much faster). No sequential bottleneck. Direct long-range connections. Scale better with data and compute. Enable large language models.'),
  card('transformers', 'What are the key innovations in Transformers?', 'Self-attention for global context. Multi-head for multiple attention patterns. Layer normalization for stability. Residual connections for gradient flow.'),
];

const selfAttention: LocalFlashcard[] = [
  card('self-attention', 'How does self-attention compute context?', 'For each word: 1) Compute Q, K, V projections. 2) Score = Q·Kᵀ of all pairs. 3) softmax(scores/√d). 4) Weighted sum of V. Result: context-aware representation.'),
  card('self-attention', 'What is masked self-attention?', 'Used in decoders (GPT). Masks future positions so each position can only attend to previous positions. Prevents information leakage during autoregressive generation.'),
  card('self-attention', 'What is cross-attention?', 'Q comes from decoder, K and V from encoder. Lets the decoder focus on relevant parts of the input. Used in encoder-decoder models (translation, summarization).'),
  card('self-attention', 'What is the complexity of self-attention?', 'O(n²d) where n = sequence length, d = dimension. Quadratic in sequence length. This is why there\'s research on efficient attention (linear attention, sparse attention).'),
  card('self-attention', 'Self-attention vs convolution?', 'Self-attention: global receptive field from layer 1, permutation equivariant. Convolution: local receptive field, translation equivariant. Attention is more flexible but more expensive.'),
];

// ═══════════════════════════════════════════════════════
// PATH 5: MODERN AI (11 topics)
// ═══════════════════════════════════════════════════════

const wordEmbeddings: LocalFlashcard[] = [
  card('word-embeddings', 'What are word embeddings?', 'Dense vector representations of words where similar words have similar vectors. Map discrete words to continuous space. Capture semantic meaning (king - man + woman ≈ queen).'),
  card('word-embeddings', 'Why not use one-hot encoding for words?', 'One-hot vectors are sparse, high-dimensional, and all equidistant. No semantic similarity. Vocabulary of 50k words = 50k-dimensional vectors. Embeddings solve all these issues.'),
  card('word-embeddings', 'What is the embedding layer?', 'A lookup table: word index → dense vector. Learnable during training. Each word maps to a fixed-size vector (128, 256, 768 dimensions typically).'),
  card('word-embeddings', 'What is cosine similarity?', 'Measures angle between two vectors: cos(θ) = (a·b)/(‖a‖‖b‖). Range [-1, 1]. 1 = identical direction. Used to find similar words/documents.', 'formula'),
  card('word-embeddings', 'What are pre-trained embeddings?', 'Embeddings trained on massive text corpora: Word2Vec (Google), GloVe (Stanford), FastText (Facebook). Use as starting point for your task. Transfer learning for words.'),
];

const word2vec: LocalFlashcard[] = [
  card('word2vec', 'What is Word2Vec?', 'Neural network-based method to learn word embeddings. Two architectures: Skip-gram (predict context from word) and CBOW (predict word from context). Published by Google, 2013.'),
  card('word2vec', 'What is Skip-gram?', 'Given a center word, predict surrounding context words. Better for rare words. Example: "The cat sat on the mat" → given "sat", predict "cat", "on".'),
  card('word2vec', 'What is CBOW?', 'Continuous Bag of Words: predict center word from context words. Faster than Skip-gram. Better for frequent words. Averages context word vectors.'),
  card('word2vec', 'What is negative sampling?', 'Optimization trick: instead of computing softmax over entire vocabulary, sample a few "negative" (unrelated) words. Makes training practical for large vocabularies.'),
  card('word2vec', 'What properties do Word2Vec embeddings have?', 'Algebraic relationships: king - man + woman ≈ queen. Paris - France + Italy ≈ Rome. Beautiful semantic structure emerges from co-occurrence patterns.'),
];

const bert: LocalFlashcard[] = [
  card('bert', 'What is BERT?', 'Bidirectional Encoder Representations from Transformers (Google, 2018). Pre-trained on massive text using masked language modeling. State-of-the-art for understanding tasks.'),
  card('bert', 'What is Masked Language Modeling (MLM)?', 'BERT\'s pre-training objective. Randomly mask 15% of tokens, model predicts them. Forces bidirectional understanding. "The [MASK] sat on the mat" → predict "cat".'),
  card('bert', 'What is Next Sentence Prediction (NSP)?', 'BERT\'s second pre-training objective. Given two sentences, predict if the second follows the first. Helps with tasks needing sentence-pair understanding.'),
  card('bert', 'How to fine-tune BERT?', 'Add a task-specific head on top of BERT. Classification: [CLS] token → linear layer. NER: each token → label. Train end-to-end with small learning rate (2e-5).'),
  card('bert', 'What are BERT variants?', 'RoBERTa: better training recipe. ALBERT: smaller model. DistilBERT: 60% smaller, 97% performance. DeBERTa: disentangled attention. XLNet: permutation LM.'),
];

const gptArchitecture: LocalFlashcard[] = [
  card('gpt-architecture', 'What is GPT?', 'Generative Pre-trained Transformer (OpenAI). Decoder-only transformer. Trained to predict next token. Auto-regressive: generates one token at a time. GPT-4 has ~1.7T parameters.'),
  card('gpt-architecture', 'How is GPT different from BERT?', 'GPT: decoder-only, left-to-right, generative (creates text). BERT: encoder-only, bidirectional, discriminative (understanding). GPT generates, BERT classifies.'),
  card('gpt-architecture', 'What is autoregressive generation?', 'Predicts tokens one at a time, left to right. Each prediction is conditioned on all previous tokens. P(text) = P(w₁) × P(w₂|w₁) × P(w₃|w₁,w₂) × ...'),
  card('gpt-architecture', 'What is the scaling hypothesis?', 'Performance improves predictably with more data, compute, and parameters. GPT-3 showed emergent abilities appear at scale. Led to the "bitter lesson" — scaling > clever algorithms.'),
  card('gpt-architecture', 'What is in-context learning?', 'GPT can perform tasks from just examples in the prompt, without any fine-tuning. Zero-shot: just instructions. Few-shot: a few examples. No weight updates needed.'),
];

const fineTuning: LocalFlashcard[] = [
  card('fine-tuning', 'What is fine-tuning?', 'Taking a pre-trained model and training it further on task-specific data. Much less data needed than training from scratch. The transfer learning paradigm for LLMs.'),
  card('fine-tuning', 'What is LoRA?', 'Low-Rank Adaptation. Freezes original weights, adds small trainable matrices. Reduces trainable parameters by 99%+. Can fine-tune 7B model on consumer GPU.'),
  card('fine-tuning', 'What is RLHF?', 'Reinforcement Learning from Human Feedback. Train a reward model from human preferences, then optimize LLM using PPO. How ChatGPT was aligned to be helpful and safe.'),
  card('fine-tuning', 'What is instruction tuning?', 'Fine-tuning on (instruction, response) pairs. Teaches the model to follow instructions. FLAN, Alpaca, and ChatGPT all use instruction tuning.'),
  card('fine-tuning', 'Full fine-tuning vs parameter-efficient methods?', 'Full: update all weights (expensive, risk forgetting). LoRA/QLoRA: update small adapters (cheap, preserves knowledge). Prompt tuning: only tune soft prompts.'),
];

const promptEngineering: LocalFlashcard[] = [
  card('prompt-engineering', 'What is prompt engineering?', 'Crafting input text to get desired output from LLMs. The "programming language" of AI. Good prompts: clear, specific, structured, with examples.'),
  card('prompt-engineering', 'What is zero-shot vs few-shot prompting?', 'Zero-shot: just instructions ("Classify sentiment: ..."). Few-shot: include examples ("Positive: I love this. Negative: Terrible. Classify: ..."). Few-shot usually performs better.'),
  card('prompt-engineering', 'What is Chain-of-Thought prompting?', '"Let\'s think step by step." Dramatically improves reasoning by making the model show its work. Works best on math, logic, and multi-step problems.'),
  card('prompt-engineering', 'What is the system prompt?', 'Instructions that set the model\'s behavior and persona. Processed before user messages. Controls tone, format, constraints. "You are a helpful coding assistant..."'),
  card('prompt-engineering', 'What are common prompting patterns?', 'Role-playing: "You are an expert..." | Structured output: "Respond in JSON" | Constraints: "In 3 bullet points" | Chain-of-thought: "Explain your reasoning"'),
];

const rag: LocalFlashcard[] = [
  card('rag', 'What is RAG?', 'Retrieval-Augmented Generation. Combines LLM with a knowledge base. Steps: 1) Retrieve relevant documents, 2) Add to prompt as context, 3) LLM generates answer from context.'),
  card('rag', 'Why use RAG instead of fine-tuning?', 'No retraining needed. Always up-to-date. Grounded in facts (reduces hallucination). Cheaper. Can cite sources. Better for domain-specific knowledge.'),
  card('rag', 'What are vector databases?', 'Stores document embeddings for fast similarity search. Convert text → vectors → store. Query: convert question → vector → find similar documents. Examples: Pinecone, Weaviate, ChromaDB.'),
  card('rag', 'What is chunking in RAG?', 'Splitting documents into smaller pieces (chunks) before embedding. Chunk size matters: too small = lost context, too large = diluted relevance. Typical: 500-1000 tokens with overlap.'),
  card('rag', 'What is the RAG pipeline?', '1) Index: chunk documents → embed → store in vector DB. 2) Retrieve: embed query → similarity search → top-K chunks. 3) Generate: prompt = instruction + retrieved chunks + question → LLM answer.'),
];

const diffusionModels: LocalFlashcard[] = [
  card('diffusion-models', 'What are Diffusion Models?', 'Generative models that learn to denoise. Forward: gradually add noise to data. Reverse: learn to remove noise step by step. Generate images by denoising random noise.'),
  card('diffusion-models', 'How does the forward process work?', 'Gradually add Gaussian noise over T timesteps until data becomes pure noise. Each step: x_t = √(1-β_t) × x_{t-1} + √β_t × ε. β is the noise schedule.'),
  card('diffusion-models', 'How does the reverse process work?', 'A neural network learns to predict and remove noise at each step. Starting from pure noise, iteratively denoise to generate clean data. Takes 20-1000 steps.'),
  card('diffusion-models', 'What is classifier-free guidance?', 'Controls generation quality vs diversity. Higher guidance scale → more adherence to prompt, less diversity. Typical scale: 7-12 for good balance.'),
  card('diffusion-models', 'Diffusion vs GANs?', 'Diffusion: more stable training, better diversity, slower generation. GANs: fast generation, mode collapse risk, harder to train. Diffusion has largely won for images.'),
];

const stableDiffusion: LocalFlashcard[] = [
  card('stable-diffusion', 'What is Stable Diffusion?', 'Open-source diffusion model by Stability AI. Key innovation: works in latent space (compressed) instead of pixel space. Much faster and runs on consumer GPUs.'),
  card('stable-diffusion', 'What is the latent space?', 'Compressed representation of images via a VAE encoder. 512×512 image → 64×64 latent. Diffusion happens in this small space, then decoded back to pixels.'),
  card('stable-diffusion', 'What is the text encoder in Stable Diffusion?', 'CLIP text encoder converts text prompts into embeddings. These embeddings guide the denoising process through cross-attention in the U-Net.'),
  card('stable-diffusion', 'What is ControlNet?', 'Adds spatial conditioning to Stable Diffusion. Control generation with edges, poses, depth maps. Generate images that follow specific compositions.'),
  card('stable-diffusion', 'What is img2img?', 'Start from an existing image instead of pure noise. Add some noise, then denoise with new prompt. Controls: strength parameter (0 = keep original, 1 = completely new).'),
];

const visionTransformers: LocalFlashcard[] = [
  card('vision-transformers', 'What is ViT (Vision Transformer)?', 'Applies transformer architecture to images. Splits image into patches (16×16), linearly embeds them, adds position encoding, processes with standard transformer encoder.'),
  card('vision-transformers', 'How does ViT process images?', 'Image → patches → flatten → linear projection → add position embeddings → transformer encoder → classification head on [CLS] token.'),
  card('vision-transformers', 'ViT vs CNN?', 'ViT: global attention from layer 1, needs more data, better at very large scale. CNN: local → global, better inductive bias, works well with less data.'),
  card('vision-transformers', 'What is DeiT?', 'Data-efficient Image Transformer. Makes ViT work with less data using knowledge distillation from CNN teacher and strong augmentation. Practical ViT.'),
  card('vision-transformers', 'What is CLIP?', 'Contrastive Language-Image Pre-training (OpenAI). Jointly trains image and text encoders. Can classify ANY category from text description. Zero-shot image classification.'),
];

const multimodalModels: LocalFlashcard[] = [
  card('multimodal-models', 'What are multimodal models?', 'Models that process multiple data types: text, images, audio, video. Examples: GPT-4V (text+image), DALL-E (text→image), Whisper (audio→text).'),
  card('multimodal-models', 'How do multimodal models combine modalities?', 'Encode each modality with specialized encoder → project to shared embedding space → fuse with attention/concatenation → decode to desired output modality.'),
  card('multimodal-models', 'What is CLIP and why is it important?', 'Connects images and text in shared space. Enables: zero-shot classification, image search by text, image generation guidance. Foundation for Stable Diffusion and GPT-4V.'),
  card('multimodal-models', 'What is GPT-4V?', 'GPT-4 with vision capabilities. Can understand images alongside text. Applications: describe images, answer visual questions, read charts, OCR, visual reasoning.'),
  card('multimodal-models', 'What is the future of multimodal AI?', 'Unified models handling all modalities. "Any-to-any" generation. Gemini, GPT-4o moving this direction. Ultimate goal: AI that perceives the world like humans.'),
];

// ═══════════════════════════════════════════════════════
// PATH 6: MLOPS & DEPLOYMENT (10 topics)
// ═══════════════════════════════════════════════════════

const modelSerialization: LocalFlashcard[] = [
  card('model-serialization', 'What is model serialization?', 'Saving a trained model to disk for later use. Preserves weights, architecture, and sometimes optimizer state. Essential for deployment and reproducibility.'),
  card('model-serialization', 'What are common serialization formats?', 'PyTorch: .pt/.pth (torch.save). TensorFlow: SavedModel, .h5. Scikit-learn: pickle, joblib. ONNX: cross-framework format. TorchScript for production.'),
  card('model-serialization', 'What is ONNX?', 'Open Neural Network Exchange. Framework-agnostic format. Train in PyTorch, deploy with ONNX Runtime. Enables optimization and cross-platform deployment.', 'code', 'torch.onnx.export(model, dummy_input, "model.onnx")\nimport onnxruntime as ort\nsession = ort.InferenceSession("model.onnx")'),
  card('model-serialization', 'What is model versioning?', 'Tracking model iterations: version number, training data, hyperparameters, metrics. Tools: MLflow, DVC, Weights & Biases. Essential for reproducibility.'),
  card('model-serialization', 'What is quantization?', 'Reducing model precision (FP32 → INT8). 4x smaller model, faster inference, minimal accuracy loss. Post-training quantization or quantization-aware training.'),
];

const dockerBasics: LocalFlashcard[] = [
  card('docker-basics', 'What is Docker?', 'Containerization platform. Packages your app + all dependencies into a portable container. "Works on my machine" → "Works everywhere." Essential for ML deployment.'),
  card('docker-basics', 'What is a Dockerfile?', 'Blueprint for building a Docker image. Instructions: FROM (base image), RUN (execute commands), COPY (add files), CMD (default command).', 'code', 'FROM python:3.11-slim\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . /app\nWORKDIR /app\nCMD ["python", "serve.py"]'),
  card('docker-basics', 'What is Docker image vs container?', 'Image: blueprint/template (read-only). Container: running instance of an image. One image → many containers. Like class vs object.'),
  card('docker-basics', 'Why Docker for ML?', 'Reproducible environments. GPU support (nvidia-docker). Consistent deployment. Easy scaling. Works with Kubernetes. Eliminates dependency hell.'),
  card('docker-basics', 'What is Docker Compose?', 'Define multi-container applications. One YAML file to run your API server, database, model server together. docker-compose up starts everything.'),
];

const containerization: LocalFlashcard[] = [
  card('containerization', 'Container vs Virtual Machine?', 'Container: shares host OS kernel, lightweight (MBs), starts in seconds. VM: full OS, heavy (GBs), starts in minutes. Containers win for microservices.'),
  card('containerization', 'What is a container registry?', 'Storage for Docker images. Docker Hub (public), AWS ECR, Google GCR, Azure ACR (private). Push images to registry, pull to deploy anywhere.'),
  card('containerization', 'What is multi-stage build?', 'Use multiple FROM statements to reduce final image size. Build stage has all tools. Final stage only has runtime. Can reduce image from 2GB to 200MB.'),
  card('containerization', 'How to optimize Docker images for ML?', 'Use slim base images. Multi-stage builds. Cache pip install layer. Use .dockerignore. Don\'t include training data in the image. Pin dependency versions.'),
  card('containerization', 'What is container orchestration?', 'Managing hundreds of containers: deployment, scaling, networking, load balancing. Kubernetes is the standard. Also: Docker Swarm, Amazon ECS.'),
];

const modelServing: LocalFlashcard[] = [
  card('model-serving', 'What is model serving?', 'Making a trained model available for inference via an API. Takes input, runs prediction, returns result. Must be fast, reliable, and scalable.'),
  card('model-serving', 'What are common serving frameworks?', 'FastAPI + custom code (flexible). TorchServe (PyTorch). TF Serving (TensorFlow). Triton (NVIDIA, multi-framework, GPU optimized). BentoML (ML-focused).'),
  card('model-serving', 'What is batch vs real-time inference?', 'Real-time: single prediction per request, low latency required (< 100ms). Batch: process many inputs at once, throughput matters more than latency.'),
  card('model-serving', 'What is model caching?', 'Keep model loaded in memory instead of loading from disk for each request. First request loads model, subsequent requests reuse. Critical for latency.'),
  card('model-serving', 'Code: Serve model with FastAPI', 'Simple production-ready API.', 'code', 'from fastapi import FastAPI\nimport torch\napp = FastAPI()\nmodel = torch.load("model.pt")\n\n@app.post("/predict")\ndef predict(data: dict):\n    tensor = preprocess(data)\n    result = model(tensor)\n    return {"prediction": result.item()}'),
];

const restApis: LocalFlashcard[] = [
  card('rest-apis', 'What is a REST API?', 'Representational State Transfer. HTTP-based interface: GET (read), POST (create), PUT (update), DELETE (remove). Stateless. Standard way to serve ML models.'),
  card('rest-apis', 'What is FastAPI?', 'Modern Python web framework. Automatic docs, type validation, async support, 40x faster than Flask. Best choice for ML APIs.', 'code', 'from fastapi import FastAPI\napp = FastAPI()\n\n@app.get("/health")\ndef health():\n    return {"status": "ok"}\n\n@app.post("/predict")\ndef predict(input: InputModel):\n    return model.predict(input)'),
  card('rest-apis', 'What are HTTP status codes for ML APIs?', '200: Success. 400: Bad input format. 404: Model/endpoint not found. 422: Validation error. 500: Server/prediction error. 503: Model not loaded yet.'),
  card('rest-apis', 'What is API versioning?', 'Maintain multiple API versions: /v1/predict, /v2/predict. Allows model updates without breaking existing clients. Use version in URL or headers.'),
  card('rest-apis', 'What is gRPC vs REST?', 'gRPC: binary protocol, faster, typed (protobuf), bidirectional streaming. REST: text (JSON), universal, simpler, browser-friendly. gRPC for internal ML services, REST for public.'),
];

const modelMonitoring: LocalFlashcard[] = [
  card('model-monitoring', 'What is model monitoring?', 'Tracking model performance in production. Detect: accuracy degradation, data drift, concept drift, latency issues, errors. Alert when metrics fall below thresholds.'),
  card('model-monitoring', 'What is data drift?', 'Input data distribution changes over time. Model trained on old distribution fails on new data. Example: user behavior changes post-COVID. Must detect and retrain.'),
  card('model-monitoring', 'What is concept drift?', 'The relationship between input and output changes. Even if input distribution is same, correct answers change. Example: stock market regime changes.'),
  card('model-monitoring', 'What metrics to monitor?', 'Model: accuracy, latency, throughput, error rate. Data: distribution stats, missing values, schema changes. System: CPU/GPU usage, memory, disk. Custom: business KPIs.'),
  card('model-monitoring', 'What tools exist for monitoring?', 'Prometheus + Grafana (general). Evidently AI (ML-specific drift). Weights & Biases. MLflow. WhyLabs. Amazon SageMaker Monitor.'),
];

const abTesting: LocalFlashcard[] = [
  card('ab-testing', 'What is A/B testing for models?', 'Deploy two model versions simultaneously. Route traffic: 50% model A, 50% model B. Measure which performs better on real users. Data-driven deployment decisions.'),
  card('ab-testing', 'What is canary deployment?', 'Deploy new model to small % of traffic (5-10%). Monitor metrics. If good, gradually increase to 100%. If bad, rollback quickly. Safe way to deploy.'),
  card('ab-testing', 'What is shadow deployment?', 'New model runs alongside production model but only old model serves results. Compare outputs without affecting users. No risk. Validate before going live.'),
  card('ab-testing', 'What is statistical significance?', 'Confidence that observed difference isn\'t random chance. Typically require p < 0.05 (95% confidence). Need enough samples. Don\'t declare winners too early.'),
  card('ab-testing', 'What is blue-green deployment?', 'Two identical environments: blue (current) and green (new). Switch ALL traffic from blue to green instantly. Easy rollback: just switch back. Zero downtime.'),
];

const featureStores: LocalFlashcard[] = [
  card('feature-stores', 'What is a feature store?', 'Centralized repository for ML features. Store, serve, and share features across teams and models. Solves training-serving skew. Single source of truth for features.'),
  card('feature-stores', 'What problem does it solve?', 'Without feature store: duplicate feature engineering code, training/serving inconsistency, no feature reuse, no versioning. Feature store solves all of these.'),
  card('feature-stores', 'What are online vs offline stores?', 'Offline: batch features for training (data warehouse). Online: real-time features for serving (key-value store, <10ms latency). Most feature stores have both.'),
  card('feature-stores', 'What are popular feature stores?', 'Feast (open-source). Tecton (managed). AWS SageMaker Feature Store. Hopsworks. Databricks Feature Store.'),
  card('feature-stores', 'What is training-serving skew?', 'Features computed differently during training vs serving. Causes silent model degradation. Feature store ensures same code computes features in both paths.'),
];

const mlPipelines: LocalFlashcard[] = [
  card('ml-pipelines', 'What is an ML pipeline?', 'Automated workflow: data ingestion → preprocessing → feature engineering → training → evaluation → deployment. Reproducible, monitored, and version-controlled.'),
  card('ml-pipelines', 'What are ML pipeline tools?', 'Airflow (general orchestration). Kubeflow (Kubernetes-native). MLflow (experiment tracking + model registry). Metaflow (Netflix). ZenML (modern, simple).'),
  card('ml-pipelines', 'What is CI/CD for ML?', 'Continuous Integration: auto-test data+model+code. Continuous Delivery: auto-deploy approved models. CT (Continuous Training): auto-retrain on new data.'),
  card('ml-pipelines', 'What is experiment tracking?', 'Logging hyperparameters, metrics, artifacts for every training run. Compare experiments. Reproduce results. Tools: MLflow, W&B, Neptune.', 'code', 'import mlflow\nmlflow.start_run()\nmlflow.log_param("lr", 0.001)\nmlflow.log_metric("accuracy", 0.95)\nmlflow.sklearn.log_model(model, "model")'),
  card('ml-pipelines', 'What is a model registry?', 'Central hub for model versions. Stages: staging → production → archived. Approval workflows. Rollback capability. Like Git but for model artifacts.'),
];

const kubernetesML: LocalFlashcard[] = [
  card('kubernetes-ml', 'What is Kubernetes?', 'Container orchestration platform. Manages deployment, scaling, and operations of containerized applications. K8s is the standard for production ML infrastructure.'),
  card('kubernetes-ml', 'What is a Pod?', 'Smallest deployable unit in K8s. Contains one or more containers. Your model server runs inside a Pod. Pods are ephemeral — K8s recreates them if they fail.'),
  card('kubernetes-ml', 'What is autoscaling for ML?', 'Horizontal Pod Autoscaler: scale pods based on CPU/GPU usage or custom metrics (request latency, queue length). Handle traffic spikes automatically.'),
  card('kubernetes-ml', 'What is GPU scheduling in K8s?', 'Use nvidia.com/gpu resource requests. K8s schedules pods to nodes with available GPUs. NVIDIA device plugin enables GPU sharing.'),
  card('kubernetes-ml', 'What is Kubeflow?', 'ML toolkit for Kubernetes. Provides: Jupyter notebooks, training operators (PyTorch, TF), hyperparameter tuning (Katib), model serving (KServe), pipelines.'),
];

// ═══════════════════════════════════════════════════════
// PATH 7: INTERVIEW PREPARATION (7 topics)
// ═══════════════════════════════════════════════════════

const mlInterviewQuestions: LocalFlashcard[] = [
  card('ml-interview-questions', 'Explain bias-variance tradeoff', 'Bias: error from overly simple model assumptions. Variance: error from sensitivity to training data. Total error = Bias² + Variance + Noise. Goal: minimize both.'),
  card('ml-interview-questions', 'How do you handle imbalanced datasets?', 'Oversampling (SMOTE), undersampling, weighted loss function, stratified sampling, ensemble methods, change evaluation metric (use F1/AUC instead of accuracy).'),
  card('ml-interview-questions', 'Explain gradient descent variants', 'Batch: all data, stable but slow. SGD: 1 sample, fast but noisy. Mini-batch: subset, best balance. Adam: adaptive learning rates + momentum. Always use mini-batch in practice.'),
  card('ml-interview-questions', 'What is the difference between L1 and L2 regularization?', 'L1 (Lasso): Σ|w| → sparse weights (feature selection). L2 (Ridge): Σw² → small weights (no zeros). L1 at diamond corners, L2 at circle — geometry explains sparsity.'),
  card('ml-interview-questions', 'How would you deploy a model to production?', 'Train → validate → serialize → containerize (Docker) → API (FastAPI) → deploy (K8s/cloud) → monitor (Prometheus) → A/B test → retrain pipeline.'),
  card('ml-interview-questions', 'What evaluation metrics do you use?', 'Classification: accuracy, precision, recall, F1, AUC-ROC. Regression: MSE, MAE, R², MAPE. Ranking: NDCG, MAP. Always match metric to business goal.'),
];

const codingMlAlgorithms: LocalFlashcard[] = [
  card('coding-ml-algorithms', 'Code: Linear Regression from scratch', 'Implement gradient descent for linear regression.', 'code', 'class LinearRegression:\n    def fit(self, X, y, lr=0.01, epochs=1000):\n        self.w = np.zeros(X.shape[1])\n        self.b = 0\n        for _ in range(epochs):\n            pred = X @ self.w + self.b\n            error = pred - y\n            self.w -= lr * (X.T @ error) / len(y)\n            self.b -= lr * error.mean()'),
  card('coding-ml-algorithms', 'Code: K-Means from scratch', 'Implement the basic K-Means algorithm.', 'code', 'def kmeans(X, k, iters=100):\n    centroids = X[np.random.choice(len(X), k, replace=False)]\n    for _ in range(iters):\n        dists = np.linalg.norm(X[:, None] - centroids, axis=2)\n        labels = dists.argmin(axis=1)\n        centroids = np.array([X[labels==i].mean(0) for i in range(k)])\n    return labels, centroids'),
  card('coding-ml-algorithms', 'Code: Sigmoid and Cross-Entropy', 'Core functions for logistic regression.', 'code', 'def sigmoid(z):\n    return 1 / (1 + np.exp(-z))\n\ndef cross_entropy(y, y_hat):\n    return -np.mean(y * np.log(y_hat + 1e-8) + (1-y) * np.log(1-y_hat + 1e-8))'),
  card('coding-ml-algorithms', 'Code: Softmax function', 'Multi-class output activation.', 'code', 'def softmax(z):\n    exp_z = np.exp(z - np.max(z, axis=1, keepdims=True))\n    return exp_z / exp_z.sum(axis=1, keepdims=True)'),
  card('coding-ml-algorithms', 'Code: Decision Tree split (Gini)', 'Find the best split using Gini impurity.', 'code', 'def gini(y):\n    classes = np.unique(y)\n    return 1 - sum((np.sum(y==c)/len(y))**2 for c in classes)\n\ndef best_split(X, y):\n    best_gini, best_feat, best_val = 1, 0, 0\n    for feat in range(X.shape[1]):\n        for val in np.unique(X[:, feat]):\n            left = y[X[:, feat] <= val]\n            right = y[X[:, feat] > val]\n            g = (len(left)*gini(left) + len(right)*gini(right)) / len(y)\n            if g < best_gini:\n                best_gini, best_feat, best_val = g, feat, val\n    return best_feat, best_val'),
];

const statisticsInterview: LocalFlashcard[] = [
  card('statistics-interview', 'What is p-value?', 'Probability of observing results as extreme as the test results, assuming null hypothesis is true. p < 0.05 → reject null hypothesis. Lower p = stronger evidence against null.'),
  card('statistics-interview', 'What is the Central Limit Theorem?', 'Sample means from any distribution approach normal distribution as sample size increases (n > 30). Enables hypothesis testing and confidence intervals.'),
  card('statistics-interview', 'Type I vs Type II error?', 'Type I (False Positive): reject true null hypothesis (α). Type II (False Negative): fail to reject false null (β). There\'s a tradeoff between them.'),
  card('statistics-interview', 'What is the difference between correlation and causation?', 'Correlation: two variables move together. Causation: one causes the other. Ice cream sales and drowning correlate (summer causes both). Always test with experiments.'),
  card('statistics-interview', 'Explain confidence intervals', '95% CI: if we repeated the experiment 100 times, 95 of those intervals would contain the true value. NOT "95% chance the true value is in this interval."'),
  card('statistics-interview', 'What is the law of large numbers?', 'As sample size increases, sample mean converges to population mean. Foundation of statistics. More data → more reliable estimates.'),
];

const deepLearningInterview: LocalFlashcard[] = [
  card('deep-learning-interview', 'Why does batch normalization work?', 'Reduces internal covariate shift. Smooths loss landscape. Allows higher learning rates. Acts as regularization. Enables training very deep networks.'),
  card('deep-learning-interview', 'Explain the Transformer architecture', 'Self-attention + feed-forward layers. Multi-head attention for parallel attention patterns. Positional encoding for sequence order. Layer norm + residual connections.'),
  card('deep-learning-interview', 'How does attention scale?', 'O(n²) in sequence length — quadratic. 1000 tokens = 1M attention scores. This is why context windows are limited. Solutions: sparse attention, linear attention, flash attention.'),
  card('deep-learning-interview', 'What is the dying ReLU problem?', 'When neuron output is always negative, ReLU always outputs 0, gradient is 0, neuron stops learning permanently. Fix: Leaky ReLU, PReLU, ELU, or proper initialization.'),
  card('deep-learning-interview', 'How would you choose between CNN, RNN, Transformer?', 'Images: CNN (spatial). Short sequences: RNN/LSTM. Long text/NLP: Transformer. Multimodal: Transformer. Time series: LSTM or Temporal CNN. Always start simple.'),
  card('deep-learning-interview', 'What is knowledge distillation?', 'Train a small "student" model to mimic a large "teacher" model. Student learns from soft labels (probabilities). Compress models for deployment. DistilBERT is 60% smaller, 97% performance.'),
];

const systemDesignML: LocalFlashcard[] = [
  card('system-design-ml', 'Design a recommendation system', '1) Data: user interactions, item features. 2) Model: collaborative filtering + content-based hybrid. 3) Serving: pre-compute top-K, cache popular items. 4) Scale: update model daily, serve from Redis/CDN.'),
  card('system-design-ml', 'Design a spam detection system', '1) Features: text, sender, links, frequency. 2) Model: gradient boosting or fine-tuned BERT. 3) Pipeline: real-time scoring at email ingestion. 4) Monitoring: drift detection + user feedback loop.'),
  card('system-design-ml', 'Design a search ranking system', '1) Query understanding → candidate retrieval (BM25) → re-ranking (learned model). 2) Features: relevance, freshness, personalization. 3) Online: low latency (< 200ms). 4) Feedback: click-through rate optimization.'),
  card('system-design-ml', 'How to handle model latency requirements?', 'Model optimization (quantization, pruning). Caching frequent predictions. Batch inference. GPU serving. Model distillation. Async processing for non-critical paths.'),
  card('system-design-ml', 'How to handle data at scale?', 'Data lake (S3/GCS) → ETL (Spark/Beam) → Feature store → Train (distributed). Stream: Kafka → Flink → real-time features. Batch + stream = Lambda architecture.'),
];

const caseStudies: LocalFlashcard[] = [
  card('case-studies', 'Netflix Recommendation System', 'Hybrid approach: collaborative filtering (user-item interactions) + content-based (genres, actors). Deep learning for ranking. 80% of content watched comes from recommendations.'),
  card('case-studies', 'Tesla Autopilot', 'Vision-only approach (no LiDAR). 8 cameras + neural networks. End-to-end learning from human driving data. Occupancy networks for 3D understanding. Fleet learning from millions of cars.'),
  card('case-studies', 'GPT and the Scaling Revolution', 'GPT-1: 117M params. GPT-2: 1.5B. GPT-3: 175B. GPT-4: ~1.7T. Performance scales predictably with compute, data, and parameters. Emergent abilities at scale.'),
  card('case-studies', 'AlphaFold — Protein Structure Prediction', 'DeepMind solved 50-year biology problem. Transformer + attention over amino acid sequences and 3D coordinates. Predicted structures for 200M proteins. Revolutionary for drug discovery.'),
  card('case-studies', 'Spotify Discover Weekly', 'Collaborative filtering + NLP on playlists + audio analysis. Creates personalized playlists. 30+ models working together. Drives 200M+ hours of listening per month.'),
];

const behavioralQuestions: LocalFlashcard[] = [
  card('behavioral-questions', 'Tell me about a challenging ML project', 'Structure: Situation → Task → Action → Result. Focus on: technical challenge, how you debugged, what you learned. Show ownership and problem-solving.'),
  card('behavioral-questions', 'How do you handle disagreements about model choice?', 'Data-driven approach: propose experiment, compare metrics. Understand business requirements. Listen to domain experts. Prototype both approaches. Let results decide.'),
  card('behavioral-questions', 'How do you stay current with ML research?', 'Read papers (arXiv, Papers With Code). Follow researchers on Twitter/X. Attend conferences (NeurIPS, ICML). Practice on Kaggle. Build side projects. Join communities.'),
  card('behavioral-questions', 'Describe a time your model failed in production', 'Be honest. Explain: what happened, how you detected it (monitoring), root cause analysis, fix implemented, what you learned. Show maturity and process.'),
  card('behavioral-questions', 'How do you explain complex ML concepts to non-technical stakeholders?', 'Use analogies. Focus on business impact, not algorithms. Visualize results. Avoid jargon. Show confidence intervals, not just numbers. Tell a story with data.'),
];

// ═══════════════════════════════════════════════════════
// MASTER MAP: slug → flashcards
// ═══════════════════════════════════════════════════════

export const localFlashcardDB: Record<string, LocalFlashcard[]> = {
  // Path 1: Math for ML
  'vectors-matrices': vectorsMatrices,
  'matrix-operations': matrixOperations,
  'eigenvalues-eigenvectors': eigenvaluesEigenvectors,
  'derivatives-gradients': derivativesGradients,
  'partial-derivatives': partialDerivatives,
  'chain-rule': chainRule,
  'probability-basics': probabilityBasics,
  'bayes-theorem': bayesTheorem,
  'distributions': distributions,

  // Path 2: Python for AI
  'numpy-basics': numpyBasics,
  'array-operations': arrayOperations,
  'pandas-dataframes': pandasDataframes,
  'data-manipulation': dataManipulation,
  'matplotlib-basics': matplotlibBasics,
  'seaborn-visualization': seabornVisualization,
  'scikit-learn-intro': scikitLearnIntro,

  // Path 3: ML Fundamentals
  'supervised-learning': supervisedLearning,
  'linear-regression': linearRegression,
  'logistic-regression': logisticRegression,
  'decision-trees': decisionTrees,
  'random-forests': randomForests,
  'svm': svm,
  'kmeans-clustering': kmeansClustering,
  'pca': pca,
  'gradient-descent': gradientDescent,
  'regularization': regularization,
  'cross-validation': crossValidation,
  'bias-variance-tradeoff': biasVarianceTradeoff,

  // Path 4: Deep Learning
  'neural-networks': neuralNetworks,
  'backpropagation': backpropagation,
  'activation-functions': activationFunctions,
  'optimization-algorithms': optimizationAlgorithms,
  'batch-normalization': batchNormalization,
  'dropout': dropout,
  'convolutional-neural-networks': cnn,
  'pooling-layers': poolingLayers,
  'transfer-learning': transferLearning,
  'recurrent-neural-networks': rnn,
  'lstm': lstm,
  'gru': gru,
  'attention-mechanism': attentionMechanism,
  'transformers': transformers,
  'self-attention': selfAttention,

  // Path 5: Modern AI
  'word-embeddings': wordEmbeddings,
  'word2vec': word2vec,
  'bert': bert,
  'gpt-architecture': gptArchitecture,
  'fine-tuning': fineTuning,
  'prompt-engineering': promptEngineering,
  'rag': rag,
  'diffusion-models': diffusionModels,
  'stable-diffusion': stableDiffusion,
  'vision-transformers': visionTransformers,
  'multimodal-models': multimodalModels,

  // Path 6: MLOps
  'model-serialization': modelSerialization,
  'docker-basics': dockerBasics,
  'containerization': containerization,
  'model-serving': modelServing,
  'rest-apis': restApis,
  'model-monitoring': modelMonitoring,
  'ab-testing': abTesting,
  'feature-stores': featureStores,
  'ml-pipelines': mlPipelines,
  'kubernetes-ml': kubernetesML,

  // Path 7: Interview Prep
  'ml-interview-questions': mlInterviewQuestions,
  'coding-ml-algorithms': codingMlAlgorithms,
  'statistics-interview': statisticsInterview,
  'deep-learning-interview': deepLearningInterview,
  'system-design-ml': systemDesignML,
  'case-studies': caseStudies,
  'behavioral-questions': behavioralQuestions,
};

// Total flashcard count
export const TOTAL_FLASHCARD_COUNT = Object.values(localFlashcardDB).reduce(
  (acc, cards) => acc + cards.length,
  0
);
