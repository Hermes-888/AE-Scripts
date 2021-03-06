
/*
    https://scriptui.joonas.me

    JSON2
    https://gist.github.com/atheken/654510

    https://github.com/NTProductions/script-ui-colour-button/blob/master/UI%20Colour%20Button.jsx
*/ 
this.JSON||(this.JSON={}),function(){function f(t){return t<10?"0"+t:t}"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(t){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(t){return this.valueOf()});var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;function quote(t){return escapable.lastIndex=0,escapable.test(t)?'"'+t.replace(escapable,function(t){var e=meta[t];return"string"==typeof e?e:"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+t+'"'}function str(t,e){var n,r,f,o,u,i=gap,a=e[t];switch(a&&"object"==typeof a&&"function"==typeof a.toJSON&&(a=a.toJSON(t)),"function"==typeof rep&&(a=rep.call(e,t,a)),typeof a){case"string":return quote(a);case"number":return isFinite(a)?String(a):"null";case"boolean":case"null":return String(a);case"object":if(!a)return"null";if(gap+=indent,u=[],"[object Array]"===Object.prototype.toString.apply(a)){for(o=a.length,n=0;n<o;n+=1)u[n]=str(n,a)||"null";return f=0===u.length?"[]":gap?"[\n"+gap+u.join(",\n"+gap)+"\n"+i+"]":"["+u.join(",")+"]",gap=i,f}if(rep&&"object"==typeof rep)for(o=rep.length,n=0;n<o;n+=1)"string"==typeof(r=rep[n])&&(f=str(r,a))&&u.push(quote(r)+(gap?": ":":")+f);else for(r in a)Object.hasOwnProperty.call(a,r)&&(f=str(r,a))&&u.push(quote(r)+(gap?": ":":")+f);return f=0===u.length?"{}":gap?"{\n"+gap+u.join(",\n"+gap)+"\n"+i+"}":"{"+u.join(",")+"}",gap=i,f}}"function"!=typeof JSON.stringify&&(JSON.stringify=function(t,e,n){var r;if(gap="",indent="","number"==typeof n)for(r=0;r<n;r+=1)indent+=" ";else"string"==typeof n&&(indent=n);if(rep=e,e&&"function"!=typeof e&&("object"!=typeof e||"number"!=typeof e.length))throw new Error("JSON.stringify");return str("",{"":t})}),"function"!=typeof JSON.parse&&(JSON.parse=function(text,reviver){var j;function walk(t,e){var n,r,f=t[e];if(f&&"object"==typeof f)for(n in f)Object.hasOwnProperty.call(f,n)&&(void 0!==(r=walk(f,n))?f[n]=r:delete f[n]);return reviver.call(t,e,f)}if(text=String(text),cx.lastIndex=0,cx.test(text)&&(text=text.replace(cx,function(t){return"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})),/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return j=eval("("+text+")"),"function"==typeof reviver?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}();

// PALETTE
var palette = new Window("palette", undefined, undefined, {resizeable: true}); 
    palette.text = "Marker Manager"; 
    palette.orientation = "column"; 
    palette.alignChildren = ["center","top"]; 
    palette.spacing = 10; 
    palette.margins = 10; 

// INSTRUCTPANEL
var instructPanel = palette.add("panel", undefined, undefined, {name: "instructPanel"}); 
    instructPanel.text = "Instructions"; 
    instructPanel.preferredSize.width = 320; 
    instructPanel.orientation = "row"; 
    instructPanel.alignChildren = ["left","top"]; 
    instructPanel.spacing = 10; 
    instructPanel.margins = 10; 

var statictext1 = instructPanel.add("statictext", undefined, undefined, {name: "statictext1", multiline: true, scrolling: true}); 
    statictext1.text = "Place markers on the Template comp. The duration doesn\'t matter. The comment is the Interaction Type. [title, message, question, custom] Run this script to collect the markers for the Template comp only. Select Export VTT File to convert markers to cues in a vtt file."; 

// DATAPANEL
var dataPanel = palette.add("panel", undefined, undefined, {name: "dataPanel"}); 
    dataPanel.text = "Interactive Cue Markers"; 
    dataPanel.preferredSize.width = 320; 
    dataPanel.orientation = "row"; 
    dataPanel.alignChildren = ["left","top"]; 
    dataPanel.spacing = 10; 
    dataPanel.margins = 10; 

var markerList_array = []; 
var markerList = dataPanel.add("listbox", undefined, undefined, {
    name: "markerList", 
    items: markerList_array, 
    numberOfColumns: 3, 
    columnTitles: ["type", "start", "dur"],
    showHeaders: true
}); 
    markerList.selection = 1; 
    markerList.helpTip = "Select a marker to edit"
    markerList.preferredSize.width = 290; 
    markerList.preferredSize.height = 95; // 4 rows?
    // scrolling = true?

// PROPSPANEL
var propsPanel = palette.add("panel", undefined, undefined, {name: "propsPanel"}); 
    propsPanel.text = "Cue Properties"; 
    propsPanel.preferredSize.width = 320; 
    propsPanel.orientation = "row"; 
    propsPanel.alignChildren = ["left","top"]; 
    propsPanel.spacing = 10; 
    propsPanel.margins = 10; 

// TOOLS Group
var tools = propsPanel.add("group", undefined, {name: "tools"}); 
    tools.orientation = "column"; 
    tools.alignChildren = ["left","center"]; 
    tools.spacing = 10; 
    tools.margins = 10; 

var typeDD_array = ["Title", "Message", "Question", "Image", "Custom"]; 
var typeDD = tools.add("dropdownlist", undefined, undefined, {name: "typeDD", items: typeDD_array}); 
    typeDD.helpTip = "Select a Marker type"; 
    typeDD.selection = 0; 

var addMarkerBtn = tools.add("button", undefined, undefined, {name: "addMarkerBtn"}); 
    addMarkerBtn.text = "Add Marker"; 

// PROPS1 Group
var props1 = propsPanel.add("group", undefined, {name: "props1"}); 
    props1.orientation = "column"; 
    props1.alignChildren = ["left","center"]; 
    props1.spacing = 10; 
    props1.margins = 0; 

var checkbox1 = props1.add("checkbox", undefined, undefined, {name: "checkbox1"}); 
    checkbox1.text = "useBlur"; 
    checkbox1.helpTip = "Blur the video during interaction"; 

var checkbox2 = props1.add("checkbox", undefined, undefined, {name: "checkbox2"}); 
    checkbox2.text = "animateIn"; 
    checkbox5.helpTip = "Animate interactive element onto screen"; 

var checkbox3 = props1.add("checkbox", undefined, undefined, {name: "checkbox3"}); 
    checkbox3.text = "pauseVideo"; 
    checkbox3.helpTip = "Pause video during interaction"; 

// PROPS2 Group
var props2 = propsPanel.add("group", undefined, {name: "props2"}); 
    props2.orientation = "column"; 
    props2.alignChildren = ["left","center"]; 
    props2.spacing = 10; 
    props2.margins = 0; 

var checkbox4 = props2.add("checkbox", undefined, undefined, {name: "checkbox4"}); 
    checkbox4.text = "showOverlay"; 
    checkbox4.helpTip = "Show a colored overlay."; 

var checkbox5 = props2.add("checkbox", undefined, undefined, {name: "checkbox5"}); 
    checkbox5.text = "animateOut"; 
    checkbox5.helpTip = "Animate interactive element off screen"; 

var checkbox6 = props2.add("checkbox", undefined, undefined, {name: "checkbox6"}); 
    checkbox6.text = "resumeVideo"; 
    checkbox6.helpTip = "Resume video playback after interaction"; 

// ACTIONSPANEL
var actionsPanel = palette.add("panel", undefined, undefined, {name: "actionsPanel"}); 
    actionsPanel.text = "Actions"; 
    actionsPanel.preferredSize.width = 320; 
    actionsPanel.orientation = "row"; 
    actionsPanel.alignChildren = ["left","top"]; 
    actionsPanel.spacing = 10; 
    actionsPanel.margins = 10; 

var button2 = actionsPanel.add("button", undefined, undefined, {name: "button2"}); 
    button2.text = "Refresh"; 

var button3 = actionsPanel.add("button", undefined, undefined, {name: "button3"}); 
    button3.text = "Export VTT"; 

var button4 = actionsPanel.add("button", undefined, undefined, {name: "button4"}); 
    button4.text = "Close"; 

palette.show();

