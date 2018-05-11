#!/usr/bin/env node

(async () => {

  const minilog = require('minilog')
  const log = minilog()
  const run = {}
  const yargs = require('yargs')

  minilog.enable()

  run.argv = yargs
    .commandDir('cmd')
    .strict()
    .version(false)
    .help()
    .wrap(null)
    .epilogue('For more information, or to contribute, check out...')
    .fail((message, error)=>{
      const config = (!run.argv ? {} : run.argv)
      if(!config.silent){
        if(message){
          error = { message }
        }
        if(!error){
          log.error(`- exception: Unknown error occurred!`)
        }
        if(error){
          if(config.debug){
            log.debug('- full exception:',JSON.stringify(error))
          }
          if(error.warning && !error.message){
            log.warn(`${ error.warning }`)
          }else{
            log.error(`${ error.message }`)
          }
        }
      }
      if(!error.no_exit){
        process.exit( error.code || error.status || 1 )
      }
    })
    .argv

})();
