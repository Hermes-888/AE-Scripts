(function(thisObj) {
	//https://www.goodboy.ninja/snippets/dockable-scriptui-panel-template
	// Any code you write here will execute before the panel is built.
	/*
		https://ae-scripting.docsforadobe.dev/introduction/objectmodel.html
		https://ae-scripting.docsforadobe.dev/
		https://github.com/NTProductions?tab=repositories

		Visual Code for Extendscript debugging
		https://www.youtube.com/watch?v=a90H-Pf61LQ
		https://www.codeandmotion.com/blog/visual-studio-code-adobe-extendscript
	*/
	buildUI(thisObj); // Calling the function to build the panel

	function buildUI(thisObj) {
		var myPanel = (thisObj instanceof Panel) ? thisObj : new Window('palette', 'Caption Creator', undefined, {
			resizeable: true
		});

		// Write any UI code here. Note: myPanel is the window panel object.
		// include inline JSON.stringify & .parse https://gist.github.com/atheken/654510
		this.JSON||(this.JSON={}),function(){function f(t){return t<10?"0"+t:t}"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(t){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(t){return this.valueOf()});var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;function quote(t){return escapable.lastIndex=0,escapable.test(t)?'"'+t.replace(escapable,function(t){var e=meta[t];return"string"==typeof e?e:"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+t+'"'}function str(t,e){var n,r,f,o,u,i=gap,a=e[t];switch(a&&"object"==typeof a&&"function"==typeof a.toJSON&&(a=a.toJSON(t)),"function"==typeof rep&&(a=rep.call(e,t,a)),typeof a){case"string":return quote(a);case"number":return isFinite(a)?String(a):"null";case"boolean":case"null":return String(a);case"object":if(!a)return"null";if(gap+=indent,u=[],"[object Array]"===Object.prototype.toString.apply(a)){for(o=a.length,n=0;n<o;n+=1)u[n]=str(n,a)||"null";return f=0===u.length?"[]":gap?"[\n"+gap+u.join(",\n"+gap)+"\n"+i+"]":"["+u.join(",")+"]",gap=i,f}if(rep&&"object"==typeof rep)for(o=rep.length,n=0;n<o;n+=1)"string"==typeof(r=rep[n])&&(f=str(r,a))&&u.push(quote(r)+(gap?": ":":")+f);else for(r in a)Object.hasOwnProperty.call(a,r)&&(f=str(r,a))&&u.push(quote(r)+(gap?": ":":")+f);return f=0===u.length?"{}":gap?"{\n"+gap+u.join(",\n"+gap)+"\n"+i+"}":"{"+u.join(",")+"}",gap=i,f}}"function"!=typeof JSON.stringify&&(JSON.stringify=function(t,e,n){var r;if(gap="",indent="","number"==typeof n)for(r=0;r<n;r+=1)indent+=" ";else"string"==typeof n&&(indent=n);if(rep=e,e&&"function"!=typeof e&&("object"!=typeof e||"number"!=typeof e.length))throw new Error("JSON.stringify");return str("",{"":t})}),"function"!=typeof JSON.parse&&(JSON.parse=function(text,reviver){var j;function walk(t,e){var n,r,f=t[e];if(f&&"object"==typeof f)for(n in f)Object.hasOwnProperty.call(f,n)&&(void 0!==(r=walk(f,n))?f[n]=r:delete f[n]);return reviver.call(t,e,f)}if(text=String(text),cx.lastIndex=0,cx.test(text)&&(text=text.replace(cx,function(t){return"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})),/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return j=eval("("+text+")"),"function"==typeof reviver?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}();

		// NOTE: add this script to the AE ScripUI Panels folder to make it dockable
		// C:\Program Files\Adobe\Adobe After Effects 2022\Support Files\Scripts\ScriptUI Panels
		var selectedComp;// composition selected by user
		var selectedPid;// project.items[index]
		var captionLayer;// [Captions] layer on selected comp, add markers, toggle enabled? 
		var hasCaptions = false;// true if captionLayer was added to selectedComp
		var frameRate;// of selectedComp
		// selected item and index of the clicked ListBox row for editing
		var selectedItem = null;
		var selectedIndex = null;
		var cueItems = [];// array of cue objects

		var dataPanel = myPanel.add('panel', [0, 0, 350, 160], 'Caption Creator: select a row to edit a caption');
		dataPanel.orientation = 'column';

		var dataList = dataPanel.add('ListBox', [0, 0, 340, 140], 'data', {
			multiselect: false,
			numberOfColumns: 3, showHeaders: true,
			columnTitles: ['#', 'Start', 'Caption']
		});
		dataList.onChange = function () {
			if (dataList.selection != null) {
				selectedIndex = dataList.selection.index;
				selectedItem = dataList.selection;

				propsPanel.enabled = true;
				// set pointer to [Captions] layer keyframe for noteText changes
				selectedComp.time = cueItems[selectedIndex].time + 0.02;
				noteText.text = cueItems[selectedIndex].text;
				noteText.active = true;// focus on the edit box
				// select the keyframe?
				try {
					if (captionLayer) {
						// unselect all then select this keyframe
						for (var i=1; i<=captionLayer.sourceText.numKeys; i++) {
							captionLayer.sourceText.setSelectedAtKey(i, false);
						}
						captionLayer.sourceText.setSelectedAtKey(1+selectedIndex, true);
					}
					//alert(' cue: '+JSON.stringify(cueItems[selectedIndex]));
				} catch(err) { alert('listChange ERROR: '+err.toString()); }
			}
		};
		// dataList.onDoubleClick = function () {}
		// dataList.revealItem(item #);// Scrolls the list to make the specified item visible, if necessary.

		var propsPanel = myPanel.add('panel', undefined, undefined, {name: 'propsPanel'});
		propsPanel.text = 'Caption Editor: select a row, edit the caption below';
		//propsPanel.preferredSize.width = 350;
		propsPanel.orientation = 'column';
		// propsPanel.alignChildren = ['left','top'];
		// propsPanel.spacing = 10;
		// propsPanel.margins = 10;
		propsPanel.enabled = false;// until a list item is selected

		// var propsPanelRow = propsPanel.add('group', undefined, {name: 'propsRow1'});
		// propsPanelRow.orientation = 'row';
		// https://extendscript.docsforadobe.dev/user-interface-tools/common-properties.html?highlight=group#common-properties

		// text editor
    var noteGroup = propsPanel.add('group', undefined, {name: 'notegroup'});
		noteGroup.orientation = 'row';
		//noteGroup.add( 'statictext', undefined, 'Caption:');
		var noteText = noteGroup.add( 'edittext', undefined, '', {
			multiline: true, wantReturn: true
		});// scrolling: true,
		// noteText.characters = ##;
		noteText.size = [350, 55];// 3 rows
		noteText.onChanging = function () {
			try {
				var txt = JSON.stringify(this.text);
				// txt.split('\n').join('');// don't allow 2 new lines
				// txt.split('\r').join('');
				selectedItem.subItems[1].text = txt;
				cueItems[selectedIndex].text = this.text;
				// update the TextLayer
				var txtlayer = captionLayer.sourceText.keyValue(1+selectedIndex);
				txtlayer.text = this.text;
				captionLayer.sourceText.setValueAtTime(cueItems[selectedIndex].time, txtlayer);

				refreshListBox();
				//findKeyframes(dataList);// fixes double lines ERROR
			} catch(err) { alert('noteText ERROR: '+err.toString()); }
		}

		var buttonPanel = myPanel.add('panel', undefined, 'Actions:');
		buttonPanel.orientation = 'column';

		var btnGrp1 = buttonPanel.add('group', undefined, {name: 'btnGrp1'});
		btnGrp1.orientation = 'row';

		// import text file to generate captions
		var importCaptionsBtn = btnGrp1.add('button', undefined, 'Import Captions');
		importCaptionsBtn.helpTip = 'Open a Text file to generate captions.';
		importCaptionsBtn.onClick = function () {
			importCaptions(dataList);
		}

		var exportBtn = btnGrp1.add('button', undefined, 'Save VTT File');
		exportBtn.helpTip = 'Save the captions to a vtt file.';
		exportBtn.enabled = false;
		exportBtn.onClick = function() {
			saveVttFile(dataList);
		};

		var btnGrp2 = buttonPanel.add('group', undefined, {name: 'btnGrp2'});
		btnGrp2.orientation = 'row';
		// btnGrp2.enabled = false;
	
		// clears dataList if none found
		var findKeyframesBtn = btnGrp2.add('button', undefined, 'Find Keyframes');
		findKeyframesBtn.helpTip = 'Check for caption keyframes in the project.';
		findKeyframesBtn.onClick = function() {
			findKeyframes(dataList);// pass in dataList
			// findCaptions()
		}

		// [HELP btn] instructions : Use a dialog window instead?
		var helpBtn = btnGrp2.add('button', undefined, 'Instructions');
		helpBtn.helpTip = 'Toggle instructions.';
		helpBtn.onClick = function () {
			showInstructions();
		}

	/* UNUSED BUTTONS:
		var btnGrp2 = buttonPanel.add('group', undefined, {name: 'btnGrp2'});
		btnGrp2.orientation = 'row';
		// btnGrp2.enabled = false;

		var findKeyframesBtn = btnGrp2.add('button', undefined, 'Find Keyframes');
		findKeyframesBtn.helpTip = 'Check for caption keyframes in the project.';
		findKeyframesBtn.onClick = function() {
			findKeyframes(dataList);// pass in dataList
		}

		// Insert keyframe
		var addMarkerBtn = btnGrp2.add('button', undefined, 'Insert Keyframe');
		addMarkerBtn.helpTip = 'Insert a new keyframe at current time.';
		addMarkerBtn.onClick = function () {
			addMarker(dataList);
		}

		// Delete keyframe
		var delMarkerBtn = btnGrp2.add('button', undefined, 'Delete Keyframe');
		delMarkerBtn.helpTip = 'Delete this keyframe.';// selected or nearest selectedComp.time
		delMarkerBtn.onClick = function () {
			deleteMarker(dataList);
		}
	*/
		/* V2 
			updates: 
			Select the Comp to add captions onto from a dropdown
			Import .vtt as well as .txt files. 
			Allow multiple Captions layers for different languages?
			Todo: findKeyframes() should only sync the cue data list for visible Captions layers
			if multiple layers, create a dropdown to select which one to use. 

			Todo: Remove All Captions layers: btn & function

			ToDo: convert CaptionCreator to an extension
			https://betterprogramming.pub/building-a-modern-extension-for-after-effects-eea269544b50

			May be able to detect audio pauses? to set keyframes.
			https://github.com/NTProductions/lyric-music-video-generator-script/blob/main/Lyric%20Music%20Video%20Generator.jsx
		*/


		/** functions ============================================
			selectedComp has a TextLayer w/keyframes. 
			Drag the keyframes to adjust timing. 

			https://ae-scripting.docsforadobe.dev/items/compitem.html
			https://ae-scripting.docsforadobe.dev/other/markervalue/#markervalue
			https://ae-scripting.docsforadobe.dev/layers/layercollection/
			https://ae-scripting.docsforadobe.dev/layers/layercollection/#layercollection-addsolid
			https://ae-scripting.docsforadobe.dev/other/textdocument/

			https://extendscript.docsforadobe.dev/user-interface-tools/types-of-controls.html
			https://extendscript.docsforadobe.dev/user-interface-tools/common-properties.html

			https://lova.tt/scriptlets
		 */
		function showInstructions() {
			var dlg = new Window('dialog', 'Caption Creator Instructions');
				dlg.btnPnl = dlg.add('panel', undefined, '');
				dlg.btnPnl.orientation = 'column';
				dlg.btnPnl.size = [380, 250];
				dlg.btnPnl.add('statictext', undefined, 'This script will simulate captions on the composition. \r');
				dlg.btnPnl.add('statictext', undefined, 'You can import a text file to generate the captions.\n');
				dlg.btnPnl.add('statictext', undefined, 'The script adds a text layer with keyframes.  \nEach line of text will become a new keyframe. \r');
				dlg.btnPnl.add('statictext', undefined, 'Adjust the timing by dragging a keyframe. \r');
				dlg.btnPnl.add('statictext', undefined, 'Click Find Keyframes to collect existing caption keyframes. \r');
				dlg.btnPnl.add('statictext', undefined, 'Select Save VTT File to convert the keyframes to a vtt file. \r');
				dlg.btnPnl.add('statictext', undefined, 'Remember to hide the captions before exporting the video.');

				var cancelBtn = dlg.btnPnl.add('button', undefined, 'OK', { name: 'ok' });
				cancelBtn.onClick = function () {
					dlg.close();
				}
				dlg.center();
				dlg.show();
		}
		/**
		 * Refresh the listBox by resizing it to update the list items
		 */
		function refreshListBox() {
				var ls = dataList.size;
				dataList.size = [1+ls[0], 1+ls[1]];
				dataList.size = [ls[0], ls[1]];
		}

		/**
		 * Select which composition to add captions to
		 * Set up global variables, selectedComp and frameRate
		 * called from other functions
		 */
		 function selectComp() {
			var comps = [];// Array of names for dropDown
			var pid = [];// project.items[index] of selected composition
			
			// add all compositions to a dropDown list
			for (var i = 1; i <= app.project.items.length; i++) {
				if (app.project.items[i] instanceof CompItem) {
						comps.push(app.project.items[i].name);
						pid.push(i);
				}
			}

			if (comps.length == 0) {
				alert('There are no compositions in this project.');
				return;
			} else {
				var dlg = new Window('dialog', 'Select a Composition');
				dlg.panel = dlg.add('panel', undefined, '');
				dlg.panel.orientation = 'column';
				dlg.panel.size = [420, 100];
				dlg.panel.add('statictext', undefined, 'A Captions layer will be added to the composition you select in the dropdown.');
				var dropDown = dlg.panel.add("dropdownlist", undefined, comps);
				
				dropDown.onChange = function () {
					try {
						// alert('selected: '+dropDown.selection.index+' :: '+dropDown.selection.text);
						selectedPid = pid[dropDown.selection.index];// Global needed?
						selectedComp = app.project.items[pid[dropDown.selection.index]];
						frameRate = Math.round(selectedComp.frameRate);// 29.97 = 30

						// show in viewer
						selectedComp.openInViewer();// make sure it is open & active to see keyframes
						// alert('selectedComp: '+selectedPid+' :: '+selectedComp.name);
						// alert('selectedComp layer count: '+ selectedComp.numLayers);
						dlg.close();// NOW? or give user several chances and they close the dialog modal
					} catch(err) { alert('selectComp ERROR: '+err.toString()); }
				}
				dlg.show();
			}
		}

		/**
		 * Set up global variables, selectedComp & captionLayer and frameRate
		 * captionLayer may not exist yet
		 * called from other functions, findKeyframes
		 */
		function findSourceComp() {
			if (!selectedComp) {
				selectComp();
			}

			// if captionLayer doesn't exist on selectedComp, add it?
			// if (!captionLayer && !hasCaptions) {
				// createCaptionLayer();
			// }
			findCaptionLayer();
		}

		function findCaptionLayer() {
			try {
				// find the Captions layer on the selected Comp, 
				// it may not exist yet or there may be multiple. 
				// if multiple, create a dropdown to select which one to use. 
				var comps = [];// Array of names for dropDown
				var pid = [];// selectedComp.layers[index]
				for (var x=1; x<=selectedComp.numLayers; x++) {
					var layerName = selectedComp.layers[x].name.substring(0, 8);
					// alert('layerName: '+selectedComp.layers[x].enabled+' : '+layerName+' : '+selectedComp.layers[x].name);// OK
					if (layerName == 'Captions') {
						// check if visible
						if (selectedComp.layers[x].enabled) {
							captionLayer = selectedComp.layers[x];// last encountered
							// captionLayer.enabled = true;// = SELECTED?
							hasCaptions = true;
							comps.push(x+': '+selectedComp.layers[x].name);// dropdown name
							pid.push(x);
						}
					}
				}
				// alert('selectedComp layers: ', selectedComp.numLayers);
				// alert('findCaptionLayer: comps.len '+comps.length);// 0
				if (comps.length == 0) {
					if (dataList) {
						dataList.removeAll();
					}
					cueItems = [];
					alert('No Captions found. Use Import Captions first.');
				}

				if (comps.length > 1) {
					// display drop down to select which layer
					var dlg = new Window('dialog', 'Select a Captions layer');
					dlg.panel = dlg.add('panel', undefined, '');
					dlg.panel.orientation = 'column';
					dlg.panel.size = [420, 100];
					dlg.panel.add('statictext', undefined, 'The selected Captions layer will be used to create the VTT file.');
					var dropDown = dlg.panel.add("dropdownlist", undefined, comps);
					
					dropDown.onChange = function () {
						try {
							captionLayer = selectedComp.layers[pid[dropDown.selection.index]];
							dlg.close();// NOW? or give user several chances and they close the dialog modal
						} catch(err) { alert('select captionLayer ERROR: '+err.toString()); }
					}
					dlg.show();
				}

			} catch(err) { alert('find captionLayer ERROR: '+err.toString()); }
		}

		/**
		 * Create a new Captions layer, 
		 * project can have multiple layers on multiple comps
		 * called from importCaptions()
		 */
		function createCaptionLayer() {
			// app.beginUndoGroup('Add caption layer');
			try {
				// one text layer w/ keyframes on the SourceText
				captionLayer = selectedComp.layers.addBoxText([1280, 120]);
				captionLayer.position.setValue([640, 660]);
				captionLayer.inPoint = 0;// seconds
				captionLayer.outPoint = selectedComp.workAreaDuration;
				captionLayer.name = 'Captions';

				var txt = captionLayer.sourceText.value;
				// txt.resetCharStyle();
				// txt.resetParagraphStyle();
				txt.boxTextSize = [1280, 110];
				txt.text = 'Add Caption here';
				txt.font = 'Arial-Bold';// w/white stroke OR 'MyriadPro-Semibold';//
				txt.fontSize = 36;
				txt.fillColor = [0, 0, 0];// OR grey?
				txt.applyFill = true;
				txt.strokeWidth = 2;// pixels
				txt.strokeColor = [0, 0, 0];
				txt.strokeOverFill = true;
				txt.applyStroke = true;
				txt.leading = 40;// line height
				txt.tracking = 40;// character width
				txt.justification = ParagraphJustification.CENTER_JUSTIFY;
				captionLayer.sourceText.setValue(txt);
				// btnGrp2.enabled = true;
				hasCaptions = true;
				// reset data
				if (dataList) {
					dataList.removeAll();
				}
				cueItems = [];
				// https://ae-scripting.docsforadobe.dev/properties/property/

				// captionLayer.locked = true;// if locked, can I still control w/script?
				//alert('Captions Added: '+selectedComp.​numLayers+' : '+captionLayer.name);
				//alert('last layer name: ' + selectedComp.layer(selectedComp.numLayers).name);// [White Solid 1]
			} catch(err) { alert('Add captionLayer ERROR: '+err.toString()); }
			// app.endUndoGroup();
		}

		/**
		 * Open a .txt file and create
		 * 	Keyframes on captionLayer TextLayer
		 * 	dataList items
		 * 	cueItems array data for Save VTT File
		 */
		function importCaptions(dataList) {
			var text = '';
			var txtArray = [];
			var time = 0.01;// start time
			var factor = 0.3;// estimated
			var duration = factor;// txtArray[i] word count * factor
			
			// Prompt user to select text file Limit to (.txt & .vtt)
			var myFile = File.openDialog('Select a file.', '*.txt;*.vtt');
			if (myFile) {
				if (myFile.open('r')) {
					// read text lines into array until end-of-file is reached
					while (!myFile.eof) {
						text = myFile.readln();
						// read into array then create keyframes and TextLayers
						// a line of text must have at least 4 characters!
						// exclude WEBVTT, cue id# and timecode
						var txtCheck = text.substring(0,6);
						if (txtCheck === 'WEBVTT' || txtCheck === '00:00:') {
							text = '';
						}
						// check for 00: longer duration
						if (txtCheck.substring(0,3) === '00:') {
							text = '';
						}
						if (text.length <= 3) {
							text = '';
						}

						// keep this line of text
						if (text != '') {
							txtArray.push(text);
						}
					}
					myFile.close();

					// alert & return
					if (txtArray.length === 0 ) {
						alert('No text found in file.');
						return;
					}

					// select which comp to add captions to, can add multiple layers?
					selectComp();
					if (!selectedComp) {
						return;
					}

					// set factor by duration
					// var average = Math.round(selectedComp.workAreaDuration / (txtArray.length-1));
					// var diff = factor/average;
					// factor = factor-diff;
					// alert('factor: '+factor+' - average: '+average+' - diff: '+diff+' -comp: '+selectedComp.name);

					// create undo group
					app.beginUndoGroup('Create Captions From File');
					// if captionLayer keyframes exist,
          // remove existing keyframes on TextLayer from end to beginning
					// try {
					// 	if (captionLayer && captionLayer.sourceText.numKeys > 0) {
					// 		var numKeys = captionLayer.sourceText.numKeys;
					// 		//alert('import: '+numKeys+' : '+captionLayer.name);// OK
					// 		for (i=numKeys; i>0; i--) {
					// 				captionLayer.sourceText.removeKey(i);
					// 		}
					// 	}
					// } catch(err) { alert('import remove keyframes ERROR: '+err.toString()); }
					// make sure the Display Type is TIMECODE for exporting vtt
					var displayType = app.project.timeDisplayType;
					if (displayType == 2013) {
						app.project.timeDisplayType = 2012;// TIMECODE=2012, FRAMES=2013
					}
          // reset data
					if (dataList) {
						dataList.removeAll();
					}
					cueItems = [];
					createCaptionLayer();

					// create a keyframe on TextLayer for each line of text
					for (i=0; i<txtArray.length; i++) {
						try {
							// calc factor? selectedComp.workAreaDuration / total lines?
							// calculate duration from text length based on Rob's cadence
							var count = txtArray[i].split(' ');
							if (count.length == 0 ) {
								duration = factor;
							} else {
								// evenly spaced? duration = average;
								duration = Math.round(count.length * factor);
							}

							// add keyframes to the captionLayer SourceText
							// add keyframe at time
							var txt = captionLayer.sourceText.value;
							txt.text = txtArray[i];
							captionLayer.sourceText.setValueAtTime(time, txt);

							// update dataList: ['#', 'Start', 'Caption']
							var listItem = dataList.add('item', (1+cueItems.length));
							listItem.subItems[0].text = timeToCurrentFormat(time, frameRate);
							listItem.subItems[1].text = JSON.stringify(txtArray[i]);

							// data for export to vtt file id=comment, start=time, end=start+duration, text
							var cueObj = {};// construct data for vtt file
							cueObj.id = cueItems.length;
							cueObj.start = timeToCurrentFormat(time, frameRate);
							cueObj.end = timeToCurrentFormat(time+duration, frameRate);// fixed duration
							cueObj.text = txtArray[i];
							cueObj.time = time;// set selectedComp.time when dataList.row is selected

							cueItems.push(cueObj);
							time = time + duration;// next keyframe start time
						} catch(err) {
							app.project.timeDisplayType = displayType;// reset to original setting
							alert('import add keyframe ERROR: '+err.toString());
							return;
						}
					}

					app.project.timeDisplayType = displayType;// reset to original setting
					app.endUndoGroup();
					exportBtn.enabled = true;// Save VTT File
					// alert('cueItems: '+JSON.stringify(cueItems));
				} else {
					alert('Open File failed!');
				}
			}// user cancelled Open File
		}

		/**
		 * Refresh cueItems, dataList from TextLayer keyframes on selectedComp
		 */
		function findKeyframes(dataList) {
			if (!selectedComp || !captionLayer) {
				findSourceComp();// setup global vars
				// captionLayer = selectedComp.layer(1);
				// alert('problem: added captionLayer here');
			}
			if (!captionLayer) {
				alert('There are no captions in this project.');
				return;
			}
			// if (captionLayer.sourceText.numKeys == 0) {
			// 	alert('There are no keyframes on the comp timeline.');
			// 	return;
			// }

			try {
				var marks = captionLayer.sourceText.numKeys;

				if (marks > 0) {
					if (dataList) {
						dataList.removeAll();
					}
					cueItems = [];
					// make sure the Display Type is TIMECODE for exporting vtt
					var displayType = app.project.timeDisplayType;
					if (displayType === 2013) {
						app.project.timeDisplayType = 2012;// TIMECODE=2012, FRAMES=2013
					}
					for (var m = 1; m <= marks; m++) {
						//var frameRate = Math.round(selectedComp.frameRate);// 29.97 = 30
						var listItem = dataList.add('item', m);// display caption text
						var time = captionLayer.sourceText.keyTime(m);
						var nextFrame = selectedComp.workAreaDuration;// end of timeline
						if (m < marks) {
								nextFrame = captionLayer.sourceText.keyTime(m+1);// next keyframe start
						}
						listItem.subItems[0].text = timeToCurrentFormat(time, frameRate);// start

						var textDocument = captionLayer.sourceText.keyValue(m);
						var txt = textDocument.text;
						txt = JSON.stringify(txt);
						// txt.split('\n').join('');// don't allow 2 new lines
						// txt.split('\r').join('');// not working
            listItem.subItems[1].text = txt;//textDocument.text;

						// data for export to vtt file id=#, start=time, end=nextFrame, text=comment
						var cueObj = {};// construct data for vtt file
						cueObj.id = cueItems.length;
						cueObj.start = timeToCurrentFormat(time, frameRate);
						cueObj.end = timeToCurrentFormat(nextFrame, frameRate);
						cueObj.text = textDocument.text;// caption text
						cueObj.time = time;// set selectedComp.time when dataList.row is selected

						cueItems.push(cueObj);
					}
					app.project.timeDisplayType = displayType;// reset

				} else {
						alert('No caption keyframes found on the '+selectedComp.name+' timeline.');
				}
			} catch(err) { alert('findKeyframes ERROR: '+err.toString()); }
		}

		// UNUSED Insert a keyframe at selectedComp.time
		function addMarker(dataList) {
			if (!selectedComp || !captionLayer) {
				findSourceComp();
			}
			if (selectedComp) {
				app.beginUndoGroup('Add New Keyframe');
				var time = selectedComp.time;// current time
				//var txt = captionLayer.sourceText.getValueAtTime(time);// nearest?
				var txt = captionLayer.sourceText.value;// main
				txt.text = 'Add Caption Text Here';
				captionLayer.sourceText.setValueAtTime(time, txt);
				app.endUndoGroup();
				noteText.text = '';
				findKeyframes(dataList);// to refresh dataList and put cueItems and keyframes into order
				
			} else {
				alert('Composition not found.');
				//alert('Create a composition named Template and try again.');
			}
		}

		/** UNUSED
		 * Delete the currently selected keyframe
		 * if time is different than selected,
		 * confirm delete keyframe at current time
		 * Warning: only use the delete btn, Don't use context delete
		 https://extendscript.docsforadobe.dev/user-interface-tools/types-of-controls.html
		 https://extendscript.docsforadobe.dev/user-interface-tools/defining-behavior-with-event-callbacks-and-listeners.html
		 */
		function deleteMarker(dataList) {
			if (!selectedComp || !captionLayer) {
				findSourceComp();
			}
			if (!captionLayer) {
				captionLayer = selectedComp.layer(1);
				if (captionLayer.name != 'Captions' || captionLayer.sourceText.numKeys == 0) {
					alert('There are no keyframes on the Captions timeline.');
					return;
				}
				alert('problem: added captionLayer here');
			}

			// in case it hasn't happened yet
			findKeyframes(dataList);// refresh cueItems

			try {
				// selected keyframe OR selectedComp.time
				var keyframeIndex;// timeline
				for (var i=0; i<cueItems.length; i++) {
					if (selectedComp.time >= cueItems[i].time) {
						keyframeIndex = i;
						continue;
					}
				}
				
				if (captionLayer && captionLayer.sourceText.numKeys > 0) {
					// remove existing keyframes from end to beginning
					//$.writeln('Found: '+selectedIndex+' : '+keyframeIndex);// VSCode console?
					//alert('Found: '+selectedIndex+' : '+keyframeIndex);
					app.beginUndoGroup('Delete keyframe');
					if (selectedIndex === keyframeIndex) {
						// remove keyframe and adjust cueItems[]
						captionLayer.sourceText.removeKey(1+selectedIndex);
					} else {
						// comfirm which keyframe to delete
						// var regex = /(\r\n|\r|\n)/gm;// global multiline
						var beforeText = captionLayer.sourceText.keyValue(1+keyframeIndex).text;
						beforeText = JSON.stringify(beforeText);// looks better
						// beforeText.replace('\"', '');// not working
						// beforeText.split('\r').join(' - ');// not working
						// beforeText.replace(regex,' - ');// not working
						var afterText = '';
						if (1+keyframeIndex < cueItems.length) {
							afterText = captionLayer.sourceText.keyValue(2+keyframeIndex).text;// if it exists
							afterText = JSON.stringify(afterText);
							// afterText.replace(regex, ' ');// not working
						}

						if (!afterText) {
							// if beforeText is the last keyframe, proceed with delete
							captionLayer.sourceText.removeKey(1+keyframeIndex);
						} else {
							var dlg = new Window('dialog', 'Delete keyframe');
							dlg.btnPnl = dlg.add('panel', undefined, 'Select which keyframe to delete:');
							dlg.btnPnl.size = [450, 180];
							//dlg.btnPnl.add('statictext', undefined, 'Caption at timeline: '+selectedIndex+' keyframeIndex: '+keyframeIndex);
							// dlg.btnPnl.add('statictext', undefined, 'Caption: '+beforeText+' Index: '+keyframeIndex);
							// alert('btnText: '+beforeText);

							var beforeBtn = dlg.btnPnl.add('button', undefined, beforeText, { name: 'btn1' });
							beforeBtn.onClick = function () {
								dlg.close();
								noteText.text = '';
								noteText.active = false;
								captionLayer.sourceText.removeKey(1+keyframeIndex);
							}
							var afterBtn = dlg.btnPnl.add('button', undefined, afterText, { name: 'btn2' });
							afterBtn.onClick = function () {
								dlg.close();
								noteText.text = '';
								noteText.active = false;
								captionLayer.sourceText.removeKey(2+keyframeIndex);
							}
							var cancelBtn = dlg.btnPnl.add('button', undefined, 'Cancel', { name: 'cancel' });
							cancelBtn.onClick = function () {
								dlg.close();
							}
							dlg.cancelElement = cancelBtn;
							dlg.center();
							dlg.show();
						}
					}

					app.endUndoGroup();
					findKeyframes(dataList);// to refresh dataList and put cueItems and keyframes into order
				}
			} catch(err) { alert('deleteMarker ERROR: '+err.toString()); }
		}

		/**
		 * Check if Allow scripts to write files is enabled
		 */
		function isSecurityPrefSet() {
			try {
				var securitySetting = app.preferences.getPrefAsLong('Main Pref Section', 'Pref_SCRIPTING_FILE_NETWORK_SECURITY');
				return (securitySetting === 1);
			} catch(err){
				alert('Error in isSecurityPrefSet function \n' + err.toString());
			}
		}
		/**
		 * usage: var cueStart = convertTimecode(cueItems[x].start);
		 * @param timeStr String - from: '00:00:06:23'
		 * @returns String - to: '00:00:06.872'
		 */
		function convertTimecode(timeStr) {
			// 1000 milliseconds divided by 29.97 fps = 33.3667
			var msFPS = 1000/selectedComp.frameRate;
			var timeCode = timeStr.slice(0, 8);// 00:00:06
			var timeCodeFrames = timeStr.slice(9, 11);// 23 frames
			var milliseconds = Math.round(parseFloat(timeCodeFrames * msFPS)).toFixed(3);

			if (milliseconds == 0) {
				milliseconds = '000';// fix: 00:00:06.0.0
				return timeCode + '.' + milliseconds;
			}
			if (milliseconds < 100) {
				milliseconds = '0'+milliseconds;// fix: 00:00:06.33.
			}

			milliseconds = milliseconds.toString();
			if (milliseconds.length > 3) {
				milliseconds = milliseconds.slice(0, 3);// fix: 00:00:06.123.345
				return timeCode + '.' + milliseconds;
			}

			alert('convertTimecode milliseconds fix failed: '+milliseconds);// shouldn't happen
			return timeCode + '.' + milliseconds;
		}
		/**
		 * Refresh data from adjusted captionLayer keyframes
		 * convert keyframes to webVTT cue data
		 * Export .vtt captions file in the project folder
		 */
		function saveVttFile(dataList) {
			try {
				if (!(isSecurityPrefSet())) {
					alert("This script requires access to write files.\n" +
							"Go to the application preferences and enable \n" +
							"\"Allow Scripts to Write Files and Access Network\"");
					return;
				}

				findCaptionLayer();// if multiple, select one
				findKeyframes(dataList);// refresh cueItems
				if (cueItems.length === 0) {
					alert('There are no keyframes to export!');
					return;
				}

				captionLayer.visible = false;// hide captionLayer
				var count = cueItems.length;
				// 1000 milliseconds divided by 29.97 fps = 33.3667
				// var msFPS = 1000/selectedComp.frameRate;
				var theFile = File.saveDialog('Save the file.', '*.vtt', 'TEXT vtt');
			} catch(err){alert('saveVtt ERROR: ' + err.toString());}

			// if user didn't cancel and there are keyframes
			if (theFile != null && count > 0) {
				theFile.open('w', 'TEXT', '????');
				theFile.encoding = 'UTF-8';

				if (app.project.file) {
					theFile.write('WEBVTT ');// WEBVTT Kind: captions; Language: en
					theFile.write('captions for ' + app.project.file.name + '\n\n');
				} else {
					theFile.write('WEBVTT \n\n');
				}

				/**
				 * for each keyframe
				 * split the inPoint, convert last 2 characters (frames) to milliseconds, then join it again with decimal
				 * do the same for the outPoint
				 * 00:00:00:00 --> 00:00:06:00
				 */
				for (var x = 0; x < count; x++) {
					var cueStart = convertTimecode(cueItems[x].start);
					var cueEnd = convertTimecode(cueItems[x].end);

					theFile.write(cueItems[x].id);// cue.type
					theFile.write('\n');
					theFile.write(cueStart);
					theFile.write(' --> ');
					theFile.write(cueEnd);
					theFile.write('\n');
					theFile.write(cueItems[x].text);// cue.text
					theFile.write('\n\n');
				}

				theFile.close();// close the text file
				alert('VTT file completed.');

				// clear the panel if saved
				if (dataList) {
					dataList.removeAll();
				}
				cueItems = [];
			}
		}// end saveVTT

		/* ToDo: Thumbnails from Caption keyframes?
		https://creativecow.net/forums/thread/thumbnails-from-markers/
		// RENDER PATH is your path to export, and FILE_NAME is your preferred name, both are strings.
		var comp = app.project.activeItem;
		var markerProp = comp.markerProperty;
		var markerKeys = markerProp.numKeys;
		for (var i = 1; i<= markerKeys; i++){
			var saveFile = new File(RENDER_PATH + '/' + FILE_NAME + '_' + i+'.png');
			var curMarkerTime = markerProp.keyTime(i);
			comp.saveFrameToPng(curMarkerTime, saveFile);
			
			var loopLength = 10;
			while (saveFile.exists == false && loopLength) {
				$.sleep(250);
				loopLength--;
			}
		}
		*/

		// dockable panel ==================================
		myPanel.onResizing = myPanel.onResize = function() {
			this.layout.resize();
		};
		if (myPanel instanceof Window) {
			myPanel.center();
			myPanel.show();
		} else {
			myPanel.layout.layout(true);
			myPanel.layout.resize();
		}
	}
})(this);