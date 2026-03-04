import { askProjectInfo } from './prompts.js';
import { generateProject } from './generator.js';

function parseArgs(argv) {
  const args = {
    templateSource: 'local'
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--template-source') args.templateSource = argv[++i];
    else if (token === '--csma-path') args.csmaPath = argv[++i];
    else if (token === '--ssma-path') args.ssmaPath = argv[++i];
    else if (token === '--template-ref') args.templateRef = argv[++i];
    else if (token === '--project-name') args.projectName = argv[++i];
    else if (token === '--architecture') args.architecture = argv[++i];
    else if (token === '--yes') args.yes = true;
    else if (token === '-h' || token === '--help') args.help = true;
  }

  return args;
}

function printHelp() {
  console.log(`csma-ssma\n\nOptions:\n  --template-source <local|github>\n  --csma-path <path>\n  --ssma-path <path>\n  --template-ref <tag|branch|sha>\n  --project-name <name>\n  --yes\n`);
}

export async function runCli(rootDir) {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  console.log('CSMA-SSMA Project Scaffolder');

  try {
    const options = await askProjectInfo(args, rootDir);
    const { targetDir } = await generateProject(options, rootDir);

    console.log('\nProject created successfully');
    console.log(`Target: ${targetDir}`);
    console.log('\nNext steps:');
    console.log(`  cd ${options.projectName}`);
    console.log('  npm install');
    if (options.architecture !== 'ssma') {
      console.log('  npm run dev');
    } else {
      console.log('  npm run dev:ssma');
    }
  } catch (error) {
    if (error?.message === 'ABORTED') {
      console.log('Cancelled by user');
      return;
    }
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}
