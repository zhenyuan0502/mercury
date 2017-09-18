const remote = require('electron').remote
const typeahead = require('typeahead.js')
const app = remote.require('./app.js')
const $ = require('jquery');
const jsonfile = require('jsonfile')
const fs = require('fs')
const ipc = require('electron').ipcRenderer
const moment = require('moment')
window.$ = $;
global.__basedir = __dirname + "/..";

let globSettings = jsonfile.readFileSync(__basedir + '/settings.json');

$(window).resize(() => {
  $('#table-container').css('max-height', 0.30 * window.innerHeight);
  $('#table-container').css('height', 0.30 * window.innerHeight);
})

$(() => {
  //INIT
  $('#table-container').css('height', 0.30 * window.innerHeight)
  $('#select-cur').val(globSettings.defaultCurrency).change();
  $('#select-lang').val(globSettings.language);
  let beneficiaries = globSettings.beneficiaries
  updatePresetsTable(beneficiaries)
})
$('#select-cur').on('change', () => {
  let val = $('#select-cur').val();
  $('#selected-cur').removeClass();
  $('#selected-cur').addClass('fa')
  $('#selected-cur').addClass('fa fa-' + val)
})

$('#save-btn').on("click", () => {
  let defaultCurrency = $('#select-cur').val();
  let language = $('#select-lang').val();
  globSettings.language = language;
  globSettings.defaultCurrency = defaultCurrency;
  globSettings.beneficiaries.sort(function(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase())
  })
  globSettings.categories.sort(function(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase())
  })
  console.log(globSettings);
  jsonfile.writeFile(__basedir + '/settings.json', globSettings, {
    spaces: 2
  }, function(err) {
    if (err != null) {
      console.error(err);
    }
  })
  $('#save-btn').addClass('is-loading')
  setTimeout(() => {
    window.close()
  },1000)
});

function togglePresets(obj) {
  $('.btn-state').addClass('is-outlined');
  $(obj).removeClass('is-outlined');
  if($(obj).attr('data') === 'beneficiaries'){
    updatePresetsTable(globSettings.beneficiaries);
  } else {
    updatePresetsTable(globSettings.categories);
  }
}

function updatePresetsTable(list) {
  $('#table-b').empty();
  for (var i = 0; i < list.length; i++) {
    addRow(list[i],list);
  }
}

function addRow(obj,parent) {
  $('#table-b').append(
    $('<tr>').append(
      $('<td>').text(obj)
    ).append(
      $('<td>').append(
        $('<a>').addClass('pull-right').addClass('btn-delete button is-danger is-outlined').append(
          $('<span>').addClass('icon is-small').append(
            $('<i>').addClass('fa fa-trash')
          )
        ).attr('data',obj).attr('onclick','eject(this)')
      )
    )
  )
}

function eject(target) {
  let dataset = null;
  if ($('a.btn-state[data="beneficiaries"]').hasClass('is-outlined')) {
      dataset = globSettings.categories;
  } else {
    dataset = globSettings.beneficiaries;
  }
  for (var i = 0; i < dataset.length; i++) {
    if(dataset[i] === $(target).attr('data')){
      dataset.splice(i,1);
      updatePresetsTable(dataset);
      $(target).parent().fadeOut("slow")
      return true;
    }
  }
  return false;
  console.log($(target).attr('data'));
}

console.log("*** SETTINGS.JS IS LOADED ***");
