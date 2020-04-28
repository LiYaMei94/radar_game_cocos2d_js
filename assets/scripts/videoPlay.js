cc.Class({

	extends: cc.Component,

	properties: {

		// videoplayer: cc.VideoPlayer

	},

	onLoad() {
		var that=this;
		that.videoplayer=this.node.getComponent(cc.VideoPlayer);
		//判断是否加载完毕，如果加载完毕启动call函数
		that.videoplayer.node.on('ready-to-play', that.readyToPlay_callback, that);
		that.videoplayer.node.on('meta-loaded', that.metaLoaded_callback, that);
		
		
		that.videoplayer.node.on('clicked', that.clicked_callback, that);
		that.videoplayer.node.on('playing', that.playing_callback, that);
		
		that.videoplayer.node.on('paused', that.paused_callback, that);
		that.videoplayer.node.on('stopped', that.stopped_callback, that);
		that.videoplayer.node.on('completed', that.completed_callback, that);
	},
	readyToPlay_callback(event){
		console.log('ready-to-play')
	},
	metaLoaded_callback(event) {
		console.log('meta-loaded')
		if (this.videoplayer) {
			this.videoplayer._syncVolume();
			this.videoplayer.play(); //加载完毕后播放
	
		}
	
	},
	clicked_callback(event){
		console.log('clicked')
	},
	playing_callback(event){
		console.log('playing')
	},
	paused_callback(event){
		console.log('paused')
	},
	stopped_callback(event){
		console.log('stopped')
	},
	completed_callback(event){
		console.log('completed')
	},
});
