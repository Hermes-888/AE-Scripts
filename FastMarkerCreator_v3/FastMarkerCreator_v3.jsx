﻿/*	Fast Marker Creator v3.0 ©2015-2020	Developer: David Torno	About: After Effects script tht allows user to easily apply markers to multiple layers at once, or even create comp markers.*/{	function fastMarker(thisObj){		var fmc = new Object();		fmc.developer = "David Torno";		fmc.version = " v3";		fmc.copyright = " ©2015-2020";		fmc.scriptName = "Fast Marker Creator";		fmc.aever = aeVer().major;		function fastMarker_buildUI(thisObj){			var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", fmc.scriptName+fmc.version, undefined, {resizeable:true});			if (pal != null){				var res ="group{orientation:'column', alignment:['fill','fill'], alignChildren:['fill','top'],\					applyModeGrp: Group{orientation:'row', alignment:['center','top'],\						applyAutoLayer: RadioButton{text:'Auto layer'},\						applySelLayer: RadioButton{text:'Selected layers'},\						applyFirstLayer: RadioButton{text:'First layer'},\						applyComp: RadioButton{text:'Comp'},\					},\					entryGrpStack: Group{orientation:'stack', alignment:['fill','top'],\						compMarkCommentNotice: StaticText{text:'Comp marker comments are not available.'},\						markerTextGrp: Group{orientation:'row', alignment:['fill','top'],\							markerST: StaticText{text:'Marker comment:', alignment:['left','top']},\							markerET: EditText{ text:'', alignment:['fill','top']},\						},\						compMarkerGrp: Group{orientation:'column', alignment:['fill','top'],\							cmTextGrp: Group{orientation:'row', alignment:['fill','top'],\								cmTextST: StaticText{text:'Text:', alignment:['left','top']},\								cmTextET: EditText{ text:'', alignment:['fill','top']},\							},\							cmDurationGrp: Group{orientation:'row', alignment:['fill','top'],\								cmDurationST: StaticText{text:'Duration (secs):', alignment:['left','top']},\								cmDurationET: EditText{ text:'', preferredSize:[40, -1], alignment:['left','top']},\								cmDurationWARN: StaticText{text:'', alignment:['fill','top']},\							},\							cmCommentGrp: Group{orientation:'row', alignment:['fill','top'],\								cmCommentST: StaticText{text:'Comment:', alignment:['left','top']},\								cmCommentET: EditText{ text:'', alignment:['fill','top']},\							},\							cmChapterGrp: Group{orientation:'row', alignment:['fill','top'],\								cmChapterST: StaticText{text:'Chapter:', alignment:['left','top']},\								cmChapterET: EditText{ text:'', preferredSize:[40, -1], alignment:['left','top']},\								cmChapterWARN: StaticText{text:'', alignment:['fill','top']},\							},\							cmURLGrp: Group{orientation:'row', alignment:['fill','top'],\								cmURLST: StaticText{text:'URL:', alignment:['left','top']},\								cmURLET: EditText{ text:'', alignment:['fill','top']},\							},\							cmFTGrp: Group{orientation:'row', alignment:['fill','top'],\								cmFTST: StaticText{text:'Frame Target:', alignment:['left','top']},\								cmFTET: EditText{ text:'', preferredSize:[40, -1], alignment:['left','top']},\								cmFTWARN: StaticText{text:'', alignment:['fill','top']},\							},\							cmCpnGrp: Group{orientation:'row', alignment:['fill','top'],\								cmCpnST: StaticText{text:'Cue Point Name:', alignment:['left','top']},\								cmCpnET: EditText{ text:'', alignment:['fill','top']},\							},\							cmEcpGrp: Group{orientation:'row', alignment:['fill','top'],\								cmEcpST: StaticText{text:'Event Cue Point:', alignment:['left','top']},\								cmEcpET: Checkbox{alignment:['left','top']},\							},\						},\					},\					createHelpGrp: Group{orientation:'row', alignment:['fill','top'], alignChildren:['fill', 'fill'],\						createMarker: Button{text:'Create'},\						about: Button{text:'?', preferredSize:[25, 25], alignment:['right','fill']},\					},\				}";				pal.grp = pal.add(res);								//Control variables				var applyModeGrp = pal.grp.applyModeGrp;				var autoLayerRB = applyModeGrp.applyAutoLayer;				var selLayerRB = applyModeGrp.applySelLayer;				var lastLayerRB = applyModeGrp.applyFirstLayer;				var compRB = applyModeGrp.applyComp;				var entryGrpStack = pal.grp.entryGrpStack;					var compMarkCommentNotice = entryGrpStack.compMarkCommentNotice;					var markerTextGrp = entryGrpStack.markerTextGrp;						var markerText = markerTextGrp.markerET;					var compMarkerGrp = entryGrpStack.compMarkerGrp;						var cmTextGrp = compMarkerGrp.cmTextGrp;							var cmTextET = cmTextGrp.cmTextET;						var cmDurationGrp = compMarkerGrp.cmDurationGrp;							var cmDurationET =cmDurationGrp.cmDurationET;							var cmDurationWARN =cmDurationGrp.cmDurationWARN;						var cmCommentGrp = compMarkerGrp.cmCommentGrp;							var cmCommentET =cmCommentGrp.cmCommentET;						var cmChapterGrp = compMarkerGrp.cmChapterGrp;							var cmChapterET = cmChapterGrp.cmChapterET;							var cmChapterWARN = cmChapterGrp.cmChapterWARN;						var cmURLGrp = compMarkerGrp.cmURLGrp;							var cmURLET =cmURLGrp.cmURLET;						var cmFTGrp = compMarkerGrp.cmFTGrp;							var cmFTET =cmFTGrp.cmFTET;							var cmFTWARN =cmFTGrp.cmFTWARN;						var cmCpnGrp = compMarkerGrp.cmCpnGrp;							var cmCpnET =cmCpnGrp.cmCpnET;						var cmEcpGrp = compMarkerGrp.cmEcpGrp;							var cmEcpET =cmEcpGrp.cmEcpET;				var create = pal.grp.createHelpGrp.createMarker;				var about = pal.grp.createHelpGrp.about;								//Default UI settings				autoLayerRB.value = true;				showHideControls([compMarkCommentNotice, compMarkerGrp], false);				//Helptips				compRB.helpTip = "Comp marker comments are available in CC2017 or newer.";	//After Effects limitation.								//onChanging processes				cmDurationET.onChanging = function(){					var check = isFloatInt(cmDurationET.text);	//Verify that only a float or integer number is typed					switch(check){						case true:							create.enabled = true;							cmDurationWARN.text = "";							break;						case false:							create.enabled = false;							cmDurationWARN.text ="[Numbers only]";						 	break;					}				}				cmChapterET.onChanging = function(){					var check = isFloatInt(cmChapterET.text);	//Verify that only a float or integer number is typed					switch(check){						case true:							create.enabled = true;							cmChapterWARN.text ="";							break;						case false:							create.enabled = false;							cmChapterWARN.text ="[Numbers only]";						 	break;					}				}				cmFTET.onChanging = function(){					var check = isFloatInt(cmFTET.text);	//Verify that only a float or integer number is typed					switch(check){						case true:							create.enabled = true;							cmFTWARN.text ="";							break;						case false:							create.enabled = false;							cmFTWARN.text ="[Numbers only]";						 	break;					}				}				//onClick processes				create.onClick = function(){					app.beginUndoGroup("Add marker");						var cmData = [cmTextET.text, cmDurationET.text, cmCommentET.text, cmChapterET.text, cmURLET.text, cmFTET.text, cmCpnET.text, cmEcpET.value];						var go = createMarker(markerText.text, applyMode([selLayerRB, lastLayerRB, autoLayerRB, compRB]), cmData);					app.endUndoGroup();				}								autoLayerRB.onClick = function(){					showHideControls([markerTextGrp], true);					showHideControls([compMarkCommentNotice, compMarkerGrp], false);				}							selLayerRB.onClick = function(){					showHideControls([markerTextGrp], true);					showHideControls([compMarkCommentNotice, compMarkerGrp], false);				}							lastLayerRB.onClick = function(){					showHideControls([markerTextGrp], true);					showHideControls([compMarkCommentNotice, compMarkerGrp], false);				}							compRB.onClick = function(){					showHideControls([markerTextGrp], false);					if(fmc.aever < 14){						showHideControls([compMarkCommentNotice], true);					}else{						showHideControls([compMarkerGrp], true);					}				}								about.onClick = function(){					var text = fmc.scriptName + fmc.version + fmc.copyright + "\n"+					"Developer: " + fmc.developer + "\n"+					"Type in a marker **comment and click create. There are three layer modes, and one comp mode.\n\nAutoLayer: Uses layers at current frame.\nSelected Layer: Uses selected layers in timeline.\nFirst Layer: Uses the last layer in the composition.\nComp: Add a comp marker without loosing your layer selection.\n\n**Comp marker comments are supported only in CC2017 or newer.";					alert(text);				}							//Functions				function showHideControls(controlAry, showHide){					for(var i= 0; i<controlAry.length; i++){						if(showHide == true){							controlAry[i].visible = true;						}else if(showHide == false){							controlAry[i].visible = false;						}					}				}							function applyMode(rb){//Returns the application mode we are gonna use to apply markers					for(var i=0; i<rb.length; i++){						if(rb[i].value === true){							return rb[i].text;							break;						}					}					return null;				}								function createMarker(text, mode, cmData){					var curComp = app.project.activeItem;					var lay, layerLen, auto;					var newMarker = new MarkerValue(text);					var text, chapter, comment, cpn, duration, ecp, frametarget, url;					if(curComp instanceof CompItem){						if(mode != null){							switch(mode){								case "Selected layers":	//Selected Layers process									lay = curComp.selectedLayers;									layLen = lay.length;									for(var l=0; l<layLen; l++){										lay[l].property("Marker").setValueAtTime(curComp.time, newMarker);									}									break;								case "First layer":	//First layer process									curComp.layer(1).property("Marker").setValueAtTime(curComp.time, newMarker);									break;								case "Auto layer":	//Auto layer process									auto = layersAtCurTime(curComp);									if(auto != null){										var autoLen = auto.length;										for(var i=0; i<autoLen; i++){											auto[i].obj.property("Marker").setValueAtTime(curComp.time, newMarker);										}									}else{										writeLn("No valid layers.");									}									break;								case "Comp":	//Comp process									if(fmc.aever < 15){										addCompMarkerPre2017(curComp);									}else{										//compObj, time, text, duration, comment, chapter, url, frametarget, cpn, ecp										text = cmData[0];										duration = cmData[1];										comment = cmData[2];										chapter = cmData[3];										url = cmData[4];										frametarget = cmData[5];										cpn = cmData[6];										ecp = cmData[7];																				addCompMarker(curComp, curComp.time, text, duration, comment, chapter, url, frametarget, cpn, ecp);									}									break;							}						}					}				}							function addCompMarkerPre2017(compObj){//Hack to apply comp markers pre CC2017					var layers = compObj.layers;					var layersLen = layers.length;					var selLayers = new Array();					var curLayer;					for(var i=1; i<=layersLen; i++){						curLayer = compObj.layer(i);						if(curLayer.selected === true){							selLayers.push(curLayer);							curLayer.selected = false;						}					}					try{						app.executeCommand(2157);	//Add Marker menu ID Wish there was a better way, but not yet natively in ExtendScript.					}catch(e){writeLn("addCompMarkerPre2017 fail"); return null};					var selLayersLen = selLayers.length;					if(selLayersLen > 0){						for(var ii=0; ii<selLayersLen; ii++){							selLayers[ii].selected = true;						}					}					return true;				}				function addCompMarker(compObj, time, text, duration, comment, chapter, url, frametarget, cpn, ecp){					var cm;					try{					//Initiate new MarkerValue Object					if(text){	//Add text if any						cm = new MarkerValue(text);					}else{						cm = new MarkerValue(""); //Blank text					}					//Duration					if(duration){						cm.duration = duration;					}					//Comment					if(comment){						cm.comment= comment;					}					//Chapter and web links					if(chapter){						cm.chapter = chapter;					}					if(url){						cm.url = url;					}					if(frametarget){						cm.frameTarget = frametarget;					}					//Flash cue point					if(cpn){						cm.cuePointName = cpn;					}					cm.eventCuePoint = ecp;										compObj.markerProperty.setValueAtTime(time, cm);				}catch(e){alert("Line: "+e.line.toString()+"\n"+e.toString())}				}							function layersAtCurTime(compObj){					var curComp, cTime, allLayers, allLayersLen, curLayer, layIn, layOut, activeLayers;					curComp = compObj;					cTime = curComp.time;					if(curComp instanceof CompItem){						allLayers = curComp.layers;						allLayersLen = allLayers.length;						activeLayers = new Array();						for(var i=1; i<=allLayersLen; i++){							curLayer = allLayers[i];							layIn = curLayer.inPoint;							layOut = curLayer.outPoint;							if(curLayer.active == true){								activeLayers.push({'obj': curLayer, 'name': curLayer.name, 'in': curLayer.inPoint, 'out': curLayer.outPoint});														}						}						if(activeLayers.length > 0){							return activeLayers;						}else{							return null;						}					}else{						return null;					}				}				pal.layout.layout(true);				pal.grp.minimumSize = pal.grp.size;				pal.layout.resize();				pal.onResizing = pal.onResize = function() {this.layout.resize();}			}			return pal;		}		function isFloatInt(input){			if(input.match(/^\d*\.?\d*$/)){				return true;			}else{				return false;			}		}		function aeVer(){			var ae, aeFullVer, aeFullVerSplit, verSec, full, major, minor, subMinor, build;			var aeFullVer = app.version;			ae = aeFullVer.split("x");			verSec = ae[0].split(".");			major = verSec[0];			minor = subMinor = null;			(ae.length > 1) ? build = ae[1] : build = null;			switch(verSec.length){				case 1:/*Major only with forced 0 for Minor*/					full = major + ".0";					break;				case 2:/*Major & Minor only*/					minor = verSec[1];					full = (major + "." + minor);					break;				case 3:/*Major, Minor, & Maintainance*/					minor = verSec[1];					subMinor = verSec[2];					full = (major + "." + minor + "." + subMinor);					break;			}			return {				'raw': aeFullVer,				'major': major,				'minor': minor,				'subMinor': subMinor,				'build': build,				'full': full			};		}		var fmPAL = fastMarker_buildUI(thisObj);		if (fmPAL != null){			if (fmPAL instanceof Window){				fmPAL.center();				fmPAL.show();			}		}	}			fastMarker(this);}