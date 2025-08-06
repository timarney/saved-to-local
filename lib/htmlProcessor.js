/**
 * Replace remote URLs with localhost URLs in HTML content
 * @param {string} htmlContent - The HTML content to process
 * @returns {string} Updated HTML with localhost URLs
 */
function replaceRemoteUrls(htmlContent) {
  let updatedHtml = htmlContent;

  // Replace staging URL with localhost
  updatedHtml = updatedHtml.replace(
    /https:\/\/forms-staging\.cdssandbox\.xyz/g,
    "http://localhost:3000"
  );

  // Replace production URL with localhost
  updatedHtml = updatedHtml.replace(
    /https:\/\/forms-formulaires\.alpha\.canada\.ca/g,
    "http://localhost:3000"
  );

  return updatedHtml;
}

/**
 * Replace form ID in HTML content
 * @param {string} htmlContent - The HTML content to process
 * @param {string} newFormId - The new form ID to use
 * @param {string} detectedEnvironment - The detected environment for logging
 * @returns {string} Updated HTML with new form ID
 */
function replaceFormIdInHtml(htmlContent, newFormId, detectedEnvironment) {
  if (!newFormId) return htmlContent;

  let updatedHtml = htmlContent;

  // Extract old form ID from meta tag for logging
  const metaMatch = htmlContent.match(
    /(<meta name="formId" content=")([^"]*)(")/
  );
  const oldFormId = metaMatch ? metaMatch[2] : "unknown";

  // Replace formId in meta tag
  updatedHtml = updatedHtml.replace(
    /(<meta name="formId" content=")[^"]*(")/g,
    `$1${newFormId}$2`
  );

  // Replace form ID in the resume link URL
  updatedHtml = updatedHtml.replace(
    /(href="[^"]*\/id\/)[^\/]*(\/resume")/g,
    `$1${newFormId}$2`
  );

  console.log(`🆔 (${detectedEnvironment}) id: ${oldFormId}`);
  console.log(`🆔 (localhost) id : ${newFormId}`);

  return updatedHtml;
}

module.exports = {
  replaceRemoteUrls,
  replaceFormIdInHtml,
};
