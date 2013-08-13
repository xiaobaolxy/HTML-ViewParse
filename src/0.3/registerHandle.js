V.registerHandle("", function(handle, index, parentHandle) {
	var textHandle = handle.childNodes[0];
	if (parentHandle.type !== "handle") {
		var i = 0;
		do {
			i += 1;
			var nextHandle = parentHandle.childNodes[index + i];
		} while (nextHandle && nextHandle.ignore);
		if (textHandle) { //textHandle as Placeholder

			textHandle.display = false;

			$.insertAfter(parentHandle.childNodes, handle, textHandle); //Node position calibration//no "$.insert" Avoid sequence error
			return function(NodeList_of_ViewInstance) {
				// console.log(this)
				var nextNodeInstance = nextHandle && NodeList_of_ViewInstance[nextHandle.id].currentNode,
					textNodeInstance = NodeList_of_ViewInstance[textHandle.id].currentNode,
					parentNodeInstance = NodeList_of_ViewInstance[parentHandle.id].currentNode
					$.DOM.insertBefore(parentNodeInstance, textNodeInstance, nextNodeInstance); //Manually insert node
			}
		}
	} else {
		if (textHandle) {
			// console.log("ignore",textHandle)
			textHandle.ignore = true;
			textHandle.display = false;
		}
	}
	// console.log(textHandle,parentHandle.type);
});
var iforelseHandle = function(handle, index, parentHandle) {
	var handleName = handle.handleName;
	var commentNode = $.DOM.Comment(handleName);
	var commentHandle = CommentHandle(commentNode) // commentHandle as Placeholder
	$.push(handle.childNodes, commentHandle);
	var i = 0;
	do {
		i += 1;
		var nextHandle = parentHandle.childNodes[index + i];
	} while (nextHandle && nextHandle.ignore);
	
	$.insertAfter(parentHandle.childNodes, handle, commentHandle); //Node position calibration//no "$.insert" Avoid sequence error
	return function(NodeList_of_ViewInstance) {
		// nextHandle = parentHandle.childNodes[index + i];
		nextHandle = nextHandle && nextHandle.newNode;
		// console.log(this)
		var nextNodeInstance = nextHandle && NodeList_of_ViewInstance[nextHandle.id].currentNode,
			commentNodeInstance = NodeList_of_ViewInstance[commentHandle.id].currentNode,
			parentNodeInstance = NodeList_of_ViewInstance[parentHandle.id].currentNode
			$.DOM.insertBefore(parentNodeInstance, commentNodeInstance, nextNodeInstance); //Manually insert node
	}
}
V.registerHandle("#if", iforelseHandle);
V.registerHandle("#else", iforelseHandle);
V.registerHandle("/if", iforelseHandle);