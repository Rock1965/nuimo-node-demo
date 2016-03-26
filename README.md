# nuimo-node
Simple library to integrate with nuimo device. 
Includes demos of functionality of Nuimo BTLE device

##Setup
run `npm install` 

#Demos
To run demos, cd into examples, then...

##Demo with Logging:
run `node index.js`

##Demo of operating system volume control (OSX):
run `node volume.js`

##Demo of player controls in spotify (OSX only):
run `node spotify.js`
This demo uses `AppleScript` to send commands to running Spotify app. It will:
 - Adjust Volume (Rotation)
 - Play/Pause (Button-Press)
 - Skip Tracks (Swipe)

[![YouTube Demo](http://img.youtube.com/vi/7te_A4Vro08/0.jpg)](https://www.youtube.com/watch?v=7te_A4Vro08)

##Demo of led matrix:
run `node ledmatrixdemo.js`

came up with my own "format" for defining images. See sample code.
