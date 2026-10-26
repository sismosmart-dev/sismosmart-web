const allowedTypes = [
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "build",
  "ci",
  "chore",
  "revert",
];

const config = {
  ignores: [
    (message) => message.startsWith("engine=spotless"),
    (message) => message.startsWith("Merge "),
  ],
  rules: {
    "subject-empty": [2, "never"],
    "subject-max-length": [1, "always", 100],
    "type-empty": [2, "never"],
    "type-enum": [2, "always", allowedTypes],
  },
};

export default config;
