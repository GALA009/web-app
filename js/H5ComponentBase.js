/* 基本图文组件对象 */

var H5ComponentBase = function (name, cfg) {
    var cfg = cfg || {};
    var id = ( 'h5_c_' + Math.random()).replace('.','_');

    var clsName =  ' h5_component_' + cfg.type;
    var component = $('<div class="h5_component' + clsName +' h5_component_name_' + name + '" id="' + id + '">');

    cfg.text    && component.text(cfg.text);
    cfg.width   && component.width(cfg.width/2);
    cfg.height  && component.height(cfg.height/2);

    cfg.css && component.css( cfg.css );
    cfg.bg && component.css('backgroundImage', 'url(' + cfg.bg + ')');
    cfg.relativeTo && component.css({
        position: 'absolute',
        top: cfg.relativeTo + 'px'
    } );

    if( cfg.center === true) {
        component.css({
            marginLeft : ( cfg.width/4 * -1) + 'px',
            left : '50%'
        })
    }

    //  自定义参数
    if ( typeof cfg.onclick === 'function') {
        component.on('click', cfg.onclick);
    }



    //显示
    component.on('onLoad', function () {
        setTimeout(function(){
            component.addClass(clsName + '_load').removeClass(clsName + '_leave');
            cfg.animateIn && component.animate(cfg.animateIn);
        }, cfg.delay || 0)
        return false;
    });
    //隐藏
    component.on('onLeave', function () {
        setTimeout(function(){
            component.addClass(clsName + '_leave').removeClass(clsName + '_load');
            cfg.animateOut && component.animate(cfg.animateOut);
        }, cfg.delay || 0)

        return false;
    });


    return component;
}