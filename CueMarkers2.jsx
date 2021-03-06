(function(thisObj) {
	//https://www.goodboy.ninja/snippets/dockable-scriptui-panel-template
	// Any code you write here will execute before the panel is built.
	/*
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
		// selected item and index of the clicked ListBox row for editing
		var selectedItem = null;
		var listItemId = null;
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

		var dataPanel = myPanel.add('panel', [0, 0, 350, 160], 'Interactive Cue Markers: select a row to edit marker');
		dataPanel.orientation = 'column';

		var dataList = dataPanel.add('ListBox', [0, 0, 340, 140], 'data', {
			multiselect: false,
			numberOfColumns: 6, showHeaders: true,
			columnTitles: ['#', 'Cue', 'Type', 'Comp Name', 'Start', 'Duration']
		});// ToDo: nix Cue & CompName columns?
		dataList.onChange = function () {
			if (dataList.selection != null) {
				listItemId = dataList.selection.index;
				selectedItem = dataList.selection;// this.selection?

				propsPanel.enabled = true;
				noteText.text = cueItems[listItemId].note;

				try {
					var markText = dataList.selection.subItems[1].text.toLowerCase();
					markText = markText.charAt(0).toUpperCase() + markText.slice(1);

					// set the dropdown to the selected marker type
					for (var i=0; i<typeList.length; i++) {
						if (typeList[i] === markText) {
							typeDD.selection = i;
						}
					}
					//dataList.selection.subItems[1].text = markText;
				} catch(err) { alert('ERROR: '+err.toString()); }

				// set checkboxes for selected cue/marker item
				var cueSettings = cueItems[listItemId].settings;// obj
				var bx1 = props1.children;// array of checkboxes 3/group
				var bx2 = props2.children;// 3
				try {
					for (var option in cueSettings) {
						for (i=0; i<bx1.length; i++) {
							//alert('prop: '+option+' props1: '+bx1[i].name+' & props2: '+bx2[i].name);
							if (bx1[i].name === option) {
								bx1[i].value = cueSettings[option];
								//alert('prop: '+option+' props1: '+bx1[i].name+' val: '+bx1[i].value);
							}
							if (bx2[i].name === option) {
								bx2[i].value = cueSettings[option];
								//alert('prop: '+option+' props2: '+bx2[i].name+' val: '+bx2[i].value);
							}
						}
					}
				} catch (e) {
					alert('Error: '+e.toString());
				}
				//alert('props2: '+props2.length);// props2 undefined
				//alert('set boxes: '+listItemId+' : '+ JSON.stringify(cueSettings));
			}
		};

		var propsPanel = myPanel.add("panel", undefined, undefined, {name: "propsPanel"});
		propsPanel.text = "Cue Properties";
		//propsPanel.preferredSize.width = 350;
		propsPanel.orientation = "column";
		propsPanel.alignChildren = ["left","top"];
		propsPanel.spacing = 10;
		propsPanel.margins = 10;
		propsPanel.enabled = false;// until a list item is selected
		var propsPanelRow = propsPanel.add("group", undefined, {name: "propsRow1"});
		propsPanelRow.orientation = "row";

		// https://extendscript.docsforadobe.dev/user-interface-tools/common-properties.html?highlight=group#common-properties
		var tools = propsPanelRow.add("group", undefined, {name: "tools", characters: 12});// total 19
		tools.orientation = "column";
		tools.alignChildren = ["left","center"];
		tools.spacing = 10;
		tools.margins = 10;

		var typeList = ['Custom', 'Title', 'Message', 'Question', 'Image'];
		var typeDD = tools.add('dropdownlist', undefined, typeList);
		typeDD.helpTip = "Select the type of interaction for this marker";
		typeDD.selection = 0;
		typeDD.onChange = function() {
			//alert(typeDD.selection.index +':'+ typeDD.selection.text+' :: '+listItemId);
			// set the dataList item to the selected marker type
			selectedItem.subItems[1].text = typeDD.selection.text;
			// resize list to update the list item ToDo: still needed?
			// var wh = dataList.size;
			// dataList.size = [1+wh[0], 1+wh[1]];
			// dataList.size = [wh[0], wh[1]];
			// update the actual Marker.comment
			try {
				var marker = app.project.items[cueItems[listItemId].compIndex].markerProperty.keyValue(listItemId+1);
				marker.comment =  typeDD.selection.text;
				app.project.items[cueItems[listItemId].compIndex].markerProperty.setValueAtKey(listItemId+1, marker);
			} catch (err) { alert('Error: '+err.toString()); }
		};
		// instructions for Type dropdown
		var ddInstruct = tools.add('staticText', undefined, undefined, {name: "instruct", multiline: true, characters: 12, justify: "center", scrolling: false});
		ddInstruct.text = 'Type of Interaction';

		// PROPS1 Group
		var props1 = propsPanelRow.add("group", undefined, {name: "props1"});
		props1.orientation = "column";
		props1.alignChildren = ["left","center"];
		props1.spacing = 10;
		props1.margins = 0;

		var checkbox1 = props1.add("checkbox", undefined, undefined, {name: "useBlur"});// name: undefined
		checkbox1.name = "useBlur";// so set it here
		checkbox1.text = "useBlur";
		checkbox1.helpTip = "Blur the video during interaction";
		checkbox1.onClick = function() {
			cueItems[listItemId].settings.useBlur = this.value;
			//alert('settings: '+listItemId+' : '+this.value+' : '+JSON.stringify(cueItems[listItemId].settings));
		};

		var checkbox2 = props1.add("checkbox", undefined, undefined, {name: "animateIn"});
		checkbox2.name = "animateIn";
		checkbox2.text = "animateIn";
		checkbox2.helpTip = "Animate interactive element onto screen";
		checkbox2.onClick = function() {
			cueItems[listItemId].settings.animateIn = this.value;
		};

		var checkbox3 = props1.add("checkbox", undefined, undefined, {name: "pauseVideo"});
		checkbox3.name = "pauseVideo";
		checkbox3.text = "pauseVideo";
		checkbox3.helpTip = "Pause video during interaction";
		checkbox3.onClick = function() {
			cueItems[listItemId].settings.pauseVideo = this.value;
		};

		// PROPS2 Group
		var props2 = propsPanelRow.add("group", undefined, {name: "props2"});
		props2.orientation = "column";
		props2.alignChildren = ["left","center"];
		props2.spacing = 10;
		props2.margins = 0;

		var checkbox4 = props2.add("checkbox", undefined, undefined, {name: "useOverlay"});
		checkbox4.name = "useOverlay";
		checkbox4.text = "useOverlay";
		checkbox4.helpTip = "Show a colored overlay behind the interactive element.";
		checkbox4.onClick = function() {
			cueItems[listItemId].settings.useOverlay = this.value;
		};

		var checkbox5 = props2.add("checkbox", undefined, undefined, {name: "animateOut"});
		checkbox5.name = "animateOut";
		checkbox5.text = "animateOut";
		checkbox5.helpTip = "Animate interactive element off screen";
		checkbox5.onClick = function() {
			cueItems[listItemId].settings.animateOut = this.value;
		};

		var checkbox6 = props2.add("checkbox", undefined, undefined, {name: "resumeVideo"});
		checkbox6.name = "resumeVideo";
		checkbox6.text = "resumeVideo";
		checkbox6.helpTip = "Resume video playback after interaction";
		checkbox6.onClick = function() {
			cueItems[listItemId].settings.resumeVideo = this.value;
		};

		var noteGroup = propsPanel.add("group", undefined, {name: "cueNotes"});
		noteGroup.orientation = 'row';
		noteGroup.add( "statictext", undefined, "Cue Notes:");
		var noteText = noteGroup.add( "edittext", undefined, "", {multiline: true});// , scrollable: true
		noteText.size = [250, 20];// 250 wide & 2 rows?
		noteText.onChanging = function () {
			cueItems[listItemId].note = this.text;
		}

		var buttonPanel = myPanel.add('panel', undefined, 'Actions:');
		buttonPanel.orientation = 'row';

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
		exportBtn.helpTip = 'Save the Interactive Cue Data to a vtt file.';
		//exportBtn.enabled = false;
		exportBtn.onClick = function() {
			saveVttFile();
		};
		// close btn? HELP btn? instructions

		//functions
		function findTemplateComp() {
			for (var i = 1; i <= app.project.items.length; i++) {
				var curItem = app.project.items[i];
				// check if this item is a composition
				if (curItem instanceof CompItem) {
					// only use markers on the Template composition
					if (curItem.name === 'Template') {
						templateComp = curItem;// for addMarker button
						templateIndex = i;
						//curItem.openInViewer();// make sure it is open to see markers
					}
				}
			}
		}

		function addMarker(dataList) {
			if (!templateComp) {
				findTemplateComp();
			}
			if (templateComp) {
				var compMarker = new MarkerValue('Custom');
				// Todo: set marker comment to selected type
				compMarker.comment = typeList[typeDD.selection];//'Custom';
				compMarker.time = templateComp.time;
				compMarker.duration = 0;//0.5;
				compMarker.label = peach;// 6
				templateComp.markerProperty.setValueAtTime(templateComp.time, compMarker);

				// make sure the Display Type is TIMECODE for exporting vtt
				if (app.project.timeDisplayType === 2013) {
					app.project.timeDisplayType = 2012;// TIMECODE=2012, FRAMES=2013
				}

				// update dataList
				var listItem = dataList.add('item', (1+cueItems.length));// display marker data
				listItem.subItems[0].text = 'cue';
				listItem.subItems[1].text = compMarker.comment;//curItem.markerProperty.keyValue(m).comment;// keyComment(m)?
				listItem.subItems[2].text = templateComp.name;// Template - not used in vtt

				var frameRate = Math.round(templateComp.frameRate);// 29.97 = 30
				var time = templateComp.time;// current time

				listItem.subItems[3].text = timeToCurrentFormat(time, frameRate);
				listItem.subItems[4].text = timeToCurrentFormat(time + 0.05, frameRate);
				// data for export to vtt file id=comment, start=time, end=start+.05, text = settings
				var cueObj = {};// construct data for vtt file
				cueObj.id = compMarker.comment;//curItem.markerProperty.keyValue(m).comment;
				cueObj.start = timeToCurrentFormat(time, frameRate);
				cueObj.end = timeToCurrentFormat(time + 0.05, frameRate);
				cueObj.compIndex = templateIndex;//templateComp.index for app.project.items(index)
				cueObj.note = "";
				cueObj.settings = {
					useBlur: false,// blur while viewing interaction
					useOverlay: true,// overlay gradient color
					animateIn: true,// animate onto then off of screen
					animateOut: true,
					pauseVideo: true,// during interaction
					resumeVideo: true,// continue playing same video
				}

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
				var marks = templateComp.markerProperty.numKeys;
				if (marks > 0) {
					for (var m = 1; m <= marks; m++) {
						var cueObj = {};// construct data for vtt file
						var frameRate = Math.round(templateComp.frameRate);// 29.97 = 30
						var marker = templateComp.markerProperty.keyValue(m);
						var listItem = dataList.add('item', m);// display marker data
						listItem.subItems[0].text = 'cue';
						listItem.subItems[1].text = marker.comment;// keyComment(m)?
						listItem.subItems[2].text = templateComp.name;// Template - not used in vtt
						// if color is not set, set marker color to peach
						if (marker.label === 0) {
							marker.label = peach;// builder may have set a different color
							templateComp.markerProperty.setValueAtKey(m, marker);
						} else {
							peach = marker.label;// use the prefered color
						}

						var time = templateComp.markerProperty.keyTime(m);// NOT: .keyValue(m).time;
						if (time) {
							listItem.subItems[3].text = timeToCurrentFormat(time, frameRate);
							// data for export to vtt file id=comment, start=time, end=start+.05, text = settings
							cueObj.id = marker.comment;// type of interaction
							cueObj.start = timeToCurrentFormat(time, frameRate);
							cueObj.end = timeToCurrentFormat(time + 0.05, frameRate);
							cueObj.compIndex = templateIndex;//templateComp.index for app.project.items(index)
							cueObj.note = "";
							cueObj.settings = {
								useBlur: false,// blur while viewing interaction
								useOverlay: true,// overlay gradient color
								animateIn: true,// animate onto then off of screen
								animateOut: true,
								pauseVideo: true,// during interaction
								resumeVideo: true,// continue playing same video
							}
						}

						var duration = templateComp.markerProperty.keyValue(m).duration;
						if (duration) {
							listItem.subItems[4].text = timeToCurrentFormat(duration, frameRate);
						}
						// duration set manually? or from marker.end;
						// separate object to update
						cueItems.push(cueObj);
					}
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
		 * could be adapted to create a captions file
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
			var theFile = File.saveDialog("Save the cue file.", "*.vtt", "TEXT vtt");

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
				 * for each cue marker
				 * split the inPoint, convert last 2 characters (frames) to milliseconds, then join it again with decimal
				 * do the same for the outPoint
				 * stringify the cue.text object
				 */
				for (var x = 0; x < count; x++) {
					var str_in = cueItems[x].start;
					var timeCodeIn = str_in.slice(0, 8);
					var timeCodeSeconds = str_in.slice(9, 11);
					// 1000 milliseconds divided by 29.97 fps = 33.3667
					var milliseconds = timeCodeSeconds * msFPS;//33;
					var cueStart = timeCodeIn + "." + milliseconds;

					var str_out = cueItems[x].end;
					var timeCodeOut = str_out.slice(0, 8);
					timeCodeSeconds = str_out.slice(9, 11);
					milliseconds = timeCodeSeconds * msFPS;//33;
					var cueEnd = timeCodeOut + "." + milliseconds;
					var cueText = JSON.stringify(cueItems[x].settings);

					// write the results to the file
					if (cueItems[x].note !== "") {
						//cueItems[x].note.replace('\n', ' ');// don't allow 2 new lines
						theFile.write('Note: '+cueItems[x].note+"\r\n\n");
					}
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
