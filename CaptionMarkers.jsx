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
		var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Cue Markers", undefined, {
			resizeable: true
		});

		// Write any UI code here. Note: myPanel is the window panel object.
		// include inline JSON.stringify & .parse https://gist.github.com/atheken/654510
		this.JSON||(this.JSON={}),function(){function f(t){return t<10?"0"+t:t}"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(t){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(t){return this.valueOf()});var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;function quote(t){return escapable.lastIndex=0,escapable.test(t)?'"'+t.replace(escapable,function(t){var e=meta[t];return"string"==typeof e?e:"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+t+'"'}function str(t,e){var n,r,f,o,u,i=gap,a=e[t];switch(a&&"object"==typeof a&&"function"==typeof a.toJSON&&(a=a.toJSON(t)),"function"==typeof rep&&(a=rep.call(e,t,a)),typeof a){case"string":return quote(a);case"number":return isFinite(a)?String(a):"null";case"boolean":case"null":return String(a);case"object":if(!a)return"null";if(gap+=indent,u=[],"[object Array]"===Object.prototype.toString.apply(a)){for(o=a.length,n=0;n<o;n+=1)u[n]=str(n,a)||"null";return f=0===u.length?"[]":gap?"[\n"+gap+u.join(",\n"+gap)+"\n"+i+"]":"["+u.join(",")+"]",gap=i,f}if(rep&&"object"==typeof rep)for(o=rep.length,n=0;n<o;n+=1)"string"==typeof(r=rep[n])&&(f=str(r,a))&&u.push(quote(r)+(gap?": ":":")+f);else for(r in a)Object.hasOwnProperty.call(a,r)&&(f=str(r,a))&&u.push(quote(r)+(gap?": ":":")+f);return f=0===u.length?"{}":gap?"{\n"+gap+u.join(",\n"+gap)+"\n"+i+"}":"{"+u.join(",")+"}",gap=i,f}}"function"!=typeof JSON.stringify&&(JSON.stringify=function(t,e,n){var r;if(gap="",indent="","number"==typeof n)for(r=0;r<n;r+=1)indent+=" ";else"string"==typeof n&&(indent=n);if(rep=e,e&&"function"!=typeof e&&("object"!=typeof e||"number"!=typeof e.length))throw new Error("JSON.stringify");return str("",{"":t})}),"function"!=typeof JSON.parse&&(JSON.parse=function(text,reviver){var j;function walk(t,e){var n,r,f=t[e];if(f&&"object"==typeof f)for(n in f)Object.hasOwnProperty.call(f,n)&&(void 0!==(r=walk(f,n))?f[n]=r:delete f[n]);return reviver.call(t,e,f)}if(text=String(text),cx.lastIndex=0,cx.test(text)&&(text=text.replace(cx,function(t){return"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})),/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return j=eval("("+text+")"),"function"==typeof reviver?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}();

		var templateComp;// the Template composition
		var templateIndex;// set by findTemplate item(index)
		var captionComp;// captions layer solid, text and markers
		//var captionCompIndex;// set by findTemplate UNUSED: captionComp.index
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

		// var instructionPanel = myPanel.add('panel', undefined, undefined);
		// instructionPanel.text ='Instructions:';
		// instructionPanel.size = [450, 80];
		// instructionPanel.alignChildren = ["left","top"];
		// instructionPanel.spacing = 10;
		// instructionPanel.margins = 10;
		//
		// var instructions = instructionPanel.add('staticText', undefined, undefined, {name: "instructions", multiline: true, scrollable: true});
		// instructions.size = [430, 60];
		// instructions.text = 'Place markers on the Template comp. The comment is the Interaction Type.\rClick Refresh Data to collect the markers for the Template comp only. \rSelect Save VTT File to convert markers to cues in a vtt file.';
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
				// set pointer to [Captions] layer marker
				captionMarker = cueItems[selectedIndex].marker
				templateComp.time = cueItems[selectedIndex].time;
				noteText.text = cueItems[selectedIndex].note;
				noteText.active = true;// focus on the edit box
			}
		};

		var propsPanel = myPanel.add("panel", undefined, undefined, {name: "propsPanel"});
		propsPanel.text = "Caption Editor: select a row";
		//propsPanel.preferredSize.width = 350;
		propsPanel.orientation = "column";
		propsPanel.alignChildren = ["left","top"];
		propsPanel.spacing = 10;
		propsPanel.margins = 10;
		propsPanel.enabled = false;// until a list item is selected

		// var propsPanelRow = propsPanel.add("group", undefined, {name: "propsRow1"});
		// propsPanelRow.orientation = "row";
		// https://extendscript.docsforadobe.dev/user-interface-tools/common-properties.html?highlight=group#common-properties

		// text editor
        var noteGroup = propsPanel.add("group", undefined, {name: "cueNotes"});
		noteGroup.orientation = 'row';
		//noteGroup.add( "statictext", undefined, "Caption:");
		var noteText = noteGroup.add( "edittext", undefined, "", {
            multiline: true, scrolling: true, wantReturn: true
        });
		noteText.size = [340, 55];// 3 rows
		noteText.onChanging = function () {
			selectedItem.subItems[1].text = this.text;
			refreshListBox();
			cueItems[selectedIndex].note = this.text;
			// update the marker
			captionMarker.comment = this.text;
            // update the TextLayer 
			captionText = cueItems[selectedIndex].captionText;
			var txt = captionText.sourceText.value;
			txt.text = this.text;
			captionText.sourceText.setValue(txt);
		}

		var buttonPanel = myPanel.add('panel', undefined, 'Actions:');
		buttonPanel.orientation = 'row';

		// import text file to generate CaptionComp
		var importCaptionsBtn = buttonPanel.add('button', undefined, 'Import Captions');
		importCaptionsBtn.helpTip = 'Open a Text file to generate captions.';
		importCaptionsBtn.onClick = function () {
			importCaptions(dataList);
		}

		// Add Caption comp to templateComp
		// var addCaptionsBtn = buttonPanel.add('button', undefined, 'Add Captions');
		// addCaptionsBtn.helpTip = 'Add Text and Shape layers to Template comp.';
		// addCaptionsBtn.onClick = function () {
		// 	addCaptionComp(dataList);
		// }

		var addMarkerBtn = buttonPanel.add('button', undefined, 'Add Marker');
		addMarkerBtn.helpTip = 'Add a new marker to Template comp.';
		addMarkerBtn.onClick = function () {
			addMarker(dataList);
		}

		var findMarkersBtn = buttonPanel.add('button', undefined, 'Find Markers');
		findMarkersBtn.helpTip = 'Check for markers on the Template comp.';
		findMarkersBtn.onClick = function() {
			findMarkers(dataList);// pass in dataList
		}

		var exportBtn = buttonPanel.add('button', undefined, 'Save VTT File');
		exportBtn.helpTip = 'Save the captions to a vtt file.';
		//exportBtn.enabled = false;
		exportBtn.onClick = function() {
			saveVttFile();
		};
		// [HELP btn] instructions

		// functions ============================================
        /**
         * Refresh the listBox by resizing it to update the list items
         */
        function refreshListBox() {
            var ls = dataList.size;
            dataList.size = [1+ls[0], 1+ls[1]];
            dataList.size = [ls[0], ls[1]];
        }

		function findTemplateComp() {
			for (var i = 1; i <= app.project.items.length; i++) {
				var curItem = app.project.items[i];
				// check if this item is a composition
				if (curItem instanceof CompItem) {
					// only use markers on the Template composition
					if (curItem.name === 'Template') {
						templateComp = curItem;// for addMarker button
						templateIndex = i;
						frameRate = Math.round(templateComp.frameRate);// 29.97 = 30
						//curItem.openInViewer();// make sure it is open to see markers
						
						//alert('Template layers: '+templateComp.numLayers);
						//alert("name of last layer is " + templateComp.layer(templateComp.numLayers).name);
						try {
							for (var x=1; x<=templateComp.numLayers; x++) {
								alert('template layer name: '+x+' '+templateComp.layers[x].name);
								if (templateComp.layers[x].name === '[Captions]') {
									hasCaptions = true;
									captionLayer = templateComp.layers[x];
									alert('Has Captions on layer: '+x);
								}
							}
						} catch(err) { alert('findTemplate ERROR: '+err.toString()); }
					}
					if (curItem.name === 'Captions') {
						captionComp = curItem;// for addMarker button
						//captionCompIndex = i;// UNUSED
						// app.project.item(index).layer(index).containingComp
					}
				}
			}

			// if CaptionComp but not a layer of Template, add it
			if (!captionComp && !hasCaptions) {
				app.beginUndoGroup("Add caption comp");
				try {
					captionComp = app.project.items.addComp("Captions", 1280, 720, 1.0, templateComp.workAreaDuration, 29.97);
					captionComp.bgColor = [1,1,1];
					var solidLayer = captionComp.layers.addSolid([0, 0, 0], "darkbkg", 1280, 130, 1.0);
					// https://ae-scripting.docsforadobe.dev/properties/property/
					solidLayer.opacity.setValue(75);
					solidLayer.position.setValue([640, 655]);

					// if templateComp contains captionComp, set flag and captionLayer
					for (var i=1; i<=templateComp.​numLayers; i++) {
						//alert('template layer name: '+x+' '+templateComp.layers[x].name);
						if (templateComp.layers[i].name === '[Captions]') {
							hasCaptions = true;
							templateComp.layers[i].enabled = true;
							captionLayer = templateComp.layers[i];
							alert('Captions Found on layer '+i);
						}
					}
					// if templateComp does not contain captionComp, add it now
					if (!hasCaptions) {
						hasCaptions = true;
						captionLayer = templateComp.layers.add(captionComp);
						//alert('Captions Added: '+templateComp.​numLayers+' : '+captionLayer.name);
						//alert("last layer name: " + templateComp.layer(templateComp.numLayers).name);// [White Solid 1]
						//templateComp.layer(templateComp.numLayers).moveToBeginning();
					}
				} catch(err) { alert('ERROR: '+err.toString()); }
				app.endUndoGroup();
			}
		}

		// add Caption Text] to templateComp? can the shape and text layers be linked together? 
		// only once. in its own comp? that can be hidden or deleted
		// https://ae-scripting.docsforadobe.dev/items/compitem/
		// add captionComp to templateComp, add markers to captionComp Text layer?
		// https://ae-scripting.docsforadobe.dev/other/markervalue/#markervalue
		// https://ae-scripting.docsforadobe.dev/layers/layercollection/
		// https://ae-scripting.docsforadobe.dev/layers/layercollection/#layercollection-addsolid
		// https://ae-scripting.docsforadobe.dev/other/textdocument/
		// https://github.com/NTProductions/lyric-music-video-generator-script/blob/main/Lyric%20Music%20Video%20Generator.jsx
		/**
		 * create captionComp once, add it to templateComp once
		 * add markers to captionComp
		 */
		function addCaptionComp(dataList) {
			// if !captionComp, create it then add it to Template.layer(1)
			findTemplateComp();
			return;
			// moved:
			if (!captionComp && !hasCaptions) {
				app.beginUndoGroup("Add caption comp");
				try {
					captionComp = app.project.items.addComp("Captions", 1280, 720, 1.0, templateComp.workAreaDuration, 29.97);
					captionComp.bgColor = [1,1,1];
					var solidLayer = captionComp.layers.addSolid([0, 0, 0], "darkbkg", 1280, 130, 1.0);
					// https://ae-scripting.docsforadobe.dev/properties/property/
					solidLayer.opacity.setValue(75);
					solidLayer.position.setValue([640, 655]);

					// if templateComp does not contain captionComp, add it now
					for (var i=1; i<=templateComp.​numLayers; i++) {
						if (templateComp.layers[i].name === '[Captions]') {
							hasCaptions = true;
							templateComp.layers[i].enabled = true;
							alert('Captions Found on layer '+i);
						}
					}
					if (!hasCaptions) {
						hasCaptions = true;
						captionLayer = templateComp.layers.add(captionComp);
						//alert('Captions Added: '+templateComp.​numLayers+' : '+captionLayer.name);
						//alert("last layer name: " + templateComp.layer(templateComp.numLayers).name);// [White Solid 1]
						//templateComp.layer(templateComp.numLayers).moveToBeginning();
					}
					/*
					// add markers to captionText layer
					captionText = captionComp.layers.addBoxText([1280, 120]);
					captionText.position.setValue([640, 670]);
					// calculate duration from text length?
					captionText.inPoint = 10;// seconds
					captionText.outPoint = 20;// layer.inPoint + duration;

					var txt = captionText.sourceText.value;
					txt.resetCharStyle();
            		// txt.resetParagraphStyle();
            		txt.boxTextSize = [1280, 110];
					txt.text = 'Add Caption Text';// len = 16 chars
					txt.font = 'MyriadPro-Regular';
					txt.fontSize = 36;
					txt.fillColor = [1, 1, 1];
					txt.applyFill = true;
					txt.leading = 40;// line height
					txt.tracking = 50;// character width
					txt.justification = ParagraphJustification.CENTER_JUSTIFY;
					captionText.sourceText.setValue(txt);

					// layer marker
					var marker = new MarkerValue('Caption Text');
					marker.comment = 'Caption';
					marker.time = 0;//templateComp.time;
					marker.duration = 10;// ToDo: duration
					marker.label = labelColor;
					captionText.property('Marker').setValueAtTime(captionText.inPoint, marker);
					*/
				} catch(err) { alert('ERROR: '+err.toString()); }

				// try {} catch(err) { alert('ERROR: '+err.toString()); }
				//alert('Template layers: '+templateComp.numLayers);
				app.endUndoGroup();
			}
		}

		function addMarker(dataList) {
			if (!templateComp || !captionComp) {
				findTemplateComp();
			}
			if (templateComp) {
				var compMarker = new MarkerValue('Caption Text');
				// Todo: set marker comment to selected type
				// compMarker.comment = 'Caption';
				compMarker.comment = 'Add Caption Text';
				compMarker.time = templateComp.time;
				compMarker.duration = 0;// ToDo: duration
				compMarker.label = labelColor;// 3 aqua
				try {
					//captionLayer.markerProperty.setValueAtTime(templateComp.time, compMarker);
					captionLayer.property('Marker').setValueAtTime(templateComp.time, compMarker);
				} catch(err) { alert('ERROR: '+err.toString()); }
				//templateComp.markerProperty.setValueAtTime(templateComp.time, compMarker);

				// add markers to captionText layer
				captionText = captionComp.layers.addBoxText([1280, 120]);
				captionText.position.setValue([640, 660]);
				// calculate duration from text length?
				captionText.inPoint = templateComp.time;// seconds
				captionText.outPoint = templateComp.time + 10;// layer.inPoint + duration;

				var txt = captionText.sourceText.value;
				txt.resetCharStyle();
				// txt.resetParagraphStyle();
				txt.boxTextSize = [1280, 110];
				txt.text = 'Add Caption Text';
				txt.font = 'MyriadPro-Regular';
				txt.fontSize = 36;
				txt.fillColor = [1, 1, 1];
				txt.applyFill = true;
				txt.leading = 40;// line height
				txt.tracking = 50;// character width
				txt.justification = ParagraphJustification.CENTER_JUSTIFY;
				captionText.sourceText.setValue(txt);

				// layer marker
				var marker = new MarkerValue('Caption Text');
				marker.comment = 'Caption';
				marker.time = 0;//templateComp.time;
				marker.duration = 10;// ToDo: duration
				marker.label = labelColor;
				captionText.property('Marker').setValueAtTime(captionText.inPoint, marker);

				// make sure the Display Type is TIMECODE for exporting vtt
                var displayType = app.project.timeDisplayType;
				if (displayType === 2013) {
					app.project.timeDisplayType = 2012;// TIMECODE=2012, FRAMES=2013
				}

				// update dataList: ['#', 'Cue', 'Start', 'Caption']
                var frameRate = Math.round(templateComp.frameRate);// 29.97 = 30
				var time = templateComp.time;// current time
				var listItem = dataList.add('item', (1+cueItems.length));// display marker data
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
				cueObj.captionText = captionText;// TextLayer
				cueObj.marker = marker;

				cueItems.push(cueObj);
				app.project.timeDisplayType = displayType;// reset to original setting
				//alert('marker added:', JSON.stringify(cueObj));
			} else {
				alert('Template comp not found.');
				//alert('Create a composition named Template and try again.');
			}
		}

		function importCaptions(dataList) {
			// if (!templateComp || !captionComp) {
			// 	findTemplateComp();
			// }
			var text = '';
			var time = 0.1;// start time
			var factor = 0.38;// estimated
			var duration = factor;// word count * factor
			
			// Prompt user to select text file
			var myFile = File.openDialog("Please select a text file.");
			if (myFile) {
				//var fileOK = myFile.open("r");
				if (myFile.open("r")) {
					dataList.removeAll();
					cueItems = [];
					// make sure the Display Type is TIMECODE for exporting vtt
					var displayType = app.project.timeDisplayType;
					if (displayType === 2013) {
						app.project.timeDisplayType = 2012;// TIMECODE=2012, FRAMES=2013
					}
					if (!templateComp || !captionComp) {
						findTemplateComp();
					}
					// create undo group
					app.beginUndoGroup("Create Text Layers From File");
					// read text lines into array until end-of-file is reached
					// then create text layer for each
					while (!myFile.eof) {
						text = myFile.readln();
						if (text == "") {text = "BLANK\r";}
						try {
							// calc factor? templateComp.workAreaDuration / total lines?
							// calculate duration from text length?
							var count = text.split(' ');
							duration = Math.round(count.length * factor);

							captionText = captionComp.layers.addBoxText([1280, 120]);
							captionText.position.setValue([640, 660]);
							captionText.inPoint = time;// seconds
							captionText.outPoint = time + duration;

							var txt = captionText.sourceText.value;
							// txt.resetCharStyle();
							// txt.resetParagraphStyle();
							txt.boxTextSize = [1280, 110];
							txt.text = text;
							txt.font = 'MyriadPro-Regular';
							txt.fontSize = 36;
							txt.fillColor = [1, 1, 1];
							txt.applyFill = true;
							txt.leading = 40;// line height
							txt.tracking = 50;// character width
							txt.justification = ParagraphJustification.CENTER_JUSTIFY;
							captionText.sourceText.setValue(txt);

							// comp marker on Template timeline
							var marker = new MarkerValue('Caption Text');
							marker.comment = text;
							marker.time = time;
							marker.duration = duration;
							marker.label = labelColor;
							// templateComp.markerProperty.setValueAtTime(time, marker);
							// captionComp.markerProperty.setValueAtTime(time, marker);
							// captionText.property('Marker').setValueAtTime(captionText.inPoint, marker);
							captionLayer.property('Marker').setValueAtTime(captionText.inPoint, marker);

							// update dataList: ['#', 'Cue', 'Start', 'Caption']
							var listItem = dataList.add('item', (1+cueItems.length));// display marker data
							listItem.subItems[0].text = timeToCurrentFormat(time, frameRate);
							listItem.subItems[1].text = text;//curItem.markerProperty.keyValue(m).comment;// keyComment(m)?

							// data for export to vtt file id=comment, start=time, end=start+.05, text = settings
							var cueObj = {};// construct data for vtt file
							cueObj.id = cueItems.length;
							cueObj.start = timeToCurrentFormat(time, frameRate);
							cueObj.end = timeToCurrentFormat(time+duration, frameRate);// fixed duration
							cueObj.note = text;//compMarker.comment;//curItem.markerProperty.keyValue(m).comment;
							cueObj.time = time;// set templateComp.time when dataList.row is selected
							cueObj.compIndex = templateIndex;//templateComp.index for app.project.items(index)
							cueObj.captionText = captionText;// TextLayer
							cueObj.marker = marker;

							cueItems.push(cueObj);
							time = time+duration;// next inPoint
						} catch(err) {
							myFile.close();
							app.endUndoGroup();
							app.project.timeDisplayType = displayType;// reset to original setting
							alert('ERROR: '+err.toString());
							return;
						}
					}

					// close the file before exiting
					myFile.close();
					app.endUndoGroup();
					app.project.timeDisplayType = displayType;// reset to original setting
					// alert('cueItems: '+JSON.stringify(cueItems));
				} else {
					alert("File open failed!");
				}
			}
		}

		function findMarkers(dataList) {
			//if (!captionLayer) {
				findTemplateComp();// setup global vars
			//}
			if (!captionLayer) {
				captionLayer = templateComp.layer(1);
				//alert('problem: added captionLayer here');
			}
			if (templateComp) {
				//alert('getMarkers: '+dataList.items.length);
				//alert('comp frameRate '+Math.round(templateComp.frameRate)+' : '+templateComp.frameRate);
				// ToDo: if cueItems.length, stash and re-instate cueItem.settings
				dataList.removeAll();
				cueItems = [];
                // make sure the Display Type is TIMECODE for exporting vtt
                var displayType = app.project.timeDisplayType;
				if (displayType === 2013) {
					app.project.timeDisplayType = 2012;// TIMECODE=2012, FRAMES=2013
				}

				try {
				var count = captionComp.layers.length;// -solid layer
				var marks = captionLayer.property("Marker").numKeys;
				if (marks > 0) {
					for (var m = 1; m <= marks; m++) {
						var cueObj = {};// construct data for vtt file
						//var frameRate = Math.round(templateComp.frameRate);// 29.97 = 30
						//var marker = templateComp.markerProperty.keyValue(m);
						var marker = captionLayer.property("Marker").keyValue(m);
						var listItem = dataList.add('item', m);// display marker data
						listItem.subItems[1].text = marker.comment;// keyComment(m)?

						var time = captionLayer.property("Marker").keyTime(m);// NOT: .keyValue(m).time;
						var duration = captionLayer.property("Marker").keyValue(m).duration;
						if (time) {
							listItem.subItems[0].text = timeToCurrentFormat(time, frameRate);// start
							// data for export to vtt file id=#, start=time, end=duration, text=comment
							cueObj.id = cueItems.length;
							cueObj.start = timeToCurrentFormat(time, frameRate);
							cueObj.end = timeToCurrentFormat(time+duration, frameRate);
							cueObj.note = marker.comment;// caption text
							cueObj.time = time;// set templateComp.time when dataList.row is selected
							cueObj.compIndex = templateIndex;//templateComp.index for app.project.items(index)
							cueObj.captionText = captionComp.layers[count - m];// update TextLayer
							cueObj.marker = marker;
						} else { alert('if (time) is necessary!'); }

						cueItems.push(cueObj);// separate object to update
					}
                    app.project.timeDisplayType = displayType;// reset
				} else {
					alert('There are no markers on the Template comp timeline.');
				}

				} catch(err) { alert('findMarkers ERROR: '+err.toString()); }
			}
		}

		function isSecurityPrefSet() {
			try {
				var securitySetting = app.preferences.getPrefAsLong("Main Pref Section", "Pref_SCRIPTING_FILE_NETWORK_SECURITY");
				return (securitySetting === 1);
			} catch(err){
				alert("Error in isSecurityPrefSet function \n" + err.toString());
			}
		}
		/**
		 * gather data from adjusted captionLayer markers
		 * convert markers to webVTT cue data
		 * Export .vtt file in the project folder
		 * Adapted to create a captions file
		 */
		function saveVttFile() {
			if (!(isSecurityPrefSet())) {
				alert("This script requires access to write files.\n" +
						"Go to the application preferences and enable.\n" +
						"\"Allow Scripts to Write Files and Access Network\"");
				return;
			}
			if (cueItems.length === 0) {
				alert("There are no markers to export!");
				return;
			}

			// findMarkers();
			var count = cueItems.length;
			// 1000 milliseconds divided by 29.97 fps = 33.3667
			var msFPS = 1000/templateComp.frameRate;
			var theFile = File.saveDialog("Save the file.", "*.vtt", "TEXT vtt");

			// if user didn't cancel and there are markers
			if (theFile != null && count > 0) {
				theFile.open("w", "TEXT", "????");
				theFile.encoding = "UTF-8";

				if (app.project.file) {
					theFile.write("WEBVTT ");
					theFile.write("interactive cues for " + app.project.file.name + "\r\n");
				} else {
					theFile.write("WEBVTT \r\n");
				}

				theFile.write("kind: metadata" + "\r\n\n\n");

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
					var cueStart = timeCodeIn + "." + milliseconds;

					var str_out = cueItems[x].end;
					var timeCodeOut = str_out.slice(0, 8);
					timeCodeSeconds = str_out.slice(9, 11);
					milliseconds = timeCodeSeconds * msFPS;
					var cueEnd = timeCodeOut + "." + milliseconds;
					var cueText = cueItems[x].note;//JSON.stringify(cueItems[x].note);

					// write the results to the file
					// if (cueItems[x].note !== "") {
					// 	//cueItems[x].note.replace('\n', ' ');// don't allow 2 new lines
					// 	theFile.write('Note: '+cueItems[x].note+"\r\n\n");
					// }
					theFile.write(cueItems[x].id);// cue.type
					theFile.write("\r\n");
					theFile.write(cueStart);
					theFile.write(" --> ");
					theFile.write(cueEnd);
					theFile.write("\r\n");
					theFile.write(cueText);// cue.text
					theFile.write("\r\n\n");
				}

				theFile.close();// close the text file
				alert('VTT file completed.');
			}
		}// end saveVTT
        // ToDo: import vtt captions?

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
