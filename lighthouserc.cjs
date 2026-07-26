module.exports = {
  ci: {
    collect: {
      startServerCommand:
        "npm run start -- --hostname 127.0.0.1 --port 3200",
      startServerReadyPattern: "Ready in",
      startServerReadyTimeout: 120000,
      url: ["http://127.0.0.1:3200/"],
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--headless --no-sandbox",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
