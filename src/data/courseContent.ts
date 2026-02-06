/**
 * Complete ML/DL/AI Course Content
 * Generated: 2026-02-01
 * Industry-Level Curriculum with Flashcards
 */

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  intuition?: string;
  example?: string;
  commonMistake?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
}

export interface TopicContent {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  estimatedMinutes: number;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  content: {
    concept: string;
    why: string;
    intuition: string;
    keyFormulas?: Array<{
      name: string;
      formula: string;
      explanation: string;
    }>;
    visualExplanation: string;
    codeExample: {
      language: string;
      code: string;
      explanation: string;
    };
    commonMistakes: Array<{
      mistake: string;
      why: string;
      correction: string;
    }>;
    realWorldApplications: Array<{
      application: string;
      description: string;
      example: string;
    }>;
    interviewQuestions: Array<{
      question: string;
      answer: string;
      difficulty: string;
    }>;
    seoFAQs: Array<{
      question: string;
      answer: string;
    }>;
    summary: string;
  };
  flashcards: Flashcard[];
}

export interface Module {
  id: string;
  title: string;
  order: number;
  topics: TopicContent[];
}

export interface Track {
  id: string;
  title: string;
  icon: string;
  description: string;
  order: number;
  estimatedHours: number;
  difficulty: string;
  prerequisites: string;
  learningObjectives: string[];
  modules: Module[];
}

// TRACK 1: MATH FOR MACHINE LEARNING
const mathForMLTrack: Track = {
  id: 'track-1-math-ml',
  title: 'Math for Machine Learning',
  icon: '📐',
  description: 'Master the mathematical foundations essential for understanding ML algorithms: Linear Algebra, Calculus, Probability, and Statistics.',
  order: 1,
  estimatedHours: 60,
  difficulty: 'Beginner to Intermediate',
  prerequisites: 'High school mathematics',
  learningObjectives: [
    'Understand vectors, matrices, and tensor operations',
    'Master derivatives, gradients, and optimization',
    'Apply probability theory and statistical inference',
    'Solve real ML problems using mathematical concepts'
  ],
  modules: [
    {
      id: 'module-1-1',
      title: 'Linear Algebra Fundamentals',
      order: 1,
      topics: [
        {
          id: 'topic-1-1-1',
          title: 'Vectors and Vector Operations',
          slug: 'vectors-vector-operations',
          difficulty: 'Beginner',
          estimatedMinutes: 45,
          seo: {
            metaTitle: 'Vectors in Machine Learning: Complete Guide with Examples 2026',
            metaDescription: 'Master vectors for ML: learn operations, dot products, norms with Python code examples. Essential foundation for AI and deep learning.',
            keywords: ['vectors machine learning', 'vector operations', 'dot product ML', 'numpy vectors', 'linear algebra AI']
          },
          content: {
            concept: 'A vector is an ordered collection of numbers representing magnitude and direction. In ML, vectors are the fundamental data structure for representing features, parameters, and data points. Vector operations (addition, scalar multiplication, dot product) enable efficient computation and geometric interpretation of algorithms.',
            why: 'Vectors matter because: (1) Every data point is a vector of features - images, text, tabular data all become vectors, (2) Model parameters are vectors/matrices - neural network weights are vectors, (3) Operations are vectorized for speed - modern GPUs excel at vector math, (4) Geometric intuition - understanding algorithms spatially helps debug and innovate.',
            intuition: 'Think of a person\'s profile as a vector: [height=170cm, weight=70kg, age=25]. This places them at a specific point in 3D space. Two similar people have vectors close together. In ML, we often work with thousands of dimensions (features), but the concept remains: vectors represent things numerically, and similar things have similar vectors.',
            keyFormulas: [
              {
                name: 'Vector Addition',
                formula: 'v + w = [v₁ + w₁, v₂ + w₂, ..., vₙ + wₙ]',
                explanation: 'Add element-wise. Used in gradient updates: new_weights = old_weights + learning_rate × gradient'
              },
              {
                name: 'Scalar Multiplication',
                formula: 'c·v = [c·v₁, c·v₂, ..., c·vₙ]',
                explanation: 'Scale all components. Used for learning rate in optimization'
              },
              {
                name: 'Dot Product',
                formula: 'v·w = Σ(vᵢ × wᵢ) = v₁w₁ + v₂w₂ + ... + vₙwₙ',
                explanation: 'Sum of element-wise products. Measures similarity; core of neural networks'
              },
              {
                name: 'L2 Norm (Magnitude)',
                formula: '||v||₂ = √(v₁² + v₂² + ... + vₙ²)',
                explanation: 'Vector length. Used in regularization and distance calculation'
              },
              {
                name: 'L1 Norm',
                formula: '||v||₁ = |v₁| + |v₂| + ... + |vₙ|',
                explanation: 'Sum of absolute values. Creates sparse solutions in optimization'
              }
            ],
            visualExplanation: 'Imagine 2D vector v=[3,4] as an arrow from origin (0,0) to point (3,4). Length is √(3²+4²)=5. When you add vectors, place them tip-to-tail like arrows; the sum is the direct path from start to end. Dot product v·w = ||v||×||w||×cos(θ): when vectors point same direction (θ=0°), dot product is maximum; perpendicular (θ=90°) gives zero; opposite (θ=180°) is negative. This geometric view extends conceptually to 1000+ dimensions.',
            codeExample: {
              language: 'python',
              code: `import numpy as np

# Create vectors (1D numpy arrays)
v = np.array([3, 4, 5])
w = np.array([1, 2, 3])

print(f"Vector v: {v}")
print(f"Vector w: {w}")

# Addition: combine features or gradient updates
sum_vec = v + w
print(f"\\nv + w = {sum_vec}")  # [4, 6, 8]

# Scalar multiplication: apply learning rate
learning_rate = 0.1
scaled = learning_rate * v
print(f"\\n0.1 * v = {scaled}")  # [0.3, 0.4, 0.5]

# Dot product: similarity or neural network forward pass
dot = np.dot(v, w)
print(f"\\nv · w = {dot}")  # 3*1 + 4*2 + 5*3 = 26

# L2 norm: vector length, used in regularization
l2_norm = np.linalg.norm(v)  # or np.sqrt(np.sum(v**2))
print(f"\\n||v||₂ = {l2_norm:.3f}")  # 7.071

# L1 norm: used in Lasso regression
l1_norm = np.linalg.norm(v, ord=1)  # or np.sum(np.abs(v))
print(f"||v||₁ = {l1_norm}")  # 12

# Normalization: create unit vector (length=1)
v_normalized = v / l2_norm
print(f"\\nNormalized v: {v_normalized}")
print(f"Length: {np.linalg.norm(v_normalized):.3f}")  # 1.000

# Cosine similarity: used in recommendation systems
cos_sim = np.dot(v, w) / (np.linalg.norm(v) * np.linalg.norm(w))
print(f"\\nCosine similarity: {cos_sim:.4f}")  # Range: [-1, 1]

# Real ML example: simple linear regression prediction
# y = w₀ + w₁x₁ + w₂x₂ = w · x (dot product!)
weights = np.array([0.5, 2.0, -1.0])  # model parameters
features = np.array([1.0, 3.5, 2.0])  # data point (1 is bias term)
prediction = np.dot(weights, features)
print(f"\\nLinear model prediction: {prediction}")  # 0.5 + 7.0 - 2.0 = 5.5`,
              explanation: 'This code shows vector operations used daily in ML: dot products compute predictions in linear models and neural networks; norms for regularization (L1/L2); normalization for feature scaling; cosine similarity for recommendations. Every operation is optimized in numpy/GPU for massive parallelism.'
            },
            commonMistakes: [
              {
                mistake: 'Using Python lists for vector math: [1,2] + [3,4] gives [1,2,3,4] (concatenation)',
                why: 'Python lists don\'t support element-wise operations; + concatenates lists',
                correction: 'Always use numpy: np.array([1,2]) + np.array([3,4]) = [4,6]'
              },
              {
                mistake: 'Confusing dot product with element-wise multiplication',
                why: 'v*w in numpy is element-wise [v₁w₁, v₂w₂, ...]; dot product is sum of that',
                correction: 'Use np.dot(v,w) or v @ w for dot product; v*w for element-wise'
              },
              {
                mistake: 'Forgetting to normalize before computing cosine similarity',
                why: 'Dot product alone gives large values for large vectors, not true similarity',
                correction: 'Divide by magnitudes: np.dot(v,w) / (np.linalg.norm(v) * np.linalg.norm(w))'
              },
              {
                mistake: 'Not checking vector dimensions before operations',
                why: 'Shape mismatches cause cryptic errors; [3,] vs [3,1] behave differently',
                correction: 'Always print v.shape; use reshape() to ensure correct dimensions'
              }
            ],
            realWorldApplications: [
              {
                application: 'Netflix/Spotify Recommendations',
                description: 'Users and items are vectors in high-dimensional space. Dot product measures preference: user_vector · item_vector = predicted_rating. Collaborative filtering uses cosine similarity between user vectors.',
                example: 'User likes action=0.9, comedy=0.2, drama=0.7. Movie is action=0.8, comedy=0.1, drama=0.9. Dot product: 0.9×0.8 + 0.2×0.1 + 0.7×0.9 = 1.37 (high → recommend!)'
              },
              {
                application: 'Image Search and Face Recognition',
                description: 'Images converted to vectors via neural networks (embeddings). Similar images have high cosine similarity. Face recognition: compare face embeddings using dot product or Euclidean distance.',
                example: 'ResNet converts 224×224×3 image to 2048-D vector. Search: compute similarity with all stored vectors, return top 10 matches.'
              },
              {
                application: 'Natural Language Processing - Word Embeddings',
                description: 'Words represented as dense vectors (Word2Vec, GloVe). Semantic similarity via cosine distance. Vector arithmetic captures relationships.',
                example: 'vector("king") - vector("man") + vector("woman") ≈ vector("queen"). Captures gender relationship in vector space.'
              },
              {
                application: 'Neural Network Forward Pass',
                description: 'Every layer is: output = activation(weights · input + bias). Billions of dot products per second during inference.',
                example: 'Input [x₁, x₂, x₃] · Weights [[w₁], [w₂], [w₃]] = w₁x₁ + w₂x₂ + w₃x₃ = neuron output'
              }
            ],
            interviewQuestions: [
              {
                question: 'What is the geometric interpretation of dot product, and why is it used everywhere in neural networks?',
                answer: 'Geometrically: v·w = ||v|| × ||w|| × cos(θ), where θ is angle between vectors. It measures how much vectors align: max when parallel (cos=1), zero when perpendicular (cos=0), negative when opposite (cos=-1). In neural networks, it\'s the core operation: each neuron computes weighted sum (dot product) of inputs, then applies activation. It\'s efficient (single parallel operation), expresses linear combinations, and hardware-optimized. Every layer is essentially: output = f(W · x + b), where W·x is dot product.',
                difficulty: 'Intermediate'
              },
              {
                question: 'Explain the difference between L1 and L2 norms, and when to use each in regularization.',
                answer: 'L1 norm (||v||₁ = Σ|vᵢ|): sum of absolute values, creates sparse solutions (many zeros), used in Lasso regression for feature selection. Not differentiable at zero (gradient undefined). L2 norm (||v||₂ = √Σvᵢ²): Euclidean length, penalizes large values more (due to squaring), used in Ridge regression and weight decay. Differentiable everywhere. Use L1 when you want automatic feature selection; L2 when you want all features with smaller weights. Often combined as Elastic Net: α||w||₁ + (1-α)||w||₂.',
                difficulty: 'Advanced'
              },
              {
                question: 'Why do we normalize feature vectors before training, and what\'s the difference between normalization and standardization?',
                answer: 'Normalization ensures features have same scale, preventing large-magnitude features from dominating (e.g., salary:$200k vs age:25). Benefits: faster convergence (gradient descent steps are balanced), meaningful distance metrics, stable gradients in deep networks. Normalization: scales to [0,1] using (x-min)/(max-min); good for bounded data. Standardization: zero mean, unit variance using (x-μ)/σ; better for Gaussian data. For neural networks, standardization is often preferred. Also use batch/layer normalization during training for internal activations.',
                difficulty: 'Advanced'
              },
              {
                question: 'How would you efficiently compute pairwise distances between 1 million vectors?',
                answer: 'Naive approach (double loop) is O(n²) = 10¹² operations → infeasible. Efficient approach uses vectorization: (1) Stack vectors into matrix X (n×d), (2) Compute squared norms ||xᵢ||² for each vector, (3) Use formula: ||xᵢ-xⱼ||² = ||xᵢ||² + ||xⱼ||² - 2xᵢ·xⱼ, (4) Compute all dot products in one shot: X @ X.T (single matrix multiplication), (5) For 1M vectors: use approximate methods like Locality Sensitive Hashing (LSH) or FAISS library for billion-scale. For exact distances, batch processing and GPU acceleration are essential.',
                difficulty: 'Advanced'
              }
            ],
            seoFAQs: [
              {
                question: 'What is a vector in machine learning?',
                answer: 'A vector in machine learning is an ordered array of numbers representing a data point, features, or model parameters. For example, an image might be represented as a vector of pixel values, or a user profile as [age, income, location_id].'
              },
              {
                question: 'Why are vectors important in AI and machine learning?',
                answer: 'Vectors are fundamental because they enable: (1) mathematical representation of data, (2) efficient parallel computation on GPUs, (3) geometric interpretation of algorithms, (4) similarity measurements between data points. Every ML algorithm fundamentally operates on vectors.'
              },
              {
                question: 'What is the dot product and why is it used in neural networks?',
                answer: 'The dot product of two vectors is the sum of element-wise products: v·w = v₁w₁ + v₂w₂ + ... It measures similarity and alignment. Neural networks use it as the core operation: each neuron computes a weighted sum (dot product) of inputs, making it the building block of deep learning.'
              },
              {
                question: 'What is the difference between L1 and L2 norm?',
                answer: 'L1 norm is the sum of absolute values (||v||₁ = |v₁|+|v₂|+...), creating sparse solutions. L2 norm is the Euclidean length (||v||₂ = √(v₁²+v₂²+...)), penalizing large values more. L1 is used for feature selection (Lasso), L2 for weight decay (Ridge).'
              },
              {
                question: 'How do you normalize a vector in machine learning?',
                answer: 'Vector normalization creates a unit vector (length 1) by dividing by its magnitude: v_normalized = v / ||v||. This is crucial for cosine similarity, feature scaling, and ensuring numerical stability in deep learning. In Python: v / np.linalg.norm(v).'
              }
            ],
            summary: 'Vectors are the foundation of ML: they represent data, parameters, and enable efficient computation. Key operations: addition (gradient updates), scalar multiplication (learning rate), dot product (predictions, similarity), and norms (regularization, distance). Always use numpy for vectorized operations. Geometric intuition helps: dot product measures alignment, norms measure size, normalization ensures scale-invariance. Master vectors first—everything else in ML builds on this foundation.'
          },
          flashcards: [
            {
              id: 'fc-1-1-1-1',
              question: 'What is a vector in the context of machine learning?',
              answer: 'A vector is an ordered collection of numbers that represents a data point, feature set, or model parameters in n-dimensional space. Each element corresponds to a specific feature or dimension.',
              intuition: 'Think of a person\'s profile: [height, weight, age] is a 3D vector. It\'s like GPS coordinates but with more dimensions.',
              example: 'A house: [bedrooms=3, sqft=1500, age=10] is a 3D feature vector',
              difficulty: 'Beginner',
              tags: ['vectors', 'basics', 'linear-algebra']
            },
            {
              id: 'fc-1-1-1-2',
              question: 'What does the dot product of two vectors represent geometrically?',
              answer: 'The dot product v·w = ||v|| × ||w|| × cos(θ) measures how much two vectors align. Positive when pointing same direction, zero when perpendicular, negative when opposite.',
              intuition: 'If two arrows point the same way (parallel), their dot product is maximum. If perpendicular (90°), it\'s zero—no alignment.',
              example: '[1,0]·[0,1] = 0 (perpendicular). [1,0]·[2,0] = 2 (parallel)',
              commonMistake: 'Confusing with element-wise multiplication: v*w gives [v₁w₁, v₂w₂, ...]; dot product sums these.',
              difficulty: 'Intermediate',
              tags: ['dot-product', 'vectors', 'geometry']
            },
            {
              id: 'fc-1-1-1-3',
              question: 'Why do we normalize vectors in machine learning?',
              answer: 'Normalization scales vectors to unit length (||v||=1), making comparisons fair regardless of magnitude. Essential for cosine similarity, feature scaling, and preventing large-magnitude features from dominating.',
              intuition: 'Like comparing percentages instead of raw numbers. A millionaire and average person can have similar taste patterns when normalized.',
              example: 'Before: [100, 200] vs [1, 2]. After normalization, both point same direction: they\'re identical!',
              commonMistake: 'Forgetting to normalize before cosine similarity—leads to magnitude dominating instead of direction.',
              difficulty: 'Intermediate',
              tags: ['normalization', 'preprocessing', 'vectors']
            },
            {
              id: 'fc-1-1-1-4',
              question: 'What is the L2 norm and where is it used in ML?',
              answer: 'L2 norm ||v||₂ = √(v₁² + v₂² + ...) is the Euclidean length of a vector. Used in L2 regularization (Ridge), Euclidean distance calculations, and gradient clipping.',
              intuition: 'It\'s the straight-line distance from origin to the vector\'s tip—like measuring how far you are from home.',
              example: 'For [3,4]: ||v||₂ = √(9+16) = 5. Used in Ridge regression: Loss + λ||w||₂²',
              difficulty: 'Intermediate',
              tags: ['norms', 'regularization', 'distance']
            },
            {
              id: 'fc-1-1-1-5',
              question: 'What is the difference between L1 and L2 norms?',
              answer: 'L1 norm (||v||₁ = Σ|vᵢ|) sums absolute values, creates sparse solutions. L2 norm (||v||₂ = √Σvᵢ²) is Euclidean length, penalizes large values more. L1 → Lasso (feature selection), L2 → Ridge (weight decay).',
              intuition: 'L1 is Manhattan distance (walking blocks); L2 is straight-line distance (flying). L1 encourages zeros; L2 shrinks all weights.',
              example: 'For [3,4]: L1=7, L2=5. L1 penalty → some weights become exactly 0.',
              commonMistake: 'Using L2 when you want sparse solutions—use L1 for automatic feature selection.',
              difficulty: 'Advanced',
              tags: ['norms', 'regularization', 'lasso', 'ridge']
            },
            {
              id: 'fc-1-1-1-6',
              question: 'How is vector addition used in gradient descent?',
              answer: 'Gradient descent updates weights by adding scaled gradient: w_new = w_old + (-learning_rate × gradient). This is vector addition with scalar multiplication.',
              intuition: 'You\'re at a point on a hill. The gradient points uphill. You take a step in opposite direction (downhill) by adding a small vector.',
              example: 'weights=[1.0, 2.0], gradient=[0.5, 0.3], lr=0.1 → new=[0.95, 1.97]',
              difficulty: 'Intermediate',
              tags: ['optimization', 'gradient-descent', 'vectors']
            },
            {
              id: 'fc-1-1-1-7',
              question: 'Why is cosine similarity better than dot product for measuring vector similarity?',
              answer: 'Cosine similarity = v·w / (||v||×||w||) measures angle, ignoring magnitude. Dot product is affected by vector length—large vectors always have high dot products. Cosine is scale-invariant.',
              intuition: 'Comparing direction, not size. Two people with identical preferences but different activity levels (magnitude) should be similar.',
              example: '[1,2] and [2,4] are parallel → cosine=1. Dot product=10 doesn\'t show they\'re identical direction.',
              commonMistake: 'Using raw dot product for similarity → biased toward high-magnitude vectors.',
              difficulty: 'Advanced',
              tags: ['similarity', 'cosine', 'dot-product']
            },
            {
              id: 'fc-1-1-1-8',
              question: 'What happens if you add two vectors element-wise?',
              answer: 'Element-wise addition: v + w = [v₁+w₁, v₂+w₂, ...]. Each corresponding pair is added. Result is same dimension as inputs.',
              intuition: 'Combining features: if v is yesterday\'s stock change and w is today\'s, v+w is total 2-day change.',
              example: '[1,2,3] + [4,5,6] = [5,7,9]',
              commonMistake: 'Trying to add different-length vectors—they must have same dimension.',
              difficulty: 'Beginner',
              tags: ['vectors', 'operations', 'basics']
            },
            {
              id: 'fc-1-1-1-9',
              question: 'In neural networks, what does the operation W·x + b represent?',
              answer: 'It\'s the affine transformation: W·x is dot product (weighted sum of inputs), b is bias (shift). This linear operation is applied before activation function in each layer.',
              intuition: 'Like weighted voting: each input x_i votes with weight w_i, sum them up, add bias to shift decision boundary.',
              example: 'x=[1,2], W=[0.5,0.3], b=0.1 → W·x+b = 0.5×1 + 0.3×2 + 0.1 = 1.2',
              difficulty: 'Intermediate',
              tags: ['neural-networks', 'dot-product', 'forward-pass']
            },
            {
              id: 'fc-1-1-1-10',
              question: 'What is a unit vector and why is it useful?',
              answer: 'A unit vector has magnitude 1: ||v||=1. Created by dividing vector by its norm: v̂ = v/||v||. Useful for representing pure direction without magnitude, used in normalized embeddings.',
              intuition: 'Like a compass direction: north is north whether you walk 1 mile or 10. Only direction matters, not distance.',
              example: '[3,4] → normalized = [0.6, 0.8]. Length is now 1, but direction preserved.',
              difficulty: 'Intermediate',
              tags: ['normalization', 'unit-vector', 'vectors']
            },
            {
              id: 'fc-1-1-1-11',
              question: 'Why do we use numpy arrays instead of Python lists for vectors?',
              answer: 'Numpy arrays support vectorized operations (C-optimized, parallel), use less memory, and provide proper mathematical operations. Python lists don\'t support element-wise math.',
              intuition: 'Lists are like handwriting math; numpy is like using a calculator. Much faster and designed for math.',
              example: '[1,2]+[3,4] → [1,2,3,4] (wrong!). np.array([1,2])+np.array([3,4]) → [4,6] ✓',
              commonMistake: 'Using lists for ML operations → slow code and wrong results.',
              difficulty: 'Beginner',
              tags: ['numpy', 'python', 'implementation']
            },
            {
              id: 'fc-1-1-1-12',
              question: 'What is the formula for Euclidean distance between two vectors?',
              answer: 'Euclidean distance d(v,w) = ||v-w||₂ = √((v₁-w₁)² + (v₂-w₂)² + ...). It\'s the L2 norm of their difference.',
              intuition: 'Straight-line distance between two points, like measuring distance between cities as the crow flies.',
              example: 'v=[1,2], w=[4,6]: d = √((1-4)² + (2-6)²) = √(9+16) = 5',
              difficulty: 'Beginner',
              tags: ['distance', 'metrics', 'vectors']
            },
            {
              id: 'fc-1-1-1-13',
              question: 'How does vector projection work and where is it used?',
              answer: 'Projection of v onto w: proj_w(v) = ((v·w) / ||w||²) × w. It finds the component of v that lies in direction of w. Used in PCA and orthogonalization.',
              intuition: 'Imagine shining a light perpendicular to w; the shadow of v on w is the projection.',
              example: 'Projecting [3,4] onto [1,0] gives [3,0]—the x-component only.',
              difficulty: 'Advanced',
              tags: ['projection', 'geometry', 'PCA']
            },
            {
              id: 'fc-1-1-1-14',
              question: 'What is vectorization and why is it crucial for ML?',
              answer: 'Vectorization replaces loops with vector/matrix operations that execute in parallel. GPUs can process thousands of elements simultaneously, making vectorized code 100-1000x faster.',
              intuition: 'Instead of processing one item at a time (loops), process all items at once (batch). Like an assembly line vs handcrafting.',
              example: 'Loop: for i in range(n): result[i]=a[i]*b[i]. Vectorized: result=a*b (10-100x faster!)',
              commonMistake: 'Using loops in ML code → training takes hours instead of minutes.',
              difficulty: 'Intermediate',
              tags: ['optimization', 'performance', 'numpy']
            },
            {
              id: 'fc-1-1-1-15',
              question: 'What does orthogonal vectors mean and why does it matter?',
              answer: 'Vectors are orthogonal when perpendicular (dot product = 0). They capture independent information with no correlation. Used in PCA (principal components are orthogonal) and feature engineering.',
              intuition: 'Like height and intelligence—knowing one tells you nothing about the other. Completely independent.',
              example: '[1,0]·[0,1] = 0. X-axis and Y-axis are orthogonal—moving horizontally doesn\'t change vertical position.',
              difficulty: 'Intermediate',
              tags: ['orthogonality', 'geometry', 'PCA']
            }
          ]
        }
      ]
    }
  ]
};

export const courseContent = {
  tracks: [mathForMLTrack]
};

export default courseContent;
