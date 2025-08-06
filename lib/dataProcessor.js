const fs = require("fs");
const path = require("path");

/**
 * Extract data from HTML file's script tag
 * @param {string} filePath - Path to the HTML file
 * @returns {Object|null} Parsed form data or null if error
 */
function extractDataFromHTML(filePath) {
  try {
    // Read the HTML file
    const htmlContent = fs.readFileSync(filePath, "utf8");

    // Use regex to find the script tag with id="form-data"
    const scriptRegex = /<script[^>]*id="form-data"[^>]*>(.*?)<\/script>/s;
    const match = htmlContent.match(scriptRegex);

    if (!match) {
      throw new Error('Could not find script tag with id="form-data"');
    }

    // Parse the JSON content
    const jsonContent = JSON.parse(match[1]);

    // Extract and decode the base64 data
    const base64Data = jsonContent.data;
    const decodedData = Buffer.from(base64Data, "base64").toString("utf8");

    return JSON.parse(decodedData);
  } catch (error) {
    console.error("Error extracting data from HTML:", error.message);
    return null;
  }
}

/**
 * Change form ID in data object
 * @param {Object} data - The form data object
 * @param {string} newFormId - The new form ID
 * @returns {Object} Modified data object
 */
function changeFormId(data, newFormId) {
  if (data && newFormId) {
    data.id = newFormId;
  }
  return data;
}

/**
 * Write modified data back to HTML file
 * @param {string} filePath - Path to the HTML file
 * @param {Object} modifiedData - The modified form data
 * @returns {boolean} Success status
 */
function writeDataToHTML(filePath, modifiedData) {
  try {
    // Read the original HTML file
    let htmlContent = fs.readFileSync(filePath, "utf8");

    // Encode the modified data to base64
    const newBase64Data = Buffer.from(
      JSON.stringify(modifiedData),
      "utf8"
    ).toString("base64");

    // Create the new JSON object for the script tag
    const newJsonContent = JSON.stringify({ data: newBase64Data });

    // Use regex to find and replace the script tag content
    const scriptRegex = /(<script[^>]*id="form-data"[^>]*>)(.*?)(<\/script>)/s;
    const newHtmlContent = htmlContent.replace(
      scriptRegex,
      `$1${newJsonContent}$3`
    );

    // Write the modified HTML back to the file
    fs.writeFileSync(filePath, newHtmlContent, "utf8");

    console.log(
      `✅ Successfully created local copy ${path.basename(filePath)}`
    );
    return true;
  } catch (error) {
    console.error("Error writing data to HTML:", error.message);
    return false;
  }
}

module.exports = {
  extractDataFromHTML,
  changeFormId,
  writeDataToHTML,
};
