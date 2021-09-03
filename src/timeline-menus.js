(()=> {

const looksLikeChrome = !!(window.chrome && (chrome.loadTimes || chrome.csi));
// NOTE: Microsoft Edge includes window.chrome.app
// (also this browser detection logic could likely use some more nuance)

window.timeline_menus = {
	[localize("&Animation Menu")]: [
		{
			item: localize("Play/Stop"),
			action: ()=> {
				timeline.toggleAnimation();
			}
		},
		{
			item: localize("+ Add Frame"),
			speech_recognition: [
				"add frame", "new frame", "add a frame", "add an animation frame", "insert frame", "insert animation frame", "add frame to timeline", "add animation frame to timeline", "add an animation frame to timeline", "add a frame to the timeline"
			],
			action: ()=> { 
				timeline.addFrameToTimeline();
			},
			description: localize("Creates a new frame to the timeline."),
		},
		{
			item: localize("- Remove Last Frame"),
			action: ()=> {
				timeline.removeFrameFromTimeline();
			}
		},
		{
			item: localize("< Move Selected Frame Left"),
			action: ()=> {
				timeline.shiftFrameLeft();
			}
		},
		{
			item: localize("> Move Selected Frame Right"),
			action: ()=> {
				timeline.shiftFrameRight();
			}
		},
		{
			item: localize("Settings")
		},
		{
			item: localize("Render Animation As Gif"),
			action: ()=> {
				timeline.renderAnimationGif();
			}
		},
	],
};

})();
