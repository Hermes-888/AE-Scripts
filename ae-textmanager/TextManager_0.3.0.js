/***********************************************************
 * TextManager.js AE script - Tjones - 7/2/20
 * Version 0.3.0 7/21/20
 *
 * Build the original AE project
 * SaveAs / Copy the project to a new folder for another language with a folder/filename that reflects language
 * 
 * Open the new project and run TextManager
 * Text layers in the project are displayed in a list
 * 
 * Select an item in the list to change the font and edit the text (only)
 * 
 * Select a font with the dropdown. These are limited to the fonts we use
 * [Change All Fonts] will change the fonts in the list to the seledted font
 * [Update All Layers]
 *
 * [Apply Changes to Text Layer] Updates only the selected Text layer 
 *
 * Export and Import are used if you want to Add Text layers to a project
 *
 * https://gitlab.com/statefoodsafety/experimentation/ae-textmanager
 ***********************************************************
 *
 * UI docs
 * http://docs.aenhancers.com/layers/textlayer/
 * http://docs.aenhancers.com/layers/layercollection/#layercollection-addtext
 *
 * http://estk.aenhancers.com/
 * http://jongware.mit.edu/idcs5js/pc_ListBox.html
 * http://estk.aenhancers.com/4%20-%20User-Interface%20Tools/control-objects.html#control-type-listbox
 * http://estk.aenhancers.com/4%20-%20User-Interface%20Tools/types-of-controls.html#creating-multi-column-lists
 * https://adobeindd.com/view/publications/a0207571-ff5b-4bbf-a540-07079bd21d75/92ra/publication-web-resources/pdf/scriptui-2-16-j.pdf
 * http://estk.aenhancers.com/4%20-%20User-Interface%20Tools/scriptui-class.html
 * ScriptUI.applicationFonts
 * http://jongware.mit.edu/idcs5js/pc_ListBox.html
 * http://jongware.mit.edu/idcs5js/pc_ListItem.html
 * 
 * Snippets
 * https://github.com/NTProductions?tab=repositories
 * https://aescripts.com/pt_textedit/#
 * https://creativedojo.net/learn-after-effects-scripting/
 *
 * https://helpx.adobe.com/after-effects/using/creating-editing-text-layers.html
 * https://blogs.adobe.com/creativecloud/after-effects-cs4-scripting-ch/?segment=dva
 *
 * TODO:
 * make this script dockable?
 * can a list item row contain buttons? w/visible, delete row icons?
 *
 * check for OS? will rootFolder path need adjustment?
 *
 * remove a Text Layer? http://docs.aenhancers.com/layers/layer/#layer-remove
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
// var layerDocs = [];
// turn on Text Editor
var debug = true;

var mainWindow = new Window('palette', 'Text Manager', undefined);
	mainWindow.orientation = 'column';

var mainGroup = mainWindow.add('group', undefined, 'mainGroup');
	mainGroup.orientation = 'row';
	mainGroup.alignChildren = 'left';
	//mainGroup.add('image', undefined, './logo-small.png');
    mainGroup.add('image', undefined, getLogo());// internal 64x80px
    
var rightSide = mainGroup.add('group', undefined, 'rightSide');
    rightSide.orientation = 'column';
    //rightSide.add('staticText', undefined, 'OS: '+$.os+' Folder: '+rootFolder);

var instructionPanel = rightSide.add('panel', undefined, undefined);
	instructionPanel.text ='Instructions:';
	instructionPanel.size = [500, 90];
	instructionPanel.alignChildren = ["left","top"];
	instructionPanel.spacing = 10;
	instructionPanel.margins = 10;

var instructions = instructionPanel.add('staticText', undefined, undefined, {name: "instructions", multiline: true, scrolling: true});
    instructions.size = [490, 60];
	instructions.text = 'Build the orginal project. \rSaveAs or Copy the project to a new folder. \rSelect an item to edit the font and text. \rUpdate the Text Layers.';
mainWindow.add('staticText', undefined, 'OS: '+$.os+' Folder: '+rootFolder);

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
        // updateAllFontsBtn.enabled = true;
		// applyChangesBtn.enabled = true;
		// addLayerBtn.enabled = true;
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
					applyChangesBtn.enabled = true;
					//selectedItem.checked = true;
					// Don't need to select the layer to update it
					//app.project.item(compId).layer(layerId).selected = true;
					// set viewer cue to inPoint + 1 sec.
					app.project.activeItem.time = (layer.inPoint + 1);
					//alert('Selected layer: startTime:' + layer.startTime + ' inPoint:' + layer.inPoint);
					//alert(app.project.activeItem.time);
					//alert('TEXT: '+layer.property("Source Text").value.text);
					// var temp = JSON.stringify(layer.property("Source Text").value);// errors
					// alert('TEXT: '+temp);
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

var editPanel = mainWindow.add('panel', undefined, 'Edit Text:');//[0, 0, 650, 200]
editPanel.orientation = 'column';
editPanel.enabled = false;

var editGroup = editPanel.add('group', undefined, 'editGroup');
editGroup.orientation = 'row';

var fontDD = editGroup.add('dropdownlist', undefined, fontList);
fontDD.selection = 0;
fontDD.onChange = function() {
    //alert(fontDD.selection.index +':'+ fontDD.selection.text);
    if (listItemId) {
        selectedItem.subItems[0].text = fontDD.selection.text;
        // resize list to update the list item
		refreshListBox();
        // update the actual TextLayer
        //updateItemLayer(selectedItem);
    }
};

/**
 * select a list item to activate and fill textEditor
 * updates the selected list item only
 * updateAllFontsBtn changes all fonts in the list only
 * applyChangesBtn changes the font and text in the Text Layer
 * addLayerBtn adds a new Text Layer to the selected comp
 */
var textEditor = editGroup.add("edittext", undefined, "Edit:", {
    multiline: true, scrolling: true, wantReturn: true
});
textEditor.size = [400, 55];
//textEditor.active = false;
textEditor.onChanging = function() {
    selectedItem.subItems[1].text = this.text;// textEditor.text;
    // resize list to update the list item
	refreshListBox();
};

// update this TextLayer item, placed below fontDD & textEditor
var btnGroup = editPanel.add('group', undefined, 'btnGroup');
btnGroup.orientation = 'row';

// Update All layers to the selected font in DropDown
var updateAllFontsBtn = btnGroup.add('button', undefined, 'Change All Fonts');
updateAllFontsBtn.helpTip = 'Change all fonts in the list to selected font.';
// updateAllFontsBtn.enabled = false;
updateAllFontsBtn.onClick = function() {
    for (var i=0; i<list.items.length; i++) {
        //listData[i].subItems[0].text = fontDD.selection.text;
		list.items[i].subItems[0].text = fontDD.selection.text;
    }
	updateAllTextBtn.enabled = true;
    refreshListBox();
    //alert('updateAllFonts: '+list.items.length+' : '+list.items[2]+' : '+fontDD.selection.text);
};

var spacer = btnGroup.add('staticText', undefined, undefined);
spacer.text = '|>- -<|';

/**
 * update all text layers in project
 */
var updateAllTextBtn = btnGroup.add('button', undefined, 'Update All Layers');
updateAllTextBtn.helpTip = 'Replace text and font in all text layers.';
updateAllTextBtn.enabled = false;
updateAllTextBtn.onClick = function() {
    updateTextLayers();
};

var applyChangesBtn = btnGroup.add('button', undefined, 'Apply Changes to Text Layer');
applyChangesBtn.helpTip = 'Update only this text layer if it exists.';
// applyChangesBtn.enabled = false;//enabled if selectedItem is valid
applyChangesBtn.onClick = function() {
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

var buttonPanel = mainWindow.add('panel', undefined, 'Save/Load Layer Data:');
	buttonPanel.orientation = 'row';
/**
 * Save the TextLayer Data to a Tab delimited csv file
 */
var exportBtn = buttonPanel.add('button', undefined, 'Export Text');
exportBtn.helpTip = 'Save the Text layer list to a Tab delimited csv file.';
exportBtn.onClick = function() {
	exportTextData();
};
/**
 * Open a csv file, check if the comp & layer ids match this project
 */
var importBtn = buttonPanel.add('button', undefined, 'Import Text');
importBtn.helpTip = 'Open a csv file, check if the layers match this project.';
importBtn.onClick = function() {
	importTextData();
};

var spc2 = buttonPanel.add('staticText', undefined, undefined);
    spc2.text = '|>- -<|';

/**
 * Refresh the Text Layers list
 */
var refreshBtn = buttonPanel.add('button', undefined, 'Refresh List');
refreshBtn.helpTip = 'Refresh the Text Layers list.'
refreshBtn.onClick = function() {
	getTextLayers();
}
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
	list.removeAll();// items
	listData = [];
	var itemId = 0;// row number
	// layerDocs = [];// for Add Text Layer
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

					// var textDoc = '';// construct a string to reinstate TextDocument
					// for(var prop in doc) {
					// 	// add if prop is not a function, resetCharStyle & resetParagraphStyle
					// 	if (prop != "resetCharStyle" && prop != "resetParagraphStyle") {
					// 		textDoc += prop + ':';
					// 		try {
					// 			textDoc += JSON.stringify(doc[prop]) + ', ';
					// 		} catch(error) {
					// 			textDoc += ' , ';// strokeColor: ,
					// 			// applyStroke: true, strokeColor:[0.7843137383461,0.20915031433105,0.20915031433105],
					// 		}
					// 	}
					// }
					// textDoc = JSON.stringify("textDoc: {" + textDoc + "}");
					// layerDocs.push(textDoc);// for Add Text Layer?

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
                    // textFileData += ''+ itemId +'\t'+ cleanText +'\t'+ textProp.value.font +'\t'+ curItem.name +'\t'+ i +'\t'+ j +'\t'+ textDoc +'\r\n';// V2
                    textFileData += ''+ itemId +'\t'+ cleanText +'\t'+ textProp.value.font +'\t'+ curItem.name +'\t'+ i +'\t'+ j +'\r\n';// V3
					itemId += 1;
				}
			}
		}
	}
}

/**
 * Export .csv file in the project folder
 * Tab delimited [rowId, Comp Name, compId, layerId, Text, Font]
 * Check if Allow Scripts to Write Files is enabled
 */
function exportTextData() {
	// var fileData = "id\tText\tFont\tCompname\tcompId\tlayerId\tTextDoc\r\n";// V2
	var fileData = "id\tText\tFont\tCompname\tcompId\tlayerId\r\n";// V3
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
			// row[6] = textDoc json object UNUSED
			// if (i === 3) {
			// 	var textDoc = JSON.parse(row[6]);
			// 	alert(textDoc);// test OK
			// }
			// layerDocs.push(row[6]);// for Add Text Layer
            listData.push(listItem);

            // if font is not in fontList, push it to fontList UNKNOWN ERROR
            // if (fontList.indexOf(row[5]) === -1) {
            //     fontDD.add(row[5]);
            //     //alert('add font: '+row[5]);
            // }
        }
        //alert('textFileData: '+textFileData);
		textEditor.text = '';
		editPanel.enabled = false;
        updateAllTextBtn.enabled = true;
	} else {
    	//alert('Open file Cancelled.');
	}
}

/**
 * update font and sourceText in matching comp layers
 * https://www.youtube.com/watch?v=6P76aFYmOR8&list=PL0qACgPuF8dWIJrE99hnYj1T3qBh__GRQ&index=26
 */
function updateTextLayers() {
    app.beginUndoGroup("TM Update All TextLayers");
    // list.item.length?
    for (var i=0; i<list.items.length; i++) {
        // check if layer exists in project
        var compId = parseInt(list.items[i].subItems[3].text);
        var layerId = parseInt(list.items[i].subItems[4].text);
        var layer = validLayer(compId, layerId);
		if (layer) {
            updateItemLayer(list.items[i]);
        }
    }
    app.endUndoGroup();
}
/**
 * change the TextLayer text and font
 * @param item - selected ListBox[ListItem]
 */
function updateItemLayer(item) {
    app.beginUndoGroup("TM Update TextLayer");
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
 * SFS logo 60x60
 * return the binary logo so it can be defined way down here at the bottom!
 * https://github.com/NTProductions/ui-image-testing
 */
function getLogo() {
	return "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00<\x00\x00\x00<\b\x06\x00\x00\x00:\u00FC\u00D9r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x05\x10iTXtXML:com.adobe.xmp\x00\x00\x00\x00\x00<?xpacket begin=\"\u00EF\u00BB\u00BF\" id=\"W5M0MpCehiHzreSzNTczkc9d\"?> <x:xmpmeta xmlns:x=\"adobe:ns:meta/\" x:xmptk=\"Adobe XMP Core 6.0-c002 79.164460, 2020/05/12-16:04:17        \"> <rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"> <rdf:Description rdf:about=\"\" xmlns:xmp=\"http://ns.adobe.com/xap/1.0/\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:photoshop=\"http://ns.adobe.com/photoshop/1.0/\" xmlns:xmpMM=\"http://ns.adobe.com/xap/1.0/mm/\" xmlns:stEvt=\"http://ns.adobe.com/xap/1.0/sType/ResourceEvent#\" xmp:CreatorTool=\"Adobe Photoshop 21.2 (Windows)\" xmp:CreateDate=\"2020-07-13T13:13:07-06:00\" xmp:ModifyDate=\"2020-07-13T13:15-06:00\" xmp:MetadataDate=\"2020-07-13T13:15-06:00\" dc:format=\"image/png\" photoshop:ColorMode=\"3\" photoshop:ICCProfile=\"sRGB IEC61966-2.1\" xmpMM:InstanceID=\"xmp.iid:90b85859-d0c0-a742-b2da-6ae2597615e9\" xmpMM:DocumentID=\"xmp.did:90b85859-d0c0-a742-b2da-6ae2597615e9\" xmpMM:OriginalDocumentID=\"xmp.did:90b85859-d0c0-a742-b2da-6ae2597615e9\"> <xmpMM:History> <rdf:Seq> <rdf:li stEvt:action=\"created\" stEvt:instanceID=\"xmp.iid:90b85859-d0c0-a742-b2da-6ae2597615e9\" stEvt:when=\"2020-07-13T13:13:07-06:00\" stEvt:softwareAgent=\"Adobe Photoshop 21.2 (Windows)\"/> </rdf:Seq> </xmpMM:History> </rdf:Description> </rdf:RDF> </x:xmpmeta> <?xpacket end=\"r\"?>J\u00D6\u0082z\x00\x00\x04\u00EDIDATh\u00DE\u00E5\u009B\u00BF\u00AF\u00D30\x10\u00C7\u00DF\u009F\u00D0?\u0080\u00A1\x03\x13S\u00C5\u00C4F7&\u00A4.L,\u0091X\x18\u00CB\u00C2J\x07f*1#uGz\u00EA\u008A\u00C4\u0090\r\u00B1uA\u00AC\x1D`\u0085\u00F0\u00F8\u008D\u00F8\x11\u00FA\u008D\u00FC\u008DN\u00C6I\u00EC\u00B3\u0093\u00BC>,Y\x0F\u00D1\u00C4\u00F6\u00C7w>\u009F/\u00E7\u0093\u00B2,O\u00EC\u00DAgyw\u00E9\u00F2\u00E4P7\u0087Z\x1C\u00EA\u00BC\u00CF\u00BE\u009ClC\x02\x03\u00F0P\u00F7\u0087Z\u008A\u00BA\u00C6$\\(`\x03\u009A\x13\u00F2\u00EB\u00A3\u00C7\u00E5\u00AFW\u00AF\u00CB\x0F7n\x12\x1A\u00D2\u00CE\u008E\x1E\u00F8\x00\u00B1\u0090\u00A0\u009F\u00EE\u00DC-\x7F\u00BFy[\u00FE9;\u00AB\u0080Q\u00BE=\u00D9\u0094\u00EF\u00AF\\%8\u00A4\u00BFJ%\u00F1A\u0080\r\u00E4\u00DAH\u00AD\x06\u00FD\u00F9\u00E2e\x05\u0088\u00BF\u00C5\u00B5\u00EB\u00B5\u00A4Q0\x01\u00F8\u00B7\x00G\u00DDB\u00EA1\u00F0A\u00C0f\u00A6\x17F\x1Dg\x0E\u00B0\u0099\u00F9-3\u0080\u00B9\\\u009B\u0080\u00FA\u00F2\u00E0a%Q\x14\u00FC\x05\u00B8\u00B5~\u00AB\u00E78\x19\x00\u00FF\u00FE\u00F4T\u00AA:\u00EB\u00CE\u00F4\u00B14}\u00CE\x1D\u00E3\u0099\u009A\u00DF\x16f\u00ECSo`\u00F3b\x19Z?\u00DE\u00BA]\u00AFO\x16\u00C0|\u00BEw\u00DF\u00EB\u00DD\x1F\u00CF\u009E\u00D7\u00EFa\u0082\u00A0\u00EE\u00F8\x7F\u00CDX\u00C0\x10\f\u008C\u0081BJ\u00E8\u00D4\u00AE\u0090\x16\u00E0 \x11J\u00C8\x1E\u00ACCR\u009D\x15\x12G\u00BB\u00D4\f\x16L\"&\x04\u00BF\u00A1bl\u00F6XXM[\u00CB\x10`\u00A8E\u00D5\t\u00D4\f\u00B5\u00A9\u00E07\x00\x03\x10\u0083\u00E0\u00FALQ\u00D1\x16\u00DAtM\u00AAk\x1C\u00A8\u0098(\u00F3\u00FE*\x04\x18k\u00A0\u00B6\u00A2\u00A9\x00RVH\u00D6\u00D6 NJ\x14\u00B0P\u0091s_i\u00F5i\u00E5G\x03\u0086$\u00A0\u009E\u00FC\u00DB\u00F4\x1C\u00B6%\u00CD\u00BAo\x00\u00CE\u0083\u0080\u00D1y,0\u00F7W\u00B6\x03\u0095Cmz\x1Ek\x15E\x0B\u00CD\u00BE\u008Ce\x0F\x02\u00CE\u00F1\u0092xYU\t\u00EA\x03\f\u00C9\u00B3h\u00FB<*`l\x7F\x17\x12\x18[\u009D\u00EBY\u00B9\u00EDh\u00FB\u00B4\u00C6<,0\u00D6\u00A1\x0BX\x18\u0095\x7F&\u00E7\u00A8\u0081\u00F9\u00BE\x0F0'\u00E7\u00BF\x01\u00867%\u008B\u00D6J\x1F\r0\u009Fa\u00D1\u00DA\f\u00F8\u00D4\u00A3\x01\u00B3s\u00FA\u00E1\u00D2'\u00B7\u00DBL\x05\x1Cc\u00A5k\u00C7#v\u008Bp\x15\u00BBM\u00FB`0\np\u00ACk9&\u00B0\u0089\u009C\f\x0B,\x1D\t\u00BB4\u009DrR\x01k\x0E\x0FK\u00E9\x0Bk:\u00C7,\u00CB\u00C8\x07\u008B+\u00FA\u0091\n\u0098\x11\x13\u00CD\u00F1p\u00CE\u0081\u00A0\x11\u00ED\x00l\u00E8\u00A6\u00C9K\x05\u008Cv\u00B4\x01\u0080\x1A\u00B8\u00EDt\x13b\u00AD\u00DB@R\x01cr\u00C5x\x17\u00A1Q\u00CB:\u00B6\x14\x03Lk\u00DF\x06\u0082\u00A8J\n`\x14\x1C1\u0083\u0083x\x04\u00A6\u00E1\u0089\r\x00t\u0081\u00A4\u00D8\u0087y\u00BC\x14\u00CBf\x12\n\\;\x1F1Q\by\u00CEm\u00D3\x02\x19\u00A2\u008D\u00F1\u00EC\x18\u00FB\u00D6\x04\u00E27TGW\x00=t ] \u00E8\u008B\u009EX\u00CC\u0096d\u0084\u0093k\u0080\u00AB\u00AD\u00891\u00E6\u00BE\u0081\x1DQ\u00C7\u0098-i\u00AD\x01\u009E\u00B3\u00A1\x18K-\u0081\u00BBb\u00D61\u00C0\x10\u008C\x18g\u00A6\u00FA\u0098\u0096\u00C2pI\u00E0.\u00BF\\\u00BB\u0086\x1D\x06k\u00A6\x05\u00CEy8\u008F=&\u0086\x00\u0087\x1AI\u009E\u00A7M\u00FB\u0085\u00FAsi\u008Au\u00EC\x1B\u009C\u0093Q\u008F\u00D0\u00C9ex\u0097>t\f\u00F0\u008C\rj\x1D\x10\u00B9\u00C7\u00B6\u0081\u0084h\u0082+\u00FE-\\\u00E0,\u00EA\u00838\u00BE\u00CA\u00D3=\u00D4\u00EC\u00C7\x12\u00B8m{\u00D3\x02sl\u00E2P2\u0089\x05^\u00C7\u00A8\u00B5\x04n;yi\u0081\u00A9\u00CE\u00E6\f\u00BC\u008DNy\u00A0Z\x03\x16\u00AA\u00D3\x17\u00B0\\\u00EB\u00BE\u008E\x0E\x1D#\u00E1?gIr<\u0090r@\u00D3\u00EF\u00F35\u00DF\u00E5\x10t\x01\u00FBN\u008Ck\u0092h\u009D\u00ED|\u0090\x18\u00E0\u008C\u0083\x0F5^\u00F2\u00E8\u0097\x1A\x18c\x11\u00E3\u00D9$\u00CD\u00E2\u00C1\f\u00DA\x0E\u00FA\u0098\u00C0\u00DC{\u0085\u00C6MS\x03\u00AF\x1CQ\u0085 `\u00B1\u00D6Z\u00CF\u00C4>\u00C0\u0096t\u00B7\u00C9\u00F3\u00B4L\u008EdA\x07\x01\u00EB\u00C77\n!3zb5Aj\u0083\u00D0\u00B4i/\u0089i\\\u00CB\u0090\x14,\u00B6O\x02\u008B,\u00BE\u00C0mq4\u00F4\u00C9D\u009A\u00A6\u00B5\u009B4\x13\x0F\x16\u009BgW\u009FS\u0094\u00CC\x00J\x01\u00CC\u00E7\u00CCd\x17M\u00D2M\t<\u0093\x1EN\u0097\u00FA\u00D1\u00B8\x00\u00BCmK\u0093\u00C1\u00BE&\u00A3(\u00BFS1\x17k\u0090\\K\x1A0\x1A\u009A\u0098\u0088\u0088\u00AD\u00AEM\u00EE+'DhI>hr)s+\u0099\u00BC\x16\x13\u00F7\u00F2\u00F9\u00B8\u00CE\u00A43\u00E3B\x16>I\u00A7\u00A9\u0081'\\\u00CF}B\x13\u00D6j\x7F6J\u00FA\u00B0Y\u00CF\u0085\u0084\x0Eu=\x15\u00B0\u00D9\u00A8\u00F9\u00D26t\u00AAd6\u00FA\u00C9Z\u00D8^\x13\u00C4%4\x0F\x0B2\x11<\u00F4K\x05\u00DB\u00B0\u00AE\td\u00BD&\u0088+o\u00AB\u00EC\\~\u00B1\u0095\u00E9\u00DE*U\u00EE\u00DBpn\u0084\u0081Z\u009C\u00CB+\x00\u00E2\u008AN%\x19\u00AA8 \u00B0\u0085\u00B9$\x0E(\u00AC{\u00E6G\u00E3Y\u00B1\u00CD\u00ED|\r\u00D4\u00A8\u0097<L\u00BE\u00F5\u009E\u008E\u0087L\u00F6\u00C6$\x00\x1E\u0092\u0097ge\u00C7\u00BD\u0087\u00E8\u00EB=\u0083\u00DEj1\u00D2^\u00F1\u00B2\x07\u00C0]I\u00DE\u0098\f\x0B4\u008F\u0091\u00EA\u00E8\u00F7\u0096lpf\u00B9\x03\u00D2\u00DA\u00B7\u00B7\u00A9o\u00AA\u009D\u0087\u009Bi\x0B\u00B3\u00C6\u00F7b\u008D.\u00DB\x0E\x00\u00A9\u0081\u00FF\x02Zd*\u00C6\u00DD\b\x00\u00AA\x00\x00\x00\x00IEND\u00AEB`\u0082";
}
