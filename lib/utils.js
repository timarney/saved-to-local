const fs = require("fs");
const path = require("path");

/**
 * Get available source files from the source directory
 * @returns {string[]} Array of HTML filenames
 */
function getSourceFiles() {
  try {
    const sourceDir = path.join(__dirname, "..", "source");
    if (!fs.existsSync(sourceDir)) {
      return [];
    }
    return fs.readdirSync(sourceDir).filter((file) => file.endsWith(".html"));
  } catch (error) {
    console.error("Error reading source directory:", error.message);
    return [];
  }
}

/**
 * Detect the environment of a form based on its HTML content
 * @param {string} htmlContent - The HTML content to analyze
 * @returns {string} The detected environment (staging, production, localhost, unknown)
 */
function detectFormEnvironment(htmlContent) {
  if (htmlContent.includes("https://forms-staging.cdssandbox.xyz")) {
    return "staging";
  } else if (
    htmlContent.includes("https://forms-formulaires.alpha.canada.ca")
  ) {
    return "production";
  } else if (htmlContent.includes("http://localhost:3000")) {
    return "localhost";
  } else {
    return "unknown";
  }
}

module.exports = {
  getSourceFiles,
  detectFormEnvironment,
};
