/* 基本图文组件对象 */

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
}