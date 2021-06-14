//
// createTextLayersFromFile.jsx
// https://www.motionscript.com/ae-scripting/create-text-layers-from-file.html

//
// This script reads a user specified text file and
// creates a text layer for each line of text in a 
// new comp called "my text comp"
{
  // Prompt user to select text file
  var myFile = File.openDialog("Please select input text file.");
  if (myFile != null) {

    // open file
    var fileOK = myFile.open("r");
    if (fileOK) {

      // create undo group
      app.beginUndoGroup("Create Text Layers From File");
      // create project if necessary

      var proj = app.project;
      if(!proj) {proj = app.newProject();}

      // create new comp named 'my text comp'
      var compW = 160; // comp width
      var compH = 120; // comp height
      var compL = 15;  // comp length (seconds)
      var compRate = 24; // comp frame rate
      var compBG = [48/255,63/255,84/255] // comp background color
  
      var myItemCollection = app.project.items;
      var myComp = myItemCollection.addComp('my text comp',compW,compH,1,compL,compRate);
      myComp.bgColor = compBG;

      // read text lines and create text layer for each
      // until end-of-file is reached

      var text;
      while (!myFile.eof) {
        text = myFile.readln();
        if (text == "") {text = "\r";}
        // addBoxText?
        myComp.layers.addText(text);
      }

      // close the file before exiting
      myFile.close();
      app.endUndoGroup();

    } else {
      alert("File open failed!");
    }
  } else {
    alert("No text file selected.");
  }
}