
module.exports = {
  context: 'yargs-reference',
  command: '*',
  desc: 'Generate markdown/html reference for a yargs powered CLI app',
  builder: {
    debug: {
      description: 'Show debug messages in console',
      type: 'boolean',
      default: false
    },
    output: {
      description: 'Output format',
      choices: ['md','html'],
      default: 'md'
    },
    target: {
      description: 'Directory to wrote the reference file to',
      type: 'string',
      default: './docs'
    },
    overwrite: {
      description: 'Overwrite existing reference file if it already exists',
      type: 'boolean',
      default: false
    },
    quiet: {
      description: 'Suppress rendered output, will still ouput error messages',
      type: 'boolean',
      default: false
    },
    silent: {
      description: 'Suppress all output, error code indicated result',
      type: 'boolean',
      default: false
    },
    hidden: {
      description: 'Document hidden commands',
      type: 'boolean',
      default: false
    }
  },
  handler: async (argv) => {

    const generator = require('../../index')
    return (await generator.start(argv))

  }
}
