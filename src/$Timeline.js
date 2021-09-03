class TimelineObject {
	constructor(startWith = 3) {
		const _this = this;
		const $container = $(E("div")).addClass("timeline-container");
		const $container2 = $(E("div")).addClass("timeline-container");
		const $tl = $(E("div")).addClass("timeline");
		const toolbox = new TimelineToolbox();
		const onion_skin_settings = ['LEFT', 'RIGHT', 'BOTH', 'OFF'];
		this.ruler = new RulerObject();
		this.animationFrames = [];
		this.playing = false;
		this.timer;
		
		//toolbox buttons
		toolbox.play.$el.on("click", function() {
			if(!_this.playing)
				_this.playAnimation();
		});
		toolbox.stop.$el.on("click", function() {
			if(_this.playing)
				_this.stopAnimation();
		});
		toolbox.add.$el.on("click", function() {
			_this.addFrameAfterCurrentFrame();
		});
		toolbox.remove.$el.on("click", function() {
			_this.removeCurrentFrameFromTimeline();
		});
		
		$container.prepend($tl);
		$container.prepend(this.ruler.$el);
		$container2.prepend(toolbox.$el);
		
		this.$el = $Component(localize("Timeline"), "timeline-component", "wide", $container).appendTo($bottom);
		this.$el.prepend($container2);
		
		//add starting number of frames
		for(let i = 0; i < startWith; i++) {
			let fr = this.addFrameToTimeline();
			//decide which frame we are currently on
			if(i == 0) {
				this.currentFrame = fr;
				fr.makeCurrent();
			}
		}
		
		if(this.ruler.nodes.length <= this.animationFrames.length) {
			this.ruler.addNodes();
		}
		
		this.labelFrames();
		this.resizeFramePreviews();
	}
	disableOnionSkin() {
		$(".onion-skin").remove();
	}
	onionSkinNextFrame() {
		$(".onion-skin.next").remove();
		
		let i = this.getCurrentFrameIndex();
		if(i + 1 >= this.animationFrames.length) 
			return;
		
		let current_frame = this.animationFrames[i];
		let next_frame = this.animationFrames[i + 1];
		let ghost = make_canvas(canvas.width, canvas.height);

		if(next_frame && next_frame.image_data) {
			ghost.ctx.putImageData(next_frame.image_data, 0, 0, 0, 0, canvas.width, canvas.height);
			$canvas_area.append($(ghost).addClass("onion-skin next"));
		}
		
		return;
	}
	onionSkinPreviousFrame() {
		$(".onion-skin.prev").remove();
		
		let i = this.getCurrentFrameIndex();
		if(i - 1 >= this.animationFrames.length) 
			return;
		
		let current_frame = this.animationFrames[i];
		let last_frame = this.animationFrames[i - 1];
		let ghost = make_canvas(canvas.width, canvas.height);
		
		if(last_frame && last_frame.image_data) {
			ghost.ctx.putImageData(last_frame.image_data, 0, 0, 0, 0, canvas.width, canvas.height);
			$canvas_area.append($(ghost).addClass("onion-skin prev"));
		}	
		
		return;
	}
	clearAllFrames() {
		console.log("clear previews and data");
		for(let i = 0; i < this.animationFrames.length; i++) {
			this.removeFrameFromTimeline(0);
			this.addFrameToTimeline();
		}
	}
	resizeFramePreviews() {
		//note: the canvasses will resize on their own when the user selects them
		let f;
		for(let i = 0; i < this.animationFrames.length; i++) {
			f = this.animationFrames[i];
			f.$el.css({
				height: (100/canvas.width)*canvas.height
			});
		}
		
		return;
	}
	labelFrames() {
		for(let i = 0; i < this.animationFrames.length; i++) {
			this.animationFrames[i].$label.text(i + 1);
		}
	}
	selectFrameToLeft() {
		//exclude 0, first frame cant shift left
		for (let i = 1; i < this.animationFrames.length; i++) {
			if(this.animationFrames[i].isCurrentFrame) {
				let current_frame = this.animationFrames[i];
				let left_of_current_frame = this.animationFrames[i - 1];	
				
				current_frame.removeCurrent();
				left_of_current_frame.makeCurrent();
				this.loadFrameToCanvas(left_of_current_frame.image_data);
				
				break;
			}
		}
		
		return;
	}
	selectFrameToRight() {
		//exclude last frame, cant shift right
		for (let i = this.animationFrames.length - 2; i >= 0; i--) {
			if(this.animationFrames[i].isCurrentFrame) {
				let current_frame = this.animationFrames[i];
				let right_of_current_frame = this.animationFrames[i + 1];
				
				current_frame.removeCurrent();
				right_of_current_frame.makeCurrent();
				this.loadFrameToCanvas(right_of_current_frame.image_data);
				
				break;
			}
		}
		return;
	}
	renderAnimationGif() {
		let history_nodes = [];
		for(let i = 0; i < this.animationFrames.length; i++) {
			history_nodes.push(this.animationFrames[i].history_node);
		}
		render_history_as_gif(history_nodes, 1000/framerate);
		
		return;
	}
	playAnimation() {
		const _this = this;
		const nFrames = this.animationFrames.length;
		const fs = this.animationFrames;
		let i = 0;
		
		this.disableOnionSkin();
		this.playing = true;
		this.timer = window.setInterval(function() {
			fs[i].removeCurrent();
			//loop through frames in canvas display
			i < nFrames - 1 ? i++ : i = 0;
			fs[i].makeCurrent();
		
			_this.loadFrameToCanvas(fs[i].image_data);
		}, 1000/framerate);
	}
	stopAnimation() {
		this.playing = false;
		window.clearInterval(this.timer);
		this.timer = null;
	}
	toggleAnimation() {
		if(this.playing) {
			this.stopAnimation();
		} else {
			this.playAnimation();
		}
		
		return;
	}
	getCurrentFrameIndex() {
		for(let i = 0; i < this.animationFrames.length; i++) {
			if(this.animationFrames[i].isCurrentFrame) {
				//return this.animationFrames[i];
				return i;
			}
		}
		
		return null;
	}
	shiftFrameRight() {
		//exclude last frame, cant shift right
		for (let i = this.animationFrames.length - 2; i >= 0; i--) {
			if(this.animationFrames[i].isCurrentFrame) {
				let current_frame = this.animationFrames[i];
				let right_of_current_frame = this.animationFrames[i + 1];
				//swap in array
				this.animationFrames[i] = right_of_current_frame;
				this.animationFrames[i + 1] = current_frame;
				//swap in dom
				current_frame.$el.before(right_of_current_frame.$el);
			}
		}
		return;
	}
	shiftFrameLeft() {
		//exclude 0, first frame cant shift left
		for (let i = 1; i < this.animationFrames.length; i++) {
			if(this.animationFrames[i].isCurrentFrame) {
				let current_frame = this.animationFrames[i];
				let left_of_current_frame = this.animationFrames[i - 1];	
				//swap positions in array
				this.animationFrames[i] = left_of_current_frame;
				this.animationFrames[i - 1] = current_frame;
				current_frame = this.animationFrames[i - 1];
				left_of_current_frame = this.animationFrames[i];
				//swap positions in dom
				current_frame.$el.after(left_of_current_frame.$el);
				break;
			}
		}
		return;
	}
	removeCurrentFrameFromTimeline() {
		let frame_index = this.getCurrentFrameIndex();
		this.removeFrameFromTimeline(frame_index);
		
		return;
	}
	removeFrameFromTimeline(index) {
		if(this.animationFrames.length == 1)
			return;
		
		const $w = new $FormToolWindow().addClass("dialogue-window");
		$w.title(localize("Paint"));
		$w.$main.text(localize("Are you sure you want to delete this frame? This action cannot be undone."));
		
		$w.$Button(localize("Yes"), () => {
			if(index === undefined) {
				//default to last frame
				index = this.animationFrames.length - 1;
			}
			let reject_frame = this.animationFrames[index];
			//remove from array
			this.animationFrames.splice(index, 1);
			//delete from dom
			reject_frame.$el.remove();
			//make nearest frame the new current frame
			if(this.animationFrames[index]) {
				//shift right
				this.animationFrames[index].makeCurrent();
			} else if (this.animationFrames[index] === undefined
			&& this.animationFrames[index - 1]) {
				//shift left
				this.animationFrames[index - 1].makeCurrent();
			} else if (this.animationFrames.length < 1) {
				//empty
				console.log("empty");
				return;
			}
			
			this.labelFrames();
			$w.close();
		});
		$w.$Button(localize("Cancel"), () => {
			$w.close();
		})[0].focus();
		$w.center();
		
		return;
	}
	loadFrameToCanvas(image_data) {
		ctx.putImageData(image_data, 0, 0, 0, 0, canvas.width, canvas.height);
	}
	copyCurrentFrame() {
		const currentFrame = this.animationFrames[this.getCurrentFrameIndex()];
		let new_frame = this.addFrameAfterCurrentFrame();
		
		new_frame.updateImageData(currentFrame.image_data);

		return;
	}
	addFrameAfterCurrentFrame() {
		let frame_index = this.getCurrentFrameIndex();
		return this.addFrameToTimeline(frame_index);
	}
	addFrameToTimeline(index) {
		let _this = this;
		let new_frame = new FrameObject();
		let framesData = this.animationFrames;
		
		if(index === undefined) {
			//append to end of component
			this.$el.find('.timeline').append(new_frame.$el);
			//add to end of animationFrames array
			this.animationFrames.push(new_frame);
			if(this.animationFrames.length == 1) {
				new_frame.makeCurrent();
			}
		} else {
			let $currentFrame = this.animationFrames[this.getCurrentFrameIndex()].$el;
			$(new_frame.$el).insertAfter($currentFrame);
			this.animationFrames.splice(index + 1, 0, new_frame);
		}

		//bind double click to switch current frame
		$(new_frame.$el).on("mousedown", function() {

			if(!new_frame.isCurrentFrame) {
				//if not current, find last current and remove
				for (let i = 0; i < framesData.length; i++) {
					let old_fr = framesData[i];
					if(old_fr.isCurrentFrame) {
						old_fr.removeCurrent();
						break;
					}
				}	
				//become new current
				new_frame.makeCurrent();
				
				//load selected drawing onto canvas
				_this.loadFrameToCanvas(new_frame.image_data);
				
				//change the onion skin
				_this.onionSkinNextFrame();
				_this.onionSkinPreviousFrame();
			}
		});
		
		this.labelFrames();
		if(this.ruler.nodes.length <= this.animationFrames.length) {
			this.ruler.addNodes();
		}

		return new_frame;
	}
}
class FrameObject {
	constructor() {
		const $menu_bar = $MenuBar(frame_menus, true);
		const $container = $(E("div")).addClass("frame-container");
		this.frame_canvas = make_canvas(100,(100/canvas.width)*canvas.height);
		this.thumbnail = this.frame_canvas;
		this.$el = $container;
		this.$label = $(E("p")).addClass("frame-label").text("0");
		this.isCurrentFrame = false;
		this.history_node = make_history_node({
			image_data: this.image_data
		}); 
				
		//default to blank canvas
		this.image_data = this.frame_canvas.ctx.createImageData(canvas.width, canvas.height);
		//color box white
		for (let i = 0; i < this.image_data.data.length; i += 4) {
		  this.image_data.data[i+0] = 255;
		  this.image_data.data[i+1] = 255;
		  this.image_data.data[i+2] = 255;
		  this.image_data.data[i+3] = 255;
		}

		this.$el.append($menu_bar);
		//this.$el.append($(this.frame_canvas).addClass("frame"));
		this.$el.append($(this.thumbnail).addClass("frame"));
		this.$el.append(this.$label);
		
		$canvas.on("pointerup", e => {	
			if(this.isCurrentFrame == true) {
				//!REALLY NOT A GREAT WAY TO BE DOING THIS
				//for now i use a timer as a placeholder way 
				//to wait until the ctx is holding the most recent canvas data
				//but ideally i should really use a "canvasupdated" event or something like that
				setTimeout(updateCurrentFrame, 5);
			}
		});
		
		const updateCurrentFrame = ()=> {
			//update canvas data
			this.history_node = make_history_node({
				image_data: ctx.getImageData(0, 0, canvas.width, canvas.height)
			});
			this.image_data = this.history_node.image_data;
			
			//update thumbnail
			this.thumbnail = new Image(100, (100/canvas.width)*canvas.height);
			this.thumbnail.src = canvas.toDataURL();
			this.$el.find('.frame').replaceWith($(this.thumbnail).addClass("frame"));
		}
	}
	//? do i still use this
	updateImageData(image_data) {
		this.image_data = image_data;
		this.frame_canvas.ctx.putImageData(this.image_data, 0, 0, 0, 0, 100, 100);
		
		return;
	}
	makeCurrent() {
		this.isCurrentFrame = true;
		this.$el.addClass("currentFrame");
		
		return;
	}
	removeCurrent() {
		this.isCurrentFrame = false;
		this.$el.removeClass("currentFrame");
		
		return;
	}
}
class RulerObject {
	constructor() {
		this.$el = $(E("div")).addClass("ruler");
		this.nodes = [];
		
		//!PLACEHOLDER
		/*for(let i = 0; i <= 100; i++) {
			this.addNode();
		}*/
	}
	addNodes(n=100) {
		for(let i = 0; i < n; i++) {
			this.addNode();
		}
		
		return;
	}
	addNode() {
		const new_node = new RulerNode(this.nodes.length);
		this.nodes.push(new_node);
		this.$el.append(new_node.$el);
	}	
}
class RulerNode {
	constructor(index) {
		this.number = index + 1;
		this.$el = $(E("div")).addClass("ruler-node");
		
		const displayNumber = this.generateDisplayNumber(this.number);
		const $label = $(E("p")).text(displayNumber);
		
		this.$el.append($label);
	}
	generateDisplayNumber(n) {
		let dn;
		let n_frames = n;
		let divide_by = (1/framerate);
		let frames_in_seconds = (n_frames / framerate);
		let whole = Math.floor((frames_in_seconds / divide_by) / framerate);
		let fraction = Math.floor((frames_in_seconds / divide_by) % framerate);
		
		if(whole > 0 
		&& fraction > 0 ) {
			dn = whole + " " + fraction + "/" + framerate + "s";
		} else if (whole <= 0 
		&& fraction > 0) {
			dn = fraction + "/" + framerate + "s";
		} else if (whole > 0 
		&& fraction <= 0) {
			dn = whole + "s";
		}
		
		return dn;
	}
}
class TimelineToolbox {
	constructor() {
		this.$el = $(E("div")).addClass("timeline-tools");
		this.play = {
			name: "play",
			icon: "images/classic/timeline_play.png",
			title: "Play"
		}
		this.stop = {
			name: "stop",
			icon: "images/classic/timeline_stop.png",
			title: "Stop"
		}
		this.add = {
			name: "add",
			icon: "images/classic/timeline_add.png",
			title: "Add Frame"
		}
		this.remove = {
			name: "remove",
			icon: "images/classic/timeline_remove.png",
			title: "Remove Selected Frame"
		}
		this.onion = {
			name: "onion",
			icon: "",
			title: "Toggle Onion Skin"
		}
		
		this.addTool(this.play);
		this.addTool(this.stop);
		this.addTool(this.add);
		this.addTool(this.remove);
		this.addTool(this.onion);
	}
	addTool(tool) {
		tool.$el = $(E("div")).addClass("tool").attr('id', 'timeline-' + tool.name).attr('title', tool.title).css('background-image', 'url('+tool.icon+')');
		this.$el.append(tool.$el);
		
		return; 
	}
}
