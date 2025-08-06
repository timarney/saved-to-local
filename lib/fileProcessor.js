const fs = require("fs");
const path = require("path");
const { replaceRemoteUrls, replaceFormIdInHtml } = require("./htmlProcessor");
const { detectFormEnvironment } = require("./utils");

/**
 * Create local copy from source form
 * @param {string} sourceFileName - Name of the source file
 * @param {string} outputFileName - Name of the output file
 * @param {string} newFormId - New form ID to use
 * @returns {boolean} Success status
 */
function createLocalCopyFromSource(sourceFileName, outputFileName, newFormId) {
  try {
    const sourcePath = path.join(__dirname, "..", "source", sourceFileName);
    const outputPath = path.join(__dirname, "..", "output", outputFileName);

    // Read the source HTML file
    let htmlContent = fs.readFileSync(sourcePath, "utf8");

    // Replace all instances of remote URLs with localhost
    let updatedHtml = replaceRemoteUrls(htmlContent);

    // Replace form ID in HTML content
    let finalHtml = replaceFormIdInHtml(
      updatedHtml,
      newFormId,
      detectFormEnvironment(htmlContent)
    );

    // Write the modified content to the new file
    fs.writeFileSync(outputPath, finalHtml, "utf8");

    return true;
  } catch (error) {
    console.error("Error creating local copy:", error.message);
    return false;
  }
}

module.exports = {
  createLocalCopyFromSource,
};
