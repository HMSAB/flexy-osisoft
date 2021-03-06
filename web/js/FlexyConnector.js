var tagNameColumn = 0;
var tagTypeColumn = 1;
var serverNameColumn = 2;
var tagSelectedColumn = 3;

var parameterNameColumn = 0;
var parameterValueColumn = 1;

function saveJSON()
{
   waitingDialog.show("Sending configuration to the flexy");

   //make an empty object
   var jsonObject = {};

   //Fetch the ServerConfig
   var UrlVal = document.getElementById("URL").value;
   var WebID = document.getElementById("WebID").value;
   var Credentials = document.getElementById("Credentials").value;
   jsonObject.ServerConfig = { URL: UrlVal, WebID: WebID, Credentials: Credentials };

   //Fetch the eWONConfig
   var CertificatePath = document.getElementById("CertificatePath").value;
   jsonObject.eWONConfig = { CertificatePath: CertificatePath };

   //Fetch the AppConfig
   var CommunicationType = document.getElementById("CommunicationType").value;
   jsonObject.AppConfig = { CommunicationType: CommunicationType };

   //Send the JSON file to the eWON
   var xhr = new XMLHttpRequest();
   xhr.onreadystatechange = function ()
   {
      if (this.readyState == 4 && this.status == 200)
      {
         waitingDialog.show("Configuration Saved.\n Reboot Flexy for new configuration to take effect.");
         var timeoutMS = 3000;
         setTimeout(function () { waitingDialog.hide(); }, timeoutMS)
      }
   };

   var portNum = 22333;
   xhr.open("POST", "http://" + location.host + ":" + portNum, true);
   xhr.setRequestHeader('Content-Type', ' text/plain');
   xhr.send(JSON.stringify(jsonObject));
}

function loadPage()
{

   //Request the ConnectorConfig.json file
   var loadJsonTags = new Promise(function (resolve)
   {
      var filename = "ConnectorConfig.json";
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function ()
      {
         if (this.readyState == 4 && this.status == 200)
         {
            resolve(JSON.parse(xmlHttp.responseText));
         }
      };
      xmlHttp.open("GET", filename, true);
      xmlHttp.send(null);
   });


   //Populate the page with information from the JSON configuration file
   Promise.all([loadJsonTags]).then(function (result)
   {
      var obj = result[0];
      var tableRef = document.getElementById('connectorSettingsTable').getElementsByTagName('tbody')[0];

      //Clear all existing cells
      while (tableRef.hasChildNodes())
      {
         tableRef.removeChild(tableRef.firstChild);
      }

      //Adds a input type entry into the connector settings table
      function addCellsInput(name, val, id, invalidText)
      {
         var row = tableRef.insertRow(tableRef.rows.length);

         //Parameter Cell
         //Contains the parameter name
         cell = row.insertCell(parameterNameColumn);
         cell.innerHTML = name;

         //Value Cell
         cell = row.insertCell(parameterValueColumn);
         var form = document.createElement("form");
         var div = document.createElement("div");
         form.classList.add("text-center");
         var input = document.createElement("input");
         input.setAttribute('type', 'text');
         input.id = id;
         input.classList.add("form-control");
         input.value = val;
         div.appendChild(input);

         var invalidFeedback = document.createElement("div");
         invalidFeedback.classList.add("invalid-feedback");
         invalidFeedback.innerHTML = invalidText;
         div.appendChild(invalidFeedback);
         form.appendChild(div);

         cell.appendChild(form);
      }

      //Adds a select type entry into the connector settings table
      function addCellsSelection(name, val, id, options)
      {
         var row = tableRef.insertRow(tableRef.rows.length);

         //Parameter Cell
         //Contains the parameter name
         cell = row.insertCell(parameterNameColumn);
         cell.innerHTML = name;

         //Value Cell
         cell = row.insertCell(parameterValueColumn);
         var form = document.createElement("form");
         form.classList.add("text-center");
         var input = document.createElement("select");
         input.id = id;
         input.classList.add("form-control");

         //Add the select options
         for (i in options)
         {
            var option = document.createElement("option");
            option.value = options[i];
            option.text = options[i];
            input.appendChild(option);

            //if present select val
            if (val === options[i]) input.selectedIndex = i;
         }
         form.appendChild(input);
         cell.appendChild(form);
      }

      //Add and set the Connector Settings fields
      addCellsInput("Server URL:", obj.ServerConfig.URL, "URL", "Invalid URL format");
      addCellsInput("OSIsoft Web ID:", obj.ServerConfig.WebID, "WebID", "Invalid WebID");
      addCellsInput("OSIsoft Credentials:", obj.ServerConfig.Credentials, "Credentials", "");
      addCellsInput("Flexy Certificate Path:", obj.eWONConfig.CertificatePath, "CertificatePath", "");

      options = ["PI Web API 2018 and older", "PI Web API 2019+"];
      addCellsSelection("Select your version of PI Web API to enable or disable OMF:", obj.AppConfig.communicationType, "CommunicationType", options);

      //Prevent form submits from reloading the page
      $("form").submit(function( event ) {
         event.preventDefault();
      });

      //Register change handler to validate input fields
      $(":text").change(function ()
      {
         var element = $(this).closest(':text')[0];

         //Trim the value to prevent accidental whitespace from user input
         element.value = element.value.trim();
         var res = true;
         switch (element.id)
         {
            case "URL":
               res = validateUrl(element.value);
               break;
            case "WebID":
               res = validateWebID(element.value);
               break;
            case "Credentials":
               break;
            case "CertificatePath":
               break;
            default:
               break;
         }

         if (res)
         {
            element.classList.remove("is-invalid");
         }
         else
         {
            element.classList.add("is-invalid");
         }
      });
   });
}

//Validates a web ID
//Must be 40 characters long
function validateWebID(id)
{
   return (id.length === 40);
}

//Validates a URL
//Must be in format xxx.xxx.xxx.xxx or xxx.xxx.xxx.xxx:pppp
function validateUrl(url)
{
   var ip_pattern = '^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';
   var port_pattern = '((:([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?)$';
   var validation_regex = new RegExp(ip_pattern + port_pattern);
   return validation_regex.test(url);
}


//Wait dialog box
var waitingDialog = waitingDialog || (function ($)
{
   'use strict';

   //Creating modal dialog's DOM
   var $dialog = $(
      '<div class="modal fade" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-hidden="true" style="padding-top:15%; overflow-y:visible;">' +
      '<div class="modal-dialog modal-m">' +
      '<div class="modal-content">' +
      '<div class="modal-header"><h3 style="margin:0;"></h3></div>' +
      '<div class="modal-body">' +
      '<div class="progress">' +
      '<div class="progress-bar" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>' +
      '</div>' +
      '</div>' +
      '</div></div></div>');

   return {
      /**
       * Opens dialog
       */
      show: function (message, options)
      {

         // Configuring dialog
         $dialog.find('.modal-dialog').attr('class', 'modal-dialog').addClass('modal-m');
         $dialog.find('.progress-bar').attr('class', 'progress-bar');
         $dialog.find('.progress-bar').addClass('progress-bar-striped');
         $dialog.find('.progress-bar').addClass('progress-bar-animated');
         $dialog.find('h3').text(message);
         // Opening dialog
         $dialog.modal();
      },
      /**
       * Closes dialog
       */
      hide: function ()
      {
         $dialog.modal('hide');
      }
   };

})(jQuery);
