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
		var captionCompIndex;// set by findTemplate
		var hasCaptions = false;// true if captionComp was added to TemplateComp
		var captionText;// add markers to captionText, comment & text = caption text
		// selected item and index of the clicked ListBox row for editing
		var selectedItem = null;
		var selectedIndex = null;
		//var markerArray = [];// array of marker objects for listBox
		var cueItems = [];// array of cue objects
		var peach = 6;// set marker color if not set already

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

		var dataPanel = myPanel.add('panel', [0, 0, 350, 160], 'Caption Markers: select a row to edit caption');
		dataPanel.orientation = 'column';

		var dataList = dataPanel.add('ListBox', [0, 0, 340, 140], 'data', {
			multiselect: false,
			numberOfColumns: 4, showHeaders: true,
			columnTitles: ['#', 'Cue', 'Start', 'Caption']
		});
		dataList.onChange = function () {
			if (dataList.selection != null) {
				selectedIndex = dataList.selection.index;
				selectedItem = dataList.selection;

				propsPanel.enabled = true;
				noteText.text = cueItems[selectedIndex].note;
                templateComp.time = cueItems[selectedIndex].start;

				// try {
				// 	var markText = dataList.selection.subItems[1].text.toLowerCase();
				// 	markText = markText.charAt(0).toUpperCase() + markText.slice(1);

				// 	// set the dropdown to the selected marker type
				// 	for (var i=0; i<typeList.length; i++) {
				// 		if (typeList[i] === markText) {
				// 			typeDD.selection = i;
				// 		}
				// 	}
				// 	//dataList.selection.subItems[1].text = markText;
				// } catch(err) { alert('ERROR: '+err.toString()); }

				//alert('set boxes: '+selectedIndex+' : '+ JSON.stringify(cueSettings));
			}
		};

		var propsPanel = myPanel.add("panel", undefined, undefined, {name: "propsPanel"});
		propsPanel.text = "Caption Properties";
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
		noteGroup.add( "statictext", undefined, "Caption:");
		var noteText = noteGroup.add( "edittext", undefined, "", {
            multiline: true, scrolling: true, wantReturn: true
        });
		noteText.size = [250, 55];// 3 rows
		noteText.onChanging = function () {
			cueItems[selectedIndex].note = this.text;
            selectedItem.subItems[2].text = this.text;
            refreshListBox();
		}

		var buttonPanel = myPanel.add('panel', undefined, 'Actions:');
		buttonPanel.orientation = 'row';

		// Add Caption comp to templateComp?
		var addCaptionsBtn = buttonPanel.add('button', undefined, 'Add Captions');
		addCaptionsBtn.helpTip = 'Add Text and Shape layers to Template comp.';
		addCaptionsBtn.onClick = function () {
			addCaptionComp(dataList);
		}

		var addMarkerBtn = buttonPanel.add('button', undefined, 'Add Marker');
		addMarkerBtn.helpTip = 'Add a new marker to Template comp.';
		addMarkerBtn.onClick = function () {
			addMarker(dataList);
		}

		var findMarkersBtn = buttonPanel.add('button', undefined, 'Find Markers');
		findMarkersBtn.helpTip = 'Check for markers on the Template comp.';
		findMarkersBtn.onClick = function() {
			getTemplateMarkers(dataList);// pass in dataList
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
						curItem.openInViewer();// make sure it is open to see markers
						
						alert('Template layers: '+templateComp.numLayers+' : '+JSON.stringify(templateComp.layers));
						//alert("name of last layer is " + templateComp.layer(templateComp.numLayers).name);
						for (var x=0; x<templateComp.numLayers; x++) {
							if (templateComp.layers[x].name === '[Captions]') {
								hasCaptions = true;
							}
						}
					}
					if (curItem.name === 'Captions') {
						captionComp = curItem;// for addMarker button
						captionCompIndex = i;
						// alert('captionComp is in: '+)
						// app.project.item(index).layer(index).containingComp
					}
				}
			}
			// if Template has a layer named Captions, set a flag?
			// if there is a comp named Captions but not a layer of Template, add it
		}

		// add Caption Text] to templateComp? can the shape and text layers be linked together? 
		// only once. in its own comp? that can be hidden or deleted
		// https://ae-scripting.docsforadobe.dev/items/compitem/
		// add captionComp to templateComp, add markers to captionComp Text layer?
		// https://ae-scripting.docsforadobe.dev/other/markervalue/#markervalue
		// https://ae-scripting.docsforadobe.dev/layers/layercollection/
		// https://ae-scripting.docsforadobe.dev/layers/layercollection/#layercollection-addsolid
		// https://github.com/NTProductions/lyric-music-video-generator-script/blob/main/Lyric%20Music%20Video%20Generator.jsx
		/**
		 * create captionComp once, add it to templateComp once
		 * add markers to captionComp
		 */
		function addCaptionComp(dataList) {
			// if !captionComp, create it then add it to Template.layer(1)
			findTemplateComp();
			if (!captionComp && !hasCaptions) {
				app.beginUndoGroup("Add caption comp");
				captionComp = app.project.items.addComp("Captions", 1920, 720, 1.0, 5, 29.97);
				var solidLayer = captionComp.layers.addSolid([0, 0, 0], "darkbkg", 1920, 120, 1.0);
				//									addSolid([0, 0, 0, .8] ???
				// https://ae-scripting.docsforadobe.dev/properties/property/
				solidLayer.opacity.setValue(80);
				solidLayer.position.setValue([0, 680.0, 0.0]);
				// add markers to captionText layer
				captionText = captionComp.layers.addBoxText([1920, 120]);
				captionText.position.setValue([0, 680.0, 0.0]);
				// captionComp.layers.addNull();// layer for markers?
				
				// try {} catch(err) { alert('ERROR: '+err.toString()); }
				// if templateComp does not contain captionComp, add it now
				for (var i=0; i<templateComp.​numLayers; i++) {
					if (templateComp.layers[i].name === '[Captions]') {
						hasCaptions = true;
						templateComp.layers[i].enabled = true;
						alert('Captions Found');
					}
				}
				if (!hasCaptions) {
					hasCaptions = true;
					templateComp.layers.add(captionComp);
					//alert('Captions Added: '+templateComp.​numLayers);
					alert("last layer name: " + templateComp.layer(templateComp.numLayers).name);
					templateComp.layer(templateComp.numLayers).moveToBeginning();
				}

				alert('Template layers: '+templateComp.numLayers+' : '+JSON.stringify(templateComp.layers));
				app.endUndoGroup();
			}
		}

		function addMarker(dataList) {
			if (!templateComp) {
				findTemplateComp();
			}
			if (templateComp) {
				var compMarker = new MarkerValue('Caption Text');
				// Todo: set marker comment to selected type
				compMarker.comment = typeList[typeDD.selection];//'Custom';
				compMarker.time = templateComp.time;
				compMarker.duration = 1;// ToDo: duration
				compMarker.label = peach;// 6
				// add markers to captionComp Text layer (captionText)
				// add newBoxText? layer index = 1+selectedIndex?
				// captionText = captionComp.layers.addBoxText([1920, 120]);
				// captionText.position.setValue([0, 680.0, 0.0]);
				captionText.property('Marker').setValueAtTime(templateComp.time, compMarker);
				captionText.text = 'Add Caption Text';
				captionText.duration.setValue(compMarker.duration);
				//templateComp.markerProperty.setValueAtTime(templateComp.time, compMarker);

				// make sure the Display Type is TIMECODE for exporting vtt
                var displayType = app.project.timeDisplayType;
				if (displayType === 2013) {
					app.project.timeDisplayType = 2012;// TIMECODE=2012, FRAMES=2013
				}

				// update dataList: ['#', 'Cue', 'Start', 'Caption']
                var frameRate = Math.round(templateComp.frameRate);// 29.97 = 30
				var time = templateComp.time;// current time
				var listItem = dataList.add('item', (1+cueItems.length));// display marker data
				listItem.subItems[0].text = 'cue';
				listItem.subItems[1].text = timeToCurrentFormat(time, frameRate);
				listItem.subItems[2].text = compMarker.comment;//curItem.markerProperty.keyValue(m).comment;// keyComment(m)?
				//listItem.subItems[3].text = templateComp.name;// Template - not used in vtt
				//listItem.subItems[4].text = timeToCurrentFormat(time + 0.05, frameRate);// duration
				// data for export to vtt file id=comment, start=time, end=start+.05, text = settings
				var cueObj = {};// construct data for vtt file
				cueObj.id = cueItems.length;
				cueObj.start = timeToCurrentFormat(time, frameRate);
				cueObj.end = timeToCurrentFormat(time + compMarker.duration, frameRate);// fixed duration
				cueObj.compIndex = templateIndex;//templateComp.index for app.project.items(index)
				cueObj.note = "";//compMarker.comment;//curItem.markerProperty.keyValue(m).comment;

				cueItems.push(cueObj);
				app.project.timeDisplayType = displayType;// reset to original setting
				//alert('marker added:', JSON.stringify(cueObj));
			} else {
				alert('Template comp not found.');
				//alert('Create a composition named Template and try again.');
			}
		}

		function getTemplateMarkers(dataList) {
			if (!templateComp) {
				findTemplateComp();
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

				var marks = templateComp.markerProperty.numKeys;
				if (marks > 0) {
					for (var m = 1; m <= marks; m++) {
						var cueObj = {};// construct data for vtt file
						var frameRate = Math.round(templateComp.frameRate);// 29.97 = 30
						var marker = templateComp.markerProperty.keyValue(m);
						var listItem = dataList.add('item', m);// display marker data
						listItem.subItems[0].text = 'cue';
						listItem.subItems[2].text = marker.comment;// keyComment(m)?

						// if color is not set, set marker color to peach
						if (marker.label === 0) {
							marker.label = peach;// builder may have set a different color
							templateComp.markerProperty.setValueAtKey(m, marker);
						} else {
							peach = marker.label;// use the prefered color
						}

						var time = templateComp.markerProperty.keyTime(m);// NOT: .keyValue(m).time;
						var duration = templateComp.markerProperty.keyValue(m).duration;
						if (time) {
							listItem.subItems[1].text = timeToCurrentFormat(time, frameRate);// start
							// data for export to vtt file id=#, start=time, end=duration, text=comment
							cueObj.id = cueItems.length;
							cueObj.start = timeToCurrentFormat(time, frameRate);
                            // ToDo: if duration = 0, determine marker duration by text length?
							cueObj.end = timeToCurrentFormat(time+duration, frameRate);
							cueObj.compIndex = templateIndex;//templateComp.index for app.project.items(index)
							cueObj.note = marker.comment;// caption text
						}

						cueItems.push(cueObj);// separate object to update
					}
                    app.project.timeDisplayType = displayType;// reset
				} else {
					alert('There are no markers on the Template comp timeline.');
				}
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
