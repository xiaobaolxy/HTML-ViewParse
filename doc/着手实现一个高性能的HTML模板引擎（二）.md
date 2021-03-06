在书写“if、else、endif”这个逻辑的时候出了些问题。
首先我先描述一下目前的做法：像
```
if(con(arg1(),arg2()))
```
这种关系我将之描述为层级结构（需要冒泡），如果arg1被通知改变，则运行arg1触发器，更新arg1的缓存，接着冒泡触发con,con的触发器通过读取arg1和arg2的缓存，更新了con的缓存，接着冒泡到if，同样运行触发函数，然后对DOM进行更改。

还有一种关系是连锁结构（需要平行触发）。
```
if(c1)
  <textNode_1>
else
  <textNode_2>
  if(c2)
    <textNode_3>
  endif
  <textNode_4>
endif
```
这里并不仅仅是单纯的ifelse，可能还有其他的自定义的控制器。所以我需要保证没一对 if[else]endif 的独立，就是它并不知道它旁边会有什么逻辑控制器。
然而问题也就出在这里。
这里难点是虽然嵌套的ifelse是层级的，但是最终渲染出来的文本却是平级的，可能是<textNode_1>，也可能是<textNode_2><textNode_3><textNode_4>，这样子。


当我想保持逻辑器的独立，但当我改变c2,<textNode_3>就会不管c1而渲染。
所以我进行向上连锁触发,c2更新后去找到更前的控制器再次计算渲染，从而<textNode_3>又会回归c1的控制。

如果改变c1,node 2~4都会是c1所控制，渲染完后再去向下连锁触发。这样node 3会被c2正确渲染。

但是也是就是这样逻辑，向上连锁或者向下连锁最后的逻辑结果总会有出错的地方。

-----

有没有好的逻辑来解决这种层级关系？
用span来替换ifelse标签而生产结构，然后使用removeChild和insertChild当然是再好不过，渲染交给DOM的逻辑完成，但是也不成解决方案，毕竟我更改了HTML结构，我只是需要一些textNode组成的长文本。

如果能虚拟HTML标签的渲染是再好不过了。

---

后来的解决方案是：
由于是涉及到渲染，只有两种情况：显示与不显示（我使用一个Comment Node来进行repalceChild）。所以在Handle中独立存储控制者的ID，然后控制者那边存储这这个ID在true还是在false。
所以判定这个元素是否需要先死，就是遍历这个元素的控制着ID，取得控制者的_data --> 取得这个元素是在true区域（if区）还是在flase（else区），所在区域如果匹配_data的值，就说明元素在这个控制器中的状态是显示。遍历的结果如果都是true，那就显示。

这是目前所能想到的最佳解决方案了。

