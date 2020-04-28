
//这里必须使用相对路径'./utils/utils.js'，不能使用绝对路径'utils/utils.js'，不然打包之后找不到utils
var utils = require('./utils/utils.js');

cc.Class({
	extends: cc.Component,

	properties: {
		jsonFileName: "json/config",
		radar_role_wrap: cc.Node,
		scroll_label_prefab:cc.Prefab
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

		// 转盘盒子
		var turntable_wrap = that.turntable.getChildByName('turntable_wrap');

		//指针
		that.radar_pointer = turntable_wrap.getChildByName('radar_pointer').getComponent(cc.Sprite);
		//转动的大圆
		that.radar_tail = turntable_wrap.getChildByName('radar_tail').getComponent(cc.Sprite);
		

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
		that.get_role_position();
		that.set_radar_role();
		that.set_scroll();
	},
	/**
	 * 设置雷达中的所有精灵的spriteFrame
	 * */
	set_radar_spriteFrame() {
		var that = this;
		var {
			radar_pointer,
			radar_tail,
			bg,
			pointer_circle,
			pointercenter,
			radar_sprite_arr
		} = that;
		var sprite_node = [bg, radar_pointer, radar_tail, pointer_circle, pointercenter];
		for (var i = 0; i < radar_sprite_arr.length; i++) {
			(function(j) {
				cc.loader.load(radar_sprite_arr[j].urls[0], function(err, texture) {
					// console.log(err);
					// console.log(texture);
					if (err) {

					}
					// 设置图像
					sprite_node[j].spriteFrame = new cc.SpriteFrame(texture);
					// console.log(radar_tail)
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
		
		// 中间那个放大缩小的圆执行动画
		var pointer_circle_animation = pointer_circle.node.getComponent(cc.Animation);
		pointer_circle_animation.play(); // 播放的是defalut clip指向的动画clip

		// 转盘动起来
		var turntable_animation=turntable.getComponent(cc.Animation);
		turntable_animation.play();
	},
	/**
	 * 设置雷达上的角色
	 * */
	set_radar_role() {
		var that = this;
		var {
			radar_role_arr,
			radar_role_wrap,
			radar_role_item
		} = that;
		that.role_node = []; //复制的角色节点，默认都是不显示的
		
		for (var i = 0; i < radar_role_arr.length; i++) {
			(function(j) {
				cc.loader.load(radar_role_arr[j], function(err, texture) {
					// console.log(err);
					// console.log(texture);
					if (err) {

					}
					var new_node = (new cc.Node(`radar_role_item${j}`));
					// var new_node = cc.instantiate(radar_role_item);
					var new_node_sprite = new_node.addComponent(cc.Sprite);
					new_node_sprite.spriteFrame = new cc.SpriteFrame(texture);
					that.role_node.push(new_node);
					// new_node.name = `radar_role_item${j}`;
					new_node.active = false; //默认都是不显示的
					radar_role_wrap.addChild(new_node)
					new_node.on(cc.Node.EventType.TOUCH_START, that.role_click, new_node);
					// 当所有的角色节点都添加到父元素之后开始搜索显示角色
					if (that.role_node.length == radar_role_arr.length) {
						// console.log(that.role_node)
						
						that.schedule(that.set_role_show, 1);
					}

				})
			})(i)
		}

	},
	/**
	 * 获取角色的坐标（随机）
	 * */
	get_role_position() {
		var that = this;
		var {
			turntable,
			radar_tail
		} = that;
		//获取每个角色的节点大小
		var role_width = 84;
		var role_height = 117;
		//转盘的大小(radar_tail节点精灵的大小)
		var max_square_width = 842;
		//转盘内正方形的大小
		var min_square_width = (((max_square_width / 2) * Math.sqrt(2)) / 2).toFixed(0);
		// 获取角色节点的对角线长：c=√(a^2+b^2)
		var center_line = Math.sqrt((Math.pow(role_height, 2) + Math.pow(role_width, 2))).toFixed(0);
		// x轴的范围是圆内的正方形的宽减去对角线长的一半
		var limit = min_square_width - center_line / 2;
		// x轴和y轴的范围是:[-limit,limit]
		var coor_arr = utils.disorder(utils.get_coor(135, -limit, limit)); //120是每个角色的高（117）+3
		// console.log(`limit==${limit}`)
		that.role_random_coor= utils.get_random_array_elements(coor_arr, 5); //5是角色的个数
		// console.log(utils.get_coor(135, -limit, limit))
	},
	/**
	 * 点击头像事件
	 * */
	role_click(e) {
		console.log(e)
	},
	/**
	 * 设置角色显示
	 * */
	set_role_show() {
		var that = this;
		var {
			role_node,
			role_show_arr,
			radar_role_wrap,
			role_random_coor
		} = that;
		// 每次最多显示3个,最少显示一个
		var min = 1;
		var max = role_show_arr.length > 3 ? 3 : role_show_arr.length;
		var random_length = utils.get_random_int(min, max); //随机显示的节点个数
		var random_node = utils.get_random_array_elements(role_show_arr, random_length); //从没有显示的节点数组中找出random_length个要显示的数组
		that.role_show_arr = utils.del_arr_elem(role_show_arr, random_node); //从没有显示的节点中删除已经显示的节点
		
		//拿到的没有显示的节点全部显示
		for (var i = 0; i < random_node.length; i++) {
			if(role_node[random_node[i]]){
				role_node[random_node[i]].setPosition(role_random_coor[random_node[i]][0], role_random_coor[random_node[i]][1]);
				role_node[random_node[i]].active = true;
			}
			
		}
		// 当角色节点全部显示时清除定时器
		if (that.role_show_arr.length == 0) {
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
			scroll_content,
			scroll_label_prefab
		} = that;
		var actionTo = cc.moveBy(0.5, cc.v2(0, 40));
		var delay = cc.delayTime(1.5);
		var scroll_content_y_max=(scroll_text.length-1)*40;
		// 每一次动作执行完的回调函数
		var callback = cc.callFunc(function() {
			// 当scroll_content在y轴上移动的距离大于300时定制节点上的所有动作
			//将scroll_content在y轴上的坐标设置为初始坐标，重新开始动作
			if (scroll_content.y > 239) {
				scroll_content.pauseAllActions(); //暂停本节点上所有正在运行的动作
				scroll_content.y = -40;
				scroll_content.resumeAllActions(); //恢复运行本节点上所有暂停的动作
			}
		});
		var seq1 = cc.sequence([actionTo, delay, callback]);
		var rep1 = cc.repeatForever(seq1);
		// 创建scroll_text.length个lable节点添加到scroll_content节点上
		for (var i = 0; i < scroll_text.length; i++) {
			var new_node=cc.instantiate(scroll_label_prefab);
			var new_node_label=new_node.getComponent(cc.Label);
			// console.log(new_node)
			var color = scroll_text[i].color.split(',').map((item, index) => item * 1);
			new_node_label.string = scroll_text[i].txt;
			new_node_label.fontSize = scroll_text[i].fontsize;
			new_node.color = new cc.Color(color[0], color[1], color[2], color[3]);
			new_node.setPosition(0, -i*40);
			new_node.parent = scroll_content;
		}
		scroll_content.runAction(rep1);
	},
	start() {},

	// update (dt) {},
});
