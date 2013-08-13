/*
 * View Instance constructor
 */

var ViewInstance = function(handleNodeTree, NodeList, triggers, database) {
	if (!(this instanceof ViewInstance)) {
		return new ViewInstance(handleNodeTree, NodeList, triggers, database);
	}
	var self = this;
	self.handleNodeTree = handleNodeTree;
	self.DOMArr = $.slice(handleNodeTree.childNodes);
	self.NodeList = NodeList;
	self._database = database || {};
	self._triggers = {};
	self.TEMP = {};
	$.forIn(triggers,function(tiggerCollection,key){
		self._triggers[key] = tiggerCollection;
	});
	$.forEach(self._triggers["."], function(tiggerFun) { //const value
		tiggerFun.event(NodeList,database);
	});
};
function _bubbleTrigger(tiggerCollection,NodeList,database,eventTrigger){
	var self = this;
	$.forEach(tiggerCollection,function(trigger){
		// if (trigger.chain) {
		// 	console.log("key:",trigger.key,trigger,",chain!!")
		// 	var chainTriggers = self._triggers[trigger.key],
		// 		index = $.indexOf(chainTriggers,trigger);
		// 	for(var i = 0;i<index;i+=1){
				
		// 	}
		// }
		trigger.event(NodeList,database,eventTrigger);
		if (trigger.bubble) {
			var parentNode = NodeList[trigger.handleId].parentNode;
			parentNode&&_bubbleTrigger.apply(self,[parentNode._triggers,NodeList,database,trigger]);
		}
		// if (trigger.chain) {
		// 	$.forEach(chainTriggers,function(chain_trigger){
		// 		console.log("chain:",chain_trigger)
		// 		chain_trigger.event(NodeList,database,trigger);
		// 	},index+1);
		// 	console.log(index,chainTriggers);
		// };
	});
};
ViewInstance.prototype = {
	append: function(el) {
		var handleNodeTree = this.handleNodeTree,
			NodeList = this.NodeList;
		$.forEach(handleNodeTree.childNodes,function(node,index,parentNode){
			// console.log(node,parentNode);
			if (!node.ignore) {
				$.DOM.append(el,NodeList[node.id].currentNode);
			}
		});
		NodeList[handleNodeTree.id].currentNode = el;
	},
	// _database: null,
	// _triggers: null,
	get: function get(key) {},
	set: function set(key, value) {
		var self = this,
			database = self._database,
			NodeList = self.NodeList,
			oldValue = database[key];
		if (oldValue != value) {
			self._database[key] = value;
		}
		_bubbleTrigger.apply(self,[self._triggers[key],NodeList,database])
	}
};