(function(thisObj) {
	//https://www.goodboy.ninja/snippets/dockable-scriptui-panel-template
	// Any code you write here will execute before the panel is built.
	/*
		http://docs.aenhancers.com/layers/textlayer/
		https://ae-scripting.docsforadobe.dev/
		https://github.com/NTProductions?tab=repositories

		Visual Code for Extendscript debugging
		https://www.youtube.com/watch?v=a90H-Pf61LQ
		https://www.codeandmotion.com/blog/visual-studio-code-adobe-extendscript
	*/
	buildUI(thisObj); // Calling the function to build the panel

	function buildUI(thisObj) {
		var myPanel = (thisObj instanceof Panel) ? thisObj : new Window('palette', 'Cue Markers', undefined, {
			resizeable: true
		});

		// Write any UI code here. Note: myPanel is the window panel object.
		// include inline JSON.stringify & .parse https://gist.github.com/atheken/654510
		this.JSON||(this.JSON={}),function(){function f(t){return t<10?"0"+t:t}"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(t){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(t){return this.valueOf()});var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;function quote(t){return escapable.lastIndex=0,escapable.test(t)?'"'+t.replace(escapable,function(t){var e=meta[t];return"string"==typeof e?e:"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+t+'"'}function str(t,e){var n,r,f,o,u,i=gap,a=e[t];switch(a&&"object"==typeof a&&"function"==typeof a.toJSON&&(a=a.toJSON(t)),"function"==typeof rep&&(a=rep.call(e,t,a)),typeof a){case"string":return quote(a);case"number":return isFinite(a)?String(a):"null";case"boolean":case"null":return String(a);case"object":if(!a)return"null";if(gap+=indent,u=[],"[object Array]"===Object.prototype.toString.apply(a)){for(o=a.length,n=0;n<o;n+=1)u[n]=str(n,a)||"null";return f=0===u.length?"[]":gap?"[\n"+gap+u.join(",\n"+gap)+"\n"+i+"]":"["+u.join(",")+"]",gap=i,f}if(rep&&"object"==typeof rep)for(o=rep.length,n=0;n<o;n+=1)"string"==typeof(r=rep[n])&&(f=str(r,a))&&u.push(quote(r)+(gap?": ":":")+f);else for(r in a)Object.hasOwnProperty.call(a,r)&&(f=str(r,a))&&u.push(quote(r)+(gap?": ":":")+f);return f=0===u.length?"{}":gap?"{\n"+gap+u.join(",\n"+gap)+"\n"+i+"}":"{"+u.join(",")+"}",gap=i,f}}"function"!=typeof JSON.stringify&&(JSON.stringify=function(t,e,n){var r;if(gap="",indent="","number"==typeof n)for(r=0;r<n;r+=1)indent+=" ";else"string"==typeof n&&(indent=n);if(rep=e,e&&"function"!=typeof e&&("object"!=typeof e||"number"!=typeof e.length))throw new Error("JSON.stringify");return str("",{"":t})}),"function"!=typeof JSON.parse&&(JSON.parse=function(text,reviver){var j;function walk(t,e){var n,r,f=t[e];if(f&&"object"==typeof f)for(n in f)Object.hasOwnProperty.call(f,n)&&(void 0!==(r=walk(f,n))?f[n]=r:delete f[n]);return reviver.call(t,e,f)}if(text=String(text),cx.lastIndex=0,cx.test(text)&&(text=text.replace(cx,function(t){return"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})),/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return j=eval("("+text+")"),"function"==typeof reviver?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}();

		var templateComp;// the Template composition
		var templateIndex;// set by findTemplate item(index)
		var captionComp;// captions layer solid, text and markers
		var captionLayer;// [Captions] layer on Template, add markers, toggle enabled? 
		var hasCaptions = false;// true if captionComp was added to TemplateComp
		var captionText;// selected visible caption TextLayer
		var captionMarker;// selected layer marker on captionLayer [Captions]
		var frameRate;// of templateComp
		// selected item and index of the clicked ListBox row for editing
		var selectedItem = null;
		var selectedIndex = null;
		//var markerArray = [];// array of marker objects for listBox
		var cueItems = [];// array of cue objects
		var labelColor = 3;// aqua, set marker color if not set already

		var instructionPanel = myPanel.add('panel', undefined, undefined);
		instructionPanel.text ='Instructions:';
		instructionPanel.size = [450, 80];
		instructionPanel.alignChildren = ['left','top'];
		instructionPanel.spacing = 10;
		instructionPanel.margins = 10;
		instructionPanel.visible = false;
		
		var instructions = instructionPanel.add('staticText', undefined, undefined, {name: 'instructions', multiline: true, scrollable: true});
		instructions.size = [430, 60];
		instructions.text = 'Place markers on the Template comp. The comment is the Interaction Type.\rClick Refresh Data to collect the markers for the Template comp only. \rSelect Save VTT File to convert markers to cues in a vtt file.';
		// Todo: takes up too much room, use a helpTip on ?

		var dataPanel = myPanel.add('panel', [0, 0, 350, 160], 'Caption Markers: select a row to edit a caption');
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
				// set pointer to [Captions] layer marker for noteText changes
				//captionMarker = cueItems[selectedIndex].marker;
				templateComp.time = cueItems[selectedIndex].time;
				noteText.text = cueItems[selectedIndex].note;
				noteText.active = true;// focus on the edit box
				// try {
					// alert('captionMarker: '+captionMarker.comment);// OK
					// alert(' cue: '+JSON.stringify(cueItems[selectedIndex].marker));
					// captionLayer.sourceText.removeKey(1+selectedIndex);
				// } catch(err) { alert('listChange ERROR: '+err.toString()); }
			}
		};
		// dataList.onDoubleClick = function () {}
		// dataList.revealItem(item #);// Scrolls the list to make the specified item visible, if necessary.

		var propsPanel = myPanel.add('panel', undefined, undefined, {name: 'propsPanel'});
		propsPanel.text = 'Caption Editor: select a row';
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
				selectedItem.subItems[1].text = this.text;// JSON.stringify(this.text)
				cueItems[selectedIndex].note = this.text;
				// captionText = cueItems[selectedIndex].captionText;
				// update the Marker & TextLayer
				var txt = captionLayer.sourceText.keyValue(1+selectedIndex);
				txt.text = this.text;
				captionLayer.sourceText.setValueAtTime(cueItems[selectedIndex].time, txt);
				//captionMarker.comment = this.text;// doesn't UPDATE
				//alert('TEST: '+captionMarker.duration+' : '+captionMarker.comment);// OK
				// captionLayer.property('Marker').removeKey(1+selectedIndex);
				// var marker = new MarkerValue('Caption Text');
				// 	marker.comment = this.text;
				// 	marker.time = cueItems[selectedIndex].time;
				// 	marker.duration = captionMarker.duration;
				// 	marker.label = labelColor;
				// captionLayer.property('Marker').setValueAtTime(cueItems[selectedIndex].time, marker);
				// captionMarker = captionLayer.property('Marker').keyValue(selectedIndex);
			} catch(err) { alert('noteText ERROR: '+err.toString()); }
			refreshListBox();
		}

		var buttonPanel = myPanel.add('panel', undefined, 'Actions:');
		buttonPanel.orientation = 'column';
		// column w/ 2 rows
		var btnGrp1 = buttonPanel.add('group', undefined, {name: 'btnGrp1'});
		btnGrp1.orientation = 'row';

		// import text file to generate CaptionComp
		var importCaptionsBtn = btnGrp1.add('button', undefined, 'Import Captions');
		importCaptionsBtn.helpTip = 'Open a Text file to generate captions.';
		importCaptionsBtn.onClick = function () {
			importCaptions(dataList);
		}

		var findMarkersBtn = btnGrp1.add('button', undefined, 'Find Markers');
		findMarkersBtn.helpTip = 'Check for markers on the Template comp.';
		findMarkersBtn.onClick = function() {
			findMarkers(dataList);// pass in dataList
		}

		var exportBtn = btnGrp1.add('button', undefined, 'Save VTT File');
		exportBtn.helpTip = 'Save the captions to a vtt file.';
		//exportBtn.enabled = false;
		exportBtn.onClick = function() {
			saveVttFile();
		};

		var btnGrp2 = buttonPanel.add('group', undefined, {name: 'btnGrp2'});
		btnGrp2.orientation = 'row';
		btnGrp2.enabled = false;

		// Insert Marker
		var addMarkerBtn = btnGrp2.add('button', undefined, 'Insert Marker');
		addMarkerBtn.helpTip = 'Insert a new marker at current time.';
		addMarkerBtn.onClick = function () {
			addMarker(dataList);
		}

		// Delete Marker
		var delMarkerBtn = btnGrp2.add('button', undefined, 'Insert Marker');
		delMarkerBtn.helpTip = 'Delete this marker.';// at templateComp.time
		delMarkerBtn.onClick = function () {
			deleteMarker(dataList);
		}

		// [HELP btn] instructions : Use a dialog window instead?
		var helpBtn = btnGrp2.add('button', undefined, 'Instructions');
		helpBtn.helpTip = 'Toggle instructions.';
		helpBtn.onClick = function () {
			if (instructionPanel.visible) {
				instructionPanel.visible = false;
				dataPanel.visible = true;
				propsPanel.visible = true;
			} else {
				instructionPanel.visible = true;
				dataPanel.visible = false;
				propsPanel.visible = false;
			}
		}
		// Thumbnails from markers?


		/** functions ============================================
			Ask, is it easier to adjust the text layers and sync the markers to them?
			or adjust the markers and sync the layers (currently)

			templateComp could have 1 TextLayer w/keyframes on the SoureText
			drag the keyframes to adjust timing. 
			findMarkers() will sync the data
			is it possible to capture timeline drag events? to call findMarkers() & refresh cueItems

			https://ae-scripting.docsforadobe.dev/items/compitem/
			https://ae-scripting.docsforadobe.dev/other/markervalue/#markervalue
			https://ae-scripting.docsforadobe.dev/layers/layercollection/
			https://ae-scripting.docsforadobe.dev/layers/layercollection/#layercollection-addsolid
			https://ae-scripting.docsforadobe.dev/other/textdocument/

			https://extendscript.docsforadobe.dev/user-interface-tools/types-of-controls.html
			https://extendscript.docsforadobe.dev/user-interface-tools/common-properties.html

			https://lova.tt/scriptlets
            https://github.com/NTProductions/lyric-music-video-generator-script/blob/main/Lyric%20Music%20Video%20Generator.jsx
		 */
        /**
         * Refresh the listBox by resizing it to update the list items
         */
        function refreshListBox() {
            var ls = dataList.size;
            dataList.size = [1+ls[0], 1+ls[1]];
            dataList.size = [ls[0], ls[1]];
        }

		/**
		 * Set up global variables, templateComp & captionLayer
		 * if captionLayer is not a layer of Template, add it Once
		 * called from other functions
		 */
		function findTemplateComp() {
			for (var i = 1; i <= app.project.items.length; i++) {
				var curItem = app.project.items[i];
				// check if this item is a composition
				if (curItem instanceof CompItem && curItem.name === 'Template') {
                    templateComp = curItem;// for addMarker button
                    templateIndex = i;
                    frameRate = Math.round(templateComp.frameRate);// 29.97 = 30
                    //curItem.openInViewer();// make sure it is open to see markers

                    try {
                        for (var x=1; x<=templateComp.numLayers; x++) {
                            if (templateComp.layers[x].name === 'Captions') {
                                hasCaptions = true;
                                captionLayer = templateComp.layers[x];
                                captionLayer.enabled = true;
                                btnGrp2.enabled = true;
                                //alert('Has Captions on layer: '+x);
                            }
                        }
                    } catch(err) { alert('findTemplate ERROR: '+err.toString()); }
				}
			}

			// if not a layer on Template, add it
			if (!captionLayer && !hasCaptions) {
				app.beginUndoGroup('Add caption layer');
				try {
                    // one text layer w/ keyframes on the SourceText
                    captionLayer = templateComp.layers.addBoxText([1280, 120]);
                    captionLayer.position.setValue([640, 660]);
                    captionLayer.inPoint = 0;// seconds
                    captionLayer.outPoint = templateComp.workAreaDuration;
                    captionLayer.name = 'Captions';

                    var txt = captionLayer.sourceText.value;
                    //txt.resetCharStyle();
                    // txt.resetParagraphStyle();
                    txt.boxTextSize = [1280, 110];
                    txt.text = txtArray[i];
                    txt.font = 'Arial-Bold';// w/black stroke
                    // use ALL properties for this to work?
                    txt.fontSize = 36;
                    txt.fillColor = [1, 1, 1];
                    txt.applyFill = true;
                    txt.strokeColor = [0, 0, 0];
                    txt.strokeOverFill = true;
                    txt.applyStroke = true;
                    txt.leading = 40;// line height
                    txt.tracking = 40;// character width
                    txt.justification = ParagraphJustification.CENTER_JUSTIFY;
                    captionLayer.sourceText.setValue(txt);
                    btnGrp2.enabled = true;
					// https://ae-scripting.docsforadobe.dev/properties/property/

                    // captionLayer.locked = true;// if locked, can I still control w/script?
                    //alert('Captions Added: '+templateComp.​numLayers+' : '+captionLayer.name);
                    //alert('last layer name: ' + templateComp.layer(templateComp.numLayers).name);// [White Solid 1]
				} catch(err) { alert('ERROR: '+err.toString()); }
				app.endUndoGroup();
			}
		}

		/**
		 * Open a .txt file and create
		 * 	Keyframes on captionLayer TextLayer
		 * 	dataList items
		 * 	cueItems array data for Save VTT File
		 */
		function importCaptions(dataList) {
			if (!templateComp || !captionLayer) {
				findTemplateComp();
			}

			var text = '';
			var txtArray = [];
			var time = 0.01;// start time
			var factor = 0.38;// estimated
			var duration = factor;// word count * factor
			
			// Prompt user to select text file
			var myFile = File.openDialog('Please select a text file.');
			if (myFile) {
				if (myFile.open('r')) {
					// read text lines into array until end-of-file is reached
					while (!myFile.eof) {
						text = myFile.readln();
						// read into array then create Markers and TextLayers
						if (text != '') {
							txtArray.push(text);
						}
					}
					myFile.close();

					// create undo group
					app.beginUndoGroup('Create Text Layers From File');
					// rename captionLayer to Captions - FILENAME
                    // remove keyframes
					try {
						if (captionLayer && captionLayer.sourceText.numKeys > 0) {
							// remove existing keyframes on TextLayer from end to beginning
							var count = captionLayer.sourceText.numKeys;
							//alert('import: '+count+' : '+captionLayer.name);// OK
                            for (i=count; i>0; i--) {
                                captionLayer.sourceText.removeKey(i);
                            }
						}
					} catch(err) { alert('import ERROR: '+err.toString()); }
					// make sure the Display Type is TIMECODE for exporting vtt
					var displayType = app.project.timeDisplayType;
					if (displayType == 2013) {
						app.project.timeDisplayType = 2012;// TIMECODE=2012, FRAMES=2013
					}
                    // reset data
					dataList.removeAll();
					cueItems = [];

					// create Marker and TextLayer for each line of text
					for (i=0; i<txtArray.length; i++) {
						try {
							// calc factor? templateComp.workAreaDuration / total lines?
							// calculate duration from text length based on Rob's cadence
							var count = txtArray[i].split(' ');
							if (count.length == 0 ) {
								duration = factor;
							} else {
								duration = Math.round(count.length * factor);
							}

							// add keyframes to the captionLayer SourceText
							// add keyframe at time NOTE: will not have a duration?
							var txt = captionLayer.sourceText.value;
							txt.text = txtArray[i];
							//captionLayer.sourceText.setValueAtKey(1, newTextDocument("keynumber1"));
							captionLayer.sourceText.setValueAtTime(time, txt);

							// update dataList: ['#', 'Start', 'Caption']
							var listItem = dataList.add('item', (1+cueItems.length));// display marker data
							listItem.subItems[0].text = timeToCurrentFormat(time, frameRate);
							listItem.subItems[1].text = txtArray[i];// JSON.stringify(txtArray[i]);

							// data for export to vtt file id=comment, start=time, end=start+duration, text = settings
							var cueObj = {};// construct data for vtt file
							cueObj.id = cueItems.length;
							cueObj.start = timeToCurrentFormat(time, frameRate);
							cueObj.end = timeToCurrentFormat(time+duration, frameRate);// fixed duration
							cueObj.note = txtArray[i];//compMarker.comment;//curItem.markerProperty.keyValue(m).comment;
							cueObj.time = time;// set templateComp.time when dataList.row is selected
							cueObj.compIndex = templateIndex;//templateComp.index for app.project.items(index)
							//cueObj.captionText = captionText;// TextLayer
							//cueObj.marker = marker;

							cueItems.push(cueObj);
							time = time + duration;// next inPoint
						} catch(err) {
							app.endUndoGroup();
							app.project.timeDisplayType = displayType;// reset to original setting
							alert('ERROR: '+err.toString());
							return;
						}
					}

					app.project.timeDisplayType = displayType;// reset to original setting
					app.endUndoGroup();
					// alert('cueItems: '+JSON.stringify(cueItems));
				} else {
					alert('Open File failed!');
				}
			}// user cancelled Open File
		}

		/**
		 * Refresh cueItems, dataList and TextLayers
		 * adjust IN/OUT points of TextLayers
		 */
		function findMarkers(dataList) {
			findTemplateComp();// setup global vars
			if (!captionLayer) {
				captionLayer = templateComp.layer(1);
				if (captionLayer.name != 'Captions' || captionLayer.property('Marker').numKeys == 0) {
					alert('There are no markers on the Template comp timeline.');
					return;
				}
				alert('problem: added captionLayer here');
			}

            app.beginUndoGroup('Refresh Keyframes');
            // ToDo: if cueItems.length, stash and re-instate cueItem.settings
            dataList.removeAll();
            cueItems = [];
            // make sure the Display Type is TIMECODE for exporting vtt
            var displayType = app.project.timeDisplayType;
            if (displayType === 2013) {
                app.project.timeDisplayType = 2012;// TIMECODE=2012, FRAMES=2013
            }

            try {
                // var count = captionComp.layers.length;// -solid layer
                var marks = captionLayer.sourceText.numKeys;
                if (marks > 0) {
                    for (var m = 1; m <= marks; m++) {
                        var cueObj = {};// construct data for vtt file
                        //var frameRate = Math.round(templateComp.frameRate);// 29.97 = 30
                        var marker = captionLayer.sourceText.keyValue(m);
                        var listItem = dataList.add('item', m);// display marker data
                        listItem.subItems[1].text = marker.text;

                        var time = captionLayer.sourceText.keyTime(m);// NOT: .keyValue(m).time;
                        var duration = captionLayer.workAreaDuration - time;//property('Marker').keyValue(m).duration;
                        if (m < marks) {
                            duration = captionLayer.sourceText.keyTime(m+1) - time;// next keyframe start
                        }
                        if (time) {
                            listItem.subItems[0].text = timeToCurrentFormat(time, frameRate);// start
                            // data for export to vtt file id=#, start=time, end=duration, text=comment
                            cueObj.id = cueItems.length;
                            cueObj.start = timeToCurrentFormat(time, frameRate);
                            cueObj.end = timeToCurrentFormat(time+duration, frameRate);
                            cueObj.note = marker.comment;// caption text
                            cueObj.time = time;// set templateComp.time when dataList.row is selected
                            cueObj.compIndex = templateIndex;//templateComp.index for app.project.items(index)
                            // cueObj.captionText = captionComp.layers[count - m];// update TextLayer
                            // cueObj.marker = marker;// to edit marker comment
                        } else { alert('if (time) is necessary!'); }

                        cueItems.push(cueObj);
                    }
                    app.project.timeDisplayType = displayType;// reset
                    app.endUndoGroup();
                } else {
                    alert('There are no markers on the Template timeline.');
                }
            } catch(err) { alert('findMarkers ERROR: '+err.toString()); }
		}

		// Insert a Marker at templateComp.time
		function addMarker(dataList) {
			if (!templateComp || !captionLayer) {
				findTemplateComp();
			}
			if (templateComp) {
				app.beginUndoGroup('Add New Marker');
                var time = templateComp.time;// current time
                //var txt = captionLayer.sourceText.getValueAtTime(time);// nearest?
                var txt = captionLayer.sourceText.value;// main
                txt.text = 'Add Caption Text Here';
                captionLayer.sourceText.setValueAtTime(time, txt);

				// make sure the Display Type is TIMECODE for exporting vtt
                var displayType = app.project.timeDisplayType;
				if (displayType === 2013) {
					app.project.timeDisplayType = 2012;// TIMECODE=2012, FRAMES=2013
				}

				// update dataList: ['#', 'Cue', 'Start', 'Caption']
                //var frameRate = Math.round(templateComp.frameRate);// 29.97 = 30
				var listItem = dataList.add('item', (1+cueItems.length));
				listItem.subItems[0].text = timeToCurrentFormat(time, frameRate);
				listItem.subItems[1].text = compMarker.comment;//curItem.markerProperty.keyValue(m).comment;// keyComment(m)?

				// data for export to vtt file id=comment, start=time, end=start+.05, text = settings
				var cueObj = {};// construct data for vtt file
				cueObj.id = cueItems.length;
				cueObj.start = timeToCurrentFormat(time, frameRate);
				cueObj.end = timeToCurrentFormat(time + compMarker.duration, frameRate);// fixed duration
				cueObj.note = 'Add Caption Text';//compMarker.comment;//curItem.markerProperty.keyValue(m).comment;
				cueObj.time = time;// set templateComp.time when dataList.row is selected
				cueObj.compIndex = templateIndex;//templateComp.index for app.project.items(index)
				// cueObj.captionText = captionText;// TextLayer
				// cueObj.marker = marker;

				cueItems.push(cueObj);
				//alert('marker added:', JSON.stringify(cueObj));
				app.project.timeDisplayType = displayType;// reset to original setting
				app.endUndoGroup();
			} else {
				alert('Template comp not found.');
				//alert('Create a composition named Template and try again.');
			}
		}

		/**
		 * Delete the currently selected Marker and TextLayer
		 * if time is different than selected,
		 * confirm delete marker at current time
		 * Warning: only use the delete btn, Don't use context delete
		 https://extendscript.docsforadobe.dev/user-interface-tools/types-of-controls.html
		 https://extendscript.docsforadobe.dev/user-interface-tools/defining-behavior-with-event-callbacks-and-listeners.html
		 */
		function deleteMarker(dataList) {
			if (!templateComp || !captionComp) {
				findTemplateComp();
			}
			if (!captionLayer) {
				captionLayer = templateComp.layer(1);
				if (captionLayer.name != 'Captions' || captionLayer.sourceText.numKeys == 0) {
					alert('There are no keyframes on the Captions timeline.');
					return;
				}
				alert('problem: added captionLayer here');
			}

			try {
				// selected marker OR templateComp.time
				var marker = cueItems[selectedIndex].marker;
				var markerIndex;// timeline
				var timeline = templateComp.time;
				for (var i=0; i<cueItems.length; i++) {
					if (timeline >= cueItems[i].time) {
						markerIndex = i;//cueItems[i].marker;
					}
				}
				if (captionLayer && captionComp.numLayers > 1) {
					// remove existing TextLayers and Markers from end to beginning
					app.beginUndoGroup('Delete Marker');
					if (selectedIndex == markerIndex) {
						// remove marker, TextLayer and adjust cueItems[]
						captionLayer.sourceText.removeKey(selectedIndex);
						captionComp.layers[captionComp.numLayers - selectedIndex].remove();
						cueItems = cueItems.splice(selectedIndex, 1);
						refreshListBox();
					} else {
						// comfirm which marker // subString? // replace instruction dialog?
						var btnText1 = captionLayer.sourceText.keyValue(markerIndex).comment;
						var dlg = new Window('dialog', 'Select which marker');
						dlg.btnPnl = dlg.add('panel', undefined, 'Select which marker:');
						dlg.btnPnl.size = [450, 280];
						dlg.btnPnl.add('statictext', undefined, 'Caption at timeline:');
						dlg.btnPnl.add('statictext', undefined, btnText1);

						// ToDo: format this modal - group column? listItemObj.toString()
						var testBtn = dlg.btnPnl.add('button', undefined, btnText1.subString(0,10));
						testBtn.onClick = function () {
							var confirm = dlg.confirm('Marker at templateComp.time? '+markerIndex);
							confirm.onClose = function() {
								dlg.close();// alert, confirm, prompt
								$.writeln('text[, text...]...');// VSCode console?
							}
						}

						var okBtn = dlg.btnPnl.add('button', undefined, 'OK', { name: 'ok' });
						okBtn.onClick = function () {
							// alert('Marker at templateComp.time? '+markerIndex);
							dlg.close();
							// marker at templateComp.time
							captionLayer.sourceText.removeKey(markerIndex);
							captionComp.layers[captionComp.numLayers - markerIndex].remove();
							cueItems = cueItems.splice(markerIndex, 1);
							refreshListBox();
						}

						var cancelBtn = dlg.btnPnl.add('button', undefined, 'Cancel', { name: 'cancel' });
						cancelBtn.onClick = function () {
							// alert('Marker at templateComp.time? '+markerIndex);
							dlg.close();
						}
						dlg.defaultElement = okBtn;
						dlg.cancelElement = cancelBtn;
						dlg.center();
						dlg.show();
					}
					// alert('Found: '+selectedIndex+' : '+markerIndex);
					app.endUndoGroup();
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
		 * Refresh data from adjusted captionLayer markers
		 * convert markers to webVTT cue data
		 * Export .vtt captions file in the project folder
		 */
		function saveVttFile() {
			if (!(isSecurityPrefSet())) {
				alert("This script requires access to write files.\n" +
						"Go to the application preferences and enable.\n" +
						"\"Allow Scripts to Write Files and Access Network\"");
				return;
			}
			if (cueItems.length === 0) {
				alert('There are no markers to export!');
				return;
			}

			findMarkers();// refresh cueItems
            captionLayer.visible = false;// hide captionLayer
			var count = cueItems.length;
			// 1000 milliseconds divided by 29.97 fps = 33.3667
			var msFPS = 1000/templateComp.frameRate;
			var theFile = File.saveDialog('Save the file.', '*.vtt', 'TEXT vtt');

			// if user didn't cancel and there are markers
			if (theFile != null && count > 0) {
				theFile.open('w', 'TEXT', '????');
				theFile.encoding = 'UTF-8';

				if (app.project.file) {
					theFile.write('WEBVTT ');
					theFile.write('interactive cues for ' + app.project.file.name + '\r\n');
				} else {
					theFile.write('WEBVTT \r\n');
				}

				theFile.write('kind: captions' + '\r\n\n\n');

				/**
				 * for each marker
				 * split the inPoint, convert last 2 characters (frames) to milliseconds, then join it again with decimal
				 * do the same for the outPoint
				 */
				for (var x = 0; x < count; x++) {
					var str_in = cueItems[x].start;
					var timeCodeIn = str_in.slice(0, 8);
					var timeCodeSeconds = str_in.slice(9, 11);
					var milliseconds = timeCodeSeconds * msFPS;
					var cueStart = timeCodeIn + '.' + milliseconds;

					var str_out = cueItems[x].end;
					var timeCodeOut = str_out.slice(0, 8);
					timeCodeSeconds = str_out.slice(9, 11);
					milliseconds = timeCodeSeconds * msFPS;
					var cueEnd = timeCodeOut + '.' + milliseconds;
					var cueText = cueItems[x].note;//JSON.stringify(cueItems[x].note);

					// write the results to the file
					// if (cueItems[x].note !== '') {
					// 	//cueItems[x].note.replace('\n', ' ');// don't allow 2 new lines
					// 	theFile.write('Note: '+cueItems[x].note+'\r\n\n');
					// }
					theFile.write(cueItems[x].id);// cue.type
					theFile.write('\r\n');
					theFile.write(cueStart);
					theFile.write(' --> ');
					theFile.write(cueEnd);
					theFile.write('\r\n');
					theFile.write(cueText);// cue.text
					theFile.write('\r\n\n');
				}

				theFile.close();// close the text file
				alert('VTT file completed.');
			}
		}// end saveVTT

        // ToDo: import vtt captions?
		/* Thumbnails from markers
		https://creativecow.net/forums/thread/thumbnails-from-markers/
		var comp = app.project.activeItem; //Active composition in AE
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