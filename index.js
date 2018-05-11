
const fs = require('fs-extra')
const globby = require('globby')
const tableify = require('markdown-tableify')
const pathSort = require('path-sort')
const htmlencode = require('htmlencode').htmlEncode


const objectToString = (o) => {
  Object.keys(o).forEach((k) => {
    if (typeof o[k] === 'object') {
      return objectToString(o[k])
    }
    o[k] = '' + o[k]
  })
  return o
}

const moduleExists = ( name ) => {
  try { return require.resolve( name ) }
  catch( e ) { return false }
}

const generate = {

  start: async ( opts ) => {

    const debug = opts.debug || false
    const output = opts.output || 'md'
    const target = opts.target || './docs'
    const overwrite = opts.overwrite || false
    const quiet = opts.quiet || false
    const silent = opts.silent || false
    const hidden = opts.hidden || false

    const path = process.cwd()
    const dest = `${target}/reference.${output}`

    const exists = await fs.pathExists(dest)
    if(exists && !overwrite){
      throw Error('Target file exists! Use --overwrite to replace.')
    }

    const log = console.log
    const _log = function(){ if(silent){ return } log.apply(console, arguments) }
    const _debug = function(){ if(!debug){ return } log.apply(console, arguments) }
    const _error = function(){ if(silent){ return } log.apply(console, arguments) }

    let consoleStatus = true
    const consoleOff = ()=>{
      consoleStatus = false
    }
    const consoleOn = ()=>{
      consoleStatus = false
    }
    console.error = console.log = console.info = console.warn = console.debug = function(){ if(!consoleStatus){ return } _log.apply(console, arguments) }

    let tmp = ""
    const _tmp = {
      write: ( ...m ) => {
        let message = m.join(' ').trim()+require('os').EOL
        tmp += message
      },
      reset: ()=>{
        tmp = ""
      }
    }

    let out = ""
    const _out = ( ...m ) => {
      let message = m.join(' ')+require('os').EOL
      out += message
    }

    try{

      consoleOff()
      _log('')

      _debug(`Matching path ${path}`)
      let paths = await globby(path,{ gitignore: true, expandDirectories: { extensions: ['js'] } });
      paths = pathSort(paths)

      _tmp.write(`# Command Reference`)
      _tmp.write('Note: This is not an exauhstive list, and entries may be missing or incomplete.')
      _tmp.write('')
      _tmp.write('----')
      _tmp.write('')

      let fns = await paths.map(async (file)=>{

        if(!moduleExists(file)){
          return
        }

        var res
        try{
          res = await require(file)
        } catch(e) {
          _debug(e)
        }
        if(!res){
          return _debug(`Discarding file: ${file}`)
        }

        let fn = JSON.parse(JSON.stringify(res))
        if(Object.keys(fn).length < 1 || !fn.command){
          return _debug(`Discarding file 2: ${file}`)
        }
        _debug(`Found file at ${file}`)

        const handleCommand = (cmd) => {

          let done = () => {
            _out(tmp)
            _tmp.reset()
          }

          if(cmd.hidden && !hidden){

            _debug('Command is marked as hidden. Use --hidden to show this item.')
            return

          }

          if(cmd.command == "*"){
            cmd.command = ""
          }

          let command = (`${cmd.context ? `${cmd.context} ` : '' }${cmd.command}`).trim()
          cmd.desc = cmd.desc || cmd.description || '<no description>'

          try{

            _tmp.write(`### Command`)
            _tmp.write(` \`${command}\``)
            _tmp.write('')

            _tmp.write(`### Description`)

            if(cmd.symlink){

              _tmp.write(`This command is an alias of \`${cmd.symlink} ${cmd.command}\``)
              _tmp.write('')

              _debug(`Writing alias ${cmd.symlink}${cmd.command} out`)
              return done()

            }

            _tmp.write(`${htmlencode(cmd.desc)}`)
            _tmp.write('')

            let ops = Object.keys(cmd.builder || {}).map((a)=>{
              let v = objectToString(cmd.builder[a])
              v.desc = v.desc || v.description || v.describe || '<no description>'
              v.choices ? v.desc += ` (Choices: [${v.choices}])` : false
              return Object.assign({},{ name: a, required: 'false', type: 'string', desc: '<no description>         ', default: '<none>' },v)
            })

            if(ops && ops.length > 0){

              let options = tableify(ops, {
                headers: [{
                  align: ':---',
                  name: 'name',
                  title: 'Option Name'
                }, {
                  align: ':------------',
                  name: 'desc',
                  title: 'Description'
                }, {
                  align: ':---:',
                  name: 'type',
                }, {
                  align: ':---:',
                  name: 'required'
                }, {
                  align: ':---:',
                  name: 'default',
                  title: 'Default Value'
                }]
              })
              _tmp.write(`### Options`)
              _tmp.write(options)
              _tmp.write('')

            }

            if(cmd.usage){

              let usage = cmd.usage
              if(!Array.isArray(usage)){
                usage = [ usage ]
              }

              _tmp.write(`### Examples`)
              usage.map((u)=>{
                _tmp.write(`${cmd.desc || ''}`)
              })

            }

            _debug(`${JSON.stringify(cmd)}`)

            _tmp.write(' ')
            _tmp.write('----')
            _tmp.write(' ')

            _debug(`Writing ${command} out`)
            done()

          }catch(e){

            _debug(e)
            _debug(`Unable to generate docs for '${command}'`)

          }

        }

        return handleCommand(fn);

      })
      consoleOn()

      if(output=="html"){

        const marked  = require('marked')
        out = marked(out)

      }

      _log(`Writing out to ${dest}`)
      await fs.outputFile(dest,out)

      if(!quiet && !silent){

        _log('')
        _log(out)

      }

    } catch(e) {

      _error('Error:',e.message)
      if(e.stack && debug){
        _error(e.stack)
      }

    }

  }

}

module.exports = generate
