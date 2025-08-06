const { getSourceFiles } = require("./lib/utils");
const { createCLI, promptForSourceFile, promptForFormId } = require("./lib/cli");
const { processForm } = require("./lib/formProcessor");

// =============================================================================
// MAIN CLI FUNCTION
// =============================================================================

/**
 * Main CLI function to run interactive mode
 * @returns {Promise<void>}
 */
async function runCLI() {
  console.log("🚀 Form Processor CLI");
  console.log("=====================");
  
  const cli = createCLI();

  try {
    // Get available source files
    const sourceFiles = getSourceFiles();

    // Prompt for source file
    const sourceFileName = await promptForSourceFile(cli, sourceFiles);
    if (!sourceFileName) {
      cli.close();
      return;
    }

    // Prompt for form ID
    const newFormId = await promptForFormId(cli);

    cli.close();

    // Process the form
    await processForm(sourceFileName, newFormId);
  } catch (error) {
    console.error("❌ CLI Error:", error.message);
    cli.close();
  }
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

// Get command line arguments
const args = process.argv.slice(2);

// Check if arguments are provided for non-interactive mode
if (args.length >= 2) {
  // Non-interactive mode
  const sourceFileName = args[0];
  const newFormId = args[1];
  processForm(sourceFileName, newFormId);
} else {
  // Interactive CLI mode
  runCLI();
}
