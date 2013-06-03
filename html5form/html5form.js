KISSY.add(function (S) {

	"use strict";

	function Html5form() {
		if (this instanceof Html5form) {
			X.superclass.constructor.apply(this, arguments);
			this.init();

		} else {
			return new Html5form();
		}
	}

	// ATTR Example
	Html5form.ATTRS = {
		/**
		 * 包含表单元素的节点（表单元素不一定在form里面）
		 * @attribute srcNode
		 * @type {Node}
		 */
		srcNode: {
			setter: S.one,
			value: null
		},
		/**
		 * 表单
		 * @attribute formNode
		 * @type {Node}
		 */
		formNode: {
			setter: S.one,
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
				if (S.isString(v)) {
					r = S.one(v);
				}
				if (r && !r instanceof S.NodeList) {
					r = new S.NodeList([r]);
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
	S.mix(S.Node.ATTRS, {
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
		 * TODO
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
				node[attr] = S.one(val) || this;
				return node[attr];
			},
			getter: function() {
				var node = this._stateProxy;
				return node['tipAlignNode'] || this;
			}
		}
	});

	S.mix(S.Node, {
		/**
		 * 是否是有效的表单元素（除button与submit外）
		 * S.Node.isFormElem
		 */
		isFormElem: function() {
			var tagName = this.get('tagName').toUpperCase(),
				type = this.attr('type');
				
			return (tagName === 'INPUT' && type !== 'button' && type !== 'submit') || tagName === 'SELECT' || tagName === 'TEXTAREA';
		},

		/**
		 * 获取去除两端空格的value值
		 * S.Node.getValue
		 */
		getValue: function() {
			if (this.isFormElem()) {
				return S.trim(this.get('value'));
			}
			
			return this.get('value');
		}
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
			var hasRequired = el.hasAttr('required'),
				isPlaceholder = HTML5Form.Validator.isPlaceholder(el),
				v = el.getValue(),
				isValid = hasRequired ? (v !== '' && !isPlaceholder) : true;
			
			if (!isValid) {
				el.attr('errorinfo', el.attr('requiredinfo') || HTML5Form.ErrInfo['required'] || '');
				el.attr('errortype', 'required');
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
				_p = el.attr('pattern'),
				//可以为字符串
				p = (_p === '' || S.isUndefined(_p) || _p === null) ? false : new RegExp("^(?:" + _p + ")$"),
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

	S.extend(Html5form, S.Base, {

		init: function() {
			// your code here
		},

		destory: function(){

		}
	});

	return Html5form;

}, {
	requires: ['base','node']
});
