{
    function myScript(thisObj) {
       function myScript_buildUI(thisObj) {

          var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Cue Markers", undefined, {resizeable:true, closeButton: false});
 
          res = "group{orientation:'column', alignment:['fill','fill'], alignChildren:['fill','top'],\
                    groupOne: Group{orientation:'row', alignment:['center','top'],\
                        createCompButton: Button{text:'Create Comp'},\
                        deleteCompButton: Button{text:'Delete Comp'},\
                        closeButton: Button{text:'Close'},\
                    }\
                },\
                groupTwo: Panel{orientation:'row', alignment:['center','top'],\
                    list: ListBox{undefined, 'data', {multiselect: false, numberOfColumns: 6, showHeaders: true,\
                    columnTitles: ['#', 'Cue', 'Type', 'Comp Name', 'Start', 'Duration']}\
                    },\
                },\
                editPanel: Panel{orientation:'row', alignment:['center','top'],\
                    typeDD: DropDownList{undefined, typeList},\
                    useBlur: Checkbox{text:'useBlur', name:'useBlur'},\
                    useOverlay: Checkbox{text:'useOverlay', name:'useOverlay'},\
                    animateIn: Checkbox{text:'animateIn', name:'animateIn'},\
                    animateOut: Checkbox{text:'animateOut', name:'animateOut'},\
                    pauseVideo: Checkbox{text:'pauseVideo', name:'pauseVideo'},\
                    resumePlayback: Checkbox{text:'resumeVideo', name:'resumePlayback'},\
                },\
                groupThree: Group{orientation:'row', alignment:['center','top'],\
                    addMarkerButton: Button{text:'Add Marker'},\
                    refreshButton: Button{text:'Refresh List'},\
                    exportButton: Button{text:'Export VTT File'},\
                    closeButton: Button{text:'Close'},\
                },\
          }";
 
          myPanel.grp = myPanel.add(res);

            /**
                https://fendrafx.com/tutorial/free-function-friday-complete-series/
                https://fendrafx.com/utility/fast-marker-creator-after-effects-script/

                https://extendscript.docsforadobe.dev/user-interface-tools/

                Use Template comp to add markers which get converted to a vtt file for interactive video
            */
            // CueMarkers variables:
            var templateComp;// set at getMarkers Should be Template?
            var typeList = ['Title', 'Message', 'Question', 'Custom'];// DropDownList
            var markerItems = [];// cue objects
            var listItemId;// grid row index
            var selectedItem;
            // initial interactive element settings for Vue
            var defaultSettings = {
                useBlur: false,// blur while viewing interaction
                useOverlay: true,// color gradient
                animateIn: true,// animates onto then off of screen
                animateOut: true,
                //animateTo: '35%',// eventually, w/slider?
                pauseVideo: true,// during interaction
                resumePlayback: true,// continue playing same video
            };

            // CueMarkers listeners:
            myPanel.grp.groupThree.addMarkerButton.onClick = function () {
                addMarker();
            }
            myPanel.grp.groupThree.refreshButton.onClick = function () {
                getMarkers();
            }
            myPanel.grp.groupThree.exportButton.onClick = function () {
                saveVttFile();
            }

            myPanel.grp.groupTwo.list.onChange = function () {
                if (list.selection != null) {
                    listItemId = myPanel.grp.groupTwo.list.selection.index;// this.target.selection.index?
                    selectedItem = myPanel.grp.groupTwo.list.selection;
                    // app.project.item(compId).openInViewer();
                    //editPanel.enabled = true;
                    var markText = myPanel.grp.groupTwo.list.selection.subItems[1].text.toLowerCase();
                        markText = markText.charAt(0).toUpperCase() + markText.slice(1);

                    // type DropDownList
                    var type = typeList.indexOf(markText);
                    if (type > -1) {
                        myPanel.grp.editPanel.typeDD.selection = type;
                        list.selection.subItems[1].text = markText;
                    }
                    // set checkboxes for selected item
                    var cueSettings = markerItems[listItemId].settings;// obj
                    var boxes = myPanel.grp.editPanel.children;// array of checkboxes
                    for (option in cueSettings) {
                        for (var i=0; i<boxes.length; i++) {
                            if (boxes[i].name === option) {
                                //alert('option: '+boxes[i].name);// ok
                                //boxes[i].value = false;// ok
                                boxes[i].value = cueSettings[option];
                            }
                        }
                    }
                    alert('set boxes: '+listItemId+' : '+ JSON.stringify(cueSettings));// ?
                }
            }

            myPanel.grp.editPanel.typeDD.onChange = function() {
                //alert(typeDD.selection.index +':'+ typeDD.selection.text+' :: '+listItemId);
                selectedItem.subItems[1].text = myPanel.grp.editPanel.typeDD.selection.text;
                // resize list to update the list item
                var wh = list.size;// TODO: test if refresh is still needed?
                list.size = [1+wh[0], 1+wh[1]];
                list.size = [wh[0], wh[1]];
                // update the actual Marker.comment
                try {
                    if (!templateComp) { return; }
                    var marker = templateComp.markerProperty.keyValue(listItemId+1);
                    //var marker = app.project.items[markerItems[listItemId].compIndex].markerProperty.keyValue(listItemId+1);
                    marker.comment =  myPanel.grp.editPanel.typeDD.selection.text;
                    templateComp.markerProperty.setValueAtKey(listItemId+1, marker);
                    //app.project.items[markerItems[listItemId].compIndex].markerProperty.setValueAtKey(listItemId+1, marker);
                } catch (err) { alert('Error: '+err.toString()); }
            };
            // checkboxes onClick
            var boxes = myPanel.grp.editPanel.children;// array of checkboxes
            for (var b=0; b<boxes.length; b++) {
                boxes[b].onClick = function() {
                    //alert('ck changed: '+this.name+' val: '+this.value);// the one changed
                    // update the data for each change, re stringify cue.text at export vtt file
                    //alert('settings: '+listItemId+' : '+JSON.stringify(markerItems[listItemId].settings));
                    if (templateComp && listItemId) {
                        markerItems[listItemId].settings[this.name] = this.value;
                    }
                };
            }
            /*
                var editGroup = editPanel.add('group', undefined, 'editGroup');
                //editGroup.orientation = 'row';
                //editGroup.alignChildren = 'left';
                // column? and layout differently
                var boxes = myPanel.grp.editPanel.children;// array of checkboxes
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
            */
          
            // CueMarkers functions:
            function addMarker() {
                var compMarker = new MarkerValue('Custom');
                compMarker.comment = 'Custom';
                compMarker.time = templateComp.time;
                compMarker.duration = 0.5;
                /*
                    Other attributes: .chapter, .comment, .cuePointName, .duration, .eventCuePoint, .frameTarget, .length, .name, .url
                */
                if (templateComp) {
                    templateComp.markerProperty.setValueAtTime(templateComp.time, compMarker);
                } else {
                    alert('Click Refresh List first.');
                }
            }

            function getMarkers() {
                markerItems = [];// refresh
                var peach = 6;// set marker color if not set already
                var displayType = app.project.timeDisplayType;
                // make sure the Display Type is TIMECODE for exporting vtt
                if (app.project.timeDisplayType === 2013) {
                    app.project.timeDisplayType = 2012;// TIMECODE=2012, FRAMES=2013
                }

                for (var i=1; i<=allItems.length; i++) {
                    var curItem = allItems[i];
                    // check if this item is a composition
                    if (curItem instanceof CompItem) {
                        // var listItem = myPanel.grp.groupTwo.add('item', -);
                        // if (curItem.selected) {
                        // 	listItem.subItems[1].text = 'selected';// nope
                        // }
                        // listItem.subItems[2].text = curItem.name;// got 3 comp names

                        // only use markers on the Template comp?
                        if (curItem.name !== 'Template') { continue; }
                        try {
                            // assume builders placed comp markers, else warn user to do so first
                            templateComp = curItem;// for addMarker button
                            var marks = curItem.markerProperty.numKeys;
                            if (marks > 0) {
                                for (var m=1; m<=marks; m++) {
                                    var cueObj = {};// construct data for vtt file
                                    var frameRate = curItem.frameRate;
                                    var marker = curItem.markerProperty.keyValue(m);
                                    var listItem =  myPanel.grp.groupTwo.list.add('item', m);// display marker data
                                    //var listItem = list.add('item', m);// display markers to user
                                    listItem.subItems[0].text = 'cue';
                                    listItem.subItems[1].text = marker.comment;//curItem.markerProperty.keyValue(m).comment;// keyComment(m)?
                                    listItem.subItems[2].text = curItem.name;// Template - not used in vtt
                                    // if color is not set, set marker color to peach
                                    if (marker.label === 0) {
                                        marker.label = peach;// builder may have set a different color
                                        curItem.markerProperty.setValueAtKey(m, marker);
                                    }

                                    var time = curItem.markerProperty.keyTime(m);// NOT: .keyValue(m).time;
                                    if (time) {
                                        listItem.subItems[3].text = timeToCurrentFormat(time, 30);// curItem.frameRate
                                        // data for export to vtt file id=comment, start=time, end=start+.05, text = settings
                                        cueObj.id = marker.comment;//curItem.markerProperty.keyValue(m).comment;
                                        cueObj.start = timeToCurrentFormat(time, 30);// frameRate
                                        cueObj.end = timeToCurrentFormat(time+0.05, 30);// frameRate
                                        cueObj.text = JSON.stringify(defaultSettings);
                                        cueObj.compIndex = i;// for app.project.items(index)
                                        cueObj.settings = {
                                            useBlur: false,// blur while viewing interaction
                                            useOverlay: true,// overlay gradient color
                                            animateIn: true,// animate onto then off of screen
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
                app.project.timeDisplayType = displayType;// always reset to original setting
            }

            /**
            * convert markers to cue data
            * Export .vtt file in the project folder
            */
            function saveVttFile() {
                var count = markerItems.length;
                var theFile = File.saveDialog("Save the cue file.", "*.vtt", "TEXT vtt");

                // if user didn't cancel and there are markers
                if (theFile != null && count > 0) {
                    // open file for "w"riting,
                    theFile.open("w","TEXT","????");
                    theFile.write("WEBVTT ");
                    theFile.write("interactive cues for "+app.project.file.name+"\r\n");
                    theFile.write("kind: metadata"+"\r\n\n\n");

                    // for all the selected Layers
                    for (var x=0; x<count; x++) {
                        /* split the value of the inPoint, convert last 2 characters (frames) to milliseconds, then join it again with decimal */
                        var str_in = markerItems[x].start;
                        var timeCodeIn = str_in.slice(0,8);
                        var timeCodeSeconds = str_in.slice(9,11);
                        // 1000 milliseconds divided by 25 fps = 40 // 1000/30 fps = 33.333 
                        var milliseconds = timeCodeSeconds*33;
                        var cueStart = timeCodeIn +"." + milliseconds;

                        /* same for the outPoint */
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

                    theFile.close();// close the text file
                    alert('Export completed.');
                }
            }

            //
          // Remove original start
          myPanel.grp.groupOne.createCompButton.onClick = function() {
              createComp();
          }
          //myPanel.grp.groupOne.deleteCompButton.size = [25, 25];
          myPanel.grp.groupOne.deleteCompButton.onClick = function() {
              //if(app.project.activeItem == undefined || app.project.activeItem == null) {
              if (app.project.activeItem) {
                    alert("Please select a comp to delete");
                    return false;
              } else {
                 deleteActiveComp(app.project.activeItem);
              }
          }
          myPanel.grp.groupOne.closeButton.onClick = function() {
              myPanel.close();
          }
          // Remove original end
     
          
          myPanel.layout.layout(true);
          return myPanel;
       }
    
    
       var myPalette = myScript_buildUI(thisObj);
       if (myPalette != null && myPalette instanceof Window) {
          myPalette.center();
          myPalette.show();
       }
    }
    myScript(this);
}

// original functions outside works too
function createComp() {
    app.project.items.addComp("New Composition", 1920, 1080, 1, 10, 30);
}

function deleteActiveComp(comp) {
    comp.remove();
}