(()=> {

const looksLikeChrome = !!(window.chrome && (chrome.loadTimes || chrome.csi));
// NOTE: Microsoft Edge includes window.chrome.app
// (also this browser detection logic could likely use some more nuance)

window.frame_menus = {
	[localize("")]: [
		{
			item: localize("New Frame"),
			action: ()=> {
				//append frame next to current frame
				timeline.addFrameAfterCurrentFrame()
			}
		},
		{
			item: localize("Delete Frame"),
			action: ()=> {
				//delete current frame
				timeline.removeCurrentFrameFromTimeline();
			}
		},
		{
			item: localize("Copy Frame"),
			action: ()=> {
				//copy current frame and append next to current frame
				timeline.copyCurrentFrame();
			}
		}

	],
};

})();
