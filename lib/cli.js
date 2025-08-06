const readline = require("readline");

/**
 * Create CLI interface
 * @returns {Object} CLI interface object with question and close methods
 */
function createCLI() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return {
    question: (query) => {
      return new Promise((resolve) => {
        rl.question(query, resolve);
      });
    },
    close: () => rl.close(),
  };
}

/**
 * Prompt user to select a source file
 * @param {Object} cli - CLI interface object
 * @param {string[]} sourceFiles - Array of available source files
 * @returns {string|null} Selected filename or null if none available
 */
async function promptForSourceFile(cli, sourceFiles) {
  if (sourceFiles.length === 0) {
    console.log("❌ No HTML files found in the source directory.");
    return null;
  }

  console.log("\n📁 Available source files:");
  sourceFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });

  while (true) {
    const answer = await cli.question(
      "\nSelect a source file (enter number or filename): "
    );

    // Check if it's a number
    const fileIndex = parseInt(answer) - 1;
    if (!isNaN(fileIndex) && fileIndex >= 0 && fileIndex < sourceFiles.length) {
      return sourceFiles[fileIndex];
    }

    // Check if it's a filename
    if (sourceFiles.includes(answer)) {
      return answer;
    }

    console.log("❌ Invalid selection. Please try again.");
  }
}

/**
 * Prompt user for form ID
 * @param {Object} cli - CLI interface object
 * @returns {string} Valid form ID
 */
async function promptForFormId(cli) {
  while (true) {
    const formId = await cli.question("\n🆔 Enter the new form ID: ");

    if (formId.trim() === "") {
      console.log("❌ Form ID cannot be empty. Please try again.");
      continue;
    }

    // Basic validation for form ID format (alphanumeric with possible hyphens/underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(formId.trim())) {
      console.log(
        "❌ Form ID should only contain letters, numbers, hyphens, and underscores. Please try again."
      );
      continue;
    }

    return formId.trim();
  }
}

module.exports = {
  createCLI,
  promptForSourceFile,
  promptForFormId,
};
