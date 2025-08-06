const fs = require("fs");
const path = require("path");
const { detectFormEnvironment } = require("./utils");
const { createLocalCopyFromSource } = require("./fileProcessor");
const { extractDataFromHTML, changeFormId, writeDataToHTML } = require("./dataProcessor");

/**
 * Process the form with given parameters
 * @param {string} sourceFileName - Name of the source file
 * @param {string} newFormId - New form ID to use
 * @returns {Promise<void>}
 */
async function processForm(sourceFileName, newFormId) {
  const outputFileName = `${newFormId}-form.html`;

  console.log(`\n\n📁 Using source file: ${sourceFileName}`);

  // Detect and log the environment of the source form
  const sourceFilePath = path.join(__dirname, "..", "source", sourceFileName);
  try {
    const sourceHtmlContent = fs.readFileSync(sourceFilePath, "utf8");
    const environment = detectFormEnvironment(sourceHtmlContent);
    console.log(`🌍 Source form environment: ${environment.toUpperCase()}`);
  } catch (error) {
    console.log(
      `⚠️  Could not detect source form environment: ${error.message}`
    );
  }

  console.log("\n🔄 Creating local copy from source...");
  createLocalCopyFromSource(sourceFileName, outputFileName, newFormId);

  // Extract data from original source HTML file
  const data = extractDataFromHTML(sourceFilePath);

  if (data) {
    console.log(`\n📄 Reading form data from: ${sourceFileName}`);
    // Change form ID if specified
    const modifiedData = changeFormId(data, newFormId);

    // Always write modified data back to HTML file
    console.log("\n💾 Writing modified data back to HTML file...");
    const success = writeDataToHTML(
      path.join(__dirname, "..", "output", outputFileName),
      modifiedData
    );
    if (!success) {
      console.log("❌ Failed to update file");
    }
  } else {
    console.log("❌ Failed to extract data from HTML file");
  }
}

module.exports = {
  processForm,
};
