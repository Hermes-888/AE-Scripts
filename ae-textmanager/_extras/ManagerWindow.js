/**
 * Text Manager  
 * AE script to collect Text Layers and export them to csv
 * Edit the csv and import layer data
 * Update Text Layers
 * 
 * - Tjones 7/15/20
 */
// folder to save the csv in IO.Directory.GetCurrentDirectory();
try {
	var rootFolder = app.project.file.path;
} catch(error) {
    // older versions failed TypeError: null is not an object
	// alert('Update the project before running script.\n' + error.toString());
	rootFolder = '.';
}

// all comp items in project
var allItems = app.project.items;
// String of TextLayer items for csv file
var textFileData = '';


// window UI =========
var mainWindow = new Window('palette', 'Main Window', undefined);
mainWindow.text = "Text Manager";
mainWindow.orientation = "column";
mainWindow.alignChildren = ["center","top"];
mainWindow.spacing = 10;
mainWindow.margins = 16;

// headGroup =========
var headGroup = mainWindow.add("group", undefined, {name: "headGroup"});
headGroup.preferredSize.width = 650;
headGroup.orientation = "row";
headGroup.alignChildren = ["left","center"];
headGroup.spacing = 10;
headGroup.margins = 0;

// var image1_imgString = "";// getLogo();
// var image1 = headGroup.add("image", undefined, File.decode(image1_imgString), {name: "image1"});

// INSTRUCTGROUP =========
var instructgroup = headGroup.add("group", undefined, {name: "instructgroup"});
instructgroup.orientation = "column";
instructgroup.alignChildren = ["left","center"];
instructgroup.spacing = 10;
instructgroup.margins = 0;

var statictext1 = instructgroup.add("statictext", undefined, undefined, {name: "statictext1"});
statictext1.text = 'OS: ' + $.os + ' Folder: ' + rootFolder;

var statictext2 = instructgroup.add("statictext", undefined, undefined, {name: "statictext2"});
statictext2.text = "Export the list of Text Layers to a csv file within the project folder. \rCopy the project to a new folder. \rEdit the Tab delimited csv file. Paste text changes and font name then save. \rImport the edited csv into the new AE project and Update the Text Layers.";
statictext2.preferredSize.width = 500;
statictext2.preferredSize.height = 90;


// dataPanel =========
var dataPanel = mainWindow.add("panel", undefined, undefined, {name: "dataPanel"});
dataPanel.text = "Text Layers:";
dataPanel.preferredSize.width = 650;
dataPanel.preferredSize.height = 200;
dataPanel.orientation = "column";
dataPanel.alignChildren = ["left","top"];
dataPanel.spacing = 10;
dataPanel.margins = 10;

var listData = [];
var list = dataPanel.add("listBox", [0, 0, 640, 180], undefined, {
	name: "list",
	multiselect: false,
	numberOfColumns: 6, showHeaders: true,
	//items: listData,
	//columnWidths: [30, 150, 300, 50, 30, 30],// maybe?
	columnTitles: ['id', 'Font', 'Text', 'Comp Name', 'CompId', 'LayerId']
});
list.preferredSize.width = 640;
list.preferredSize.height = 180;


// editPanel =========
var editPanel = mainWindow.add("panel", undefined, undefined, {name: "editPanel"});
editPanel.text = "Edit panel:";
editPanel.orientation = "column";
editPanel.alignChildren = ["left","top"];
editPanel.spacing = 10;
editPanel.margins = 10;

// EDITGROUP =========
var editgroup = editPanel.add("group", undefined, {name: "editgroup"});
editgroup.orientation = "row";
editgroup.alignChildren = ["left","center"];
editgroup.spacing = 10;
editgroup.margins = 0;

var dropdown1_array = ["Font 1","-","Font 2"];
var dropdown1 = editgroup.add("dropdownlist", undefined, undefined, {name: "dropdown1", items: dropdown1_array});
dropdown1.helpTip = "Change Font";
dropdown1.selection = 0;

var edittext1 = editgroup.add('edittext {properties: {name: "edittext1", multiline: true, scrollable: true}}');
edittext1.text = "EditText";
edittext1.preferredSize.width = 400;
edittext1.preferredSize.height = 45;

// BTNGROUP =========
var btngroup = editPanel.add("group", undefined, {name: "btngroup"});
btngroup.orientation = "row";
btngroup.alignChildren = ["left","center"];
btngroup.spacing = 10;
btngroup.margins = 0;

var button1 = btngroup.add("button", undefined, undefined, {name: "button1"});
button1.helpTip = "Remove this item from the list.";
button1.text = "Remove Item";

var button2 = btngroup.add("button", undefined, undefined, {name: "button2"});
button2.helpTip = "Remove the text layer in comp.";
button2.text = "Remove Text Layer";

var button3 = btngroup.add("button", undefined, undefined, {name: "button3"});
button3.helpTip = "Update only this text layer if it exists.";
button3.text = "Apply Changes to Text Layer";

var button4 = btngroup.add("button", undefined, undefined, {name: "button4"});
button4.helpTip = "Add this text layer to the currently selected comp.";
button4.text = "Add Text Layer";


// actionPanel =========
var actionPanel = mainWindow.add("panel", undefined, undefined, {name: "actionPanel"});
actionPanel.text = "Actions:";
actionPanel.orientation = "row";
actionPanel.alignChildren = ["left","top"];
actionPanel.spacing = 10;
actionPanel.margins = 10;
actionPanel.alignment = ["center","top"];

var button5 = actionPanel.add("button", undefined, undefined, {name: "button5"});
button5.helpTip = "Save the TextLayer Data to a Tab delimited csv file.";
button5.text = "Export Text";

var button6 = actionPanel.add("button", undefined, undefined, {name: "button6"});
button6.helpTip = "Open a csv file, check if the layers match this project.";
button6.text = "Import Text";

var button7 = actionPanel.add("button", undefined, undefined, {name: "button7"});
button7.helpTip = "Replace text and font in text layers.";
button7.text = "Update All Text";

var button8 = actionPanel.add("button", undefined, undefined, {name: "button8"});
button8.helpTip = "Close window and exit the script.";
button8.text = "Close Window";

/**
 * Check if a project is open
 * Display the window or warn user to open a project
 */
if (allItems.length === 0) {
    alert('Open an existing project!');
    mainWindow.close();
} else {
	getTextLayers();
	mainWindow.center();
	mainWindow.show();
	if (!(isSecurityPrefSet())) {
		alert("This script requires access to write files.\n" +
			"Go to the \"General\" panel of the application preferences and make sure\n" +
			"\"Allow Scripts to Write Files and Access Network\" is checked.");
		app.executeCommand(2359);// open preferences
	}
}

/**
 * getTextLayers populates the ListBox.items
 * itemNum, font name, layer text, compName, compId and LayerId in a project
 * https://aenhancers.com/viewtopic.php?t=652
 * 
 * check if CompItem is used in project?
 * https://www.youtube.com/watch?v=W_qHvOZDlfc
 * 
 * only children of Template?
 * save the TextDocument textProp.value
 */
function getTextLayers() {
	var itemId = 0;// row number
	layerDocs = [];// for Add Text Layer
	//var allItems = app.project.items;// global
	// for each item in the project
	for (var i=1; i <= allItems.length; i++) {
        var curItem = allItems[i];
        // check if this item is a composition
		if (curItem instanceof CompItem) {
			var allLayers = curItem.layers;
			// for every layer in the composition
			for (var j=1; j <= allLayers.length; j++) {
                var curLayer = allLayers[j];
				// check if it is a text layer
				if (curLayer instanceof TextLayer) {
                    //var enabled = curLayer.enabled ? 'ON' : 'off';// Boolean ALL are ON
                    var textProp = curLayer.property("Source Text");
                    //var textProp = curLayer.sourceText;// test
                    // strip line return and tab for csv then reinstate them at import?
					//var cleanText = textProp.value.text;
					var cleanText = textProp.value.text.replace(/(\r\n|\n|\r|\t)/gm," ");
                    //var cleanText = JSON.stringify(textProp.value.text);
                    var doc = textProp.value;// object
					// http://docs.aenhancers.com/other/textdocument/

					var textDoc = '';// construct a string to reinstate TextDocument
					for(var prop in doc) {
						// add if prop is not a function, resetCharStyle & resetParagraphStyle
						if (prop != "resetCharStyle" && prop != "resetParagraphStyle") {
							textDoc += prop + ':';
							try {
								textDoc += JSON.stringify(doc[prop]) + ', ';
							} catch(error) {
								textDoc += ' , ';// strokeColor: ,
								// applyStroke: true, strokeColor:[0.7843137383461,0.20915031433105,0.20915031433105],
							}
						}
					}
					textDoc = JSON.stringify("textDoc: {" + textDoc + "}");
					layerDocs.push(textDoc);// for Add Text Layer?

					// http://jongware.mit.edu/idcs5js/pc_ListItem.html
					var listItem = list.add('item', itemId);
                        listItem.subItems[0].text = textProp.value.font;
                        listItem.subItems[1].text = textProp.value.text;
                        listItem.subItems[2].text = curItem.name;
                        listItem.subItems[3].text = i;//curItem.id;// compId
                        listItem.subItems[4].text = curLayer.index;//[5] TextLayerId
                        // textDoc
					listData.push(listItem);// unused for export, used for import

					// if font is not in fontList, add it
					// if (textProp && fontList.indexOf(textProp.value.font) === -1) {
                    //     fontDD.add(textProp.value.font);
					// 	//alert('add font: '+textProp.value.font);
					// }

                    // Use \t Tab delimited csv columns
                    // id, text, font, compName, compId, layerId, TextDocument?
                    textFileData += ''+ itemId +'\t'+ cleanText +'\t'+ textProp.value.font +'\t'+ curItem.name +'\t'+ i +'\t'+ j +'\t'+ textDoc +'\r\n';
					itemId += 1;
				}
			}
		}
	}
}

/**
 * Check if scripts can write files
 */
function isSecurityPrefSet(){
	try {
		var securitySetting = app.preferences.getPrefAsLong("Main Pref Section", "Pref_SCRIPTING_FILE_NETWORK_SECURITY");
		return (securitySetting == 1);
	} catch(err){
		alert("Error in isSecurityPrefSet function\n" + err.toString());
	}
}
