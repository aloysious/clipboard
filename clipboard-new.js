KISSY.add(function (S) {

	"use strict";

	var Clipboard = {
		version: '1.0.7',
		clients: {},
		moviePath : 'http://img04.taobaocdn.com/tps/i4/T1N_N1XdhIXXXXXXXX.swf',
		nextId: 1,
		setMoviePath: function(path) {
			this.moviePath = path;
		},
		dispatch: function(id, eventName, args) {
			var client = this.clients[id];
			client && client.receiveEvent(eventName, args);
		},
		register: function(id, client) {
			this.clients[id] = client;
		},
		getDOMObjectPosition: function(obj, stopObj) {
			var info = {
				left: 0,
				top: 0,
				width: DOM.width(obj),
				height: DOM.height(obj)
			};

			while (obj && obj != stopObj) {
				info.left += DOM.offset(obj).left;
				info.top += DOM.offset(obj).top;
				obj = DOM.get()

			}
		}
	};

	return Clipboard;
	



	function Clipboard(id,cfg) {
		if (this instanceof Clipboard) {

			this.con = S.one(id);

			Clipboard.superclass.constructor.call(this, cfg);
			this.init();

		} else {
			return new Clipboard(id,cfg);
		}
	}

	// ATTR Example
	Clipboard.ATTRS = {
		version: {
			value: '1.0.7'
		},
		clients: {
			value: [] 
		}
	};

	S.extend(Clipboard, S.Base, {

		init: function() {
			// your code here
		},

		destory: function(){

		}
	});

	return Clipboard;

}, {
	requires: ['base','node']
});
