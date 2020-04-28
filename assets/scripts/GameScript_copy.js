// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html


//这里必须使用'./utils/utils.js'，不能使用'utils/utils.js'，不然打包之后找不到utils
var utils = require('./utils/utils.js');

cc.Class({
	extends: cc.Component,

	properties: {
		jsonFileName: "json/config",
		radar_role_item: cc.Prefab,
		radar_role_wrap: cc.Node,
	},

	// LIFE-CYCLE CALLBACKS:

	onLoad() {
		var that = this;
		// 背景
		that.bg = this.node.getChildByName('bg').getComponent(cc.Sprite);
		// 雷达盒子
		that.radar_wrap = this.node.getChildByName('radar_wrap');
		// 内层放大缩小的圆
		that.pointer_circle = that.radar_wrap.getChildByName('pointer_circle').getComponent(cc.Sprite);
		// 中间不动的那个小点
		that.pointercenter = that.radar_wrap.getChildByName('pointercenter').getComponent(cc.Sprite);

		// 转盘
		that.turntable = that.radar_wrap.getChildByName('turntable');

		// 转盘盒子1
		var turntable_wrap1 = that.turntable.getChildByName('turntable_wrap');
		// 克隆turntable_wrap1节点
		var turntable_wrap2 = cc.instantiate(turntable_wrap1);
		var turntable_wrap3 = cc.instantiate(turntable_wrap1);

		//指针
		that.radar_pointer1 = turntable_wrap1.getChildByName('radar_pointer').getComponent(cc.Sprite);
		that.radar_pointer2 = turntable_wrap2.getChildByName('radar_pointer').getComponent(cc.Sprite);
		that.radar_pointer3 = turntable_wrap3.getChildByName('radar_pointer').getComponent(cc.Sprite);
		//转动的大圆
		that.radar_tail1 = turntable_wrap1.getChildByName('radar_tail').getComponent(cc.Sprite);
		that.radar_tail2 = turntable_wrap2.getChildByName('radar_tail').getComponent(cc.Sprite);
		that.radar_tail3 = turntable_wrap3.getChildByName('radar_tail').getComponent(cc.Sprite);


		// 将克隆的节点写入父元素
		turntable_wrap2.parent = that.turntable;
		turntable_wrap3.parent = that.turntable;
		// 设置其他两个转盘旋转角度
		turntable_wrap2.runAction(cc.rotateBy(0, -3));
		turntable_wrap3.runAction(cc.rotateBy(0, -6));
		//设置旋转的转盘里面指针和转盘的透明度
		that.radar_tail2.node.opacity = 255;
		that.radar_pointer2.node.opacity = 200;
		that.radar_pointer3.node.opacity = 180;



		// 滚动字幕
		var scroll_wrap = that.bg.node.getChildByName('scroll_wrap');
		that.scroll_content = scroll_wrap.getChildByName('scroll_mask').getChildByName('scroll_content');

		// 加载资源信息
		cc.loader.loadRes(that.jsonFileName, function(err, object) {
			that.config = object.json;
			// 雷达精灵
			that.radar_sprite_arr = object.json.radar_sprite.radar_scene_sprite;
			// 滚动的文字
			that.scroll_text = object.json.scrolltxts;

			//角色头像
			that.radar_role_arr = object.json.radar_sprite.radar_role_sprite;
			that.role_show_arr = Array.from({
				length: that.radar_role_arr.length
			}, (v, k) => k); //要显示的角色节点的index值

			that.init();
		})






	},
	/**
	 * 初始化
	 * */
	init() {
		var that = this;
		that.radar_animation();
		that.set_radar_spriteFrame();
		that.set_radar_role();
		that.set_scroll();
	},
	/**
	 * 设置雷达中的所有精灵的spriteFrame
	 * */
	set_radar_spriteFrame() {
		var that = this;
		var {
			radar_pointer1,
			radar_pointer2,
			radar_pointer3,
			radar_tail1,
			radar_tail2,
			radar_tail3,
			bg,
			pointer_circle,
			pointercenter,
			radar_sprite_arr
		} = that;
		var sprite_node = [bg, 'radar_pointer', 'radar_tail', pointer_circle, pointercenter];
		for (var i = 0; i < radar_sprite_arr.length; i++) {
			(function(j) {
				cc.loader.load(radar_sprite_arr[j].urls[0], function(err, texture) {
					// console.log(err);
					// console.log(texture);
					if (err) {

					}
					// 设置图像
					if (Object.prototype.toString.call(sprite_node[j]) == "[object String]") {
						if (sprite_node[j] == 'radar_pointer') {
							radar_pointer1.spriteFrame = new cc.SpriteFrame(texture);
							radar_pointer2.spriteFrame = new cc.SpriteFrame(texture);
							radar_pointer3.spriteFrame = new cc.SpriteFrame(texture);
						} else if (sprite_node[j] == 'radar_tail') {
							radar_tail1.spriteFrame = new cc.SpriteFrame(texture);
							radar_tail2.spriteFrame = new cc.SpriteFrame(texture);
							radar_tail3.spriteFrame = new cc.SpriteFrame(texture);
						}
					} else {
						sprite_node[j].spriteFrame = new cc.SpriteFrame(texture);
					}
				})
			})(i)
		}
	},
	/**
	 * 雷达的动画
	 * */
	radar_animation() {
		var that = this;
		var {
			pointer_circle,
			turntable
		} = that;
		//转盘旋转360度-重复
		var turntable_rep = cc.repeatForever(cc.rotateBy(2, -360));

		// 中间那个放大缩小的圆执行动画
		var pointer_circle_animation = pointer_circle.node.getComponent(cc.Animation);
		pointer_circle_animation.play(); // 播放的是defalut clip指向的动画clip

		// 转盘动起来
		turntable.runAction(turntable_rep);
	},
	/**
	 * 设置雷达上的角色
	 * */
	set_radar_role() {
		var that = this;
		var {
			radar_role_arr,
			radar_role_item,
			radar_role_wrap
		} = that;
		that.role_node = []; //复制的角色节点，默认都是不显示的
		for (var i = 0; i < radar_role_arr.length; i++) {
			(function(j) {
				cc.loader.load(radar_role_arr[j], function(err, texture) {
					// console.log(err);
					// console.log(texture);
					if (err) {

					}
					var new_node = cc.instantiate(radar_role_item);//克隆预制节点
					var new_node_sprite = new_node.addComponent(cc.Sprite);
					new_node.name = 'radar_role_item';
					new_node.setPosition(radar_role_arr[j].positionX, radar_role_arr[j].positionY);
					new_node_sprite.spriteFrame = new cc.SpriteFrame(texture);
					that.role_node.push(new_node);
					new_node.active = false; //默认都是不显示的
					new_node.parent = radar_role_wrap;

					// 当所有的角色节点都添加到父元素之后开始搜索显示角色
					if (that.role_node.length == radar_role_arr.length) {
						that.schedule(that.set_role_show, 1);
					}
				})
			})(i)
		}


	},
	/**
	 * 设置角色显示
	 * */
	set_role_show() {
		var that = this;
		var {
			role_node,
			role_show_arr
		} = that;
		// 每次最多显示3个,最少显示一个
		var min = 1;
		var max = role_show_arr.length > 3 ? 3 : role_show_arr.length;
		var random_length = utils.get_random_int(min, max); //随机显示的节点个数
		var random_node = utils.get_random_array_elements(role_show_arr, random_length); //从没有显示的节点数组中找出random_length个要显示的数组
		that.role_show_arr = utils.del_arr_elem(role_show_arr, random_node); //从没有显示的节点中删除已经显示的节点

		//拿到的没有显示的节点全部显示
		for (var i = 0; i < random_node.length; i++) { 
			role_node[random_node[i]].active = true;
		}
		// 当角色节点全部显示时清除定时器
		if (that.role_show_arr == 0) {
			that.unschedule(that.set_role_show);
		}
	},
	/**
	 * 设置滚动字幕
	 * */
	set_scroll() {
		var that = this;
		var {
			scroll_text,
			scroll_content
		} = that;
		var actionTo = cc.moveBy(0.5, cc.v2(0, 45));
		var delay = cc.delayTime(1.5);
		
		// 每一次动作执行完的回调函数
		var callback = cc.callFunc(function() {
			// 当scroll_content在y轴上移动的距离大于300时定制节点上的所有动作
			//将scroll_content在y轴上的坐标设置为初始坐标，重新开始动作
			if (scroll_content.y > 300) {
				scroll_content.pauseAllActions();//暂停本节点上所有正在运行的动作
				scroll_content.y = -45;
				scroll_content.resumeAllActions();//恢复运行本节点上所有暂停的动作
			}
		});
		var seq1 = cc.sequence([actionTo, delay, callback]);
		var rep1 = cc.repeatForever(seq1);
		
		// 创建scroll_text.length个lable节点添加到scroll_content节点上
		for (var i = 0; i < scroll_text.length; i++) {
			var new_node = (new cc.Node('Label')).addComponent(cc.Label);
			var color = scroll_text[i].color.split(',').map((item, index) => item * 1);
			new_node.string = scroll_text[i].txt;
			new_node.fontSize = scroll_text[i].fontsize;
			new_node.node.color = new cc.Color(color[0], color[1], color[2], color[3]);
			new_node.node.setPosition(0, -i * 45);
			new_node.node.parent = scroll_content;

		}
		scroll_content.runAction(rep1);
	},
	start() {},

	// update (dt) {},
});
