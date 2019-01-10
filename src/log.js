const $ = require('jquery')

const $log = $('#logs')


function log(str){
  $log.prepend(`<p>${str}</p>`)
}

window.onerror = window.onerror = function (msg, url, lineNo, columnNo, error) {
  log(JSON.stringify({
    msg, url, lineNo, columnNo
  }))
}
module.exports = log