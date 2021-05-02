/***********************************************************
 * TextManager.js AE script - Tjones - 7/2/20
 *
 * Build the English AE file
 * Retrieve TextLayer items and display them in a list box
 * Export the list to a csv file within the project folder
 * 
 * Copy the project to a new folder for another language with filename that reflects language.
 * Open the copied csv file in Excel - Tab delimited
 * Edit the text column, change the font name and Save
 * 
 * Open the new AE project, run this script
 * Import the edited csv into the project and Update the TextLayers
 *
 * https://gitlab.com/statefoodsafety/experimentation/ae-textmanager
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
 * make this script dockable
 *
 * can a list item row contain buttons? w/visible, delete row icons?
 *
 * Remove Text Layer Btn? http://docs.aenhancers.com/layers/layer/#layer-remove
 * 
 * Need to be able to change the Font.  In the file or with a dropdown?
 * https://stackoverflow.com/questions/57450142/find-available-fonts-in-adobe-after-effects-with-extendscript
 * Or create a dropdown of known fonts used for translations to select from
 * do different language fonts need to change the size? this could need to be done manually.
 * http://estk.aenhancers.com/4%20-%20User-Interface%20Tools/scriptui-class.html
 * ScriptUI.applicationFonts
 *
 * need to reinstate the line breaks \r\n in sourceText
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
// selected item and index of the clicked ListBox row for editing
var selectedItem = null;
var listItemId = null;
// set compId when an item is selected, used to add new text layer
var selectedCompId = null;
// String of TextLayer items for csv file
var textFileData = '';
// Array of TextLayer items
var listData = [];
var layerDocs = [];
// turn on Text Editor
var debug = true;

var mainWindow = new Window('palette', 'Text Manager V2', undefined);
	mainWindow.orientation = 'column';

var mainGroup = mainWindow.add('group', undefined, 'mainGroup');
	mainGroup.orientation = 'row';
	mainGroup.alignChildren = 'left';
	//mainGroup.add('image', undefined, './logo-small.png');
    mainGroup.add('image', undefined, getLogo());// internal 64x80px
    
var rightSide = mainGroup.add('group', undefined, 'rightSide');
    rightSide.orientation = 'column';
    rightSide.add('staticText', undefined, 'OS: '+ $.os +' Folder: '+rootFolder);

var instructionPanel = rightSide.add('panel', undefined, undefined);
	instructionPanel.text ='Instructions:';
	instructionPanel.size = [500, 90];
	instructionPanel.alignChildren = ["left","top"];
	instructionPanel.spacing = 10;
	instructionPanel.margins = 10;

var instructions = instructionPanel.add('staticText', undefined, undefined, {name: "instructions", multiline: true, scrolling: true});
    instructions.size = [490, 60];
	instructions.text = 'Export the list of Text Layers to a csv file within the project folder. \rCopy the project to a new folder. \rEdit the Tab delimited csv file. Paste text changes and font name then save. \rImport the edited csv into the new AE project and Update the Text Layers.';

var dataPanel = mainWindow.add('panel', [0, 0, 650, 200], 'Text Layers:');
	dataPanel.orientation = 'column';

var list = dataPanel.add('ListBox', [0, 0, 640, 180], 'data', {
	multiselect: false,
    numberOfColumns: 6, showHeaders: true,
    //items: listData,
    //columnWidths: [30, 150, 300, 50, 30, 30],// maybe?
	columnTitles: ['id', 'Font', 'Text', 'Comp Name', 'CompId', 'LayerId']
});// rearrange
// rowId, text, font, compName, compId, layerId
// Indicators (valid Comp in project), Actions (delete row from list)

// populate the ListBox items
getTextLayers();

/**
 * list item clicked,
 * set the viewer to the selected list item comp
 *
 * put selected text in textEditor field and enable it
 * update the fontList dropdown selection to the font in item
 */
list.onChange = function () {
	if (list.selection != null) {
		listItemId = list.selection.index;
        selectedItem = list.selection;
        removeItemBtn.enabled = true;
		updateRowBtn.enabled = true;
		addLayerBtn.enabled = true;
		editPanel.enabled = true;
		//textEditor.active = true;// set focus?

		textEditor.text = list.selection.subItems[1].text;
		var fontId = fontList.indexOf(list.selection.subItems[0].text.toString());
		if (fontId > -1) {
			fontDD.selection = fontId;
		}

        // check if comp exists in project 
        var compId = parseInt(list.selection.subItems[3].text);
		
        try {
            var comp = app.project.items[compId];
            if (comp) {
                selectedCompId = compId;// valid comp
                comp.openInViewer();

				// if layer exists update else add
				var layerId = parseInt(list.selection.subItems[4].text);
				var layer = validLayer(compId, layerId);
				if (layer) {
					updateRowBtn.enabled = true;
				} else {
					addLayerBtn.enabled = true;
					alert('Selected Layer not found in this project.\n' + comp.name);
				}
            }
        } catch(error) {
            // compName id:, undefined or value out of range
			addLayerBtn.enabled = true;
            alert('layerId: ' + list.selection.subItems[4].text + ' Does not exist in this project!\n' + error.toString());
        }

		// Don't need to select the layer to update it
		//var layerId = parseInt(list.selection.subItems[4].text);
		//app.project.item(compId).layer(layerId).selected = true;
	}
};

/**
 * font list dropdown and text editor
 * selecting a row updates the selected font
 * use font match names to change the font!
 * Look up the matchname for the font in illustrator/AE? under Windows->Documentinfo->fonts
 * English - Spanish - Mandarin - Korean
 * (Vietnamese = SegoePrint) - (Tagalog = SegoePrint)- (Serbo-Croatian = MyriadPro and SegoePrint)
 */
var fontList = ['Arimo', 'MyriadPro-Regular', 'MyriadPro-Bold', '-', 'SegoePrint', '-', 'SimSun', '-', 'MalgunGothic-Semilight'];

var editPanel = mainWindow.add('panel', undefined, 'Edit Text:');
editPanel.orientation = 'column';
editPanel.enabled = false;

var editGroup = editPanel.add('group', undefined, 'editGroup');
editGroup.orientation = 'row';

var fontDD = editGroup.add('dropdownlist', undefined, fontList);
fontDD.selection = 0;
fontDD.onChange = function() {
    //alert(fontDD.selection.index +':'+ fontDD.selection.text);
    if (listItemId) {
        //selectedItem.subItems[0].text = fontDD.selection.text;
        // resize list to update the list item
		refreshListBox();
        // update the actual TextLayer
        //updateItemLayer(selectedItem);
    }
};

/**
 * select a list item to activate and fill textEditor
 * onChange updates the list item only
 * removeItemBtn remove the list item
 * updateRowBtn changes the text layer
 * addLayerBtn adds a new Text Layer to the selected comp
 */
var textEditor = editGroup.add("edittext", undefined, "Edit:", {
    multiline: true, scrolling: true, wantReturn: true
});
textEditor.size = [400, 45];
//textEditor.active = false;
textEditor.onChanging = function() {
    selectedItem.subItems[1].text = this.text;// textEditor.text;
    // resize list to update the list item
	refreshListBox();
};

// update this TextLayer item, placed below fontDD & textEditor
var btnGroup = editPanel.add('group', undefined, 'btnGroup');
btnGroup.orientation = 'row';

var removeItemBtn = btnGroup.add('button', undefined, 'Remove Item');
removeItemBtn.helpTip = 'Remove this item from the list.';
removeItemBtn.enabled = false;
removeItemBtn.onClick = function() {
    list.remove(selectedItem);
    selectedItem = null;
    selectedCompId = null;
    listItemId = null;
    // updateRowBtn.enabled = false;
    // addLayerBtn.enabled = false;
    // removeItemBtn.enabled = false;
    textEditor.text = '';
	editPanel.enabled = false;
};

// TODO: remove Text Layer? http://docs.aenhancers.com/layers/layer/#layer-remove

var updateRowBtn = btnGroup.add('button', undefined, 'Apply Changes to Text Layer');
updateRowBtn.helpTip = 'Update only this text layer if it exists.';// updateBtn = all
updateRowBtn.enabled = false;//enabled if selectedItem is valid
updateRowBtn.onClick = function() {
    // update the actual TextLayer if it exists in project
    var compId = parseInt(selectedItem.subItems[3].text);
    var layerId = parseInt(selectedItem.subItems[4].text);
    var layer = validLayer(compId, layerId);
    if (layer) {
		selectedItem.subItems[0].text = fontDD.selection.text;
        updateItemLayer(selectedItem);
		refreshListBox();
    } else {
        alert('Update: Layer not found in this project.');
    }
};

var addLayerBtn = btnGroup.add('button', undefined, 'Add Text Layer');
addLayerBtn.helpTip = 'Add this text layer to the currently selected comp.';
// addLayerBtn.enabled = false;// enabled if selectedItem is NOT valid
addLayerBtn.onClick = function() {
    // the compId of this item doesnt exist in this project.
    var comp = app.project.activeItem;
	if (comp instanceof CompItem) {
        // add text layer to the active comp
        var layer = comp.layers.addText(selectedItem.subItems[1].text);
        var doc = layer.property("Source Text").value;
        doc.font = fontDD.selection.text;
        doc.text = selectedItem.subItems[1].text;
		// var doc = JSON.parse(layerDocs[listItemId]);// TextDocument
		layer.property("Source Text").setValue(doc);
        // add new list.item
		selectedItem = list.add('item', list.items.length);
		selectedItem.subItems[0].text = doc.font;//fontDD.selection.text;
		selectedItem.subItems[1].text = doc.text;
		selectedItem.subItems[2].text = comp.name;
		selectedItem.subItems[3].text = findCompIndex(comp.name);//selectedCompId;// comp. find project.items[index]
		selectedItem.subItems[4].text = layer.index;

		refreshListBox();
    } else {
        // if comp selected, warn user to select a comp
        alert('Select a comp then try again.');
    }
};

var buttonPanel = mainWindow.add('panel', undefined, 'Actions:');
	buttonPanel.orientation = 'row';
/**
 * Save the TextLayer Data to a Tab delimited csv file
 */
var exportBtn = buttonPanel.add('button', undefined, 'Export Text');
exportBtn.helpTip = 'Save the TextLayer Data to a Tab delimited csv file.';
exportBtn.onClick = function() {
	exportTextData();
};
/**
 * Open a csv file, check if the comp & layer ids match this project
 * enable updateBtn if match found
 */
var importBtn = buttonPanel.add('button', undefined, 'Import Text');
importBtn.helpTip = 'Open a csv file, check if the layers match this project.';
importBtn.onClick = function() {
	importTextData();
};
/**
 * update text button will replace text in project.items.comp.TextLayer + (font?)
 * https://www.youtube.com/watch?v=6P76aFYmOR8
 * 
 * updateBtn is enabled when a csv file is imported
 */
var updateBtn = buttonPanel.add('button', undefined, 'Update Text');
updateBtn.helpTip = 'Replace text and font in text layers.';
updateBtn.enabled = false;
updateBtn.onClick = function() {
    updateTextLayers();
};

/**
 * Close the script window
 */
var closeBtn = buttonPanel.add('button', undefined, 'Close Window');
closeBtn.helpTip = 'Close the script.';
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
	if (!(isSecurityPrefSet())) {
		alert("This script requires access to write files.\n" +
			"Go to the \"General\" panel of the application preferences and make sure\n" +
			"\"Allow Scripts to Write Files and Access Network\" is checked.");
		app.executeCommand(2359);// open preferences
	}
}

function findCompIndex(name) {
	for (var i=1; i <= allItems.length; i++) {
		if (allItems[i] instanceof CompItem && allItems[i].name == name) {
			return i;
		}
	}
	alert(name + ' not found!');
	return 'NA';
}
/**
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
					//listData.push(listItem);// unused for export, used for import

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
 * Export .csv file in the project folder
 * Tab delimited [rowId, Comp Name, compId, layerId, Text, Font]
 */
function exportTextData() {
	var fileData = "id\tText\tFont\tCompname\tcompId\tlayerId\tTextDoc\r\n";// V2
	fileData += textFileData;

	// let the user name the file when they Export Text
	var csvFile = File.saveDialog(rootFolder+"/TextLayerData.csv");
	csvFile.open("w");
	csvFile.encoding = "UTF-8";
	csvFile.write(fileData);
	csvFile.close();
}

/**
 * Import a .csv file of TextLayer data
 * https://www.youtube.com/watch?v=mmFlGCEwrm8
 */
function importTextData() {
    textEditor.text = '';
    editPanel.enabled = false;
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
      
		// remove listBox items then add new items
        list.removeAll();// items
        listData = [];
        // rowId, Comp Name, compId, layerId, Text, Font
        for (var i=1; i<fileText.length; i++) {
            // convert compId and layerId to int
            var row = fileText[i].split('\t');
            // check for matching layers
			var compId = parseInt(row[4].text);
			var layerId = parseInt(row[5].text);
			var match = validLayer(compId, layerId) ? 'M' : '-';
			var listItem = list.add('item', match);// V2
            // var listItem = list.add('item', row[0]);// rowId
			// V2: rowId, text, font, compName, compId, layerId, TextDocument?
                listItem.subItems[0].text = row[2];// font
                listItem.subItems[1].text = row[1];// text
                listItem.subItems[2].text = row[3];// compName
                listItem.subItems[3].text = row[4];// compId;// item index CompItem
                listItem.subItems[4].text = row[5];// layerId;// layer index TextLayer
			// row[6] = textDoc json object
			// if (i === 3) {
			// 	var textDoc = JSON.parse(row[6]);
			// 	alert(textDoc);// test OK
			// }
			layerDocs.push(row[6]);// for Add Text Layer
            listData.push(listItem);

            // if font is not in fontList, push it to fontList UNKNOWN ERROR
            // if (fontList.indexOf(row[5]) === -1) {
            //     fontDD.add(row[5]);
            //     //alert('add font: '+row[5]);
            // }
        }
        //alert('textFileData: '+textFileData);
        exportBtn.enabled = false;
        updateBtn.enabled = true;
        
	} else {
    	//alert('Open file Cancelled.');
	}
}

/**
 * update font and sourceText in matching comp layers
 * https://www.youtube.com/watch?v=6P76aFYmOR8&list=PL0qACgPuF8dWIJrE99hnYj1T3qBh__GRQ&index=26
 */
function updateTextLayers() {
    app.beginUndoGroup("Update All TextLayers");
    // list.item.length?
    for (var i=0; i<listData.length; i++) {
        // check if layer exists in project
        var compId = parseInt(listData[i].subItems[3].text);
        var layerId = parseInt(listData[i].subItems[4].text);
        var layer = validLayer(compId, layerId);
		if (layer) {
            updateItemLayer(listData[i]);
        }
    }
    app.endUndoGroup();
}
/**
 * textEditor updates as each character is typed. Not a good Undo strategy!
 * just change the list item text? add a button to updateItemLayer once?
 * @param item - selected ListBox[ListItem]
 */
function updateItemLayer(item) {
    app.beginUndoGroup("Update TextLayer");
    var compId = parseInt(item.subItems[3].text);
    var layerId = parseInt(item.subItems[4].text);
    var textProp = app.project.items[compId].layers[layerId].property("Source Text");
    var textDoc = textProp.value;

    textDoc.font = item.subItems[0].text;
    textDoc.text = item.subItems[1].text;
    // item.subItems[2] = Comp Name UNUSED
    textProp.setValue(textDoc);
    app.endUndoGroup();
}
/**
 * if layer exists return layer or null
 * https://community.adobe.com/t5/after-effects/extendscript-for-ae-reference-comp-by-name-not-by-index/td-p/9631301?page=1
 * @param {Int} compId 
 * @param {Int} layerId
 */
function validLayer(compId, layerId) {
    var layer = null;
    try {
        layer = app.project.items[compId].layers[layerId];
        if (layer instanceof TextLayer) {
            return layer;
        }
    } catch(error) {
        // undefined or value out of range
        //alert('Layer does not exist in this project!\n' + error.toString());
    }
    // else try{} to check for matching
    // TODO: layer names are usually the same as text
    // if (layerName) {
        // loop through comps to find layer
        // for (var i=0; i<allItems.length; i++) {
        //     if (allItems[i].layers[layerName]) {
        //         return allItems[i].layers[layerName];
        //     }
        // }
    // }
    return layer;
}

/**
 * Refresh the listBox by resizing it to update the list item
 */
function refreshListBox() {
	var ls = list.size;
	list.size = [1+ls[0], 1+ls[1]];
	list.size = [ls[0], ls[1]];
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

/**
 * SFS logo 60x60
 * return the binary logo so it can be defined way down here at the bottom!
 * https://github.com/NTProductions/ui-image-testing
 */
function getLogo() {
	return "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00<\x00\x00\x00<\b\x06\x00\x00\x00:\u00FC\u00D9r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x05\x10iTXtXML:com.adobe.xmp\x00\x00\x00\x00\x00<?xpacket begin=\"\u00EF\u00BB\u00BF\" id=\"W5M0MpCehiHzreSzNTczkc9d\"?> <x:xmpmeta xmlns:x=\"adobe:ns:meta/\" x:xmptk=\"Adobe XMP Core 6.0-c002 79.164460, 2020/05/12-16:04:17        \"> <rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"> <rdf:Description rdf:about=\"\" xmlns:xmp=\"http://ns.adobe.com/xap/1.0/\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:photoshop=\"http://ns.adobe.com/photoshop/1.0/\" xmlns:xmpMM=\"http://ns.adobe.com/xap/1.0/mm/\" xmlns:stEvt=\"http://ns.adobe.com/xap/1.0/sType/ResourceEvent#\" xmp:CreatorTool=\"Adobe Photoshop 21.2 (Windows)\" xmp:CreateDate=\"2020-07-13T13:13:07-06:00\" xmp:ModifyDate=\"2020-07-13T13:15-06:00\" xmp:MetadataDate=\"2020-07-13T13:15-06:00\" dc:format=\"image/png\" photoshop:ColorMode=\"3\" photoshop:ICCProfile=\"sRGB IEC61966-2.1\" xmpMM:InstanceID=\"xmp.iid:90b85859-d0c0-a742-b2da-6ae2597615e9\" xmpMM:DocumentID=\"xmp.did:90b85859-d0c0-a742-b2da-6ae2597615e9\" xmpMM:OriginalDocumentID=\"xmp.did:90b85859-d0c0-a742-b2da-6ae2597615e9\"> <xmpMM:History> <rdf:Seq> <rdf:li stEvt:action=\"created\" stEvt:instanceID=\"xmp.iid:90b85859-d0c0-a742-b2da-6ae2597615e9\" stEvt:when=\"2020-07-13T13:13:07-06:00\" stEvt:softwareAgent=\"Adobe Photoshop 21.2 (Windows)\"/> </rdf:Seq> </xmpMM:History> </rdf:Description> </rdf:RDF> </x:xmpmeta> <?xpacket end=\"r\"?>J\u00D6\u0082z\x00\x00\x04\u00EDIDATh\u00DE\u00E5\u009B\u00BF\u00AF\u00D30\x10\u00C7\u00DF\u009F\u00D0?\u0080\u00A1\x03\x13S\u00C5\u00C4F7&\u00A4.L,\u0091X\x18\u00CB\u00C2J\x07f*1#uGz\u00EA\u008A\u00C4\u0090\r\u00B1uA\u00AC\x1D`\u0085\u00F0\u00F8\u008D\u00F8\x11\u00FA\u008D\u00FC\u008DN\u00C6I\u00EC\u00B3\u0093\u00BC>,Y\x0F\u00D1\u00C4\u00F6\u00C7w>\u009F/\u00E7\u0093\u00B2,O\u00EC\u00DAgyw\u00E9\u00F2\u00E4P7\u0087Z\x1C\u00EA\u00BC\u00CF\u00BE\u009ClC\x02\x03\u00F0P\u00F7\u0087Z\u008A\u00BA\u00C6$\\(`\x03\u009A\x13\u00F2\u00EB\u00A3\u00C7\u00E5\u00AFW\u00AF\u00CB\x0F7n\x12\x1A\u00D2\u00CE\u008E\x1E\u00F8\x00\u00B1\u0090\u00A0\u009F\u00EE\u00DC-\x7F\u00BFy[\u00FE9;\u00AB\u0080Q\u00BE=\u00D9\u0094\u00EF\u00AF\\%8\u00A4\u00BFJ%\u00F1A\u0080\r\u00E4\u00DAH\u00AD\x06\u00FD\u00F9\u00E2e\x05\u0088\u00BF\u00C5\u00B5\u00EB\u00B5\u00A4Q0\x01\u00F8\u00B7\x00G\u00DDB\u00EA1\u00F0A\u00C0f\u00A6\x17F\x1Dg\x0E\u00B0\u0099\u00F9-3\u0080\u00B9\\\u009B\u0080\u00FA\u00F2\u00E0a%Q\x14\u00FC\x05\u00B8\u00B5~\u00AB\u00E78\x19\x00\u00FF\u00FE\u00F4T\u00AA:\u00EB\u00CE\u00F4\u00B14}\u00CE\x1D\u00E3\u0099\u009A\u00DF\x16f\u00ECSo`\u00F3b\x19Z?\u00DE\u00BA]\u00AFO\x16\u00C0|\u00BEw\u00DF\u00EB\u00DD\x1F\u00CF\u009E\u00D7\u00EFa\u0082\u00A0\u00EE\u00F8\x7F\u00CDX\u00C0\x10\f\u008C\u0081BJ\u00E8\u00D4\u00AE\u0090\x16\u00E0 \x11J\u00C8\x1E\u00ACCR\u009D\x15\x12G\u00BB\u00D4\f\x16L\"&\x04\u00BF\u00A1bl\u00F6XXM[\u00CB\x10`\u00A8E\u00D5\t\u00D4\f\u00B5\u00A9\u00E07\x00\x03\x10\u0083\u00E0\u00FALQ\u00D1\x16\u00DAtM\u00AAk\x1C\u00A8\u0098(\u00F3\u00FE*\x04\x18k\u00A0\u00B6\u00A2\u00A9\x00RVH\u00D6\u00D6 NJ\x14\u00B0P\u0091s_i\u00F5i\u00E5G\x03\u0086$\u00A0\u009E\u00FC\u00DB\u00F4\x1C\u00B6%\u00CD\u00BAo\x00\u00CE\u0083\u0080\u00D1y,0\u00F7W\u00B6\x03\u0095Cmz\x1Ek\x15E\x0B\u00CD\u00BE\u008Ce\x0F\x02\u00CE\u00F1\u0092xYU\t\u00EA\x03\f\u00C9\u00B3h\u00FB<*`l\x7F\x17\x12\x18[\u009D\u00EBY\u00B9\u00EDh\u00FB\u00B4\u00C6<,0\u00D6\u00A1\x0BX\x18\u0095\x7F&\u00E7\u00A8\u0081\u00F9\u00BE\x0F0'\u00E7\u00BF\x01\u00867%\u008B\u00D6J\x1F\r0\u009Fa\u00D1\u00DA\f\u00F8\u00D4\u00A3\x01\u00B3s\u00FA\u00E1\u00D2'\u00B7\u00DBL\x05\x1Cc\u00A5k\u00C7#v\u008Bp\x15\u00BBM\u00FB`0\np\u00ACk9&\u00B0\u0089\u009C\f\x0B,\x1D\t\u00BB4\u009DrR\x01k\x0E\x0FK\u00E9\x0Bk:\u00C7,\u00CB\u00C8\x07\u008B+\u00FA\u0091\n\u0098\x11\x13\u00CD\u00F1p\u00CE\u0081\u00A0\x11\u00ED\x00l\u00E8\u00A6\u00C9K\x05\u008Cv\u00B4\x01\u0080\x1A\u00B8\u00EDt\x13b\u00AD\u00DB@R\x01cr\u00C5x\x17\u00A1Q\u00CB:\u00B6\x14\x03Lk\u00DF\x06\u0082\u00A8J\n`\x14\x1C1\u0083\u0083x\x04\u00A6\u00E1\u0089\r\x00t\u0081\u00A4\u00D8\u0087y\u00BC\x14\u00CBf\x12\n\\;\x1F1Q\by\u00CEm\u00D3\x02\x19\u00A2\u008D\u00F1\u00EC\x18\u00FB\u00D6\x04\u00E27TGW\x00=t ] \u00E8\u008B\u009EX\u00CC\u0096d\u0084\u0093k\u0080\u00AB\u00AD\u00891\u00E6\u00BE\u0081\x1DQ\u00C7\u0098-i\u00AD\x01\u009E\u00B3\u00A1\x18K-\u0081\u00BBb\u00D61\u00C0\x10\u008C\x18g\u00A6\u00FA\u0098\u0096\u00C2pI\u00E0.\u00BF\\\u00BB\u0086\x1D\x06k\u00A6\x05\u00CEy8\u008F=&\u0086\x00\u0087\x1AI\u009E\u00A7M\u00FB\u0085\u00FAsi\u008Au\u00EC\x1B\u009C\u0093Q\u008F\u00D0\u00C9ex\u0097>t\f\u00F0\u008C\rj\x1D\x10\u00B9\u00C7\u00B6\u0081\u0084h\u0082+\u00FE-\\\u00E0,\u00EA\u00838\u00BE\u00CA\u00D3=\u00D4\u00EC\u00C7\x12\u00B8m{\u00D3\x02sl\u00E2P2\u0089\x05^\u00C7\u00A8\u00B5\x04n;yi\u0081\u00A9\u00CE\u00E6\f\u00BC\u008DNy\u00A0Z\x03\x16\u00AA\u00D3\x17\u00B0\\\u00EB\u00BE\u008E\x0E\x1D#\u00E1?gIr<\u0090r@\u00D3\u00EF\u00F35\u00DF\u00E5\x10t\x01\u00FBN\u008Ck\u0092h\u009D\u00ED|\u0090\x18\u00E0\u008C\u0083\x0F5^\u00F2\u00E8\u0097\x1A\x18c\x11\u00E3\u00D9$\u00CD\u00E2\u00C1\f\u00DA\x0E\u00FA\u0098\u00C0\u00DC{\u0085\u00C6MS\x03\u00AF\x1CQ\u0085 `\u00B1\u00D6Z\u00CF\u00C4>\u00C0\u0096t\u00B7\u00C9\u00F3\u00B4L\u008EdA\x07\x01\u00EB\u00C77\n!3zb5Aj\u0083\u00D0\u00B4i/\u0089i\\\u00CB\u0090\x14,\u00B6O\x02\u008B,\u00BE\u00C0mq4\u00F4\u00C9D\u009A\u00A6\u00B5\u009B4\x13\x0F\x16\u009BgW\u009FS\u0094\u00CC\x00J\x01\u00CC\u00E7\u00CCd\x17M\u00D2M\t<\u0093\x1EN\u0097\u00FA\u00D1\u00B8\x00\u00BCmK\u0093\u00C1\u00BE&\u00A3(\u00BFS1\x17k\u0090\\K\x1A0\x1A\u009A\u0098\u0088\u0088\u00AD\u00AEM\u00EE+'DhI>hr)s+\u0099\u00BC\x16\x13\u00F7\u00F2\u00F9\u00B8\u00CE\u00A43\u00E3B\x16>I\u00A7\u00A9\u0081'\\\u00CF}B\x13\u00D6j\x7F6J\u00FA\u00B0Y\u00CF\u0085\u0084\x0Eu=\x15\u00B0\u00D9\u00A8\u00F9\u00D26t\u00AAd6\u00FA\u00C9Z\u00D8^\x13\u00C4%4\x0F\x0B2\x11<\u00F4K\x05\u00DB\u00B0\u00AE\td\u00BD&\u0088+o\u00AB\u00EC\\~\u00B1\u0095\u00E9\u00DE*U\u00EE\u00DBpn\u0084\u0081Z\u009C\u00CB+\x00\u00E2\u008AN%\x19\u00AA8 \u00B0\u0085\u00B9$\x0E(\u00AC{\u00E6G\u00E3Y\u00B1\u00CD\u00ED|\r\u00D4\u00A8\u0097<L\u00BE\u00F5\u009E\u008E\u0087L\u00F6\u00C6$\x00\x1E\u0092\u0097ge\u00C7\u00BD\u0087\u00E8\u00EB=\u0083\u00DEj1\u00D2^\u00F1\u00B2\x07\u00C0]I\u00DE\u0098\f\x0B4\u008F\u0091\u00EA\u00E8\u00F7\u0096lpf\u00B9\x03\u00D2\u00DA\u00B7\u00B7\u00A9o\u00AA\u009D\u0087\u009Bi\x0B\u00B3\u00C6\u00F7b\u008D.\u00DB\x0E\x00\u00A9\u0081\u00FF\x02Zd*\u00C6\u00DD\b\x00\u00AA\x00\x00\x00\x00IEND\u00AEB`\u0082";
}
