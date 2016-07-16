/* 内容管理对象 */

var H5 = function() {
	this.id = ('h5_' + Math.random()).replace('.', '_');
	this.el = $('<div class="h5" id="' + this.id + '">').hide();
	this.page = [];
	$('body').append(this.el);

	/*
	 ** 新增一个页
	 * @param {string} name 组建的名称，会加入到ClassName
	 * @param {string} text 页内的默认文本
	 * @param {H5} H5对象,可以重复使用H5对象支持的方法
	 */
	this.addPage = function(name, text) {
		var page = $('<div class="h5_page section">');

		if (name != undefined) {
			page.addClass('h5_page_' + name);
		}
		if (text != undefined) {
			page.text(text);
		}
		this.el.append(page);
		this.page.push(page);
		if (typeof this.whenAddPage === 'function') {
			this.whenAddPage();
		}
		return this;
	};

	/* 新增一个组件 */
	this.addComponent = function(name, cfg) {
		var cfg = cfg || {};
		cfg = $.extend({
			type: 'base'
		}, cfg);

		var component; //定义一个变量，存储 组件元素
		var page = this.page.slice(-1)[0];

		switch (cfg.type) {
			case 'base':
				component = new H5ComponentBase(name, cfg);
				break;

			case 'polyline':
				component = new H5ComponentPolyline(name, cfg);
				break;

			case 'pie':
				component = new H5ComponentPie(name, cfg);
				break;

			case 'bar':
				component = new H5ComponentBar(name, cfg);
				break;

			case 'bar_v':
				component = new H5ComponentBar_v(name, cfg);
				break;

			case 'radar':
				component = new H5ComponentRadar(name, cfg);
				break;

			case 'ring':
				component = new H5ComponentRing(name, cfg);
				break;

			case 'point':
				component = new H5ComponentPoint(name, cfg);
				break;
			default:
		}
		page.append(component);
		return this;
	};
	/* H5对象初始化呈现 */
	this.loader = function(firstPage) {
		this.el.fullpage({
			onLeave: function(index, nextIndex, direction) {
				$(this).find('.h5_component').trigger('onLeave');
			},
			afterLoad: function(anchorLink, index) {
				$(this).find('.h5_component').trigger('onLoad');
			}
		});
		this.page[0].find('.h5_component').trigger('onLoad');
		this.el.show();
		if (firstPage) {
			$.fn.fullpage.moveTo(firstPage);
		}
	};
	this.loader = typeof H5_loading == 'function' ? H5_loading : this.loader;
	return this;
};var H5_loading = function(images, firstPage) {
	var id = this.id;

	if (this._images === undefined) { //第一次进入

		this._images = (images || []).length;
		this._loaded = 0;

		window[id] = this; //把当前对象存储在全局对象 window 中, 用来进行某个图片加载完成之后的回调

		for (s in images) {
			var item = images[s];
			var img = new Image();
			img.onload = function() {
				window[id].loader();
			}
			img.src = item;
		}

		$('#rate').text('0%');
		return this;

	} else {
		this._loaded++;
		$('#rate').text(((this._loaded / this._images * 100) >> 0) + '%');
		if (this._loaded < this._images) {
			return this;
		}
	}
	window[id] = null;

	this.el.fullpage({
		onLeave: function(index, nextIndex, derection) {
			$(this).find('.h5_component').trigger('onLeave');
		},
		afterLoad: function(anchorLink, index) {
			$(this).find('.h5_component').trigger('onLoad');
		}

	});
	this.page[0].find('.h5_component').trigger('onload');
	this.el.show();
	if (firstPage) {
		$.fn.fullpage.moveTo(firstPage);
	}

}/* 柱图组件对象 */

var H5ComponentBar = function ( name, cfg ) {
    var component = new H5ComponentBase( name, cfg );

    $.each(cfg.data, function(idx, item){

        var line = $('<div class="line">');
        var name = $('<div class="name">');
        var rate = $('<div class="rate">');
        var per = $('<div class="per">');

        var width = item[1]*100 + '%';
        var bgStyle = '';
        if(item[2]) {
            var bgstyle = 'style="background-color:' + item[2] + '"';
        }
        rate.html('<div class="bg" ' + bgstyle + '></div>');
        rate.css('width', width);

        name.text(item[0]);

        per.text(width);

        line.append( name ).append(rate).append(per);

        component.append(line);

    });

    return component;
}/* 垂直柱图组件对象 */

var H5ComponentBar_v = function(name, cfg) {
	var component = new H5ComponentBar(name, cfg);

	var width = (100 / cfg.data.length) >> 0;
	component.find('.line').width(width + '%');

	$.each(component.find('.rate'), function() {
		var w = $(this).css('width');
		$(this).height(w).width('');

	});

	$.each(component.find('.per'), function() {
		$(this).appendTo($(this).prev());
	})

	return component;
}/* 基本图文组件对象 */

var H5ComponentBase = function(name, cfg) {
	var cfg = cfg || {};
	var id = ('h5_c_' + Math.random()).replace('.', '_');

	// 把当前的组建类型添加到样式中进行标记
	var clsName = ' h5_component_' + cfg.type;
	var component = $('<div class="h5_component' + clsName + ' h5_component_name_' + name + '" id="' + id + '">');

	/*
	 * 语法解析
	 * 如果 && 左边为 true 则赋值 && 右边的值给左边，否则等于它本身
	 * 如：cfg.text && component.text(cfg.text);
	 * 如果 cfg.text 为 true 则把 component.text(cfg.text)；赋值给 cfg.text
	 * 如果 cfg.text 为 false 不再往后运行, cfg.text 等于它本身
	 */
	cfg.text && component.text(cfg.text);
	cfg.width && component.width(cfg.width / 2);
	cfg.height && component.height(cfg.height / 2);

	cfg.css && component.css(cfg.css);
	cfg.bg && component.css('backgroundImage', 'url(' + cfg.bg + ')');

	if (cfg.center === true) {
		component.css({
			marginLeft: (cfg.width / 4 * -1) + 'px',
			left: '50%'
		})
	}

	//  点击事件
	if (typeof cfg.onclick === 'function') {
		component.on('click', cfg.onclick);
	}

	//显示
	component.on('onLoad', function() {
		setTimeout(function() {
			component.addClass(clsName + '_load').removeClass(clsName + '_leave');
			cfg.animateIn && component.animate(cfg.animateIn);
		}, cfg.delay || 0);
		return false;
	});

	//隐藏
	component.on('onLeave', function() {
		setTimeout(function() {
			component.addClass(clsName + '_leave').removeClass(clsName + '_load');
			cfg.animateOut && component.animate(cfg.animateOut);
		}, cfg.delay || 0);

		return false;
	});

	return component;
}/* 饼图组件对象 */

var H5ComponentPie = function(name, cfg) {
	var component = new H5ComponentBase(name, cfg);

	//绘制网格线 - 背景层
	var w = cfg.width;
	var h = cfg.height;

	//加入一个画布（网格线背景）
	var cns = document.createElement('canvas');
	var ctx = cns.getContext('2d');
	cns.width = ctx.width = w;
	cns.height = ctx.height = h;
	$(cns).css('zIndex', 1);
	component.append(cns);

	var r = w / 2;

	//加入一个地图层
	ctx.beginPath();
	ctx.fillStyle = '#eee';
	ctx.strokeStyle = '#eee';
	ctx.lineWidth = 1;
	ctx.arc(r, r, r, 0, 2 * Math.PI);
	ctx.fill();
	ctx.stroke();

	//绘制一个数据层
	var cns = document.createElement('canvas');
	var ctx = cns.getContext('2d');
	cns.width = ctx.width = w;
	cns.height = ctx.height = h;
	$(cns).css('zIndex', 2);
	component.append(cns);

	var colors = ['red', 'green', 'blue', '#a00', 'orange']; //备用颜色
	var sAngel = 1.5 * Math.PI; //设置开始的角度在12点位置
	var eAngel = 0;
	var aAngel = Math.PI * 2; //100%的圆结束的角度 2pi = 360

	var step = cfg.data.length;
	for (var i = 0; i < step; i++) {
		var item = cfg.data[i];
		var color = item[2] || (item[2] = colors.pop());

		eAngel = sAngel + aAngel * item[1];

		ctx.beginPath();
		ctx.fillStyle = color;
		ctx.strokeStyle = color;
		ctx.lineWidth = .1;

		ctx.moveTo(r, r);
		ctx.arc(r, r, r, sAngel, eAngel);
		ctx.fill();
		ctx.stroke();
		sAngel = eAngel;

		//加入所有的项目文本以及百分比
		var text = $('<div class="text">');
		text.text(cfg.data[i][0]);

		var per = $('<div class="per">');
		per.text(cfg.data[i][1] * 100 + '%');
		text.append(per);

		var x = r + Math.sin(.5 * Math.PI - sAngel) * r;
		var y = r + Math.cos(.5 * Math.PI - sAngel) * r;

		if (x > w / 2) {
			text.css('left', x / 2);
		} else {
			text.css('right', (w - x) / 2);
		}

		if (y > h / 2) {
			text.css('top', y / 2);
		} else {
			text.css('bottom', (h - y) / 2);
		}

		if (cfg.data[i][2]) {
			text.css('color', cfg.data[i][2]);
		}

		text.css('opacity', 0);
		component.append(text);
	}


	//加入一个蒙版层
	var cns = document.createElement('canvas');
	var ctx = cns.getContext('2d');
	cns.width = ctx.width = w;
	cns.height = ctx.height = h;
	$(cns).css('zIndex', 3);
	component.append(cns);

	ctx.fillStyle = '#eee';
	ctx.strokeStyle = '#eee';
	ctx.lineWidth = 1;

	//生长动画
	var draw = function(per) {

		ctx.clearRect(0, 0, w, h);

		ctx.beginPath();

		ctx.moveTo(r, r);

		if (per <= 0) {
			ctx.arc(r, r, r, 0, 2 * Math.PI);
			component.find('.text').css('opacity', 1);

		} else {
			ctx.arc(r, r, r, sAngel, sAngel + 2 * Math.PI * per, true);

		}
		ctx.fill();
		ctx.stroke();

		if (per >= 1) {
			component.find('.text').css('transition', 'all 0s');
			H5ComponentPie.reSort(component.find('.text'));
			component.find('.text').css('transition', 'all 1s');
			component.find('.text').css('opacity', 1);
			ctx.clearRect(0, 0, w, h);
		}
	}

	draw(0);

	component.on('onLoad', function() {
		//饼图生长动画
		var s = 0;

		for (var i = 0; i < 100; i++) {
			setTimeout(function() {
				s += .01;
				draw(s);
			}, i * 10 + 500);
		}
	});
	component.on('onLeave', function() {
		//饼图退场动画
		var s = 1;

		for (var i = 0; i < 100; i++) {
			setTimeout(function() {
				s -= .01;
				draw(s);
			}, i * 10);
		}
	});

	return component;
}

//重排项目文本
H5ComponentPie.reSort = function(list) {

	//1.检测相交
	var compare = function(domA, domB) {

		var offsetA = $(domA).offset();
		var offsetB = $(domB).offset();

		//domA 的投影
		var shadowA_x = [offsetA.left, $(domA).width() + offsetA.left];
		var shadowA_y = [offsetA.top, $(domA).height() + offsetA.top];

		//domB 的投影
		var shadowB_x = [offsetB.left, $(domA).width() + offsetB.left];
		var shadowB_y = [offsetB.top, $(domA).height() + offsetB.top];

		//检测 x
		var intersect_x = (shadowA_x[0] > shadowB_x[0] && shadowA_x[0] < shadowB_x[1]) || (shadowA_x[1] > shadowB_x[0] && shadowA_x[1] < shadowB_x[1]);

		//检测 y
		var intersect_y = (shadowA_y[0] > shadowB_y[0] && shadowA_y[0] < shadowB_y[1]) || (shadowA_y[1] > shadowB_y[0] && shadowA_y[1] < shadowB_y[1]);

		return intersect_x && intersect_y;

	}

	//2.错开重排
	var reset = function(domA, domB) {
		if ($(domA).css('top') != 'auto') {

			$(domA).css('top', parseInt($(domA).css('top')) + $(domB).height());
		}
		if ($(domA).css('bottom') != 'auto') {

			$(domA).css('bottom', parseInt($(domA).css('bottom')) + $(domB).height());
		}
	}


	//  定义将要重排的元素
	var willReset = [list[0]];

	$.each(list, function(i, domTarget) {
		if (compare(willReset[willReset.length - 1], domTarget)) {
			willReset.push(domTarget); //  不会把自身加入到对比
		}
	});

	if (willReset.length > 1) {
		$.each(willReset, function(i, domA) {
			if (willReset[i + 1]) {
				reset(domA, willReset[i + 1]);
			}
		});
		H5ComponentPie.reSort(willReset);
	}
}/* 散点图表组件对象 */

var H5ComponentPoint = function ( name, cfg ) {
    var component = new H5ComponentBase( name, cfg );

    var base = cfg.data[0][1];

    $.each( cfg.data, function(idx, item){
        var point = $('<div class="point point_' + idx + '">');

        var name = $('<div class="name">'+item[0]+'</div>');
        var rate = $('<div class="per">'+(item[1]*100)+'%</div>');

        name.append(rate);
        point.append(name);
        var per = (item[1]/base*100) + '%';
        point.width(per).height(per);

        if(item[2]) {
            point.css('background-color', item[2]);
        }

        if(item[3] !== undefined && item[4] !== undefined) {
            point.css('left', item[3]).css('top', item[4]);
        }
        component.append(point);
    });


    return component;
}
/* 柱图组件对象 */

var H5ComponentPolyline = function ( name, cfg ) {
    var component = new H5ComponentBase( name, cfg );

    //绘制网格线 - 背景层
    var w = cfg.width;
    var h = cfg.height;

    //加入一个画布（网格线背景）
    var cns = document.createElement('canvas');
    var ctx = cns.getContext('2d');
    cns.width = ctx.width = w;
    cns.height = ctx.height = h;
    component.append(cns);

    // 水平网格线
    var step = 10;
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#aaaaaa";

    window.ctx = ctx;

    for(var i = 0; i < step + 1; i++ ) {
        var y = (h/step) * i;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
    }

    //垂直网格线（根据项目的个数分）
    step = cfg.data.length+1;
    var text_w = w/step >> 0;

    for(var i = 0; i < step+1; i++ ) {
        var x = (w/step) * i;

        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);

        if(cfg.data[i]) {
            var text = $('<div class="text">');
            text.text(cfg.data[i][0]);
            text.css('width', text_w/2).css('left', (x/2 + text_w/4));


            component.append(text);
        }
    }

    ctx.stroke();

    // 加入画布 - 数据层
    var cns = document.createElement('canvas');
    var ctx = cns.getContext('2d');
    cns.width = ctx.width = w;
    cns.height = ctx.height = h;
    component.append(cns);


    /*
    *   绘制折线以及对于数据和阴影
    *   @param {floot} per 0到1之间的数据,会根据这个值绘制最终数据对于的中间状态
    *   @return {DOM} component元素
    *
    */
    var draw = function(per) {
        // 清空画布
        ctx.clearRect(0,0,w,h);

        // 绘制折线数据
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#ff8878";

        var x= 0;
        var y= 0;

        var row_w = ( w / (cfg.data.length + 1 ));
        // 画点
        for(i in cfg.data) {
            var item = cfg.data[i];

            x = row_w * i + row_w;
            y = h-(item[1]*h*per);

            ctx.moveTo(x, y);
            ctx.arc(x, y, 5, 0, 2*Math.PI);

        }

        //连线
        //移动画笔到第一个点位置
        ctx.moveTo(row_w , h-(cfg.data[0][1]*h*per));
        for (i in cfg.data) {
            var item = cfg.data[i];

            x = row_w * i + row_w;
            y = h-(item[1]*h*per);

            ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0)';
        ctx.lineWidth = 1;

        //绘制阴影
        ctx.lineTo(x, h);
        ctx.lineTo(row_w, h);
        ctx.fillStyle = 'rgba(255, 136, 120, .2)';
        ctx.fill();

        //写数据
        for(i in cfg.data) {
            var item = cfg.data[i];

            x = row_w * i + row_w;
            y = h-(item[1]*h*per);

            ctx.fillStyle = item[2] ? item[2] : '#595959';

            ctx.fillText(((item[1]*100) >> 0) +'%', x-10, y-10);
        }

        ctx.stroke();
    }

    component.on('onLoad', function(){
        //折线图生长动画
        var s = 0;

        for(var i=0; i<100; i++) {
            setTimeout(function() {
                s+=.01;
                draw(s);
            }, i*10+500);
        }
    });
    component.on('onLeave', function(){
        //折线图退场动画
        var s = 1;

        for(var i=0; i<100; i++) {
            setTimeout(function() {
                s-=.01;
                draw(s);
            }, i*10);
        }
    });

    return component;
}/* 雷达图组件对象 */

var H5ComponentRadar = function ( name, cfg ) {
    var component = new H5ComponentBase( name, cfg );

    //绘制网格线 - 背景层
    var w = cfg.width;
    var h = cfg.height;

    //加入一个画布（网格线背景）
    var cns = document.createElement('canvas');
    var ctx = cns.getContext('2d');
    cns.width = ctx.width = w;
    cns.height = ctx.height = h;
    component.append(cns);

    var r = w/2;
    var step = cfg.data.length;

    //计算一个圆周上的坐标 （计算多边形的顶点坐标）
    //已知: 圆心坐标（a,b）、半径 r、 角度 deg
    //弧度 rad = (2 * Math.PI / 360) * (360 / step) * i
    // x = a + Math.sin(rad)*r
    // y = b + Math.cos(rad)*r

    //绘制网格背景 (分面绘制，分为10份)
    var isBlue = false;
    for (var s = 10; s > 0; s--) {
        ctx.beginPath();
        for(var i=0; i<step; i++) {
            var rad = (2 * Math.PI / 360) * (360 / step) * i;
            var x = r + Math.sin(rad) * r * (s/10);
            var y = r + Math.cos(rad) * r * (s/10);

            //ctx.arc(x, y, 5, 0, 2*Math.PI);

            ctx.lineTo(x,y)
        }
        ctx.closePath();
        ctx.fillStyle = (isBlue = !isBlue) ? '#99c0ff' : '#f1f9ff';
        ctx.fill();
    }


    //绘制伞骨
    for(var i=0; i<step; i++) {
        var rad = (2 * Math.PI / 360) * (360 / step) * i;
        var x = r + Math.sin(rad) * r;
        var y = r + Math.cos(rad) * r;
        ctx.moveTo(r,r);
        ctx.lineTo(x,y);

        //输出项目文字
        var text = $('<div class="text">');
        text.text(cfg.data[i][0]);
        text.css('transition', 'all .5s '+ i*.1 + 's');

        if(x > w/2) {
            text.css('left', x/2 + 5);
        }else{
            text.css('right', (w-x)/2 + 5);
        }

        if(y > h/2) {
            text.css('top', y/2 + 5);
        }else{
            text.css('bottom', (h-y)/2 + 5);
        }

        if(cfg.data[i][2]) {
            text.css('color', cfg.data[i][2]);
        }
        text.css('opacity', 0);
        component.append(text);
    }
    ctx.strokeStyle = '#e0e0e0';
    ctx.stroke();


    //数据层的开发
    //加入一个画布（数据层）
    var cns = document.createElement('canvas');
    var ctx = cns.getContext('2d');
    cns.width = ctx.width = w;
    cns.height = ctx.height = h;
    component.append(cns);
    ctx.strokeStyle = '#f00';

    var draw = function(per) {
        if(per <=1 ) {
            component.find('.text').css('opacity', 0);
        }
        if(per >=1 ) {
            component.find('.text').css('opacity', 1);
        }
        ctx.clearRect(0,0,w,h);

        //输出数据的折线
        for(var i=0; i<step; i++) {
            var rad = (2 * Math.PI / 360) * (360 / step) * i;
            var rate = cfg.data[i][1] * per;

            var x = r + Math.sin(rad) * r * rate;
            var y = r + Math.cos(rad) * r * rate;

             ctx.lineTo(x,y);
        }
        ctx.closePath();
        ctx.stroke();

        //输出数据的点
        ctx.fillStyle = '#ff7676';
        for(var i=0; i<step; i++) {
            var rad = (2 * Math.PI / 360) * (360 / step) * i;
            var rate = cfg.data[i][1] * per;

            var x = r + Math.sin(rad) * r * rate;
            var y = r + Math.cos(rad) * r * rate;

            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2*Math.PI);
            ctx.fill();
            ctx.closePath();

        }

    }

    component.on('onLoad', function(){
        //雷达图生长动画
        var s = 0;

        for(var i=0; i<100; i++) {
            setTimeout(function() {
                s+=.01;
                draw(s);
            }, i*10+500);
        }
    });
    component.on('onLeave', function(){
        //雷达图退场动画
        var s = 1;

        for(var i=0; i<100; i++) {
            setTimeout(function() {
                s-=.01;
                draw(s);
            }, i*10);
        }
    });

    return component;
}/* 环图组件对象 */

var H5ComponentRing = function(name, cfg) {
	cfg.type = 'pie';
	if (cfg.data.length > 1) { //  环图应该只有一个数据
		cfg.data = [cfg.data[0]];
	}
	var component = new H5ComponentPie(name, cfg);

	var mask = $('<div class="mask">');
	component.addClass('h5_component_ring');

	component.append(mask);

	var text = component.find('.text');

	text.attr('style', '');
	if (cfg.data[0][2]) {
		text.css('color', cfg.data[0][2]);
	}
	mask.append(text);

	return component;
}