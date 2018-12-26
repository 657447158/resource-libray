;(function($, window, document){
	"use strict";
	var defaults = {
		deVal : "请选择状态",
		search : false,
		riInput : "",
		deSelected : "",
		version : "1.0",
		z_index : 80
	};

	function getJsonLength(json){
	    var len = 0;
	    if(Boolean(json)){
	        for(var i in json)len++;
	    }
	    return len;
	};
	// init 下拉框的结构
	var dropDefault = function(obj ,options){

		var z_index = options.z_index--;
		var selectorName = $(obj).attr('class') || $(obj).attr('id');
		var defaultWrap = '';
		defaultWrap += '<div class="daq-select daq-'+ selectorName +'" style="z-index:'+ z_index +'"><div class="daq-btn daq-btn-default"><div class="daq-filter">'+ options.deVal +'</div><span class="daq-caret"></span>';
		if(options.riInput != ""){
			defaultWrap += '<input class="daq-riInput" type="text" value="'+ options.riInput +'"/>';
		}
		defaultWrap	+= '</div><div class="daq-dropdown-menu"></div></div>';
		$(obj).after(defaultWrap);
		if(options.riInput != ""){
			$(obj).next('.daq-'+ selectorName +'').find('.daq-filter').css({'float':'left', 'width' : '95px'});
			$(obj).next('.daq-'+ selectorName +'').find('.daq-btn-default').css('width', '230px').addClass('clearfix');
			$(obj).next('.daq-'+ selectorName +'').find('.daq-caret').css('left' , '82px');
		}
	};
	// init 子菜单列表
	var initLi = function(obj, $options, type){
		var $targetMenu = $(obj).next().find('.daq-dropdown-menu');
		var bindStr = '<ul class="daq-drop-ul">';
		var optionLen = type === "tree" ? getJsonLength($options) : $options.length;
		if(optionLen > 0){
			for(var i = 0; i < optionLen; i++){
				if(type === "default"){
					bindStr += '<li><a tabindex='+  $options.eq(i).val() +'><span class="text">'+ $options.eq(i).text() +'</span></a></li>';
				}else if(type === "tree"){
					var caret = $options[i].open ? "daq-caret" : "daq-caret-r";
					bindStr += '<li><span id="daq-caret-id" class="'+ caret +' daq-caret-li"></span><a class="daq-one-node" tabindex='+  $options[i].pid +'><span>'+ $options[i].name +'</span></a>';
					var childArrLen = getJsonLength($options[i].childArr);
					if(childArrLen > 0){
						var isShow = $options[i].open ? "daq-show" : "daq-hidden" || "daq-hidden";
						bindStr += '<ul class="daq-drop-child-node '+ isShow +'">';
						for(var j = 0; j < childArrLen; j++){
							bindStr += '<li><a class="daq-two-node" tabindex='+  $options[i].childArr[j].id +' href="javascript:void(0);"><div class="daq-dot"></div><span class="text">'+ $options[i].childArr[j].name +'</span></a></li>';
						}
						bindStr += "</ul>";
					}
					bindStr += '</li>';
				}
			}
			bindStr += '</ul>';
			$targetMenu.html(bindStr);
		}
	};

	// init multi  列表
	var initMulti = function(obj, $options){
		var $targetMenu = $(obj).next().find('.daq-dropdown-menu');
		var bindStr = '<ul class="daq-drop-ul">';
		var optionLen = getJsonLength($options) 
		if(optionLen > 0){
			for(var i = 0; i < optionLen; i++){
				bindStr += '<li><div class="daq-one-node-wrap daq-drop-hover"><input type="checkbox" class="daq-checkbox daq-checkbox-one" value="" /><a class="daq-one-node" tabindex='+  $options[i].pid +'><span>'+ $options[i].name +'</span></a></div>';
				var childArrLen = getJsonLength($options[i].childArr);
				if(childArrLen > 0){
					var isShow = $options[i].open ? "daq-show" : "daq-hidden" || "daq-hidden";
					bindStr += '<ul class="daq-drop-child-node '+ isShow +'">';
					for(var j = 0; j < childArrLen; j++){
						bindStr += '<li><input type="checkbox" class="daq-two-checkbox daq-checkbox"/><a class="daq-two-node daq-drop-hover" tabindex='+  $options[i].childArr[j].id +' href="javascript:void(0);"><span class="text">'+ $options[i].childArr[j].name +'</span></a></li>';
					}
					bindStr += "</ul>";
				}
				bindStr += '</li>';
			}
			bindStr += '</ul>';
			$targetMenu.html(bindStr);
		}
	};

	// init 下拉框搜索
	var dropSearch = function(obj){
		var $menu = $(obj).next().find('.daq-dropdown-menu').addClass('daq-dropdown-search');
		var searchWrap = '<div class="daq-select-searchbox1"><input type="text" class="daq-inputadd1 daq-search1" placeholder="查找"></div>';
		$menu.append(searchWrap);
	};
	// 多选下拉框的回调函数
	var callback = function(that, obj, options){
		var change = options.change;
		if(change){
			// 当前点击数据
			var clickNode = {};
			var curId = $(that).next().attr('tabindex');
			var curName = $(that).next().find("span").text();
			clickNode.curId = curId;
			clickNode.curName = curName;
			if($(that).hasClass('daq-two-checkbox')){
				var $parentTarget = $(that).parent().parent().prev().find('.daq-one-node');
				var curPId = $parentTarget.attr('tabindex');
				var curPName = $parentTarget.text();
				clickNode.curPId = curPId;
				clickNode.curPName = curPName;
			}
			// 选中数据
			var checkedNode = {};
			var m = 0;
			var checkedAll = $(obj).next().find('.daq-checkbox').each(function(k,v){
				var is_checked = $(v).eq(0).attr('checked');
				if(is_checked === "checked"){
					// 当父节点选中，子节点必选中
					var tempObj = {};
					if($(v).hasClass('daq-checkbox-one')){
						var tempId = $(v).next().attr('tabindex');
						var tempName = $(v).next().text();
						tempObj.pId = "";
						tempObj.pName = "";
						tempObj.id = tempId;
						tempObj.name = tempName;
					}

					if($(v).hasClass('daq-two-checkbox')){
						var tmpChildId = $(v).next().attr('tabindex');
						var tmpChildName = $(v).next().text();
						var $parentTar = $(v).parent().parent().prev().find('.daq-one-node');
						var tmpPId = $parentTar.eq(0).attr('tabindex');
						var tmpPName = $parentTar.text();
						tempObj.pId = tmpPId;
						tempObj.pName = tmpPName;
						tempObj.id = tmpChildId;
						tempObj.name = tmpChildName;
					}
					checkedNode[m] = tempObj;
					m++;
				}
			});
			change(clickNode, checkedNode);
		}
	};

	// base 事件
	var baseEvent = function(obj){
		var $target = $(obj).next();
		// click事件
		$target.on('click', '.daq-btn-default', function(e){

			e.stopPropagation();
			var $curTarget = $target.find('.daq-dropdown-menu');
			var $allMenu = $('body').find('.daq-dropdown-menu');

			$allMenu.each(function(k,v){
				if($(v).parent().attr('class') != $curTarget.parent().attr('class')){
					$(v).removeClass('daq-show');
				}
			})
			$curTarget.hasClass('daq-show') ? $curTarget.removeClass('daq-show'): $curTarget.addClass('daq-show');
		})
		// 鼠标移出菜单区域事件
		$target.on('mouseleave', '.daq-dropdown-menu', function(){
			$target.find('.daq-drop-ul li a').each(function(){
				$(this).removeClass('active');
			});
		})

		// 菜单事件
		$target.on('click', '.daq-dropdown-menu', function(e){
			e.stopPropagation();
		})
		
		// 点击空白隐藏下拉框
		$(document).click( function(e) { 
			var tarClass = e.target.className;
			var reg = /daq-checkbox/;
			if(tarClass.match(reg) == null){
				$target.find('.daq-dropdown-menu').removeClass('daq-show');
			}
		}); 
		// daq-riInput 事件
		$target.on('click', '.daq-riInput', function(e){
			e.stopPropagation();
		})

	};



	// default 下拉框事件
	var dropEvent = function(obj, options){
		var tmpRi = options.riInput;
		var $target = $(obj).next();
		// hover悬浮加效果
		$target.on('hover', '.daq-drop-ul li a', function(){
			$target.find('.daq-drop-ul li a').each(function(){
				$(this).removeClass('active');
			});
			$(this).addClass('active');
		});
		// 列表点击选中事件
		$target.on('click', '.daq-drop-ul li', function(e){
			e.stopPropagation();
			$(this).addClass('selected');
			var selectedIndex = $(this).find('a').attr('tabindex');
			var selectedVal   = $(this).find('a').find('span').text();
			if(tmpRi != ""){
				$target.find('.daq-riInput').val(selectedVal);
			}else{
				$target.find('.daq-filter').text(selectedVal);
			}
			$target.find('.daq-btn-default').addClass('active');
			$(obj).val(selectedIndex);
			$target.find('.daq-dropdown-menu').removeClass('daq-show');
			$(obj).trigger('change');
		})
	};

	// tree 事件
	var treeEvent = function(obj){
		var $target = $(obj).next();
		// hover悬浮加效果
		$target.on('hover', '.daq-drop-ul li a', function(){
			$target.find('.daq-drop-ul li a').each(function(){
				$(this).removeClass('active');
			});
			$(this).addClass('active');
		});

		$target.on('click', '.daq-drop-ul>li>a', function(e){

			e.stopPropagation();
			$(this).next().slideToggle("slow");
			var tarCaret = $(this).siblings('#daq-caret-id');
			tarCaret.hasClass('daq-caret') ? tarCaret.removeClass('daq-caret').addClass('daq-caret-r') : tarCaret.removeClass('daq-caret-r').addClass('daq-caret')
		});

		$target.on('click', '.daq-two-node', function(e){
			e.stopPropagation();
			$target.find('.daq-filter').html($(this).find('.text').html());
			$target.find('.daq-dropdown-menu').removeClass('daq-show');
			// 添加选中状态
			$target.find('.daq-drop-child-node li>a').each(function(){
				$(this).removeClass('selected');
			});
			$(this).addClass('selected');
			$target.find('.daq-filter').trigger('change');
		})

	};

	// multiEvent 事件
	var multiEvent = function(obj, options){
		var $target = $(obj).next();
		// hover悬浮加效果
		$target.on('hover', '.daq-drop-hover', function(){
			$target.find('.daq-drop-hover').each(function(){
				$(this).removeClass('active');
			});
			$(this).addClass('active');
			
		});

		
		// 
		$target.on('click', '.daq-one-node', function(e){
			e.stopPropagation();
			var $curCheckBox = $(this).prev();
			$(this).parent().next().slideToggle('slow');
		})
		// 一级节点 change事件
		$target.on('change', '.daq-checkbox-one', function(e){
			var that = this;
			$(that).parent().next().find('.daq-checkbox').each(function(k,v){
				$(that).is(':checked') ? $(v).attr("checked","checked") : $(v).removeAttr('checked');
			})
			$(that).is(':checked') ? $(that).parent().addClass('halfsel') : $(that).parent().removeClass('halfsel');
			return function(){
				callback(that, obj, options);
			}()
		});

		// 二级节点 change事件
		$target.on('change', '.daq-two-checkbox', function(e){

			var that = this;
			var checkArr = $(that).parent().parent().find('.daq-two-checkbox');
			var count = 0;
			// 统计选中checkbox的个数
			checkArr.each(function(k,v){
				if(v){
					if($(v).attr('checked')){
						count++;
					}
				}
			})
			var $cur = $(that).parent().parent().prev();
			if(count === 0){
				$cur.removeClass('halfsel');
				$cur.find('.daq-checkbox-one').removeAttr('checked');
			}
			if(count === checkArr.length){
				$cur.find('.daq-checkbox-one').attr("checked","checked");
			}
			if(count > 0){
				$cur.addClass('halfsel');
			}
			return function(){
				callback(that, obj, options);
			}();
		});
		

		$target.on('click', '.daq-two-node', function(e){
			e.stopPropagation();
			var $curCheckBox = $(this).prev();

			$curCheckBox.trigger('click');
		})
	};

	// search 事件
	var searchEvent = function(obj){
		var $target = $(obj).next();
		var $liArr = $target.find('.daq-drop-ul li');
		$target.on('click', '.daq-search1', function(e){
			e.stopPropagation();
		});
		$target.on('keyup', '.daq-search1', function(e){
			e.stopPropagation();
			var inputText = $(this).val();	
			var counter = 0;
			$liArr.each(function(k,v){
				var reg = new RegExp(inputText);
				var curText = $(v).find('a').find('span').text();
				if(curText.search(reg,'i') != -1){
					counter++;
					$(v).css('display', 'block');
					$liArr.parent().find('.no-results').each(function(k,v){$(v).remove()});
				}else{
					$(v).css('display', 'none');
				}
			})
			if(counter == 0){
				$liArr.parent().find('.no-results').each(function(k,v){$(v).remove()});
				var noResults = '<li class="no-results active">没有搜索到 "'+ inputText +'"</li>';
				$liArr.parent().append(noResults);
			}
		})
	};


	
	/** 扩展jQuery方法 - 默认下拉框*/
	$.fn.dropDqDefault = function(options){
		var options = $.extend(defaults, options);
		$(this).css('display', 'none');
		var $options = $(this).find('option');
		dropDefault(this, options);
		initLi(this, $options, "default");
		baseEvent(this);
		dropEvent(this, options);
		$(this).on('change', function(){
			console.log("d");
			if(options.change){
				var change = options.change;
				var selectedVal = $(this).val()
				var selectedText = $(this).find("option:selected").text();
				change(selectedVal, selectedText);
			}
		})
		// 判断是否带搜索框
		if(options.search){
			dropSearch(this);
			searchEvent(this);
		}
		if(options.deSelected != ""){
			$(this).next().find('.daq-drop-ul li').each(function(i,elem){
				if($(elem).find('a').attr('tabindex') == options.deSelected){
					$(elem).trigger('click');
				}
			})
		}
	};
	/** 扩展jQuery方法 - 带菜单的下拉框*/
	$.fn.dropDqTree = function(options){
		var that = this;
		var options = $.extend(defaults, options);
		$(that).css('display', 'none');
		var jsonData = options.data;
		dropDefault(that ,options);
		initLi(that, jsonData, "tree");
		baseEvent(that);
		treeEvent(that);
		var change = options.change;
		$(that).next().find('.daq-filter').on('change', function(){
			if(options.change){
				$(that).next().find('.daq-drop-child-node li>a').each(function(k,v){
					if($(v).hasClass('selected')){
						var childId = $(v).attr('tabindex');
						var childName = $(v).find('.text').html();
						var $pSelector = $(v).parent().parent().siblings('.daq-one-node');
						var pId = $pSelector.attr('tabindex');
						var pName = $pSelector.find('.text').html();
						change(pId, pName, childId, childName);
					}
				})
			}
		})
	};



	/** 扩展jQuery方法 - 多选下拉框*/
	$.fn.dropDqMulti = function(options){
		var that = this;
		var options = $.extend(defaults, options);
		$(that).css('display', 'none');
		var jsonData = options.data;
		dropDefault(that, options);
		initMulti(that, jsonData);
		baseEvent(this);
		multiEvent(this, options);
		
	};

})(jQuery, window, document);