export const SKILL_TAXONOMY = {
  // Programming Languages
  languages: [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Golang',
    'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Scala', 'R', 'Dart', 'SQL', 'Bash', 'Shell'
  ],

  // Frontend
  frontend: [
    'React', 'React.js', 'ReactJS', 'Next.js', 'Vue', 'Vue.js', 'Nuxt.js', 'Angular',
    'Svelte', 'HTML', 'HTML5', 'CSS', 'CSS3', 'Tailwind CSS', 'Tailwind', 'Bootstrap',
    'Sass', 'SCSS', 'Redux', 'Zustand', 'GraphQL', 'Webpack', 'Vite', 'Babel',
    'Responsive Design', 'WebSockets'
  ],

  // Backend
  backend: [
    'Node.js', 'NodeJS', 'Express', 'Express.js', 'NestJS', 'Django', 'FastAPI',
    'Flask', 'Spring Boot', 'Spring', 'Ruby on Rails', 'ASP.NET', '.NET Core',
    'Laravel', 'Koa', 'REST', 'RESTful API', 'REST API', 'GraphQL', 'gRPC', 'Microservices'
  ],

  // Databases & Caching
  databases: [
    'MongoDB', 'Mongoose', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Elasticsearch',
    'Cassandra', 'DynamoDB', 'Firebase', 'Supabase', 'Neo4j', 'Oracle', 'Prisma', 'TypeORM'
  ],

  // Cloud & DevOps
  cloud_devops: [
    'AWS', 'Amazon Web Services', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes',
    'CI/CD', 'GitHub Actions', 'Jenkins', 'Terraform', 'Ansible', 'Linux', 'Nginx',
    'Serverless', 'Vercel', 'Netlify', 'Cloudflare'
  ],

  // AI & Data Science
  ai_ml_data: [
    'Machine Learning', 'Deep Learning', 'NLP', 'Natural Language Processing',
    'Computer Vision', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'Pandas', 'NumPy',
    'OpenAI', 'LangChain', 'Llama', 'Hugging Face', 'Data Analysis', 'Data Engineering',
    'Apache Spark', 'Kafka', 'Hadoop', 'Tableau', 'Power BI'
  ],

  // Testing & Quality
  testing: [
    'Jest', 'Mocha', 'Chai', 'Cypress', 'Playwright', 'Selenium', 'Unit Testing',
    'Integration Testing', 'E2E Testing', 'TDD', 'Junit', 'PyTest'
  ],

  // Soft Skills & Practices
  practices: [
    'Agile', 'Scrum', 'Kanban', 'Git', 'GitHub', 'GitLab', 'Jira', 'Code Review',
    'System Design', 'Clean Architecture', 'Problem Solving', 'Leadership',
    'Cross-functional Collaboration', 'Mentorship'
  ]
};

// Flattened list of canonical skills for fast lookup
export const ALL_SKILLS = Object.values(SKILL_TAXONOMY).flat();

// Alias normalization dictionary
export const SKILL_ALIASES = {
  'js': 'JavaScript',
  'ts': 'TypeScript',
  'py': 'Python',
  'golang': 'Go',
  'reactjs': 'React',
  'react.js': 'React',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'node': 'Node.js',
  'expressjs': 'Express',
  'express.js': 'Express',
  'vuejs': 'Vue',
  'vue.js': 'Vue',
  'nextjs': 'Next.js',
  'next.js': 'Next.js',
  'tailwind': 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',
  'postgres': 'PostgreSQL',
  'psql': 'PostgreSQL',
  'mongo': 'MongoDB',
  'es': 'Elasticsearch',
  'k8s': 'Kubernetes',
  'docker container': 'Docker',
  'aws cloud': 'AWS',
  'gcp': 'Google Cloud',
  'ml': 'Machine Learning',
  'dl': 'Deep Learning',
  'nlp': 'NLP',
  'natural language processing': 'NLP'
};
