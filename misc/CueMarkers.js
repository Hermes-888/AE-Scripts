/***********************************************************
 * CueMarkers.js AE script - Tjones - 4/20/21
 *
 * Build the English AE file
 * Define markers on the Template comp to represent Interaction Cues
 * Export a vtt file to the local folder.
 * The video and vtt file will be incorporated into a Vue Interactive Video
 *
 *
 * https://gitlab.com/statefoodsafety/experimentation/
 ***********************************************************
 *
 * http://docs.aenhancers.com/layers/textlayer/
 *
 * http://docs.aenhancers.com/layers/layercollection/#layercollection-addtext
 *
 * UI docs
 * http://estk.aenhancers.com/
 * http://estk.aenhancers.com/4%20-%20User-Interface%20Tools/control-objects.html#list-control-object-functions
 * http://jongware.mit.edu/idcs5js/pc_ListBox.html
 * http://estk.aenhancers.com/4%20-%20User-Interface%20Tools/control-objects.html#control-type-listbox
 * http://estk.aenhancers.com/4%20-%20User-Interface%20Tools/types-of-controls.html#creating-multi-column-lists
 * https://adobeindd.com/view/publications/a0207571-ff5b-4bbf-a540-07079bd21d75/92ra/publication-web-resources/pdf/scriptui-2-16-j.pdf
 * 
 *
 * Snippets
 * https://github.com/NTProductions?tab=repositories
 * https://aescripts.com/pt_textedit/#
 *
 * https://www.youtube.com/watch?v=NoyfeVE1bXQ
 * https://www.youtube.com/watch?v=_Ue1x0Vqq1Q
 * https://www.youtube.com/watch?v=_T7fY_B5NLc
 * https://www.youtube.com/watch?v=x90MacNDMu0
 * https://creativedojo.net/learn-after-effects-scripting/
 *
 * https://helpx.adobe.com/after-effects/using/creating-editing-text-layers.html
 * https://blogs.adobe.com/creativecloud/after-effects-cs4-scripting-ch/?segment=dva
 *
 * TODO:
 * Check for write permission
 * https://github.com/NTProductions/check-write-files-setting/blob/master/Check%20Write%20Files%20Setting.jsx
 * 
 * make this script dockable
 * 
 * ability to delete list items you don't want to import. could also be done in the excel program
 * can a list item row contain buttons? w/visible, delete row icons?
 * 
 * Need to be able to change the Font.  In the file or with a dropdown?
 * https://stackoverflow.com/questions/57450142/find-available-fonts-in-adobe-after-effects-with-extendscript
 * Or create a dropdown of known fonts used for translations to select from
 * do different language fonts need to change the size? this could need to be done manually.
 * 
 * need to reinstate the line breaks \r\n in sourceText
 * 
 * http://estk.aenhancers.com/4%20-%20User-Interface%20Tools/scriptui-class.html
 * ScriptUI.applicationFonts
 * 
 * check for OS? will rootFolder path need adjustment?
 * 
 * select a font, provide a button to change every TextLayer with the same font?
 * 
 * load a csv file, check if each id matches TextLayer compId,layerId
 * https://github.com/fabianmoronzirfas/extendscript/wiki/Create-And-Read-Files
 * https://estk.aenhancers.com/3%20-%20File%20System%20Access/file-object.html
 * http://www.motionscript.com/ae-scripting/create-text-layers-from-file.html
 * 
 * http://jongware.mit.edu/idcs5js/pc_ListBox.html
 * http://jongware.mit.edu/idcs5js/pc_ListItem.html
 * 
 * Adobe CC Extension Builder for Brackets
 * https://www.youtube.com/watch?time_continue=206&v=e-_PGTWmbn4&feature=emb_logo
 *
 * Great Script UI builder - Chrome only
 * https://scriptui.joonas.me/
 */

// folder to save the csv in
try {
	var rootFolder = app.project.file.path;
} catch(error) {
	// TypeError: null is not an object
	// alert('Update the project before running script.\n' + error.toString());
	rootFolder = '.';
}

// all comp items in project
var allItems = app.project.items;
// selected item and index of the clicked ListBox row for editing
var selectedItem = null;
var listItemId = null;
// String of TextLayer items for csv file
var textFileData = '';
// Array of TextLayer items
var listData = [];

var markerItems = [];// array of cue marker objects
var defaultSettings = {
	useBlur: false,// blur while viewing interaction
	useOverlay: true,
	animateIn: true,// animates onto then off of screen
	animateOut: true,
	//animateTo: '35%',// not here
	pauseVideo: true,// during interaction
	resumePlayback: true,// continue playing same video
};
// turn on Text Editor
var debug = true;

var mainWindow = new Window('palette', 'Cue Markers', undefined);
	mainWindow.orientation = 'column';

var mainGroup = mainWindow.add('group', undefined, 'mainGroup');
	mainGroup.orientation = 'row';
	mainGroup.alignChildren = 'left';
	mainGroup.add('image', undefined, getLogo());// internal 64x80px
    
var rightSide = mainGroup.add('group', undefined, 'rightSide');
    rightSide.orientation = 'column';
    // rightSide.add('staticText', undefined, 'OS: '+ $.os +' Folder: '+rootFolder);

var instructionPanel = rightSide.add('panel', undefined, undefined);
	instructionPanel.text ='Instructions:';
	instructionPanel.size = [500, 90];
	instructionPanel.alignChildren = ["left","top"];
	instructionPanel.spacing = 10;
	instructionPanel.margins = 10;

var instructions = instructionPanel.add('staticText', undefined, undefined, {name: "instructions", multiline: true, scrolling: true});
	instructions.size = [490, 60];
	instructions.text = 'Place markers on the Template comp. The duration doesn\'t matter.\rThe comment is the Interaction Type. [title, message, question, custom]\rRun this script to collect the markers for the Template comp only. \rSelect Export VTT File to convert markers to cues in a vtt file.';

var dataPanel = mainWindow.add('panel', [0, 0, 600, 200], 'Interactive Cue Markers:');
	dataPanel.orientation = 'column';

var list = dataPanel.add('ListBox', [0, 0, 590, 180], 'data', {
	multiselect: false,
	numberOfColumns: 6, showHeaders: true,
	//columnWidths: [30, 150, 300, 50, 30, 30],// maybe?
	columnTitles: ['#', 'Cue', 'Type', 'Comp Name', 'Start', 'Duration']
});

// populate the ListBox items
//getTextLayers();
// populate markers
getMarkers();

/**
 * list item clicked, edit the selected list item
 *
 * set the type dropdown to the selected item type
 * set the checkboxes
 */
list.onChange = function () {
	if (list.selection != null) {
		listItemId = list.selection.index;
		selectedItem = list.selection;

		// var compId = parseInt(list.selection.subItems[3]);
		// var layerId = parseInt(list.selection.subItems[4]);
		// app.project.item(compId).openInViewer();
		// Don't need to select the layer to update it
		//app.project.item(compId).layer(layerId).selected = true;
		//textEditor.text = list.selection.subItems[1].text;

		editPanel.enabled = true;
		var markText = list.selection.subItems[1].text.toLowerCase();
				markText = markText.charAt(0).toUpperCase() + markText.slice(1);

		var type = typeList.indexOf(markText);
		if (type > -1) {
			typeDD.selection = type;
			list.selection.subItems[1].text = markText;
		}
		// set checkboxes for selected item
		var cueSettings = markerItems[listItemId].settings;// obj
		var boxes = editGroup.children;// array of checkboxes
		for (option in cueSettings) {
			for (var i=0; i<boxes.length; i++) {
				if (boxes[i].name === option) {
					//alert('option: '+boxes[i].name);// ok
					//boxes[i].value = false;// ok
					boxes[i].value = cueSettings[option];
					//boxes[i].setValue(cueSettings[option]);
				}
			}
		}
		alert('set boxes: '+listItemId+' : '+ JSON.stringify(cueSettings));// ?
	}
};

/**
 * Cue Type dropdown and properties checkboxes
 *
 */
// English - Spanish - Mandarin - Korean - (Vietnamese = SegoePrint) - (Tagalog = SegoePrint)- (Serbo-Croatian = MyriadPro and SegoePrint)
//var fontList = ['Arimo', 'MyriadPro-Regular', 'MyriadPro-Bold', '-', 'SegoePrint', '-', 'SimSun', '-', 'MalgunGothic-Semilight'];
var typeList = ['Title', 'Message', 'Question', 'Custom'];

var editPanel = mainWindow.add('panel', undefined, 'Cue Properties:');
editPanel.orientation = 'row';
editPanel.enabled = false;// until a list item is selected

var typeDD = editPanel.add('dropdownlist', undefined, typeList);
typeDD.selection = 0;
typeDD.onChange = function() {
	//alert(typeDD.selection.index +':'+ typeDD.selection.text+' :: '+listItemId);
	selectedItem.subItems[1].text = typeDD.selection.text;
	// resize list to update the list item
	var wh = list.size;
	list.size = [1+wh[0], 1+wh[1]];
	list.size = [wh[0], wh[1]];
	// update the actual Marker.comment
	try {
		var marker = app.project.items[markerItems[listItemId].compIndex].markerProperty.keyValue(listItemId+1);
		marker.comment =  typeDD.selection.text;
		app.project.items[markerItems[listItemId].compIndex].markerProperty.setValueAtKey(listItemId+1, marker);
	} catch (err) { alert('Error: '+err.toString()); }
};
/**
 * checkboxes to change cue settings
 */
var editGroup = editPanel.add('group', undefined, 'editGroup');
//editGroup.orientation = 'row';
//editGroup.alignChildren = 'left';
// column? and layout differently
for (option in defaultSettings) {
	var ck = editGroup.add('checkbox', undefined, option);
	ck.value = defaultSettings[option];
	ck.name = option;
	ck.onClick = function() {
		//alert('ck changed: '+this.name+' val: '+this.value);// the one changed
		// update the data for each change, re stringify cue.text at export vtt file
		markerItems[listItemId].settings[this.name] = this.value;
		//alert('settings: '+listItemId+' : '+JSON.stringify(markerItems[listItemId].settings));
	};
}

/**
 * Edit selected item text
 * select a list item to activate and fill textEditor
 * onChange updates the list item immediately?
 */
// var textEditor = editPanel.add("edittext", undefined, "Edit:", {
// 	multiline: true, scrolling: true, wantReturn: true
// });
// textEditor.size = [400, 45];
// //textEditor.active = false;
// textEditor.onChanging = function() {
// 	selectedItem.subItems[1].text = this.text;//textEditor.text;// updates when another row is selected
//
// 	// resize list to update the list item
// 	var wh = list.size;
// 	list.size = [1+wh[0], 1+wh[1]];
// 	list.size = [wh[0], wh[1]];
//
// 	// update the actual TextLayer
// 	updateItemLayer(selectedItem);
// };

/**
 * updates as each character is typed. Not a good Undo strategy!
 * just change the list item text? add a button to updateItemLayer once?
 * @param item - selected ListBox[ListItem]
 */
// function updateItemLayer(item) {
// 	app.beginUndoGroup("Update Marker");
// 	var compId = parseInt(item.subItems[3]);
// 	var layerId = parseInt(item.subItems[4]);
// 	var textProp = app.project.items[compId].layers[layerId].property("Source Text");
// 	var textDoc = textProp.value;
//
// 	textDoc.font = item.subItems[0];
// 	textDoc.text = item.subItems[1];
// 	// item.subItems[2] = Comp Name UNUSED
// 	textProp.setValue(textDoc);
// 	app.endUndoGroup();
// }


var buttonPanel = mainWindow.add('panel', undefined, 'Actions:');
	buttonPanel.orientation = 'row';
/**
 * Save the TextLayer Data to a Tab delimited csv file
 */
var exportBtn = buttonPanel.add('button', undefined, 'Export VTT File');
exportBtn.helpTip = 'Save the Interactive Cue Data to a vtt file';
//exportBtn.enabled = false;
exportBtn.onClick = function() {
	exportTextData();
};
/**
 * Open a VTT file, add markers to Template comp
 */
// var importBtn = buttonPanel.add('button', undefined, 'Import Text');
// importBtn.helpTip = 'Open a csv file, check if the layers match this project';
// importBtn.onClick = function() {
// 	importTextData();
// };
/** UNUSED
 * update text button will replace text in project.items.comp.TextLayer + (font?)
 * https://www.youtube.com/watch?v=6P76aFYmOR8
 * updateBtn is enabled when a csv file is imported
 */
// var updateBtn = buttonPanel.add('button', undefined, 'Update Text');
// updateBtn.helpTip = 'Relace text and font in text layers';
// updateBtn.enabled = false;
// updateBtn.onClick = function() {
//     updateTextLayers();
// };

/**
 * Close the script window
 */
var closeBtn = buttonPanel.add('button', undefined, 'Close Window');
closeBtn.helpTip = 'Close the script';
closeBtn.onClick = function() {
	mainWindow.close();
};

/**
 * Check if a project is open
 * Display the window or warn user to open a project
 */
if (allItems.length === 0) {
    alert('Open an existing project!');
    mainWindow.close();
} else {
	mainWindow.center();
	mainWindow.show();
	// alert('project: '+ app.project.file.path);
}

/**
 * getMarkers
 * https://ae-expressions.docsforadobe.dev/markerkey.html
 * https://ae-expressions.docsforadobe.dev/comp.html#comp-marker
 * https://ae-expressions.docsforadobe.dev/time-conversion.html
 * https://ae-scripting.docsforadobe.dev/general/project/
 * https://extendscript.docsforadobe.dev/user-interface-tools/
 *
	useBlur: true,// blur while viewing interaction
	useOverlay: false,
	animateIn: true,// animates onto then off of screen
	animateOut: true,
	pauseVideo: true,// during interaction
	resumePlayback: true,// continue playing same video
 */
function getMarkers() {
	//var peach = 6;
	var displayType = app.project.timeDisplayType;
	// make sure the Display Type is TIMECODE for exporting vtt
	if (app.project.timeDisplayType === 2013) {
		app.project.timeDisplayType = 2012;// TIMECODE=2012, FRAMES=2013
		// always change it back
	}

	for (var i=1; i <= allItems.length; i++) {
		var curItem = allItems[i];
		// check if this item is a composition
		if (curItem instanceof CompItem) {
			// added a NullObject Layer with markers on it
			// var listItem = list.add('item', 1);
			// if (curItem.selected) {
			// 	listItem.subItems[1].text = 'selected';// nope
			// }
			// listItem.subItems[2].text = curItem.name;// got 3 comp names

			// only use markers on the Template comp?
			if (curItem.name !== 'Template') { continue; }
			try {
				// assume builders have placed comp markers
				var marks = curItem.markerProperty.numKeys;
				if (marks > 0) {
					for (var m=1; m<=marks; m++) {
						var cueObj = {};// construct data for vtt file
						var listItem = list.add('item', m);// display markers to user
						listItem.subItems[0].text = 'cue';
						//listItem.subItems[1].text = curItem.layer(1).marker.keyValue(m).comment;// null layer on 1
						listItem.subItems[1].text = curItem.markerProperty.keyValue(m).comment;// marker.time, marker.duration
						listItem.subItems[2].text = curItem.name;// unused in vtt
						//curItem.markerProperty.keyValue(m).label = peach;// didn't update, always set to 6?


						var time = curItem.markerProperty.keyTime(m);// NOT: .keyValue(m).time;
						if (time) {
							listItem.subItems[3].text = timeToCurrentFormat(time, 30);// curItem.frameRate
							// data for export to vtt file id=comment, start=time, end=start+.05, text = settings
							cueObj.id = curItem.markerProperty.keyValue(m).comment;
							cueObj.start = timeToCurrentFormat(time, 30);// curItem.frameRate
							cueObj.end = timeToCurrentFormat(time+0.05, 30);// curItem.frameRate
							cueObj.text = JSON.stringify(defaultSettings);
							cueObj.compIndex = i;// app.project.items(i)
							//cueObj.settings = defaultSettings;// same object in each ERR
							cueObj.settings = {
								useBlur: false,// blur while viewing interaction
								useOverlay: true,
								animateIn: true,// animates onto then off of screen
								animateOut: true,
								pauseVideo: true,// during interaction
								resumePlayback: true,// continue playing same video
							}
						}

						var duration = curItem.markerProperty.keyValue(m).duration;
						if (duration) {
							listItem.subItems[4].text = timeToCurrentFormat(duration, 30);// curItem.frameRate
						}
						// duration set manually? or from marker.end;
						// separate object to update
						markerItems.push(cueObj);
					}
				} else {
					alert('There are no markers on the Template comp.');
				}
			} catch(error) {
				// curItem.property is undefined
				alert('Error: '+error.toString());
			}
		}
	}
	// end for
	app.project.timeDisplayType = displayType;// always reset to original
}

/** UNUSED REMOVE?
 * getTextLayers populates the ListBox.items
 * itemNum, font name, layer text, comp name, compId and LayerId in a project
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
            // strip line return and tab for csv
            // need to reinstate them at import?
					//var cleanText = textProp.value.text;
					var cleanText = textProp.value.text.replace(/(\r\n|\n|\r|\t)/gm," ");
					//var cleanText = JSON.stringify(textProp.value.text);
					//var TextDoc = JSON.stringify(textProp.value);//Error: Can't get color, this text has no stroke
					//alert('cleaned: '+cleanText);

          // http://jongware.mit.edu/idcs5js/pc_ListItem.html
					var listItem = list.add('item', itemId);
              listItem.subItems[0].text = textProp.value.font;
              listItem.subItems[1].text = textProp.value.text;
              listItem.subItems[2].text = curItem.name;
              listItem.subItems[3].text = i;// item index CompItem
              listItem.subItems[4].text = j;// layer index TextLayer
					//listData.push(listItem);// unused for export

					// if font is not in fontList, push it to fontList UNUSED
					// if (textProp && fontList.indexOf(textProp.value.font) === -1) {
					// 	fontList.push(textProp.value.font);
					// 	//alert('add font: '+textProp.value.font);
					// }

					// Use \t Tab delimited csv columns
					textFileData += ''+ itemId +'\t'+ curItem.name +'\t'+ i +'\t'+ j +'\t'+ cleanText +'\t'+ textProp.value.font+'\n';
					itemId += 1;
				}
			}
		}
	}
}

/**
 * Export .csv file in the project folder
 * Tab delimited [rowId, Comp Name, compId, layerId, Text, Font]
 */
function exportTextData() {
	// var fileData = "id\tCompName\tCompId\tLayerId\tText\tFont\r\n";
	// fileData += textFileData;
	//
	// // let the user name the file when they Export Text
	// var csvFile = File.saveDialog(rootFolder+"/TextLayerData.csv");
	// csvFile.open("w");
	// csvFile.encoding = "UTF-8";
	// csvFile.write(fileData);
	// csvFile.close();

	var count = markerItems.length;
	var theFile = File.saveDialog("Save the cue file.", "*.vtt", "TEXT vtt");

// if user didn't cancel...
	if (theFile != null && count > 0) {
		// open file for "w"riting,
		theFile.open("w","TEXT","????");
		theFile.write("WEBVTT ");
		theFile.write("interactive cues for "+ app.project.file.name+"\r\n");
		theFile.write("kind: metadata"+"\r\n\n\n");

		// for all the selected Layers
		for (var x=0; x<count; x++) {
			/* split the value of the inPoint; converting last 2 characters (frames) to milliseconds, then join it again with decimal */
			var str_in = markerItems[x].start;
			var timeCodeIn = str_in.slice(0,8);
			var timeCodeSeconds = str_in.slice(9,11);
			// 1000/30 fps = 33.333 // 1000 milliseconds divided by 25 fps = 40
			var milliseconds = timeCodeSeconds*33;
			var cueStart = timeCodeIn +"." + milliseconds;

			/* same for the outPoint; */
			var str_out= markerItems[x].end;
			var timeCodeOut=str_out.slice(0,8);
			timeCodeSeconds=str_out.slice(9,11);
			milliseconds = timeCodeSeconds*33;
			var cueEnd = timeCodeOut +"." + milliseconds;
			var cueText = JSON.stringify(markerItems[x].settings);
			markerItems[x].text = cueText;// also update .text?

			//writing the results to the file
			theFile.write(markerItems[x].id);// cue.type
			theFile.write("\r\n");
			theFile.write(cueStart);
			theFile.write(" --> ");
			theFile.write(cueEnd);
			theFile.write("\r\n");
			theFile.write(cueText);// markerItems[x].text
			theFile.write("\r\n\n");
		}

		// close the text file
		theFile.close();
		alert('Export completed.');
	}
}

/**
 * Import a .csv file of TextLayer data
 * if layers match the project, enable Update Text btn to replace text layers else warn user
 * https://www.youtube.com/watch?v=mmFlGCEwrm8
 */
function importTextData() {
	var fileText = [];
	var csvFile = File.openDialog("", "Text: *csv");
	var fileOK = (csvFile !== null);

    if (fileOK) {
		csvFile.open("r");
        while (!csvFile.eof) {
            var line = csvFile.readln();

			if (line) {
				fileText.push(line);
			} else {
				alert("Discarding the empty line in this file.");
			}
        }

		csvFile.close();
      
		// check if data matches all TextLayers in this project
        var count = 1;
        for (var i=1; i<fileText.length; i++) {
            // convert compId and layerId to int
			var row = fileText[i].split('\t');
            var compId = parseInt(row[2]);
            var layerId = parseInt(row[3]);
            // check if this project has a matching TextLayer
			try {
				var layer = app.project.items[compId].layers[layerId];
				if (layer instanceof TextLayer) {
					count +=1;
				}
			} catch(error) {
				// undefined & value out of range
				// alert('Does not exist!' + error.toString());
			}
        }

        if (count === fileText.length) {
            listData = [];
            // rowId, Comp Name, compId, layerId, Text, Font
            // remove listBox items then add new items
            list.removeAll();// items
            for (i=1; i<fileText.length; i++) {
                // convert compId and layerId to int
				var row = fileText[i].split('\t');
				var listItem = list.add('item', row[0]);//rowId
					listItem.subItems[0].text = row[5];// font
					listItem.subItems[1].text = row[4];// text
					listItem.subItems[2].text = row[1];// compName
					listItem.subItems[3].text = row[2];//compId;// item index CompItem
					listItem.subItems[4].text = row[3];//layerId;// layer index TextLayer
          listData.push(listItem);

              // if font is not in fontList, push it to fontList UNUSED
              // if (fontList.indexOf(row[5]) === -1) {
              //     fontList.push(row[5]);
              //     //alert('add font: '+row[5]);
              // }
            }
            //alert('textFileData: '+textFileData);
            exportBtn.enabled = false;
            updateBtn.enabled = true;
        } else {
            alert('Import canceled: This file does not have the same layers!');
        }
	} else {
		//alert('Cancelled opening a file.');
	}
}

/**
 * updateBtn clicked
 * set font and sourceText in the comp layer
 * app.project.item(i).layer(j).property("Source Text").setValue(newValue)
 * https://www.youtube.com/watch?v=6P76aFYmOR8&list=PL0qACgPuF8dWIJrE99hnYj1T3qBh__GRQ&index=26
 */
function updateTextLayers() {
	app.beginUndoGroup("Import TextLayers");
    for (var i=0; i<listData.length; i++) {
		var compId = parseInt(listData[i].subItems[3]);
		var layerId = parseInt(listData[i].subItems[4]);
		var textProp = app.project.items[compId].layers[layerId].property("Source Text");
		var textDoc = textProp.value;

		textDoc.font = listData[i].subItems[0];
		textDoc.text = listData[i].subItems[1];
		textProp.setValue(textDoc);
    }
    app.endUndoGroup();
}

/**
 * SFS logo 64x80px TODO: smaller logo?
 * return the binary logo so it can be defined way down here at the bottom!
 * https://github.com/NTProductions/ui-image-testing
 */
function getLogo() {
	return "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00@\x00\x00\x00P\b\x06\x00\x00\x00\u00A9\u00BFsE\x00\x00\x00\tpHYs\x00\x00\x0E\u00C4\x00\x00\x0E\u00C4\x01\u0095+\x0E\x1B\x00\x00\x05\u00F1iTXtXML:com.adobe.xmp\x00\x00\x00\x00\x00<?xpacket begin=\"\u00EF\u00BB\u00BF\" id=\"W5M0MpCehiHzreSzNTczkc9d\"?> <x:xmpmeta xmlns:x=\"adobe:ns:meta/\" x:xmptk=\"Adobe XMP Core 6.0-c002 79.164360, 2020/02/13-01:07:22        \"> <rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"> <rdf:Description rdf:about=\"\" xmlns:xmp=\"http://ns.adobe.com/xap/1.0/\" xmlns:xmpMM=\"http://ns.adobe.com/xap/1.0/mm/\" xmlns:stEvt=\"http://ns.adobe.com/xap/1.0/sType/ResourceEvent#\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:photoshop=\"http://ns.adobe.com/photoshop/1.0/\" xmp:CreatorTool=\"Adobe Photoshop 21.1 (Windows)\" xmp:CreateDate=\"2020-06-09T09:31:54-06:00\" xmp:MetadataDate=\"2020-06-09T09:31:54-06:00\" xmp:ModifyDate=\"2020-06-09T09:31:54-06:00\" xmpMM:InstanceID=\"xmp.iid:7d5b3e9f-3a8c-e447-8f18-0a472d513bb1\" xmpMM:DocumentID=\"adobe:docid:photoshop:b6627d4c-5a8f-ba43-8dca-d652b89de0c7\" xmpMM:OriginalDocumentID=\"xmp.did:3c35d9f2-a67f-d347-add4-f302a50b2dd6\" dc:format=\"image/png\" photoshop:ColorMode=\"3\" photoshop:ICCProfile=\"sRGB IEC61966-2.1\"> <xmpMM:History> <rdf:Seq> <rdf:li stEvt:action=\"created\" stEvt:instanceID=\"xmp.iid:3c35d9f2-a67f-d347-add4-f302a50b2dd6\" stEvt:when=\"2020-06-09T09:31:54-06:00\" stEvt:softwareAgent=\"Adobe Photoshop 21.1 (Windows)\"/> <rdf:li stEvt:action=\"saved\" stEvt:instanceID=\"xmp.iid:7d5b3e9f-3a8c-e447-8f18-0a472d513bb1\" stEvt:when=\"2020-06-09T09:31:54-06:00\" stEvt:softwareAgent=\"Adobe Photoshop 21.1 (Windows)\" stEvt:changed=\"/\"/> </rdf:Seq> </xmpMM:History> </rdf:Description> </rdf:RDF> </x:xmpmeta> <?xpacket end=\"r\"?>\u00B4\u00FDM\u0099\x00\x00\x12\x1AIDATx\u00DA\u00DD\\\x07x\x14e\x1A\u008Ez\u00DE\u00A3\u00E7IK[R!\x11\x10\x02( \"\u009C\u00D2\u00BBR\u00A4\u0088\u00A0\u00804i'`\u00C1v(\x160t\u00F0\u00B0\x01*\"*\u008A'\u00A7\u00E7\x11\x0B\"\u0082\b\u00CAI\u008F\x02\"\bX@\u00D9\u00DE\u00FBw\u00EF\u00F7\u00CF\u00EE\u00CEL\u00B6$\u00D9\u009D\u00C0y\u00F3<\u00C3\u0086\u00CDd\u00E6\u00FF\u00DF\u00FF+\u00EFW\u00FEI3\u00E4]\u0091v^\u00CE\u009C\u00A24CV\u00C1\u009D\u0086\u00DC\u00A2u\u00F8\u00D4\u009D\u00AFq\u009C\u009F\u00C9g\u00E4\u00A5\u00EB3\u00F2\u0096;\u009E,%\u00EF\u00E6-d\u00FEK\u00D7C\u00FA\u00DA\u00D9=\x04(\u00FF\u00D7\x00\u00E8\x1A\u00A6\u00E9ke\u00F77\u00B5\u00E9p\u00C8\u00F3\u00CF\x7FQ\u00F8\b\u009C\u00F9\u0095l\u0093\u00A7{\u00F5\u00E9\u00B9\u00A5\u00FA\u00F4\u00BC\u00BA\u00FF\x7F\x00\u00D4\u00C7\u00C4k\u00EBZ\x19\u00F2\x1B\u00FD\u00C31\u00EB1\n\u00FC\u00FA\x1B\u00C5:<\x1B\u00DE#s\u0087.G\x00\u00D2(Cf\u00C1E\u00BF\x7F\x00t\rx\u00E2m\r\u00B9\u00C5km\u00E3&\u00B9\u00FD\u00FB\x0E\u00A8g\x1C\fR\u00F075\x18A\u00A3\u0089\u009C\u008B\u009F&\u00D3\u00D5\u00ED>\x07\x10C\u00F5\u0099\u00F9\u0097\u00E2\u00EF\x7FG\x00\u00F0jg\u00E4\u00D5\u00C3\u00E0\u0087\x1B\u009B\u00B4,\u00B3\u00DDuO\u00C0\u00B7\u00EB\u00EB\u00A8\u00D5\x0E\u009A\u00CDd\u009B2\u0083LW]K\u009E\u008F7E\u00FD>p\u00FA4\u00B9\u0096\u00FC\u009DL\u00ED;\u00EF\u00C1\u00FD\x1E\u00D0\u00D7\u00AD\u00DF\u00C0\u0090\u00DD Mk0R\u00BB\x01\x0F\u0086\r\u0097\u00AE\u00C1\u0085\u00FAz9\u00B9<iCa\u0093U\u0096>\x03N\u00B8\u009Ey\u0081\u00FC\u00C7\u008E\u00C7\x16\u00F5O>%S\u00C7\u00EE\u00A4\u00AF\u009BC\u0086\u00CC|\u00C2}\u00C81w\x01\u0091\u00C3\x19\r\u0094\u00CDF\u009E\u00F77\u0092m\u00EC$\u00B3\u00B1\u00F95\x1B`'&\u00C3`\x16\u00C3s\\\u00C2`'e8\x15 \u00F2?\x17\u00E0&cp\u00D3\u00E18\u00DB`\"\u0099\x10\u00BB\u00CB\u00F4\u00FC\u0080\u00EC\u00C2\u008B\u00C4CxU\u00B3\n.\u00E6\u00EF0\u0080ZX\u008D\x02\u00FD\u00E5Y\u009D\u00F1\u00F3\x04\u00E8\u00F5Rc\u00F36\u009FZ\u0087\u008F\u00B6\u00B8\u0096?O\u00BE\u00DD{\u00B1|\u0081\u0098\x13\u00F7\x1F=F\u00F6i\u00F7\x12\u00EEGXU\u00C2\u00B3\u00A5\u0093\u00FF_\u00A7>\u0099\u00BB\u00F6!O\u00D9\u0087\x14\u00EF\b\u009C>C\u00EE\u00B7\u00FEA\u00F6\u00BB\u00EFw\u009Bo\u00E8\u00BE\u00DBX\\\u00B2\x12\u0086\u00F5\x1E\u00A8Y_}\u00AD\u00AC\u00A6\x00\u00B4.\u00C6\u00F4'\u008C\u00FF\x121\u00D6\u00F0\u0099\u009E{\u0089\u00BE^n\x1D}\x1D\x1D\u00C6\u009Dy\u00BD>#\x7F\x1C\u00E6<\r\u00CF\u00BE\u0098}\u00F1\u0085\u00E6.\u00BD\u00CF8\u00FF\u00FE<\u00D9\u00EF{\u00D0k\x1D9\u00D6j\u00EE\u00DD\u00FF{s\u00A7\x1E\u00E5\u00A6\u00EB:m3^\u00D1|\u00A3\u00B1Y\u00AB2s\u00C7\x1E_\u009A;\u00F7\u00FC\u00C62t\u00C4i\u00DB\u00C4\u00BF:\x1C\u00B3\u00E7\x04\u00DC\u00AF\u00BCF\u00DE\x1D_R\u00D0d\u00A6D\u0087\u00FF\u00FBc\u00E4x\u00E4q26n\u0089\u0089\u00EA\b\x0F\u0097'\u00AF8\x19\x14\f\u009El\u00A3'\u0090w\u00DB\u00F6\u0084\u00F7\f\u00BA\u00DC\x02P\u00CF\u00BF? \u00966\u00C7\u00C3\u00B3\u00DD\u00B6\u00F1S,X\u0088\u00A3\x18\u00FF\x01\x00T\u008E1\u0097c\u00CC\x07\u00ADCo/\u00B7\u00DE6\u00C6\b\u00F0\x1D\u008E\u00D2E~\u00F7\x1B\u00EB\u00C9r\u00E3\u00CDFH_f\x1A\x06\u0094i\u009Bx\u00D7\x19\u00D5\u00CD=\x1E\n:\u009D\x10?;\x05\u00F5\x06a\u0098\u0082\x0E\u0087\u00F8.\u00DE\u00EAF\r\u00D0\u00ED&\u00EF\u00A6O\u00A1\u00E7\u00D3\u00C9\u00D8\u00A8\x05A\u00BA\b\u00AA\x12s\u00E2\u00AA\x13\u00EA\x00\t\x13Ra\x1D<\x02+\u00FE\x0E\x05\u00F4z\u00AA\u00F2\u00C1\u0086\u00D5\u00ED\u0091\u00C6\u009B`\u00CC\u00F6\u0099\x0F\u009B\u00F5ur\x1A\u00B3_n\x02\u0091\u00B2\u0090\x06G\u00E0\u0097\u00D3\u00E4\u00F9h\x139\x1E}\u0082\u0080\u00BE\u0098\u00B0X\u00F1\u00AAL\u00BC\u00E2\t)\u0081:\u008A\u00D3xu;\u00B2\u00CF\u0098)\u00DCd\u00E0\u0087\u0093Z\f\u0095\u009C\u00F3\x17\u00FBq\u00EF\u00B6i\u00D0\u009Bv\u00CE\u00D2\u0085\u009E\b\u0080\x10g\u00A0C\u008E\u00C7\u00E6\u0092\u00FB\u00F57\u00C9\x0B\u0083\u00E5\u00DB\u00F9%\u00F9\u00CB\u00BF\x15\"\u00E7?\u00FA=\u00F9\u00F6\u00EC%\u00EF\u00E7_\u00C08\u0095\u0091\u00EB\u0085\x17\u00C5\u00F5\u0096>\x03\u00C9\u00D4\u00A2-A\u00A5\u00C4j\u00B3(\u00C7\x13\u00F5j\u009D\u0090\b\u00D8\"\u00DCS'\u008C&\u00D4\u0091\u00CC=\u00FB\u0091\u00FD\u00AE{\u00C8\u00F5\u00DC\n\u00F2\u00FCk\u00A3\x18\x0B\u00DB\u009E\u00F0\u00F8\u00FC\u0087\u008F\u00881\u00F3\u00D8\u00D9f8\u00E7-\"\u00DB\u00D4\x19\x148+K\u0092k\u00E5K\fn\u00B740\u00AF\u00DE0^\u00C1\u0088\u00BE\u00FEp\u0082\u008CE\u00CDH\x7FY\x06\u00E9\u00FF\u009C)Y\u00E9\u00BCb\u0088qs26m%NC\u0083+%\u00C3U\x0B\x13\u00AD\u0095%DV\x185\fT\u0093IW\x06\x06\u00DB\n\u0080!\u009E\u00CD\u00AA\u0085\u00B1\u00F0\u0098\u00C2\u00E3\u0083\u00FB\x15c6d\u00E4\u008B9\u0088qb\u008C\u00FE\u00EF\u008E\u00CA\u009E\u00E8\u009Dw\x19\u0080\u00FEl\x04\x07\u00BA\u00DF|[6X\u00DF|K\u0086\u0082&\u00F2D\u00F8\u00A1\u00FC3\u008Bqv\x03\u00E9\u0093\x1FX\u0093\x13MB]\u00C4\u0098\u00C2\u00E3\u00E3\u0093\u00BF\u00E3\u00B1\u0087\u00E7\u0080\u00EF\u00D8`\u0087\x0F\u00EF\u00A7[\x01@\u00EE\u00A44 :\u00CE\r4\u00C2\x07\u0093\x16vI\u009A\f\u008C\x07\u00C5\x0F\x0F\x7F\u00F2\x00C\u00ABh\u00A8_T\u00E9\u00DF\u00C2]\u00C9\u0093\u00D0@r\u00D8cD\u00E6\t\u0095\u0081\x14Mc\"1\u00C5\u00B7}\u0087\u008C\f.\x12\x04E\x03\x00\u00E0B!M\u008D\u00F1YB\u00E0\x0B\x04\"#D\u00D5tU;\u00B8\u00C4\x16\u00F1'\u0087\u00D5\u00E3\u00BF\x15\u00864<\u0081\x14\x01`\u009B\u00C46-\x02\u00C0\u00FE\u0083\u0090\u008A\u0086\u00A5\f\u00C0\u00BDJ\x00<\u00EB\u00DFI\x1D\x00\u009E\x00\u00EC\u0088\x17\u00F7\u00B5\u00DC4\x18\u00C8\u0097\u00E1s\x10y\u00BF\u00D8I\u00D6\u00E1\u00A3\u00C8\u00BBe\x1B\u00D9\u00EE\u00BE_\u00F2\x10\u00B1\u00F8\x00,\u00BF\u00FB\u00E5W1J\x1FYG\u008E#\x10\u0099\u0094\x17\u0083\u00EF\u00E1\\\u00F6\u008C\u00AC\u00EA\u00C7\u008F\u00B3\u00ADX\u00CA\u00B4p\u0081\x7F\u00DF~\u00D9:>\u00BFR\x1B\x00\u008AK(`\u00B5\u0092u\u00C4\x1D\u0082\b\u0081\u0088\b\x03k\u00BBs\u00AA@\u00DF\u00FE\u00F0la\u009C\u00A2\x06\u008A\u00952\u00FD\u00A5\u00AB\u00E0 |8\x1E\u009F+\x00I\x19\x00\u00DC\u00C3\u00B9`\u0089\u008A\u009C\u00C1\u00B0/K\u0083h\u00CE\x0F\u00FC\u00F8\u0093\u00EC\x1F\x11\u0080\u00A4\f\x00\u00F4\x17\u00F4X\x10(\u00EB\u00B0\u0091\u00E4\u00FF\u00F6\x10V~\u00B4pQ\u00B6\u00F1\u0093\u00E1F\u00F7\u0091\u00FD\u00A1Gc\x03\x00k\u00CD\u0089\u0092\u00F0\u00C1\u009CB\x13\x00 m\u00F6\u0087\x1E\u00919\u00CB\u00A9\x1F\u00C9\u00D4\u00BC\u00CD\u00DB\x12\x00\u00F8O\u00E4\u0081\u00F3\x17\u00A7\x0E@V!\u0081\u008AR\u00D0\u00EE \u00EB-\u00B7G\x03\x00\x03\u00E4\\\u00B2<\u00E6s\u00F4\u00B0\u00D6\u00BE\u00FF\u00EC\u00D6\x1E\x00\u00B8Kf\u00A5\x11\u00BEc0p\u00A4\u00F9n\x14\x00v\u00D6M-\x00\u0080\x01\u008B\x0B\u00C0\u00D7{\u00C8\u00F5\u00EC\nvC\x15\u00FE\u00AE\u0080\u00CC\u00D7w\u00A3\u00A0\u00D5V3\x00\u0080<U\x00\u00E0\u009F\u00D1\x00\u0080r\u00A6\n\x00\x1B\x1C\u00EB\u0090\x11\u0082\u0083[\u0087\u00DE\x16\r\x00V\u00D8\u00FD\u00EA\u00EB\u00EA\u00880$\u00A6\b\u00B4T\u0094UK\x15\u00B0M\u0098z\x0E\x01\u00C0\u00CAs`\x12\x13\u0080]\u00FF\x11\u009E\u0081W\\\u00E9\u00E2\u0084\u00A5~\u00FA\u0099\u009A\x01\x00\u00F7\u00B0\u00DE2\u00F2\x1C\x01\u0080\u00BF\u00E7\u0089\u00F2\u00C1\u0092\x10\x05\u00C0W\x00\u00E0\u00E3O$B\u00A4dk J\u00DE\u00CD\u009F\u00D5\x1C\x00\u00C3\u00CE\x15\x00lq\u00A7\u00DF\x17\x1F\u0080\u009D_\u0091o\u00EF\u00BEh\u00BA\n\u00D2T1\u008B\u00F4\u00FB\x05`\u00DA\u00BD\x12\x00\u0083n\u0095\x00`c\u00C8\x00\u008C\u0099H>pr\u008E(U\x00\u00C0\u00FA\u009BZ]\u0087\u0088\u00ED\u00ECy\x00@\u00C1\x034\x01\x00Q\u009A\u00E3\u0089\u00A7\u00D4\x00\u00DCq\u00A7\x00\u00C0>e\x1A\u00BC\u00C0n\u00F2\x03t%\u00CD\u00D5g\u00C2\x03t\u00BFQ$1j\u00CE\x06\u00DC\x1E\u00C3\r\u00E6\x16/\u00E4\x01F\x00\u0080\u00E8\u00A6\f\u00C0\u00E5\u0099\u00E4(](1\u00AEo\x0FcRN\n\u009C\u00FC\u0091\u0082.\u0097  A\u008F\u0097\x02?\u00FF\"\u00E2\u0083\b\x00\u00E9yd\u00B9y\x18\u0082\x11o\u00CD\x01\x00V\x1Aa\u0082'Nrna=\u00C7\x023\u0095\u00B1\u0080\u00FD\u009E\x07\u00B4\x01\u00E0\u00A9\x05\u0089\u00B3G,\x01J\x00\u00D8p\u008E\u00B93\u00EA:My\u00C0_\u00EF\u0096\x01\u0080\u00ADA@\u00B6\u0084\x01\u0098\u00ECC\u0090\x12\u00A1\u00C2\x0B\u0097\u009E?\x00\u00EE\u0098p\u00EE\x00\u0080:\"J]\u00C6\u00F9\u0080\u00B1\u009Ew\u00DF\u0097\x01X\u00FCt\u00EA\x00\u00FC9SP\u00EA\u0084\x00\u009C>\x13\r\u00C0\u00E8\u00F15\x0B@\u00C80G\u00F2\x01\u00E9y\u00B38#t\u00B3{\u00DDz9\x1A|\u00F1\x15\r\u00BC@}.v&\x04\u00C0\u00BBi\u00B3\u00E0\u00FD\x11\x00j\u00C3s(V(\x02\u00C0\u00EC'\u00B5\u008B\x06\x15R\u00E9\u00DD\u00B9\u008B\u00A9\u00F8\u00D44\u00FC\u00D3\u00D5\u00B9t\u00B9_\u0095+K5\x16\be\u0081\u00DC\u00EB\u00DE\u008E]'8|\u0084\u008Cpyz&BJ\u00D79uF\u00D4\u00B5\u00CC\u00DFE\u009A\\\u0083|\u0080K\u0091\x0F\u00F0\u00BC\u00F7>\u00832,\r\u00ABu5\u00C4,\u00E2{\u00B8 \u00A1IJ,\u00B4\u00BA\u009E\u008D\x1F\u00A8E\u00FF\u00CC\u00AFd\u00EE\u00D4S\x02\u0099U@\u00C9\x1Ec\u00A8\u0080u\u00D4\u00F8\u00B8\u0089\u0093T2B\u00AEW\u00D6\u0086\u00B2\u00C2\u00B5\u00B3s!\u00AEgU\u00A9\u00A2\u00FAE\u00DA\u00E4\u00E2\x10\u00ECpN?p&Tw\u00F1\u00FB\u00C96v\"\u008CdVl\u00FA\x1C\u00C3\b2\x7F\u00D0\x02\x00\u0091\x13,\u00FBHY\x17\u00F0\x01\u0080k\u00A0\x029\x7F\x00A8\x19\u00AE\u009E\u00F8\u008F\u00FF@\u00C6\u00A6W'W\u00CC\u0088\u00C3\n]\u0088\u00FC\u00C2\u0085\x13#\u00D7\x0E\x14\u00A2\x7F\u00CE\x00\u0080J\u00FA\u00F6\u00EEW\u00F2\x1D\x03\u009EY\u009C\x06\x06\u0096f\u00EE\u00D2{;Wa\u00C5 \rFfHR\u00A4\u00A6\x11\x00\u00E18\u00DC\x7F\u00E4;2\x16\u0095HY\u00E2X\x00\u00C4\u00E0\x01\u009A\x00\u00C0\u0094\u00BBaSR2^,\u00FA1<\u00B3\u00B6\u00A8\u00FC\x1A\u009B\u00B5^\u00C3\u00AB\x13\x16S\u00CB\u008D\u0083\u00A2\u0093\x15I\u00BB\x1F9\x0E\u00E7\u00C2\u0084\u00C8\x14\u00C7\x03`\u00D4\u00B8\u009A\x01\x00\x12gj\u00D7I\u00A4\u00E8\u00C4\u00E1\u00F6\u0090\u00B9[\u00DF]\u00FA\u008C\u00BC\x0B\u00A5Zyv\u00E1\u00A3\u00FE\x03\u00E5\u00B2\u00E5E\u00C4\u00A6Um\u0080-\u00B8\x1D\u00BE<\"\x01\u00C5\u00B1%\u00C0\u00A0kH\u00C6\u00926\"[\u00A45\x00\u0082f\x0F\u00BC\x05\x16\u00DE'I9h8\x02\u00AF\u00F5\u0098\u00B7\u00D4 \x015\x18\u00E1\u00D9 \x17G\u009C\u00F3\x16k'\x01\u00F0\u00BF\u008E\u00B9\u00F3\u00A5\x07\u009F<)&\x19\u00CF\u00BE\b\u00B7\u00D8\u00A89y?\u00DF\u00A1-\x00\x158\u0086\u00EF\u00C0A\u00FE~\x0E7WH\x00\u00D4\u00CB\u00E9\x00\u00AB\x18\u0089B\u00DC\x1B\u00DE\u00D3$\x17\x1F\x01 \u0094\u00E5\u00E52\u00B7\u00E9\u00BAN\t\u00ED\x0B36\u00CB\u00E0\x11B\x155\x03\x00R\u00E8\\\u00B4L\u00E6\x00\\\u00FC\u00A9\u00A3\u00BB%\u00D2\"\x03q\u00CF\u00B1\u008E\u009D\x14\u00E9V\u00F2\u0097\x7F\u00A3\u008E\u00D5S-H\u0080^\x0B\x00\x10\u00EB\u009B\u00DAuLl`\u00F1;\x06)h4J\x00\u008C\u009E\u0090\x1A\x00\u00A1\u00BA\u00A0\u0092\u008F8\x17/\u00F3\x01\u0094kd\x002\u00F3\u00D3\u00CC\u00DDn\u00FC\u008A\u009CR\u008F\x0E7E\u0098\u00DA^\u00AFbjI\x03\u0090\x01\x02\u00B2\u00E6\u00B5*\x03\u00C0\u0089Rs\u00EF\u00FEX&\u00A9bo\u00BF\u00F7\u00C1\u00D4\u0098 /da\x13\n(2M\u00D6\u00D1\u00E3O\u00C1\u00E8f\u00CAMR\u00D0\x05cQ\u00B3\u0095\u00AA\u008B\u0086\u008F\u00D6\u00A4F(\x00X\u00FD\u00AA\f@e*\x00\u0089\u00B1\u00F4\x1F*\x12\u00AA\u009A\u00C4\x02\u009Cj\x07\u00F3\f\u0086\x1B\u00B0\u00DCn2u\u00EA\u00F1\x05\u0080Vw\u0089\u00E1\u00C1c<\x1B\u00E5\x06%\x0Eg5\tB2\x0BD|!)\u009F\u0087,\u00BD\u00FA\t\u00AB\u009C\u00887X\x15\u00EE0\u00D5hP\u00B8aE\u008C\u00E1?\u00FC\x1D\u00BB\u00E2\u00E5\u00A2\u00F9K\x05\x00t\u00C2\u00F1\u00D8\x1C\u00AF\u00B2~.5G\u00A4NA\u00BD[\u00B6\u0086\u00CC\u00AF\u008F,}\x06$\x06\u0080\u00DD\u00E6\u00F4\u0099\u008AZ\u00E5\u00AA\u0084\u00D7W\u00C5\x00\u00BA\u009E[\u00A9\b\u0082\u00FE\u00CD\u0086vXT\u009F P\u00BE\u00CC2`\u00C8\u00910%\u00E6vVc\u00CBkS\u00A3\u00C4!\x03\u00E4?X.\u0093\u00AC~\u0083\x13\u00BAX\u00E15B\u00F9D\x01\u00C0\u00AA\u00D5\u00C9\x03\u00C0\u00FA\u008F\u0080\u00CB\u00A7\u00E8Pu<\u00F4\u0088\x1DF\u00FF\u008A\u00E8FI\x1D\x18a\u00E3\x16k8W\x16!Dc&\u00A6F\u0088B\u00DD%\u00CAT7W\u0089\x13\u00DD\u0093'\u00EBzaU\u00E4z\u00F7\u009A\u00D7\u0093\x07\u0080=\n\u0097\u00DA\\\u00AE\u0088\x04\u0082\x01~\r\u00FD\u00FFc\u00CCNQ\fl\u00B8\u00E7\u00ED\rj\u00F4Y\u00FF\u0092u\u0087`|\u00A6\u00E6m(B\u00B3\x19\u0080\x11wT\x0E\u00C0\u008B\u00AB\u00E5\u00C4\u00C5\u0087\u009B\u00A4\u0086\u00AB$\u00B3@\u008E\x07\u00E5\u008A07z\u00C1\u00D8/\u00E3\x1E\u00E6\u00D8\x00\u00D4\u00CD)\u00B4M\u0098\x12\u00E9z\fp\u00E6\u0094\u00BB;\u0092\u00ED\x07\u00E2\\\x7F\u00CB\u00B6\"\x07\x10\u0091\u00AA\u00C9\u00D3\x12\u00BA5\x06\u00C0\x1D\u008A\x1E\x05\x00\x1F|\u009C\x1C\x00<f\x0E\u0081?\u0092\u00FB\u0090]/\u00AF\u00E1\u0094}\u00CF\u00F8\u00BD\u00C2Y\x05i\u00A6k\u00AF\u00FF0\u00D2\u00F9\u00C9\u00B5\u00BD[G%m\u0085\u00F5\u00EC\u0082\u00B8Jl\u0091\u00DB\x10\x1D\u00DC\x18\u0091\u00C0\u00BD\u00F2d\u00BD\x1F\x7F\"\x03\u00B0\u00F5s\u00E1I\u0092\u00A9P\u009B\u00DA\u00DE@A\u00BB]!}\u00A3Oa.\u00F5\u00E2\x03\u0080\u00C0\b\x17\u008C\u00F7| '\x0E\\\u00AC\u0083\u00C9\x02\u0080\u00C9\u0098{\u00DC\u00A4*v8\x1E\u0098U9\x00\u008A\u00E7\u00FB\x0F\x1D\x16\u0093\u00A9~q\x06\u00E2\u00FF\u00B7\u00D9r&\u00EA\u00E4)2^y\u00D5\u00CBJ\u00F1\u008F\u00D9-\u00CEm\u00E9P\u0083\u00C8\u0092\to\u00D0\u00E2\u009A\u00A4\u00BC\x01\u00B3:\u00B6\u00FAaV'hh\u00E9\u00C2\u00C4\u0081\x16\u00A4\u0086k\u0087\u00AA\u00B6\u00BD\u00EAJ@(\u00A3\u00E5\u00FBr\u0097:\u00D9[GwS\u00E5\u00ED\u00F2\b\x11M%\u00AD\u00D7\u00AB\u00CAe0$L(\u0092\u00AA\u00C6\u00C0\u00EA+\x0F\u00EE,M\x18hAo9i\u00AA\u00EA\u00E5)lR-;\u00C4\x00ssV8\u00A0\u00E2\u00C32p\u00D81\u00EEt\u00AF\u00D2~\x01\x18\u008A\u00FE\u00AE\x15/\u00CA\u00838\u0088\u00E0\u00A8\u00A0Q\u00B5\u008Da\u00C5r\u0094\x00\u0080;C*\x03\x00b\x1F\u0091\u00C0\u009F~\u0096\u00DA\u00EBt\r\u00AB\u009E\x00\x05\u009Bt\u00BF\u00F1\u0096\x1C\u00FE\u00EE\u00D9\u00C7\u0095\u00E7\u0085a\u00F6W9\x00\x19y\x7F2w\u00EDs0\u00E8t\u00C9\x06\u0084\u0093\u0099\u00D5\fJ\u00A4\u008E\u008F\u00BBT\x00\u00B8_[\x17\x1F\x00\x16\u00DDF-\u00C8\x7F\u00E2\u0094\f\x00$\u00D1\u00D8\u00ACu\u0095\x01\x10\u00C1\u0094h\u00B3\u00B1*%\u00D8\r\tnV\u00F5\x1D#\u009C%\u00CA\u00C8\u009B\u00C1\u00B41\u0082\u00E2W_K\x12P\x1DQ\u0084!\u00E2Z\u00A3j\u00B7H\u00D9GQ\u00AD1\u00AA\u00AC\x10\u00EC\u008D\u00927\u00B0\x0B5\u00B5j/u\u0099Vi\u00F5A}W\u00AFUt\u00B0\u00FF\u00C2I\u0098wX\u00B5\u00AB\u00B5e\x06\u00AB]\u00CF:\u00F4\u00B6\x13\u00E1\u00A8LJ\u0095M\u00A9Vl.\x00\u00981S\r\u00C0\u00FBe\u0089\x01(i-RV\u00912\u00B6\u00D5F\u00E6.\u00BD\u00AA\u00E4\n\u00E5\u00D5\u0097\u009B\u00AC\u009CK\u0097\u00F3\u0098\u00BB\u00C5\u00DBkT\u00C9\u00CE\u00CE\u00C2\u00C7\u00BC\u009FmS1)CQ\u00D3*{\x04vw\u008E9\u00F3\u00D5%\u00B1\u00AD\u00DB\u00E3\x03\u00C0\u00BC\u0081\u009B$\u00C3\u00C9K\x06\u00C0\x02\x00:\u00F7\u00AC\x1C\u0080\u00D0F\x0B\u00F7\u00DAu\u00F2\u00EAs^\u00A3M\u0087\u00ED\u00BC+&\u00A9MS0b\u00E9\u0096\u00FECN\u0092O\u00B6\u00A6\u008E'\u00E7\u00C5,l\u00C4\u00B3\u00C6\u00DCx\u00A9<|\x001\x1E\u00B3\x13\u00BC\u00A1k\x1F\x15y\u00E18\u00DE\u00D2\u00F3&\u00A9q\u00BA\u0092\u00A8O\u00F4\x17(,?\u009E\x1D\u00C4\u00EA\u00F7I~\u00D7\x18\u008BM:l\u0081b\u0097'\u00B3D\x16\u00B3\u00AA\u00E4\f\x05\x00\u00A1t\u0098\u009C\u0090,O\f@\u0097\u00DE\x14\u00AEQ(r\u00F8\u0089\u00B9\u0083N\u00EAF\u00F7\u00ED\u00DE\u00A3\u00DA\u00BD\x02u*\u008B\u00A7\u00FBU\u00DF6\u0097\u0091\x7F\u00A9\u00A9}\u00E7\u00FD\u00BC\u00CFO\u00CE\x15|\x16jyoX9\x00O?\u00AB\x06\u00E0\u009BC\u0089\x01\u00E06\x19\u0097K\r\u00C0\u00B0\u0091\u0089ChH\u00A4\u00E3\u00A9\u0085\u00EA=A\u00F7\u00FF\u00CD\x05\u0083\u00D8N\u0093}\u0083\x10\u00A3^\u008E9\u00F3\u0082\u00AA\u00B2\u00F5\u009Cy\u00A2\x17\u00A82\x1B\u00C0\u00DBiT6\u00E0\u008B\u009D\x10\u00E7\u00DC\u00F8=\u00C6M[\u0089v\u009A\u0088\u00C4\u00D9\x1Dd\u00EA\u00D0%v\x1A-_*\u00C53\u00DBT\u0082\u00C6MX\u0090\u0088eU\u00D9SX\u00E5\u00DD\u00A0\u0086\u00C2&\u00AB\u0095=\u00BC\u00CC\x11,\u0083\u0087\u00C7lxVEdE\u00CD\u00C8\u00FD\u00CAZa\u00D9y3\x06g\u0084\x12q{\u0096\x02\u00CB\u00A0[\u0085\u00941\u0095\u00E5\u00A6\u0086\u00B8\x06\x10\u00A0\x18\u009B\\\x05\u00BA|H\u00B1\u009D\x0E\u00E3\u00EA{\u00F3q\u00A8h\u00A6\u00A6;Gq\u00C3ls\u00F7\u00BEG\u0083f9\u00B2\x0B\u00FC|Z\u0094\u009C\u00A4Rw\u0082]#\u00AC.Lg\u00C3\u00BBE\u00AA\x10E\u0086w\u0099\u00C4\r\u0085\u00F9\u00F78\u0095yLa\u00F8\u009EZ\x10\u0080A\u00ECW#[g\u00A1\n\u00DD\u00ED\x0F\u00CC\u00F2\u00A8tz\u00FF\x01\u00D1\x1A/\u00B26\u008Az\x7F\u00AC\u00CCP\u00B5\x12+|m\u0082\x1D%l\x13\\/\u00ADQ\u00AB\x17\\6~\u00BF<\x16\u00E5\u00D5f\u00EF0t\n\u00E28\u00CB\u00FD\u00DA\u009Bj\u00C3\x06\u00EB\u00CB|=\u00AE\x7F\u00D7\u00F2\u00E4\u00BDDl\\\u00E7-R7^p\u00BD\u00AFu\u00FB\x1D\x18C\u00ED\u009A\u00DD<\u00ADkp\x01\x02\u008B\u00D7\u0099\u00D0\u00A8A\u00D8+h\u00AC\x16\u00A9\u00F4\u00C4\u0093\x07\u00B9\u00AA0y\u00DE]b\x190\u00F4WHh\u00E3s\u00B3{<3\u00FF2\u00F0\u00EB\u00CF|\u0088\u00D5U  \u00EA\u00E2\u00ED.\u00C9\u0084\u00CE\tO\u00B6/l\b\x11\x0F\u00B8V\u00BCT\u00A1\u00E1\u00C8\u00CFi6\u00A7\u00BEvv\u0097s\u00BA}\x1E+\u00A13]\u00D7q\u00A7\u00FF\u00BB\u00EF\u00D5\u00A2\u0088\u00E8M\x10\u0097\u00F0\u0086FM\u009A,\u00EA\u008B\u00AA2\u00C7\x11\u00EA\u00C9\x07\x10\u00E9\u00CDr\x01\u00F0\u00A1\u00C9\u00BEW \u00F9w\x07\u00E47\u00E2,r\u00B6\u00A9]\u00C7\x1D\u00BECG*\u00F4\u00C0yE\u009F\u00A0\u00B0\u00E2\u00A9\u00A8\x04\u00EF=\u0086\u009B\u00E5\u00DA\u00BEr\u00D7\u00A7\u0084th\u00F2\u00B5\u00B2\u0086\u00A4\u00F2\u00F2\u0095\u00D4^\u00A0\u00C0 \u00D4\u00CD\u00C92\u00B6l\u00BB-\u00D6vw\u00FE\u00CE\u00DC{\u0080\u00B4\u00EF\u00B7:\u0099]\u00B6\u00F2\u0090 \u00DEz'b\t\u00B7[}c\u00F8z\u00FB\u00DD\u00F7{p\u00CD\u0090T\u00DF<\u0093\u00FAk(\x18\u0084\u00F4\u00BCZ\u0088\x12\u00D7\u00F3F\u00E5X\u00DB\u00E8\u00B9\u00BE`\u00BA\u00F6\x06\t\b\u00F6\x14\u00F1r\n\u00BC\u00E2|\r>\u00F9\u00F5\x1A\u00CA\u00D4\u0098\u0092\u00E3#L?\r\u00C9\u00E8\u00A5\u00C5\u00EB4\u00B4{\x1FGv\u00E1\u0085\u0088\u00D8\x1Eu<\u00F2\u00B8?\u00E8\u008C\u00F1*\f\u0084\u00A6\\\u00F1\u00E1\u00D0\u0096\r\u009A\u00B4\u00C3\u00BC@\u00DA\f\u008D\u00C0\u008Ai5o\u00D0\u00E6\x0ESeRT%Q[\u00B62\u0090\u00BB\u00A0z%\u00FF\u009B/Qa\u009E\u0080\u00F0\u00D3\u00D2w\u00E0aeFV\u009D\x13s\x0B\u009A\u008B`Et\u00A3\u00B1\u00EBd\x1D\u00E7d)\u00F7\x10\u00C5{\x19\u0083\u00B3t\x11\x13\u00ADg\r\x19\u00DA\u00BEg\u00A8F^M\x03\u0095\u00D0\u0081+\u00ACp\u00CC~\u00D2\x1F\u00EF\u009DA\x12ouR\u00F0\u00B7\u00B3\u0089{\u008A7o!K\u00EF\u00FE\u00E5\x00vPu\x18\u00DE\u00F9\x7F\u008F\x10\u00BFx\u00A5n\u00FD\u00CE`g\u009B]\b\u0089\u0083g\u00CFV\u00EB\r\x0F\u00CC)l\u00E3\u00A7\u0098\x10\u00EB?\u00A1\u00CF\u00A8\u00B9\u00B7K\u00D5\u00F8\u009B\u009A\u00F4Y\u0085\x17@g\x07\u0098\u00DAt\u00F8\u00D0Y\u00BA\u00D0\u00EF?t$\u00FE\u00ACa\u00DD\u00B9\u0096g\x1B;\u00E9\u008C\u00A1\u00C1\u0095K\x00`qM\u00BF_\u00EC\u00DC\u00BDG,\u00AB\u0090\u00FB\u0092\u00DB\x1B\u008BK\u0096\u00C3\u008A\x1F\u00E3@\u0086\u00C3\u00D8\x00T\u0080\u0083\x18\u00C7\u00DC\u00F9~\u00EEX\u00D5g\x17N\u00C7\u00C4u5!\u00EE\u00E7\u00FFej\u00B9\u00A2'\u0091\reS\u00C4\u00F2Sx\u00D7\u0096\u00B9W\u00BFm\u00C6f\u00ADV\u00C1\u00FD\r\x00i\u00CA\u00AEX\u00BB\u00AB\u00E9\u00F3\u00BF\x13\x16\x13\u0097h\u00C0\u00CC2\x00\x00\x00\x00IEND\u00AEB`\u0082";
}
