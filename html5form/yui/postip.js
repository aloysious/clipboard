/**
 *相对定位提示信息，浮动层提示,支持表单提交html5form组件<br/>
 *相对提示构造器，通过new Y.Postip来render一个tip，可以使用Y.Postip定制tip出现方式、tip内容、tip定位等<br/>
 *使用new Y.Postip(options);<br/>
 *@module postip
 *@class Y.Postip
 *@constructor
 *@param {string|nodes|node} id 定位具体载体,参数形式如'.J-tip',Y.all('.J-tip'),Y.one('.J-tip')
 *@param {object} config 初始配置项
 *<ul>
 *<li>pos.h:(string) 相对提示的水平对齐方式，默认 left，(oleft,left,center,right,oright,正负数值可选)</li>
 *<li>pos.v:(string) 相对提示的垂直对齐方式，默认 top，(otop,top,middle,bottom,obottom,正负数值可选)</li>
 *<li>classname:(string) 相对弹出层样式设置，默认为 .postip</li>
 *<li>content:(string) 相对弹出层内容设置，如未填或为空时，内容为触发层rel值，可以是innerHTML</li>
 *<li>otip:(object) 默认js会构建一个tip，指定otip对象后，tip为otip对象</li>
 *</ul>
 */
YUI.namespace('Y.FormPostip');
YUI.add('form-postip',function(Y){
	Y.FormPostip = function(){
		this.init.apply(this,arguments);
		Y.FormPostip._instances[Y.stamp(this)] = this;
	};
	Y.FormPostip._instances = {};
	/**
	 * 重新定位所有提示框
	 * @method reposAllTip
	 */
	Y.FormPostip.reposAllTip = function() {
		Y.Object.each(Y.FormPostip._instances, function(item) {
			if (item.get('show')) {
				item.reposTip();
			}
		});
	};
	
	Y.mix(Y.FormPostip,{
		init:function(config){
			var that = this;
			that.relElem = null;
			that.config = config;
			that.isShow = false;
			//渲染弹出框
			that.render();
			//构造弹出框
			that.buildTip();
			that.bindEvent();
			return this;
		},
		buildTip:function(){
			var that = this;
			if(that.oTip)return;
			if(typeof that.Tip == 'undifined' || that.Tip == null){
				var tip = Y.Node.create('<div class="J-tip" style="visibility:hidden;display:inline-block;position:absolute;z-index:1000;top:0"><div class="J-tipbox '+that.oTipclass+'">'+that.content+'</div></div>');
				Y.one('body').appendChild(tip);
				that.oTip = tip;
			}else if(typeof that.Tip == 'object'){
				that.oTip = that.Tip;
			}
			//IE6以下隐藏干扰层
			if(/6/i.test(Y.UA.ie)){
				that.mark = Y.Node.create('<iframe frameborder="0" src="javascript:false" style="background:transparent;position:absolute;border:none;top:0;left:0;padding:0;margin:0;z-index:-1;filter:alpha(opacity=0);"></iframe>');
				that.mark.setStyles({
					'width':that.oTip.get('region').width+'px',
					'height':that.oTip.get('region').height+'px'
				});
				that.oTip.appendChild(that.mark);
			}
			return this;
		},
		/**
		 *构造配置项，在init的时候调用
		 *@method buildParam
		 *@return this
		 */
		buildParam:function(o){
			var that = this;
			//基本参数
			var o = (typeof o == 'undefined' || o == null)?{}:o;

			//鼠标事件类型
			that.eventype = (typeof o.eventype=='undifined' || o.eventype==null)?'mouseover':o.eventype;
			that.mouseout = (typeof o.mouseout=='undifined' || o.mouseout==null)?true:false;
			//设置Tip对齐方式
			that.pos = (typeof o.pos == 'undefined' || o.pos == null)?{}:o;
			if(o.pos){
				//如果为数值时即为自定义位置
				that.pos.hAlign = (typeof o.pos.h=='undifined' || o.pos.h==null)?'left':o.pos.h;
				that.pos.vAlign = (typeof o.pos.v=='undifined' || o.pos.v==null)?'bottom':o.pos.v;
			}
			that.oTipclass = (typeof o.classname=='undifined' || o.classname==null)?'postip':o.classname;
			that.content = (typeof o.content=='undifined' || o.content==null) ? '' : o.content;
			that.Tip = o.otip;
			return this;
		},
		/**
		 *渲染，init在new的时候调用，render可以在运行时任意时刻调用，参数为options，其成员可覆盖原参数
		 *@method render
		 *@param {object} o 同构造函数配置项config
		 *@return this
		 */
		render:function(o){
			var that = this;
			that.parseParam(o);
			return this;
		},
		/**
		 *绑定事件，包括浏览器重设大小，点击气泡阻止事件
		 *@method bindEvent 
		 *@return this
		 */
		bindEvent:function(){
			var that = this;
			that.resizeEvent = Y.on('resize', function(e){
				that.reposTip();
			},window);	
			that.oTip.on('click',function(e){
				e.stopPropagation();
			});
			return this;
		},
		//过滤参数列表
		parseParam:function(o){
			var that = this;
			if(typeof o == 'undefined' || o == null){
				var o = {};
			}
			for(var i in o){
				that.config[i] = o[i];
			}
			that.buildParam(that.config);
			return this;
		}, 
		/**
		 *渲染，提示UI确定显示定位
		 *@method rendTipUI
		 *@param {node} el 相对定位节点
		 *@param {string} tipcon 获取定位显示内容		 
		 *@return this
		 */
		rendTipUI:function(el,con){
			this.oTip.one('.J-tipbox').set('innerHTML',con);
			this.posTip(el);
			this.relElem = el;
			if(/6/i.test(Y.UA.ie)){
				this.mark.setStyle('height',this.oTip.get('clientHeight') + 'px');
				this.mark.setStyle('width',this.oTip.get('clientWidth') + 'px');
			}
			this.show();
			return this;
		},
		/**
		 *重新定位相对弹出层，参数为触发对象
		 *@method posTip
		 *@param {object} o 同构造函数config配置
		 *@return this
		 */
		posTip:function(o){
			var	that = this
			var _left,_top;	  
			_left = that.getLeft(that.pos.hAlign,o,that.oTip);
			_top = that.getTop(that.pos.vAlign,o,that.oTip);						
			that.oTip.setStyles({
				'left':_left+'px',
				'top':_top+'px'
			});
			//IE6下隐藏干扰物并定位iframe
			return this;
		},
		/**
		 * 重新定位提示框
		 * @method reposTip
		 * @return this
		 */
		reposTip: function() {
			var that = this;
			if (that.relElem) {
				that.posTip(that.relElem);
			}
			return this;
		},

		/**
		 *获得相对提示层相对于触发层的左边距，参数为(pos.h,触发层,相对提示层)
		 *@method getLeft
		 *@param {string} a 定位相对水平方向pos.h如：'oleft','left','center','right','oright'
		 *@param {object} o 触发层
		 *@param {object} e 相对提示层
		 *@return this
		 */
		getLeft:function(a,o,e){
			var that = this,
				cget = o.get('region'),
				eget = e.get('region');
			//如果为数值
			if(!isNaN(parseInt(Number(a)))){
				return cget[0] + Number(a);
			}else{
				switch(a){
					case 'oleft': 
						return cget[0] - eget.width;
					case 'oright':
						return cget[0] + cget.width;
					case 'center':
						return cget[0] + (cget.width - eget.width)/2;
					case 'right':
						return cget[0] + cget.width - eget.width;
					default:
						return cget[0];				
				}
			}
			return this;
		},
		/**
		 *获得相对提示层相对于触发层的顶边距，参数为(pos.v,触发层,相对提示层)
		 *@method getTop
		 *@param {string} a 定位相对垂直方向pos.v如：'otop','top','middle','bottom','obottom'
		 *@param {object} o 触发层
		 *@param {object} e 相对提示层
		 *@return this
		 */
		getTop:function(a,o,e){
			var that = this,
				cget = o.get('region'),
				eget = e.get('region');
			if(!isNaN(parseInt(Number(a)))){
				return cget[1] + Number(a);
			}else{
				switch(a){
					case 'otop': 
						return cget[1] - eget.height;
					case 'obottom':
						return cget[1] + cget.height;
					case 'middle':
						return cget[1] + (cget.height - eget.height)/2;
					case 'bottom':
						return cget[1] + cget.height - eget.height;
					default:
						return cget[1];				
				}
			}
			return this;
		},
		/**
		 *控制弹出框显示
		 *@method show
		 *@return this
		 */
		show:function(){
			var that = this;
			if(that.oTip.getStyle('visibility') == 'visible')return;
			that.oTip.setStyle('visibility','visible');
			return this;
		},
		/**
		 *控制弹出框隐藏
		 *@method hide
		 *@return this
		 */
		hide:function(){
			var that = this;
			if(that.oTip.getStyle('visibility') == 'visible'){
				that.oTip.setStyle('visibility','hidden');	
			};
			return this;
		},
		/**
		 * 判断是否当前显示
		 * @method get
		 * @param {String} attr show
		 * @return {Boolean}
		 */
		get:function(attr){
			if(attr == 'show'){
				return this.oTip.getStyle('visibility') == 'visible'; 
			}
			return null;
		},
		/**
		 * 从_instances对象里删除实例
		 * @method destroy
		 */
		destroy: function() {
			delete Y.FormPostip._instances[Y.stamp(this)];
			this.oTip.remove(true);
			this.resizeEvent.detach();
		}
		
	},0,null,4);

	//Y.FormPostip = FormPostip;
	
},'',{requires:['node']});
