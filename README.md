# yargs-reference
A tool to generate a command line reference from a yargs powered cli

## How to use

Its simple!

```$ npm i yargs-reference -g
$ cd /my/app/path
$ yargs-reference

Writing out to ./docs/reference.md

# Command Reference
Note: This is not an exauhstive list, and entries may be missing or incomplete.

----

### Command
`command`

### Description
My command does...

### Options
| Option Name | Description | Type | Required | Default Value |
| :--- | :------------ | :---: | :---: | :---: |
| option | This option does... - (Choices: only,these,are,valid) | string | false | valid |

----
```

Please see the reference file for advanced information

## Compatibility

The tool should be usable as-in, to generate a reference file for a command line tool built to the [following spec](https://github.com/yargs/yargs/blob/master/docs/advanced.md#example-command-hierarchy-using-commanddir).

## The schema

```
// my-command.js
exports.command = 'command'

exports.description = 'My command does...'

exports.builder = {
  option: {
    type: 'string',
    description: 'This option does...'
    default: 'valid',
    choices: ['only','these','are','valid']
  }
}
```

If the modules which export your commands functionality conform to this, then it may well work. We dont offer any guarantee, so your milage may and probably will vary.

Please see [this file](./bin/cmd/index.js) for a working example.

## Non-yarg tools?

If your tool wasn't written with yargs in mind, it may still work - the tool scans the source files for modules exposing the following fields;

|  Field  |  Use  |
|---------|-------|
|  context  |  The context of the command  |
|  command  |  The actual command itself with any parameters  |
|  description  |  A short description of the command  |
|  builder  |  Options for your command ([options schema](https://github.com/yargs/yargs/blob/master/docs/advanced.md#providing-a-command-module))  |



## What does the output look like?

Check out our own [reference file](./docs/reference.md) to see! Have a look at [this file](./bin/cmd/index.js) to see what it was generated from.
