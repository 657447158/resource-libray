(function () {

	var tm = '<div class="list_foot clearfix" ><div class="fl list_info"><span>每页显示<select v-model="indexs.pageSize" class="pageSelect" id="pageSel" @change="btnClick(1)"> <option>10</option><option>30</option><option>40</option><option>50</option></select>条</span>' +
		'<span>共{{indexs.num}}条数据</span>' +
		'<span class="page_info">当前<span id="curr_page">{{parames.cur}}</span>/{{indexs.pageCount}}页</span>' +
		' <a class="refresh" id="refresh" @click="btnClick(1)"><img src="/images/admin/refresh.png" alt="刷新列表"/>刷新列表</a></div>' +
		'<div v-if="indexs.pageCount>1" class="list_info fr list_page">' +
		'<div id="pagination" class="fl">' +
		'<a v-if="parames.cur<=1" class="prev">上一页</a>' +
		'<a v-if="parames.cur>1" @click="btnClick(parames.cur-1)" class="prev">上一页</a>' +
		'<a v-for="index in indexs.arrs" v-bind:class="{ current: parames.cur== index}"  v-on:click="btnClick(index)">{{ index }}</a>' +
		'<a v-if="parames.cur>=indexs.pageCount" class="prev">下一页</a>' +
		'<a v-if="parames.cur<indexs.pageCount" @click="btnClick(parames.cur+1)" class="prev">下一页</a>' +
		'</div>' +
		'<span class="fl">跳转至<input type="text" class="listP_input allPage">页 <a class="page_btn " href="javascript:;" @click="btnClick(-1)">go</a></span>' +
		'</div></div>';

	var navBar = Vue.extend({
		template: tm,
		props: {
			parames: {
				type: [String, Number],
				required: true
			},
			cur: {
				type: [String, Number],
				required: true
			},
            filterKey: String,
			callback: {
				default: function () {
					return function callback() {
					}
				}
			}
		},
		computed: {
			indexs: function () {

                var filterKey = this.filterKey && this.filterKey.toLowerCase()

				var arrs = [],obj={},
					_self = this, parames=_self.parames,search=parames.search;
				search.page=parames.cur;
                search.pageSize=parames.pageSize;
                search.search=filterKey;
				//获取数据
				$.ajaxSetup({
					async : false
				});
				$.ajax({
					type:parames.method,
					url:parames.url,
					data:search,
					success: function(data){
						obj.pageCount=data.pagecount;
						obj.num=data.numcount;
						obj.pageSize=data.pagesize;
						/**
						 * 回掉函数
						 * */
						_self.callback({data:data.entitys});
					}
				});
				$.ajaxSetup({
					async : true
				});
				var showNum = 4,
					ne_half = showNum / 2,
					upperLimit = obj.pageCount - showNum,
					cur = parames.cur - 1;
					start = cur > ne_half ? Math.max(Math.min(cur - ne_half, upperLimit), 0) : 0, /*开始页码*/
					end = cur > ne_half ? Math.min(cur + ne_half + (showNum % 2),obj.pageCount) : Math.min(showNum, obj.pageCount); /*结束页码*/
				if (start > 0) {
					arrs.push(1);
					if (1 < start) {
						arrs.push("...");
					}
				}
				for (var i = start; i < end; i++) {
					arrs.push(i + 1);
				}
				if (end < obj.pageCount) {
					if (obj.pageCount - 1 > end) {
						arrs.push("...");
					}
					arrs.push(obj.pageCount);
				}

				obj.arrs=arrs;

				return obj
			}

		},
        filters: {
            capitalize: function (str) {

                return str.charAt(0).toUpperCase() + str.slice(1)
            }
        },
		methods: {
			btnClick: function (page) {
				/*页面点击事件*/
				if(page==-1){
					page=$(".listP_input").val();
				}
				if (page != this.parames.cur || $("#pageSel").val()!=this.parames.pageSize) {
					this.parames.cur = page;
					this.parames.pageSize=$("#pageSel").val();
				}
			}
		}
	});

	window.Vnav = navBar

})()