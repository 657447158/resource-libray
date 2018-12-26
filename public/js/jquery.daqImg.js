(function ($) {
    $.fn.daqImg = function (options) {
        var o = $.extend({container: '.item', object: 'img', rowHeight: 300, maxRows: 0, truncate: 0}, options);
        return this.each(function () {
            var grid = $(this), containers = $(grid).find(o.container), items = [], t = new Date().getTime(),
                s = window.getComputedStyle ? getComputedStyle(containers[0], null) : containers[0].currentStyle;
            o.margin = (parseInt(s.marginLeft) || 0) + (parseInt(s.marginRight) || 0) + (Math.round(parseFloat(s.borderLeftWidth)) || 0) + (Math.round(parseFloat(s.borderRightWidth)) || 0);
            for (j = 0; j < containers.length; j++) {
                var c = containers[j],
                    w = parseInt(c.getAttribute('data-w')),
                    norm_w = w * (o.rowHeight / parseInt(c.getAttribute('data-h'))), // normalized width
                    obj = $(c).find(o.object);
                items.push([c, w, norm_w, obj, obj.data('src')]);
            }
            makeGrid(grid, items, o);
            $(window).off('resize.daqImg' + grid.data('flex-t'));
            $(window).on('resize.daqImg' + t, function () {
                makeGrid(grid, items, o);
            });
            grid.data('flex-t', t)
        });
    }

    function makeGrid(grid, items, o, noresize) {
        var x, new_w, ratio = 1, rows = 1, max_w = grid.width() - 2, row = [], row_width = 0, row_h = o.rowHeight;
        if (!max_w) max_w = grid.width() - 2;
        function _helper(lastRow) {
            if (o.maxRows && rows > o.maxRows || o.truncate && lastRow && rows > 1) row[x][0].style.display = 'none';
            else {
                if (row[x][4]) {
                    row[x][3].attr('src', row[x][4]);
                    row[x][4] = '';
                }
                row[x][0].style.width = new_w + 'px';
                row[x][0].style.height = row_h + 'px';
                row[x][0].style.display = 'block';
            }
        }

        for (i = 0; i < items.length; i++) {
            row.push(items[i]);
            row_width += items[i][2] + o.margin;
            if (row_width >= max_w) {
                var margins_in_row = row.length * o.margin;
                ratio = (max_w - margins_in_row) / (row_width - margins_in_row), row_h = Math.ceil(o.rowHeight * ratio), exact_w = 0, new_w;
                for (x = 0; x < row.length; x++) {
                    new_w = Math.ceil(row[x][2] * ratio);
                    exact_w += new_w + o.margin;
                    if (exact_w > max_w) new_w -= exact_w - max_w;
                    _helper();
                }
                //重置下一行
                row = [], row_width = 0;
                rows++;
            }
        }

        for (x = 0; x < row.length; x++) {
            new_w = Math.floor(row[x][2] * ratio), h = Math.floor(o.rowHeight * ratio);
            _helper(true);
        }

        //滚动条在呈现新的布局添加或删除
        if (!noresize && max_w != grid.width()) makeGrid(grid, items, o, true);
    }
}(jQuery));
