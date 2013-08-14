/*
 * View constructor
 */

function View(arg) {
	var self = this;
	if (!(self instanceof View)) {
		return new View(arg);
	}
	self.handleNodeTree = arg;
	self._handles = [];
	self._triggers = {}; //bey key word


	_buildHandler.call(self);
	_buildTrigger.call(self);
	// _traversal(this.handleNodeTree, function(node, index, parentNode) {
	// 	View.u[node.id] = node;
	// });
	// return $.bind(_create, this);
	return function(data) {
		return _create.call(self, data);
	}
};

function _buildHandler(handleNodeTree) {
	var self = this,
		handles = self._handles
		handleNodeTree = handleNodeTree || self.handleNodeTree;
	_traversal(handleNodeTree, function(item_node, index, handleNodeTree) {
		// console.log(item_node, index, handleNodeTree)
		item_node.parentNode = handleNodeTree;
		if (item_node.type === "handle") {
			var handleFactory = V.handles[item_node.handleName];
			if (handleFactory) {
				var handle = handleFactory(item_node, index, handleNodeTree)
				// handle&&$.push(handles, $.bind(handle,item_node));
				handle && $.push(handles, handle);
			}
		}
		// console.log(item_node);
	});
};
var _attrRegExp = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g;

function _buildTrigger(handleNodeTree) {
	var self = this,
		triggers = self._triggers;
	handleNodeTree = handleNodeTree || self.handleNodeTree;
	_traversal(handleNodeTree, function(handle, index, parentHandle) {
		// handle.parentNode = parentHandle;
		if (handle.type === "handle") {
			var triggerFactory = V.triggers[handle.handleName];
			if (triggerFactory) {
				var trigger = triggerFactory(handle, index, parentHandle);
				// cos
				if (trigger) {
					var key = trigger.key = trigger.key || "";
					// console.log
					trigger.handleId = trigger.handleId || handle.id;
					//unshift list and In order to achieve the trigger can be simulated bubble
					$.unshift((triggers[key] = triggers[key] || []), trigger); //Storage as key -> array
					$.push(handle._triggers, trigger); //Storage as array
				}
			}
		} else if (handle.type === "element") {
			var node = handle.node,
				nodeHTMLStr = node.outerHTML.replace(node.innerHTML, ""),
				attrs = nodeHTMLStr.match(_attrRegExp)
				$.forEach(attrs, function(attrStr) {
					var attrInfo = attrStr.split(_attrRegExp),
						attrKey = attrInfo[1],
						attrValue = attrInfo[2];
					if (_matchRule.test(attrValue)) {
						var attrBuilder = (V.attrModules[handle.id + attrKey] = V.parse(attrValue))(),
							_shadowDIV = $.DOM.clone(shadowDIV);
						// console.log(at = attrBuilder)
						attrBuilder.append(_shadowDIV);
						$.forIn(attrBuilder._triggers, function(triggerCollection, key) {
							$.forEach(triggerCollection, function(trigger) {
								var _newTrigger = $.create(trigger);
								_newTrigger.event = function(NodeList, database, eventTrigger){
									$.forIn(attrBuilder._triggers,function(attrTriggerCollection,attrTriggerKey){
										$.forEach(attrTriggerCollection,function(attrTrigger){
											attrTrigger.event(attrBuilder.NodeList, database, eventTrigger);
										})
									});
									NodeList[handle.id].currentNode.setAttribute(attrKey, _shadowDIV.innerHTML)
								};
								// var _trigger = trigger.event,
									// _newTrigger = function(NodeList, database, eventTrigger) {
									// 	_trigger(attrBuilder.NodeList, database, eventTrigger);
									// 	console.log(attrKey, _shadowDIV.innerHTML, NodeList[handle.id].currentNode)
									// 	NodeList[handle.id].currentNode.setAttribute(attrKey, _shadowDIV.innerHTML)
									// };
								// trigger.event = _newTrigger;
								$.unshift((triggers[key] = triggers[key] || []), _newTrigger); //Storage as key -> array
								$.push(handle._triggers, _newTrigger); //Storage as array
							})
						});
					}
				});
		}
	});
};

function _create(data) {
	var self = this,
		NodeList_of_ViewInstance = {}, //save newDOM  without the most top of parentNode -- change with append!!
		topNode = $.create(self.handleNodeTree);
	topNode.currentNode = $.DOM.clone(shadowBody);
	$.pushByID(NodeList_of_ViewInstance, topNode);

	_traversal(topNode, function(node, index, parentNode) {
		node = $.pushByID(NodeList_of_ViewInstance, $.create(node));
		if (!node.ignore) {
			var currentParentNode = NodeList_of_ViewInstance[parentNode.id].currentNode || topNode.currentNode;
			var currentNode = node.currentNode = $.DOM.clone(node.node);
			$.DOM.append(currentParentNode, currentNode);
			// if (node.type === "comment") {
			// 	console.log(node.id,node.currentNode,NodeList_of_ViewInstance[node.id]);
			// }
		}
	});


	// _traversal(self.handleNodeTree, function(node, index, parentNode) {
	// 	if (!node.ignore && node.display) { //build DOM construction
	// 		parentNode = node.parentNode;
	// 		$.DOM.append(parentNode.newNode, node.newNode)
	// 	}
	// 	var item = {
	// 		currentNode: node.newNode,
	// 		triggers: [],
	// 		viewParseNode: node
	// 	};
	// 	// console.log(node.type,node.id)
	// 	$.push(DOMs, item);
	// 	DOMs["hashid|" + node.id] = item;
	// });
	$.forEach(self._handles, function(handle) {
		// handle(NodeList_of_ViewInstance);
		handle.call(self, NodeList_of_ViewInstance);
	});
	// console.log(self.handleNodeTree.newNode, DOMs);

	// console.log("ViewInstance", ViewInstance(self.handleNodeTree, NodeList_of_ViewInstance, self._triggers))
	return ViewInstance(self.handleNodeTree, NodeList_of_ViewInstance, self._triggers);
};