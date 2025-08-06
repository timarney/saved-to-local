const fs = require("fs");
const path = require("path");

// Function to replace remote URLs with localhost URLs
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

// Function to replace form ID in HTML content
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

// Function to create local copy from source form
function createLocalCopyFromSource(sourceFileName, outputFileName, newFormId) {
  try {
    const sourcePath = path.join(__dirname, "source", sourceFileName);
    const outputPath = path.join(__dirname, "output", outputFileName);

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

// Function to detect if form is from staging or production
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

// Function to change form ID in data
function changeFormId(data, newFormId) {
  if (data && newFormId) {
    data.id = newFormId;
  }
  return data;
}

// Function to write modified data back to HTML file
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

// Get command line arguments
const args = process.argv.slice(2);

// Check if required arguments are provided
if (args.length < 2) {
  console.log("Usage: node main <source-file-name> <new-form-id>");
  console.log(
    "Example: node main staging-form.html cmdyu74gx0001nbrybeq9r4kt"
  );
  process.exit(1);
}

const sourceFileName = args[0];
const newFormId = args[1];
const outputFileName = `${newFormId}-form.html`;

console.log(`\n\n📁 Using source file: ${sourceFileName}`);

// Detect and log the environment of the source form
const sourceFilePath = path.join(__dirname, "source", sourceFileName);
try {
  const sourceHtmlContent = fs.readFileSync(sourceFilePath, "utf8");
  const environment = detectFormEnvironment(sourceHtmlContent);
  console.log(`🌍 Source form environment: ${environment.toUpperCase()}`);
} catch (error) {
  console.log(`⚠️  Could not detect source form environment: ${error.message}`);
}

console.log("\n🔄 Creating local copy from source...");
createLocalCopyFromSource(sourceFileName, outputFileName, newFormId);

// Extract data from original source HTML file
const data = extractDataFromHTML(sourceFilePath);

if (data) {
  console.log(`\n📄 Reading form data from from: ${sourceFileName}`);
  // Change form ID if specified
  const modifiedData = changeFormId(data, newFormId);

  // Always write modified data back to HTML file
  console.log("\n💾 Writing modified data back to HTML file...");
  const success = writeDataToHTML(path.join("output", outputFileName), modifiedData);
  if (!success) {
    console.log("❌ Failed to update file");
  }
} else {
  console.log("❌ Failed to extract data from HTML file");
}
