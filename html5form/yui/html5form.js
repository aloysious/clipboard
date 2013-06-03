/**
 * html5form
 */
YUI.add('html5form', function(Y) {
	
	var Lang = Y.Lang,
		YArray = Y.Array;
	
	function HTML5Form() {
		HTML5Form.superclass.constructor.apply(this, arguments);
	}
	
	HTML5Form.NAME = 'html5form';
	
	HTML5Form.ATTRS = {
		/**
		 * 包含表单元素的节点（表单元素不一定在form里面）
		 * @attribute srcNode
		 * @type {Node}
		 */
		srcNode: {
			setter: Y.one,
			value: null
		},
		/**
		 * 表单
		 * @attribute formNode
		 * @type {Node}
		 */
		formNode: {
			setter: Y.one,
			value: null
		},
		/**
		 * 表单元素
		 * @attribute fieldElems
		 * @type {Node}
		 */
		fieldElems: {
			value: null
		},
		/**
		 * 提交按钮（可多个）
		 * @attribute submitNode
		 * @type {NodeList}
		 */
		submitNode: {
			setter: function(v) {
				var r = v;
				if (Lang.isString(v)) {
					r = Y.one(v);
				}
				if (r && !Y.instanceOf(r, Y.NodeList)) {
					r = new Y.NodeList([r]);
				}
				return r;
			},
			value: null
		},
		/**
		 * 全局错误提示Tip
		 * @attribute errorTip
		 * @type {Object}
		 */
		errorTip: {
			value: null
		},
		/**
		 * 错误提示Tip定位
		 * @attribute errorTip
		 * @type {Object}
		 */
		errorTipPos: {
			value: {
				v: 'middle',
				h: 'oright'
			}
		},
		/**
		 * 多提示（每个表单元素都拥有自己的错误提示Tip）
		 * @attribute multiErrorTip
		 * @type {Boolean}
		 */
		multiErrorTip: {
			value: true
		},
		/**
		 * 自动渲染
		 * @attribute render
		 * @type {Boolean}
		 */
		render: {
			value: false
		}
	};
	
	/**
	 * 表单元素新属性的set方法
	 */
	function DEFAULT_SETTER(val, attr) {
		var node = this._stateProxy;
		node[attr] = val;
		return val;
	};
	
	/**
	 * 表单元素新属性的get方法
	 */
	function DEFAULT_GETTER(attr) {
		var node = this._stateProxy;
		return node[attr];
	};
	
	/**
	 * 添加Node的属性
	 */
	Y.mix(Y.Node.ATTRS, {
		/**
		 * 自定义校验函数
		 * @attribute validFn
		 * @type {Function}
		 */
		validFn: {
			setter: DEFAULT_SETTER,
			getter: function() {
				return DEFAULT_GETTER.call(this, 'validFn');
			}
		},
		/**
		 * 表单元素校验回调函数
		 * @attribute afterValidate
		 * @type {Function}
		 */
		afterValidate: {
			setter: DEFAULT_SETTER,
			getter: function() {
				return DEFAULT_GETTER.call(this, 'afterValidate');
			}
		},
		/**
		 * 切换错误前回调函数
		 * @attribute beforeToggleError
		 * @type {Function}
		 */
		beforeToggleError: {
			setter: DEFAULT_SETTER,
			getter: function() {
				return DEFAULT_GETTER.call(this, 'beforeToggleError');
			}
		},
		/**
		 * 切换错误后回调函数
		 * @attribute afterToggleError
		 * @type {Function}
		 */
		afterToggleError: {
			setter: DEFAULT_SETTER,
			getter: function() {
				return DEFAULT_GETTER.call(this, 'afterToggleError');
			}
		},
		/**
		 * 错误提示Tip，instance of Y.FormPostip
		 * @attribute errorTip
		 * @type {Object}
		 */
		errorTip: {
			setter: DEFAULT_SETTER,
			getter: function() {
				return DEFAULT_GETTER.call(this, 'errorTip');
			}
		},
		/**
		 * 是否有提示Tip
		 * @attribute hasTip
		 * @type {Boolean}
		 */
		hasTip: {
			setter: DEFAULT_SETTER,
			getter: function() {
				var node = this._stateProxy;
				return node['hasTip'] === false ? false : true;
			}
		},
		/**
		 * 错误提示Tip定位
		 * @attribute errorTip
		 * @type {Object}
		 */
		errorTipPos: {
			setter: DEFAULT_SETTER,
			getter: function() {
				return DEFAULT_GETTER.call(this, 'errorTipPos');
			}
		},
		/**
		 * 错误提示模板
		 * @attribute errorTextTemplate
		 * @type {Object}
		 */
		errorTextTemplate: {
			setter: DEFAULT_SETTER,
			getter: function() {
				return DEFAULT_GETTER.call(this, 'errorTextTemplate');
			}
		},
		/**
		 * 错误提示Tip定位元素
		 * @attribute tipAlignNode
		 * @type {Node}
		 */
		tipAlignNode: {
			setter: function(val, attr) {
				var node = this._stateProxy;
				node[attr] = Y.one(val) || this;
				return node[attr];
			},
			getter: function() {
				var node = this._stateProxy;
				return node['tipAlignNode'] || this;
			}
		}
	});
	
	/**
	 * 是否是有效的表单元素（除button与submit外）
	 * Y.Node.isFormElem
	 */
	Y.Node.addMethod('isFormElem', function() {
		var tagName = this.get('tagName').toUpperCase(),
			type = this.getAttribute('type');
			
		return (tagName === 'INPUT' && type !== 'button' && type !== 'submit') || tagName === 'SELECT' || tagName === 'TEXTAREA';
	});
	
	/**
	 * 获取去除两端空格的value值
	 * Y.Node.getValue
	 */
	Y.Node.addMethod('getValue', function() {
		if (this.isFormElem()) {
			return Lang.trim(this.get('value'));
		}
		
		return this.get('value');
	});
	
	/**
	 * 错误信息模板
	 */
	HTML5Form.ERROR_TEXT_TEMPLATE = '<b class="left"></b><p class="error">{ERROR_TEXT}</p>';
	
	/**
	 * 校验正则（包括type与pattern）
	 */
	HTML5Form.RX = {
		email: /^[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
		url: /((https?|ftp|gopher|telnet|file|notes|ms-help):((\/\/)|(\\\\))+[\w\d:#@%/;$()~_?\+-=\\\.&]*)/i,
		// **TODO: password
		phone: /([\+][0-9]{1,3}([ \.\-])?)?([\(]{1}[0-9]{3}[\)])?([0-9A-Z \.\-]{1,32})((x|ext|extension)?[0-9]{1,4}?)/,
		number: /^\d+$/,
		money: /^\d+(\.)?(\d+)?$/,
		// Date in ISO format. Credit: bassistance
		dateISO: /\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/,
		date: /\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/,
		alpha: /[a-zA-Z]+/,
		alphaNumeric: /\w+/,
		integer: /^\d+$/
	};
	
	/**
	 * 错误信息
	 */
	HTML5Form.ErrInfo = {
		email:"邮件输入格式错误",
		url:"url输入格式错误",
		required:"请输入必填内容",
		money:"请输入正确的价格",
		date: "请输入正确日期",
		min:"超出最小值",
		max:"超出最大值",
		number:"请输入正确数字",
		integer: '请输入正确整数'
	};
	
	/**
	 * 格式化方法
	 */
	HTML5Form.Format = {
		/**
		 * date日期格式;如：2011-11-11
		 * @method date
		 * @param d {Date}
		 * @return {string} 日期格式
		 * @static
		 */
		date: function(d) {
			return d.getFullYear() + '-' + (d.getMonth() < 9 ? ('0' + (d.getMonth() + 1)) : (d.getMonth() + 1)) + '-' + (d.getDate() < 10 ? ('0' + d.getDate()) : d.getDate());
		},
		/**
		 * TODO!
		 * week日期格式
		 * @method week
		 * @param d {Date}
		 * @return {string} 星期格式
		 * @static
		 */
		week: function(d) {
			var w = d;
			return w;
		}
	};
	
	/**
	 * 校验方法
	 */
	HTML5Form.Validator = {
		/**
		 * 内容是否为空
		 * @method required
		 * @param el {Node} 表单元素
		 * @return {Boolean}
		 * @static
		 */
		required: function(el) {
			var hasRequired = el.hasAttribute('required'),
				isPlaceholder = HTML5Form.Validator.isPlaceholder(el),
				v = el.getValue(),
				isValid = hasRequired ? (v !== '' && !isPlaceholder) : true;
			
			if (!isValid) {
				el.setAttribute('errorinfo', el.getAttribute('requiredinfo') || HTML5Form.ErrInfo['required'] || '');
				el.setAttribute('errortype', 'required');
			}
			
			return isValid;
		},
		/**
		 * 是否匹配正则
		 * @method pattern
		 * @param el {Node} 表单元素
		 * @return {Boolean}
		 * @static
		 */
		pattern: function(el) {
			var v = el.getValue(),
				_p = el.getAttribute('pattern'),
				//可以为字符串
				p = (_p === '' || Lang.isUndefined(_p) || _p === null) ? false : new RegExp("^(?:" + _p + ")$"),
				isValid = (v !== '' && p) ? p.test(v) : true;
			
			if (!isValid) {
				el.setAttribute('errorinfo', el.getAttribute('patterninfo') || HTML5Form.ErrInfo[_p] || '');
				el.setAttribute('errortype', 'pattern');
			}
			
			return isValid;
		},
		/**
		 * 是否符合type的相应格式
		 * @method type
		 * @param el {Node} 表单元素
		 * @return {Boolean}
		 * @static
		 */
		type: function(el) {
			var v = el.getValue(),
				_tp = el.getAttribute('type'),
				tp = HTML5Form.RX[_tp],
				isValid = (v !== '' && tp) ? tp.test(v) : true;
			
			if (!isValid) {
				el.setAttribute('errorinfo', el.getAttribute('typeinfo') || HTML5Form.ErrInfo[_tp] || '');
				el.setAttribute('errortype', 'type');
			}
			
			return isValid;
		},
		/**
		 * 是否超出最大值
		 * @method max
		 * @param el {Node} 表单元素
		 * @return {Boolean}
		 * @static
		 */
		max: function(el) {
			var v = el.getValue(),
				type = el.getAttribute('type').toUpperCase(),
				max = parseFloat(el.getAttribute('max')),
				isValid = (v !== '' && (type === 'NUMBER' || type === 'MONEY') && Lang.isNumber(max)) ? (max >= parseFloat(v)) : true;
			
			if (!isValid) {
				el.setAttribute('errorinfo', el.getAttribute('maxinfo') || HTML5Form.ErrInfo['max'] || '');
				el.setAttribute('errortype', 'max');
			}
			
			return isValid;
		},
		/**
		 * 是否低于最小值
		 * @method min
		 * @param el {Node} 表单元素
		 * @return {Boolean}
		 * @static
		 */
		min: function(el) {
			var v = el.getValue(),
				type = el.getAttribute('type').toUpperCase(),
				min = parseFloat(el.getAttribute('min')),
				isValid = (v !== '' && type === 'NUMBER' && Lang.isNumber(min)) ? (min <= parseFloat(v)) : true;
			
			if (!isValid) {
				el.setAttribute('errorinfo', el.getAttribute('mininfo') || HTML5Form.ErrInfo['min'] || '');
				el.setAttribute('errortype', 'min');
			}
			
			return isValid;
		},
		/**
		 * 是否满足自定义校验函数
		 * @method validFn
		 * @param el {Node} 表单元素
		 * @return {Boolean}
		 * @static
		 */
		validFn: function(el) {
			var v = el.getValue(),
				validFn = el.get('validFn'),
				isValid = (v !== '' && validFn) ? validFn.call(this, el, HTML5Form) : true;
			
			if (!isValid) {
				el.setAttribute('errorinfo', el.getAttribute('custominfo') || '');
				el.setAttribute('errortype', 'custom');
			}
			
			return isValid;
		},
		/**
		 * 是否是占位符
		 * @method isPlaceholder
		 * @param el {Node} 表单元素
		 * @return {Boolean}
		 * @static
		 */
		isPlaceholder: function(el) {
			var v = el.getValue(),
				p = el.getAttribute('placeholder');
			
			return (Lang.isUndefined(p) || p === null || p === '') ? false : v === p;
		},
		/**
		 * 是否是合法身份证
		 * @method isIDCard
		 * @param el {Node} 表单元素
		 * @return {Boolean}
		 * @static
		 */
		isIDCard: function(el) {
			var v = el.getValue(),
				_v = v,
				re = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9xX])$/;
			
			if (v.length == 15) {
				v = v.slice(0, 6) + '19' + v.slice(6) + '1';
			}
			if (!v.match(re)) {
				return false;
			}
			
			//检查18位身份证的校验码是否正确
			//校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10
			if (_v.length == 18) {
				var valnum,
					arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2],
					arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'],
					nTemp = 0,
					i = 0;
				for (; i < 17; i++) {
					nTemp += v.substr(i, 1) * arrInt[i];
				}
				valnum = arrCh[nTemp % 11];
				if (valnum != v.substr(17, 1).toUpperCase()) {
					return false;
				}
			}
			return true;
		}
	};
	
	Y.extend(HTML5Form, Y.Base, {
		
		/**
		 * 初始化
		 * @method initializer
		 */
		initializer: function() {
            this.publish('beforeSubmit');
            this.publish('afterFormValidate');
            this.publish('beforeFormValidate');
			this.Events = [];
			if (this.get('render')) {
				this.render();
			}
		},
		
		/**
		 * 渲染
		 * @method render
		 * @return this
		 */
		render: function() {
			var that = this;
			
			that.renderUI();
			that.bindUI();
			that.syncUI();
			
			return this;
		},
		
		/**
		 * 渲染UI
		 * @method renderUI
		 * @return this
		 */
		renderUI: function() {
			var that = this,
				srcNode = that.get('srcNode');
			
			if (!that.get('formNode')) {
				that.set('formNode', srcNode);
			}
			if (!that.get('submitNode')) {
				that.set('submitNode', srcNode.all('input[type=submit],button[type=submit]'));
			}
			that._detachEvents();
			that._getFieldElems();
			if (!that.get('mutilErrorTip') && !that.get('errorTip')) {
				that.set('errorTip', new Y.FormPostip({
					pos: that.get('errorTipPos'),
					classname: 'yui3-html5form-errortip'
				}));
			}
		
			return this;
		},
		
		/**
		 * 获取可以校验的表单元素（不一定需要校验）
		 * @method _getFieldElems
		 * @return fieldElems {Array}
		 * @private
		 */
		_getFieldElems: function() {
			var that = this,
				srcNode = that.get('srcNode'),
				formElems = srcNode.all('input,select,textarea'),
				fieldElems = [];
			
			that.set('fieldElems', fieldElems);
			formElems.each(function(el) {
				var type = el.get('type').toUpperCase();
				if (type !== 'SUBMIT' && type !== 'BUTTON') {
					that.addFieldElem(el);
				}
			});
			
			return fieldElems;
		},
		
		/**
		 * 当参数为一组时，递归执行一个方法
		 * @method _batch
		 * @param {String} method 方法名
		 * @param el {Array | NodeList} 序号
		 * @private
		 */
		_batch: function(method, el) {
			var that = this, 
				bindArg = Array.prototype.slice.call(arguments, 2);
			
			if (Lang.isString(el) || el.nodeType) {
				that[method].apply(that, [Y.one(el)].concat(bindArg));
				return true;
			}
			
			if (Lang.isArray(el)) {
				for (var i = 0, l = el.length; i < l; i++) {
					that[method].apply(that, [Y.one(el[i])].concat(bindArg));
				}
				return true;
			}
			
			if (Y.instanceOf(el, Y.NodeList)) {
				el.each(function(node) {
					that[method].apply(that, [node].concat(bindArg));
				});
				return true;
			}
			
			return false;
		},
		
		/**
		 * 切换占位符
		 * @method togglePlaceholder
		 * @param el {Node}
		 * @param force {Boolean} 默认为true
		 */
		togglePlaceholder: function(el, force) {
			var that = this;
			if (that._batch('togglePlaceholder', el, force) === true) { return; }
			
			var	v = el.getValue(),
				p = el.getAttribute('placeholder'),
                _force = false;
			
            if (v === '') {
                _force = true;
            }
            if (Lang.isBoolean(force)) {
                _force = force;
            }
            if (_force) {
                that.addPlaceholder(el);
            } else {
                that.removePlaceholder(el);
            }
			
			return this;
		},
        
        addPlaceholder: function(el) {
            var that = this;
			if (that._batch('addPlaceholder', el) === true) { return; }

            var	v = el.getValue(),
				p = el.getAttribute('placeholder');
            
            if (p !== '' && !Lang.isUndefined(p) && p !== null && (v === '' || HTML5Form.Validator.isPlaceholder(el))) {
                el.addClass('yui3-html5form-placeholder');
                el.set('value', p);
            }
            
            return this;
        },
        
        removePlaceholder: function(el) {
            var that = this;
			if (that._batch('removePlaceholder', el) === true) { return; }
            
            var	v = el.getValue(),
				p = el.getAttribute('placeholder');
            
            if (p !== '' && !Lang.isUndefined(p) && p !== null && (v === '' || HTML5Form.Validator.isPlaceholder(el))) {
                el.set('value', '');
                el.removeClass('yui3-html5form-placeholder');
            }
            
            return this;
        },
		
		/**
		 * 设置表单元素的校验相关属性
		 * @method setElemAttr
		 * @param el {Node}
		 * @param key {String}
		 * @param val
		 */
		setElemAttr: function(el, key, val) {
			var that = this;
			
			if (that._batch('setElemAttr', el, key, val) === true) { return; }
			
			var isCheckbox = el.get('type') === 'checkbox',
				el = isCheckbox ? that._getCheckboxElems(el).item(0) : el;
			
			el.set(key, val);
			
			return this;
		},
		
		/**
		 * 设置表单元素的多个校验相关属性
		 * @method setElemAttrs
		 * @param el {Node}
		 * @param key {String}
		 * @param val
		 */
		setElemAttrs: function(el, attrs) {
			var that = this;
			
			if (that._batch('setElemAttrs', el, attrs) === true) { return; }
			
			if (attrs && Lang.isObject(attrs)) {
				Y.Object.each(attrs, function(val, key) {
					that.setElemAttr(el, key, val);
				});
			}
			
			return this;
		},
		
		/**
		 * 获取表单元素的相关属性
		 * @method getElemAttr
		 * @param el {Node}
		 * @param key {String}
		 * @return val
		 */
		getElemAttr: function(el, key) {
			var that = this;
			
			if (that._batch('getElemAttr', el, key) === true) { return; }
			
			var isCheckbox = el.get('type') === 'checkbox',
				el = isCheckbox ? that._getCheckboxElems(el).item(0) : el;
			
			return el.get(key);
		},
		
		/**
		 * 添加可以校验的表单元素（不一定需要校验）
		 * @method addFieldElem
		 * @return el {Node}
		 */
		addFieldElem: function(el) {
			if(!el) return;
			var that = this,
				srcNode = that.get('srcNode'),
				fieldElems = that.get('fieldElems');
			
			if (that._batch('addFieldElem', el) === true) { return; }
			if (el) {
				var t = el.getAttribute('type'),
					isAdded = el.hasAttribute('isAdded');
				
				//if not checkbox or radio
				if (t !== 'checkbox' && t !== 'radio' && t !== 'hidden' && !isAdded) {
					//push element
					fieldElems.push(el);

					el.setAttribute('isAdded', 'isAdded');
					//set placeholder
					that.togglePlaceholder(el, true);
					//init type
					switch (t) {
						case 'date':
							if (Y.Calendar) {
								new Y.Calendar(el.get('id'), {
									popup: true,
									closeable: true
								}).on('select', function(d) {
									el.set('value', HTML5Form.Format.date(d));
									that.validate(el);
									that.toggleError(el);
								});
							}
							break;
						case 'datetime':
							break;
						case 'week':
							break;
						default:
							break;
					}
					//set focus
					if (el.hasAttribute('autofocus')) {
						that.togglePlaceholder(el, false);
						el.focus();
						//fixed focus position IE下光标会显示在字符的前面
						el.set('value', el.get('value'));
					}
					//bind element event
					that._bindElemEvent(el);
				} else if (t === 'checkbox' && !isAdded) {
					var els = that._getCheckboxElems(el);
					if (els && els.size()) {
						els.setAttribute('isAdded', 'isAdded');
						//push checkbox elements
						fieldElems.push(el);
						that._bindElemEvent(el);
					}
				}
			}
			
			return this;
		},
		/**
		 * 移除可以校验的表单元素
		 * @method removeFieldElem
		 * @return el {Node}
		 */
        removeFieldElem: function(el, force) {
            var that = this,
			    fieldElems = that.get('fieldElems');
             
			force = force === true ? true : false;
			if (that._batch('removeFieldElem', el, force) === true) { return; }
			if (el && el._node) {
				var i = Y.Array.indexOf(fieldElems, el);
				if (i > -1) {
					fieldElems.splice(i, 1);
					that.set('fieldElems', fieldElems);
					that.removeError(el, force);
					if (force) {
						el.remove(true);
					}
				}
			}
				
			return this;
        },		
		/**
		 * 获取系列多选框元素
		 * @method _getCheckboxElems
		 * @return el {String | Node}
		 */
		_getCheckboxElems: function(el) {
			var that = this,
				srcNode = that.get('srcNode'),
				name = Lang.isString(el) ? el : el.getAttribute('name'),
				els = new Y.NodeList([el]);
			
			if (name) {
				els = srcNode.all('input[name=' + name + ']');
				if(!els._nodes.length){
					els = Y.all(document.getElementsByName(name));
				}
			}
			
			return els;
		},
		
		/**
		 * 绑定UI函数
		 * @method bindUI
		 * @return this
		 */
		bindUI: function() {
			var that = this,
				fieldElems = that.get('fieldElems');
			
			that.Events = that.Events.concat([
				that.get('submitNode').on('click', Y.bind(that._handleSubmit, that))
			]);
			
			return this;
		},

		/**
		 * 更新UI
		 * @method syncUI
		 * @return this
		 */
		syncUI: function() {
			var that = this;
			
			return this;
		},	
		
		/**
		 * 绑定表单元素事件
		 * @method _bindElemEvent
		 * @return el {Node}
		 * @private
		 */
		_bindElemEvent: function(el) {
			var that = this;
				tagName = el.get('tagName').toUpperCase(),
				type = el.getAttribute('type');
				
			if (type !== 'checkbox' && type !== 'radio' && type !== 'hidden') {
				if (tagName === 'SELECT') {
					that.Events = that.Events.concat([
						el.on('change', Y.bind(that._handleChange, that))
					]);
				} else {
					that.Events = that.Events.concat([
						el.on('keyup', Y.bind(that._handleKeyup, that))
					]);
				}
				that.Events = that.Events.concat([
					el.on('focus', Y.bind(that._handleFocus, that)),
					el.on('blur', Y.bind(that._handleBlur, that))
				]);
			} else if (type === 'checkbox') {
				that.Events = that.Events.concat([
					that._getCheckboxElems(el).on('click', Y.bind(that._handleClick, that))
				]);
			}
			
			return el;
		},
		
		/**
		 * 解除所有事件
		 * @method _detachEvents
		 * @private
		 */
		_detachEvents: function() {
			while (this.Events.length) {
				this.Events.pop().detach();
			}
		},
		
		/**
		 * focus回调
		 * @method _handleFocus
		 * @private
		 */
		_handleFocus: function(e) {
			var that = this;
			that.togglePlaceholder(e.target, false);
			//that.toggleError(e.target);
		},
		
		/**
		 * blur回调
		 * @method _handleBlur
		 * @private
		 */
		_handleBlur: function(e) {
			var that = this;
			that.validate(e.target);
			that.togglePlaceholder(e.target, true);
			that.toggleError(e.target);
		},
		/**
		 * blur回调对外接口
		 * @method handleBlur
		 * @public
		 */
		handleBlur: function(node) {
			var that = this;
			that.validate(node);
			that.togglePlaceholder(node, true);
			that.toggleError(node);
		},
		
		/**
		 * keyup回调
		 * @method _handleKeyup
		 * @private
		 */
		_handleKeyup: function(e) {
			e.halt();
			if(e.keyCode == 9) return;
		},
		
		/**
		 * change回调
		 * @method _handleChange
		 * @private
		 */
		_handleChange: function(e) {
			var that = this;
			that.validate(e.target);
			that.toggleError(e.target);
		},
		
		/**
		 * click回调 （只针对checkbox）
		 * @method _handleClick
		 * @private
		 */
		_handleClick: function(e) {
			var that = this;
			
			that._validateCheckbox(e.target);
			that.toggleError(that._getCheckboxElems(e.target).item(0));
		},
		
		/**
		 * submit回调
		 * @method _handleSubmit
		 * @private
		 */
		_handleSubmit: function(e) {
			var that = this,
				isFormValid = true;
			
			e.halt();
            if (that.fire('beforeFormValidate',e) === false) {return;}
			if (!that.validateForm()) { isFormValid = false; }
            if (that.fire('afterFormValidate', e, isFormValid) === false) { isFormValid = false; }
            if (isFormValid && that.fire('beforeSubmit', e, isFormValid) === false) { return; }
			isFormValid && that.get('formNode').submit();
		},
		
		/**
		 * 校验checkbox
		 * @method _validateCheckbox
		 * @param els {String | Node} name或者Node
		 * @return isValid {Boolean}
		 * @private
		 */
		_validateCheckbox: function(el) {
			var that = this,
				els = that._getCheckboxElems(el),
				fel = els.item(0),
				afterValidate = el.get('afterValidate'),
				//todo
				//checkbox find different attribute
				isRequired = fel.hasAttribute('isrequired'),
				isValid = false;
				
			if (isRequired) {
				for (var i = 0, l = els.size(); i < l; i++) {
					if (!els.item(i).get('disabled') && els.item(i).get('checked')) {
						isValid = true;
						break;
					}
				}
			} else {
				isValid = true;
			}
			
			if (isValid) {
				fel.removeAttribute('isError');
			} else {
				fel.setAttribute('isError', 'isError');
				fel.setAttribute('errorinfo', fel.getAttribute('requiredinfo') || HTML5Form.ErrInfo['required'] || '');
				fel.setAttribute('errortype', 'required');
			}
			
			afterValidate && afterValidate.call(this, els, isValid);
			
			return isValid;
		},
		
		/**
		 * 校验表单元素（除checkbox外）
		 * @method validate
		 * @param el {Node}
		 * @return isValid {Boolean}
		 */
		validate: function(el) {
			var that = this;
			if (that._batch('validate', el) === true) { return; }
			
			var	isDisabled = el.get('disabled'),
				Validator = HTML5Form.Validator,
				afterValidate = el.get('afterValidate'),
				isValid = true;
			
			if (el.getAttribute('type') !== 'checkbox') {
			
				if (isDisabled) { return isValid; }
				
				isValid = Validator.required(el) && Validator.type(el) && Validator.max(el) && Validator.min(el) && Validator.pattern(el) && Validator.validFn(el);
			
				if (isValid) {
					el.removeAttribute('isError');
				} else {
					el.setAttribute('isError', 'isError');
				}
				
				afterValidate && afterValidate.call(this, el, isValid);
				
			} else {
				isValid = that._validateCheckbox(el);
			}
		
			return isValid;
		},
		
		/**
		 * 校验表单
		 * @method validateForm
		 * @return isValid {Boolean}
		 */
		validateForm: function() {
			var that = this,
				isValid = true;
				fieldElems = that.get('fieldElems'),
				el = null,
				firstErrorElem = null,
				i = 0,
				l = fieldElems.length
			
			for (; i < l; i++) {
				el = fieldElems[i];
				if (!that.validate(el)) {
					isValid = false;
					if (!firstErrorElem) {
						firstErrorElem = el;
					}
				}
				that.toggleError(el);
			}
			
			if (!isValid) {
				firstErrorElem.focus();
				//fixed focus position IE下光标会显示在字符的前面
				firstErrorElem.set('value', firstErrorElem.get('value'));
				//that.toggleError(firstErrorElem);
			}
			
			return isValid;
		},
		
		/**
		 * 执行处理错误前回调
		 * @method _fireBeforeToggleError
		 * @param el {Node}
		 * @private
		 */
		_fireBeforeToggleError: function(el) {
			var that = this;
			if (that._batch('_fireBeforeToggleError', el) === true) { return; }
			
			var beforeToggleError = el.get('beforeToggleError'),
				isValid = !el.hasAttribute('isError');
			if (beforeToggleError) {
				if (el.getAttribute('type') !== 'checkbox') {
					beforeToggleError.call(this, el, isValid);
				} else {
					beforeToggleError.call(this, that._getCheckboxElems(el), isValid);
				}
			}
			
			return this;
		},
		
		/**
		 * 执行处理错误后回调
		 * @method _fireBeforeToggleError
		 * @param el {Node}
		 * @private
		 */
		_fireAfterToggleError: function(el) {
			var that = this;
			if (that._batch('_fireAfterToggleError', el) === true) { return; }
			
			var afterToggleError = el.get('afterToggleError'),
				isValid = !el.hasAttribute('isError');
			if (afterToggleError) {
				if (el.getAttribute('type') !== 'checkbox') {
					afterToggleError.call(this, el, isValid);
				} else {
					afterToggleError.call(this, that._getCheckboxElems(el), isValid);
				}
			}
			
			return this;
		},
		
		/**
		 * 处理错误
		 * @method toggleError
		 * @param el {Node}
		 * @param renderTip {Boolean} 是否渲染提示Tip
		 */
		toggleError: function(el, force, renderTip) {
			var that = this;
			if (that._batch('toggleError', el, force, renderTip) === true) { return; }
			
			var	force = force === false ? false : true,
				isValid = force && !el.hasAttribute('isError');
			if (isValid) {
				that.removeError(el, renderTip);
			} else {
				that.addError(el, '', renderTip);
			}
			
			return this;
		},
		
		/**
		 * 移除错误
		 * @method removeError
		 * @param el {Node | Array}
		 * @param renderTip {Boolean} 是否渲染提示Tip
		 */
		removeError: function(el, renderTip) {
			var that = this;
			if (that._batch('removeError', el, renderTip) === true) { return; }
			
			that._fireBeforeToggleError(el);
			renderTip = el.get('hasTip') && (renderTip === false ? false : true);
			el.removeClass('yui3-html5form-error');
            el.removeAttribute('isError');
			if (renderTip) {
				that.removeErrorTip(el);
				if (!that.get('multiErrorTip')) {
					that.get('errorTip').hide();
				}
			}
			that._fireAfterToggleError(el);
			
			return this;
		},
		
		/**
		 * 移除错误的提示
		 * @method removeErrorTip
		 * @param el {Node}
		 */
		removeErrorTip: function(el) {
			var that = this;
			if (that._batch('removeErrorTip', el) === true) { return; }
			
			var errTip = el.get('errorTip');
			//is errtip exist, remove it
			if (errTip) {
				errTip.hide();
				errTip.destroy();
				errTip = null;
				el.set('errorTip', null);
			}
		},
		
		/**
		 * 移除错误
		 * @method renderError
		 * @param el {Node | Array}
		 */
		addError: function(el, content, renderTip) {
			var that = this;
			if (that._batch('addError', el, content, renderTip) === true) { return; }
			
			if (content === false) {
				renderTip = content;
			}
			that._fireBeforeToggleError(el);
			renderTip = el.get('hasTip') && (renderTip === false ? false : true);
            if (el.get('type') !== 'checkbox') {
                el.addClass('yui3-html5form-error');
            }
            el.setAttribute('isError', 'isError');
			if (renderTip) {
				that.addErrorTip(el, content);
			}
			that._fireAfterToggleError(el);
			
			return this;
		},
		
		/**
		 * 渲染错误的提示
		 * @method renderErrorTip
		 * @param el {Node}
		 * @param content {String}
		 */
		addErrorTip: function(el, content) {
			var that = this;
			if (that._batch('addErrorTip', el, content) === true) { return; }
			
			var type = el.getAttribute('type'),
				template = el.get('errorTextTemplate') || HTML5Form.ERROR_TEXT_TEMPLATE,
				errInfo = template.replace('{ERROR_TEXT}', content || el.getAttribute('errorinfo') || ''),
				errTip = null;
			
			//if type is hidden, do not show the errtip
			if (type === 'hidden') { return; }
			
			if (that.get('multiErrorTip')) {
				if (!el.get('errorTip')) {
					el.set('errorTip', new Y.FormPostip({
						pos: el.get('errorTipPos') || that.get('errorTipPos'),
						classname: 'yui3-html5form-errortip'
					}));
				}
				errTip = el.get('errorTip');
			} else {
				errTip = that.get('errorTip');
			}
			
			errTip.rendTipUI(el.get('tipAlignNode'), errInfo);
			
			return this;
		},
		
		/**
		 * 析构函数
		 * @method destructor
		 */
		destructor: function() {
			this._detachEvents();
			this.set('fieldElems', null);
		}
		
	});
	
	Y.HTML5Form = HTML5Form;
	
}, '2.0', {
	requires: ['node', 'base']
});
