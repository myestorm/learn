/**
 * jQuery 日历插件 noshCalendar v0.0.1
 * @author chenwenxue coolman_84@163.com
 * 依赖moment.js http://momentjs.com/
 */
;(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }

}(function($) {
    'use strict';

    if(typeof moment === 'undefined'){
        alert('请先引入moment.js， http://momentjs.com/');
        return false;
    }

    /* 简单发布订阅模式
     * 使用范例：
     * $(function () {
     *     $.getJSON('data.json', function (results) {
     *         $.pubCal('add', results);
     *     });
     *     $.subCal('add', function(e, results) {
     *         $('body').html(results.one);
     *     });
     * });
     */
    var calendarPubSub = $({}); //自定义事件对象
    $.each({
        trigger: 'pubCal', //发布
        on: 'subCal', //订阅
        off: 'unsubCal' //取消订阅
    }, function(key, val) {
        $[val] = function() {
            calendarPubSub[key].apply(calendarPubSub, arguments);
        };
    });

    //全局配置
    window.noshCalendar = {
        today: moment().unix(), //修正时间 当前时间戳（秒）
        deflection: 0, //客户端时间与服务器时间偏移量 （服务器时间-客户端时间，单位秒）
        locale: { //语言设置
            firstDayOfWeek: 1, //1【星期一】或7【星期天】
            weekdays: ['一', '二', '三', '四', '五', '六', '日'],
            prevMonth: '&laquo;上月',
            nextMonth: '下月&raquo;',
            year: '年',
            month: '月',
            day: '日',
            hour: '时',
            minute: '分',
            second: '秒',
            today: '今天'
        }
    };

    var NoshCalendar = function(){};

    /**
     * 日历初始数据
     * @return {Object}
     */
    NoshCalendar.prototype.emptyData = function(){
        return {
            year: {
                list: [], //列表
                selected: '' //选中
            },
            month: {
                list: [], //列表
                selected: '' //选中
            },
            day: {
                list: [], //列表
                selected: '' //选中
            },
            hour: {
                list: [], //列表
                selected: '' //选中
            },
            minute: {
                list: [], //列表
                selected: '' //选中
            },
            second: {
                list: [], //列表
                selected: '' //选中
            }
        };
    };

    /**
     * 拆分时间格式
     * @param  {String} string 时间字符串
     * @param  {String} format 时间字符串格式 参考momentjs
     * @return {Object}        年月日时分秒
     */
    NoshCalendar.prototype.cutDatetime = function(string, format){
        var d = null;
        var res = {};
        var getVal = function(type){
            return parseInt(d.format(type));
        };

        if(format !== 'timestamp'){
            d = moment(string, format);
        } else {
            if(string.toString().length === 10){
                d = moment(string * 1000);
            } else if(string.toString().length === 13){
                d = moment(string);
            } else {
                d = moment();
            }
        }

        res = {
            year: getVal('YYYY'),
            month: getVal('M') - 1,
            day: getVal('D'),
            hour: getVal('H'),
            minute: getVal('m'),
            second: getVal('s')
        };
        return res;
    };

    /**
     * moment拆分时间数组
     * @param  {Moment} m     moment对象
     * @return {Array}        [年,月,日,时,分,秒]
     */
    NoshCalendar.prototype.momentToArray = function(m){
        var r = m.format('YYYY-M-D').split('-');
        var h = m.format('H:m:s').split(':');
        var res = [];
        res[0] = + r[0];
        res[1] = r[1] - 1;
        res[2] = + r[2];
        res[3] = + h[0];
        res[4] = + h[1];
        res[5] = + h[2];
        return res;
    };

    /**
     * 整数前位补零
     * @param  {Int} num  * 要转换的数字，建议整数 但也可以是字符
     * @param  {Int} len  需要补零的个数，默认 1
     * @return {String}
     */
    NoshCalendar.prototype.fillZero = function(num, len){
        var prefix = '';
        var end = 0;
        len = len ? Math.abs(parseInt(len)) : 1;
        end = len - num.toString().length + 1;
        num = parseInt(num);
        for(var i = 0; i < end; i++){
            prefix += '0';
        }
        return num < Math.pow(10, len) ? prefix + num : num.toString();
    };

    /**
     * 计算月份天数
     * @param  {Int} year  年分
     * @param  {Int} month 月份【0-11】
     * @return {Int}       月份天数
     */
    NoshCalendar.prototype.dayNumOfMonth = function(year, month){
        return 32 - new Date(year, month, 32).getDate();
    };

    /**
     * 获取当前时间
     * @param  {Timestamp} timestamp 时间戳（秒）
     * @return {Object}
     */
    NoshCalendar.prototype.today = function(){
        var timestamp = moment().unix() + window.noshCalendar.deflection;
        return this.cutDatetime(timestamp, 'timestamp');
    };

    /**
     * 是否是今天
     * @param  {Object} date 年月日 {year: 2017, month: 3, day: 4} month [0-11] day [1-31]
     * @return {Boolean}
     */
    NoshCalendar.prototype.isToday = function(date){
        var self = this;
        var today = self.today();
        var todayMoment = moment([today.year, today.month, today.day]);
        return moment([date.year, date.month, date.day]).isSame(todayMoment);
    };

    /**
     * 检查是否是周末
     * @param  {Int} year 年
     * @param  {Int} month 月 [0-11]
     * @param  {Int} day   日
     * @return {Int}
     */
    NoshCalendar.prototype.checkIsWeekend = function(year, month, day){
        var weekday = moment([year, month, day]).isoWeekday();
        var res = weekday === 6 || weekday === 7 ? true : false;
        return res;
    };

    /**
     * 检查日期的是否在限制范围
     * @param  {Array} arr [year,month,day,hour,minute,second] 年 月 [0-11] 天 时 分 秒
     * @return {Array}     [Boolean【结果】, Array【正确结果】, String【边界类型 min/max】]
     */
    NoshCalendar.prototype.checkInRange = function(arr){
        var self = this;
        var result = null;
        var checkLeft = function(){
            var res = [true, arr,  ''];
            var newArr = [];
            var startObject = self.current.startObject;
            var minDay = [];
            if(!$.isEmptyObject(startObject)){
                minDay = [startObject.year];
                if(startObject.month < 12 && startObject.month > 0){
                    minDay.push(startObject.month);
                }
                if(startObject.day && startObject.day < 32 && startObject.day > 0){
                    minDay.push(startObject.day);
                }
                if(startObject.hour && startObject.hour < 25 && startObject.hour > 0){
                    minDay.push(startObject.hour);
                }
                if(startObject.minute && startObject.minute < 61 && startObject.minute > 0){
                    minDay.push(startObject.minute);
                }
                if(startObject.second && startObject.second < 61 && startObject.second > 0){
                    minDay.push(startObject.second);
                }

                if(arr.length !== minDay.length){
                    $.each(minDay, function(k){
                        newArr[k] = typeof arr[k] !== 'undefined' ? arr[k] : minDay[k];
                    });
                } else {
                    newArr = arr;
                }

                if(moment(newArr).isBefore(moment(minDay))){
                    res[0] = false;
                    res[1] = [];
                    res[1] = minDay;
                    res[2] = 'min';
                }
            }
            return res;
        };

        var checkRight = function(){
            var res = [true, arr,  ''];
            var newArr = [];
            var endObject = self.current.endObject;
            var maxDay = [];
            if(!$.isEmptyObject(endObject)){
                maxDay = [endObject.year];
                if(endObject.month < 12 && endObject.month > 0){
                    maxDay.push(endObject.month);
                }
                if(endObject.day && endObject.day < 32 && endObject.day > 0){
                    maxDay.push(endObject.day);
                }
                if(endObject.hour && endObject.hour < 25 && endObject.hour > 0){
                    maxDay.push(endObject.hour);
                }
                if(endObject.minute && endObject.minute < 61 && endObject.minute > 0){
                    maxDay.push(endObject.minute);
                }
                if(endObject.second && endObject.second < 61 && endObject.second > 0){
                    maxDay.push(endObject.second);
                }

                if(arr.length !== maxDay.length){
                    $.each(maxDay, function(k){
                        newArr[k] = typeof arr[k] !== 'undefined' ? arr[k] : maxDay[k];
                    });
                } else {
                    newArr = arr;
                }

                if(moment(newArr).isAfter(moment(maxDay))){
                    res[0] = false;
                    res[1] = [];
                    res[1] = maxDay;
                    res[2] = 'max';
                }
            }
            return res;
        };

        result = checkLeft();

        if(result[0] === true){
            result = checkRight();
        }
        return result;
    };

    /**
     * 设置年相关数据
     */
    NoshCalendar.prototype.setYearData = function(){
        var self = this;
        var start = '';
        var end = '';
        var selected = self.current.valueObject.year;
        var list = [];

        if(!$.isEmptyObject(self.current.startObject)){
            start = self.current.startObject.year;
            selected = selected < start ? start : selected;
        } else {
            start = self.current.valueObject.year - 30;
        }

        if(!$.isEmptyObject(self.current.endObject)){
            end = self.current.endObject.year;
            selected = selected > end ? end : selected;
        } else {
            end = self.current.valueObject.year + 30;
        }

        for(var i=start; i<=end; i++){
            list.push({
                value: i,
                disabled: false,
                text: i
            });
        }

        self.data.year.list = list;
        self.data.year.selected = selected;
    };

    /**
     * 设置月相关数据
     */
    NoshCalendar.prototype.setMonthData = function(){
        var self = this;
        var start = 0;
        var end = 11;
        var selected = self.current.valueObject.month;
        var list = [];
        var startObject = !$.isEmptyObject(self.current.startObject) ? self.current.startObject : null;
        var endObject = !$.isEmptyObject(self.current.endObject) ? self.current.endObject : null;

        for(var i=start; i<=end; i++){
            list.push({
                value: i,
                disabled: false,
                text: self.fillZero(i+1)
            });
        }

        if(startObject && self.data.year.selected === startObject.year){
            for(var j = start; j < startObject.month; j++){
                list[j].disabled = true;
            }
            selected = selected < startObject.month ? startObject.month : selected;
        }

        if(endObject && self.data.year.selected === endObject.year){
            for(var k = endObject.month + 1; k <= end; k++){
                list[k].disabled = true;
            }
            selected = selected > endObject.month ? endObject.month : selected;
        }

        self.data.month.list = list;
        self.data.month.selected = selected;
    };

    /**
     * 获取月份天数详细
     * @param  {Int} year 年
     * @param  {Int} month 月 [0-11]
     * @param  {Array} checked 非必要 [year, month, day]
     * @return {Object}
     */
    NoshCalendar.prototype.getMonthDays = function(year, month, checked){
        var self = this;
        var isAutomatic = Math.abs(self.current.show) === 0 ? true : false;
        var len = 6 * 7; //固定42个格子
        var start = 1;
        var end = self.dayNumOfMonth(year, month);

        var sWeekday = moment([year, month, start]).isoWeekday(); //第一天星期几
        var prev = 0;
        var next = 0;

        var res = {
            select: self.current.valueObject.day,
            year: year,
            month: month,
            list: []
        };

        //如果星期天排第一个
        prev = window.noshCalendar.locale.firstDayOfWeek === 7 ? sWeekday : sWeekday - 1;
        next = len - prev - end;

        for(var i = 0; i < prev; i++){
            var pitem = self.momentToArray(moment([year, month, start]).subtract((prev - i), 'days'));
            var ptext = isAutomatic ? self.fillZero(pitem[2]) : '&nbsp;';
            res.list.push({
                index: i,
                year: pitem[0],
                month: pitem[1],
                day: pitem[2],
                text: ptext,
                disabled: true,
                checked: false
            });
        }

        for(var j = start; j <= end; j++){
            var citem = self.momentToArray(moment([year, month, j]));
            var index = j - start + prev;
            var inRange = self.checkInRange([year, month, j]);
            var disabled = inRange[0] ? false : true;
            var checkedStatus = disabled === false && checked && checked[0] === year && checked[1] === month && checked[2] === j ? true : false;
            res.list.push({
                index: index,
                year: citem[0],
                month: citem[1],
                day: citem[2],
                text: self.fillZero(citem[2]),
                disabled: disabled,
                checked: checkedStatus
            });

            if(self.isToday({year: year, month: month, day: j})){
               res.list[index].isToday = true;
            }
        }


        for(var k = 1; k <= next; k++){
            var nitem = self.momentToArray(moment([year, month, end]).add(k, 'days'));
            var indexk = k + prev + end;
            var ntext = isAutomatic ? self.fillZero(nitem[2]) : '&nbsp;';
            res.list.push({
                index: indexk,
                year: nitem[0],
                month: nitem[1],
                day: nitem[2],
                text: ntext,
                disabled: true,
                checked: false
            });
        }
        return res;
    };

    /**
     * 设置日相关数据
     */
    NoshCalendar.prototype.setDayData = function(year, month){
        var self = this;
        var days = [];
        var months = [];
        var show = parseInt(Math.abs(self.current.show));
        var checkArr = null;
        var selected = self.current.valueObject.day;

        year = year ? year : self.data.year.selected;
        month = month ? month : self.data.month.selected;

        checkArr = self.checkInRange([self.data.year.selected, self.data.month.selected, selected])[1];

        months.push([year, month]);

        if(show > 0){
            for(var i = 1; i <= show; i++){
                var pitem = self.momentToArray(moment([year, month, 1]).subtract((i), 'months'));
                var nitem = self.momentToArray(moment([year, month, 1]).add((i), 'months'));
                months.unshift([pitem[0], pitem[1]]);
                months.push([nitem[0], nitem[1]]);
            }
        }

        $.each(months, function(){
            var val = arguments[1];
            days.push(self.getMonthDays(val[0], val[1], checkArr));
        });

        selected = checkArr[2];

        self.data.day.list = days;
        self.data.day.selected = selected;
    };

    /**
     * 设置时相关数据
     */
    NoshCalendar.prototype.setHourData = function(){
        var self = this;
        var start = 0;
        var end = 23;
        var selected = self.current.valueObject.hour;
        var list = [];

        var startObject = !$.isEmptyObject(self.current.startObject) ? self.current.startObject : null;
        var endObject = !$.isEmptyObject(self.current.endObject) ? self.current.endObject : null;
        var mm = moment([self.data.year.selected, self.data.month.selected, self.data.day.selected]);

        for(var i=start; i<=end; i++){
            list.push({
                value: i,
                disabled: false,
                text: self.fillZero(i)
            });
        }

        if(startObject && mm.isSame([startObject.year, startObject.month, startObject.day])){
            for(var j = start - start; j < startObject.hour - start; j++){
                list[j].disabled = true;
            }
            selected = selected < startObject.hour ? startObject.hour : selected;
        }

        if(endObject && mm.isSame([endObject.year, endObject.month, endObject.day])){
            for(var k = endObject.hour + 1; k <= end; k++){
                list[k].disabled = true;
            }
            selected = selected > endObject.hour ? endObject.hour : selected;
        }

        self.data.hour.list = list;
        self.data.hour.selected = selected;
    };

    /**
     * 设置分相关数据
     */
    NoshCalendar.prototype.setMinuteData = function(){
        var self = this;
        var start = 0;
        var end = 59;
        var selected = self.current.valueObject.minute;
        var list = [];

        var startObject = !$.isEmptyObject(self.current.startObject) ? self.current.startObject : null;
        var endObject = !$.isEmptyObject(self.current.endObject) ? self.current.endObject : null;
        var mm = moment([self.data.year.selected, self.data.month.selected, self.data.day.selected, self.data.hour.selected]);

        for(var i=start; i<=end; i++){
            list.push({
                value: i,
                disabled: false,
                text: self.fillZero(i)
            });
        }

        if(startObject && mm.isSame([startObject.year, startObject.month, startObject.day, startObject.hour])){
            for(var j = start - start; j < startObject.minute - start; j++){
                list[j].disabled = true;
            }
            selected = selected < startObject.minute ? startObject.minute : selected;
        }

        if(endObject && mm.isSame([endObject.year, endObject.month, endObject.day, endObject.hour])){
            for(var k = endObject.minute + 1; k <= end; k++){
                list[k].disabled = true;
            }
            selected = selected > endObject.minute ? endObject.minute : selected;
        }

        self.data.minute.list = list;
        self.data.minute.selected = selected;
    };

    /**
     * 设置秒相关数据
     */
    NoshCalendar.prototype.setSecondData = function(){
        var self = this;
        var start = 0;
        var end = 59;
        var selected = self.current.valueObject.second;
        var list = [];

        var startObject = !$.isEmptyObject(self.current.startObject) ? self.current.startObject : null;
        var endObject = !$.isEmptyObject(self.current.endObject) ? self.current.endObject : null;
        var mm = moment([self.data.year.selected, self.data.month.selected, self.data.day.selected, self.data.hour.selected, self.data.minute.selected]);

        for(var i=start; i<=end; i++){
            list.push({
                value: i,
                disabled: false,
                text: self.fillZero(i)
            });
        }

        if(startObject && mm.isSame([startObject.year, startObject.month, startObject.day, startObject.hour, startObject.minute])){
            for(var j = start - start; j < startObject.second - start; j++){
                list[j].disabled = true;
            }
            selected = selected < startObject.second ? startObject.second : selected;
        }

        if(endObject && mm.isSame([endObject.year, endObject.month, endObject.day, endObject.hour, endObject.minute])){
            for(var k = endObject.second + 1; k <= end; k++){
                list[k].disabled = true;
            }
            selected = selected > endObject.second ? endObject.second : selected;
        }

        self.data.second.list = list;
        self.data.second.selected = selected;
    };

    /**
     * 获取当前数据
     * @return  {Object}
     */
    NoshCalendar.prototype.getData = function(){
        return this.data;
    };

    /**
     * 获取当前对象
     * @return  {Object}
     */
    NoshCalendar.prototype.getCurrent = function(){
        return this.current;
    };

    /**
     * 重置当前数据
     */
    NoshCalendar.prototype.resetData = function(){
        this.data = $.extend(true, {}, this.emptyData() || {});
        this.box.empty();
    };

    /**
     * 检查是否初始化
     * @return {Boolean}
     */
    NoshCalendar.prototype.checkIsInit = function(){
        var res = false;
        var box = this.box;

        if(typeof(box) === 'undefined'){
            this.box = null;
            this.data = $.extend(true, {}, this.emptyData() || {});
            this.current = null;
            this.display = 'normal';
        }
        if(box && box[0]){
            res = true;
        } else  {
            res = false;
        }
        return res;
    };

    /**
     * 初始化当前操作对象
     * @param  {Object} d 参考def
     * @return {Object}   参考def
     */
    NoshCalendar.prototype.initCurrent = function(d){
        var self = this;
        var defFormat = 'YYYY-MM-DD HH:mm:ss';
        var defTime = moment(window.noshCalendar.today * 1000);
        var today = null;
        var def = {
            input: null,
            width: 430,
            value: defTime.format(defFormat),
            start: '',
            end: '',
            show: 0, //左右两边显示数
            footer: true,
            format: defFormat
        };

        self.current = $.extend(true, def, d || {});
        today = moment(self.today()).format(self.current.format);

        if(self.current.start === 'today'){
            self.current.start = today;
        }
        if(self.current.end === 'today'){
            self.current.end = today;
        }

        if(/#/.test(self.current.start) && $(self.current.start).length > 0){
            self.current.start = $(self.current.start).val();
            self.current.start = self.current.start ? self.current.start : today;
        }

        if(/#/.test(self.current.end) && $(self.current.end).length > 0){
            self.current.end = $(self.current.end).val();
            self.current.end = self.current.end ? self.current.end : today;
        }

        self.current.value = self.current.value ? self.current.value : defTime.format(self.current.format);

        //拆分数据
        self.current.valueObject = self.cutDatetime(self.current.value, self.current.format, 123);
        self.current.startObject = self.current.start ? self.cutDatetime(self.current.start, self.current.format) : null;
        self.current.endObject = self.current.end ? self.cutDatetime(self.current.end, self.current.format) : null;

        $.pubCal('initCurrent', self.current);
        return self.current;
    };

    /**
     * 插件初始化
     * @param  {Timestamp} timestamp 时间戳（秒）
     * @param  {String} id 日历显示的位置 id
     */
    NoshCalendar.prototype.init = function(timestamp, id){
        var self = this;
        if(timestamp){
           window.noshCalendar.deflection = timestamp - moment().unix();
        }
        id = id ? id : 'nosh-calendar';
        if(self.checkIsInit() === false){
            var $html = null;
            if(id === 'nosh-calendar'){
                $html = $('<div class="nosh-calendar" id="'+ id +'"></div>');
                $html.appendTo('body');
            } else {
                $html = $('#'+ id);
                self.display = 'inline';
            }
            self.box = $html;

            $html.on('change', '.nosh-year', function(){
                var val = $(this).val();
                self.change({year: val});
            });

            $html.on('change', '.nosh-month', function(){
                var val = $(this).val();
                self.change({month: val});
            });

            $html.on('click', 'td', function(){
                var me = $(this);
                var col = Number(me.data('col'));
                var index = Number(me.data('index'));
                if(!me.hasClass('disabled') && !me.hasClass('selected')){
                    var colData = self.data.day.list[col];
                    self.change({year: colData.year, month: colData.month, day: colData.list[index].day});
                }

                if(self.current.footer !== true){
                    self.current.input.val(self.getVal()).trigger('change');
                    self.closed();
                }
                return false;
            });

            $html.on('change', '.nosh-hour', function(){
                var val = $(this).val();
                self.change({hour: val});
            });

            $html.on('change', '.nosh-minute', function(){
                var val = $(this).val();
                self.change({minute: val});
            });

            $html.on('change', '.nosh-second', function(){
                var val = $(this).val();
                self.change({second: val});
            });

            $html.on('click', '.nosh-prev, .nosh-next', function(){
                var type = $(this).hasClass('nosh-prev') ? -1 : 1;
                var year = self.data.year.selected;
                var month = self.data.month.selected + type;

                if(month === 12){
                    year = year + 1;
                    month = 0;
                } else if(month === -1){
                    year = year - 1;
                    month = 11;
                }
                self.change({
                    year: year,
                    month: month
                });
                return false;
            });

            $html.on('click', '.nosh-confirm', function(){
                var val = self.getVal();
                $.pubCal('confirm', [self.current, val]);
                self.current.input.val(val).trigger('change');
                self.closed();
                return false;
            });

            $html.on('click', '.nosh-set-today', function(){
                var val = self.today();
                self.change(val);
                $.pubCal('confirmToday', [self.current, val]);
                self.current.input.val(self.getVal()).trigger('change');
                self.closed();
                return false;
            });

            if(self.display !== 'inline'){
                $(document).on('click.noshCalendar', function(event){
                    var $target = $(event.target);
                    if(self.current && !$target.is(self.current.input) && !$target.hasClass('nosh-calendar') && $target.closest('.nosh-calendar').length === 0 && !self.box.is(':hidden')){
                        self.closed();
                    }
                });

                $(document).on('keyup', function(event){
                    if(Number(event.keyCode) === 27){
                        self.closed();
                    }
                });
            }
            $.pubCal('init', self.box);
        }
    };

    /**
     * 数字下拉框模板
     * @param  {Array} arr      数组 {value: "5", disable: false, text: "05" }
     * @return {Html}           返回html片段
     */
    NoshCalendar.prototype.numberSelectOptions = function(arr, selected){
        var options = '';
        for(var i = 0; i < arr.length; i++){
            var val = arr[i];
            var disabled = val.disabled ? ' disabled="disabled"' : '';
            var selectedText = Number(val.value) === selected ? ' selected="selected"' : '';
            options += '<option value="'+ val.value +'"'+ selectedText + disabled +'>'+ val.text +'</option>';
        }
        return options;
    };

    /**
     * 日历头部
     * @return {Html}
     */
    NoshCalendar.prototype.header = function(){
        var locale = window.noshCalendar.locale;
        var self = this;
        var html = '<div class="nosh-header">'+
            '    <div class="header-content">'+
            '        <label class="year">'+
            '            <select class="nosh-year">'+ self.numberSelectOptions(self.data.year.list, self.data.year.selected) +
            '            </select> '+ locale.year +
            '        </label>'+
            '        <label class="month">'+
            '            <select class="nosh-month">'+ self.numberSelectOptions(self.data.month.list, self.data.month.selected) +
            '            </select> '+ locale.month +
            '        </label>'+
            '    </div>'+
            '    <a href="javascript:;" class="nosh-prev">'+ locale.prevMonth +'</a>'+
            '    <a href="javascript:;" class="nosh-next">'+ locale.nextMonth +'</a>'+
            '</div>';
        return html;
    };

    /**
     * 日历尾部
     * @return {Html}
     */
    NoshCalendar.prototype.footer = function(){
        var locale = window.noshCalendar.locale;
        var self = this;
        var minute = '\n<li>'+
            '    <label>'+
            '        <select class="nosh-minute">'+ self.numberSelectOptions(self.data.minute.list, self.data.minute.selected) +
            '        </select> '+ locale.minute +
            '    </label>'+
            '</li>\n';
        var second = '\n<li>'+
            '    <label>'+
            '        <select class="nosh-second">'+ self.numberSelectOptions(self.data.second.list, self.data.second.selected) +
            '        </select> '+ locale.second +
            '    </label>'+
            '</li>\n';
        var html = '';

        //如果格式没有分秒这不现实分秒
        if(/m/.test(self.current.format) === false){
            minute = '';
        }
        if(/s/.test(self.current.format) === false){
            second = '';
        }

        html = '<div class="nosh-footer">'+
            '    <ul>'+
            '        <li class="day nosh-selected-day">'+ self.data.year.selected + locale.year + self.fillZero(self.data.month.selected + 1) + locale.month + self.fillZero(self.data.day.selected) + locale.day +'</li>'+
            '        <li>'+
            '            <label>'+
            '                <select class="nosh-hour">'+ self.numberSelectOptions(self.data.hour.list, self.data.hour.selected) +
            '                </select> '+ locale.hour +
            '            </label>'+
            '        </li>'+ minute + second +
            '        <li class="btns">'+
            '            <button type="button" class="nosh-confirm">确定</button>'+
            '        </li>'+
            '        <li class="btns-today">'+
            '            <button type="button" class="nosh-set-today">今天</button>'+
            '        </li>'+
            '    </ul>'+
            '</div>';
        return html;
    };

    /**
     * 月日历表单
     * @param  {Array}  days  显示日历
     * @return {Html}
     */
    NoshCalendar.prototype.days = function(days, ext){
        var self = this;
        var header = '';
        var body = '';
        var html = '';
        var locale = window.noshCalendar.locale;
        var width = 100 / (self.current.show * 2 + 1);
        var preTitle = self.current.show > 0 ? '<tr><th colspan="7">'+ ext.year + locale.year + (ext.month + 1) + locale.month +'</th></tr>' : '';

        $.each(locale.weekdays, function(k){
            header += '<th>'+ locale.weekdays[k] +'</th>';
        });
        header = '<thead>'+ preTitle +'<tr>'+ header +'</tr></thead>';

        $.each(days, function(k, v){
            var checked = v.checked ? ' selected' : '';
            var disabled = v.disabled ? ' disabled' : '';
            var rowStart = '';
            var rowEnd = '';
            var weekend = self.checkIsWeekend(v.year, v.month, v.day) ? ' weekend' : '';
            var today = v.isToday ? ' today' : '';

            rowStart = k % 7 === 0 ? '<tr>' : '';
            rowEnd = k % 7 === 6 ? '</tr>' : '';
            body += rowStart +'<td class="'+ checked + disabled + weekend + today +'" data-col="'+ ext.index +'" data-index="'+ v.index +'" data-day="'+ v.year +'-'+ (v.month + 1) +'-'+ v.day +'">'+ v.text +'</td>'+ rowEnd;
        });
        html = '<div class="nosh-days" data-index="'+ ext.index +'" data-year="'+ ext.year +'" data-month="'+ ext.month +'" style="width: '+ width +'%;"><table>'+ header +'<tbody>'+ body +'</tbody></table></div>';
        return html;
    };

    /**
     * 日历主体部分
     * @return {Html}
     */
    NoshCalendar.prototype.body = function(){
        var self = this;
        var html = '';
        var width = self.current.width * (self.current.show * 2 + 1);
        $.each(self.data.day.list, function(k){
            var v = self.data.day.list[k];
            html += self.days(v.list, { year: v.year, month: v.month, index: k});
        });
        html = '<div class="nosh-body" style="width: '+ width +'px;">'+ html +'</div>';
        return html;
    };

    /**
     * 初次展示日历
     * @param  {Object} opts    current
     * @param  {Object} styles  附加样式
     */
    NoshCalendar.prototype.show = function(opts, styles){
        var self = this;
        var html = '';
        var body = '';
        var header = '';
        var footer = '';
        var width = 'auto';

        self.initCurrent(opts);
        self.setYearData();
        self.setMonthData();
        self.setDayData();
        self.setHourData();
        self.setMinuteData();
        self.setSecondData();

        if(self.dataFilter && $.isFunction(self.dataFilter)){
            self.data = $.extend(true, self.data, self.dataFilter(self.getData()) || self.emptyData());
        }
        width = self.current.width * (self.current.show * 2 + 1);

        header = self.header();
        body = self.body();
        if(self.current.footer === true){
            footer = self.footer();
        }

        styles.width = width;
        html = header + body + footer;

        self.box.css(styles).html(html).show();

        $.pubCal('show', [self.box, self.current, self.data]);
    };

    /**
     * 日历关闭
     */
    NoshCalendar.prototype.closed = function(){
        var self = this;
        if(self.display !== 'inline'){
            var input = self.current.input;
            self.box.empty().hide();
            self.resetData();
            self.current = null;
            $.pubCal('closed', input);
        }
    };

    /**
     * 日历数据改变
     * @param  {Object} d 页面改变值
     */
    NoshCalendar.prototype.change = function(d){
        var self = this;
        var html = '';
        var body = '';
        var header = '';
        var footer = '';

        self.resetData();

        $.each(d, function(k, v){
            self.current.valueObject[k] = Number(v);
        });

        self.setYearData();
        self.setMonthData();
        self.setDayData();
        self.setHourData();
        self.setMinuteData();
        self.setSecondData();

        if(self.dataFilter && $.isFunction(self.dataFilter)){
            self.data = $.extend(true, self.data, self.dataFilter(self.getData()) || self.emptyData());
        }

        header = self.header();
        body = self.body();
        if(self.current.footer === true){
            footer = self.footer();
        }

        html = header + body + footer;
        self.box.html(html);

        $.pubCal('change', [self.box, self.current, d, self.data]);
    };

    /**
     * 输出指定格式
     * @return {String} 这个值赋给input
     */
    NoshCalendar.prototype.getVal = function(){
        var r = moment(this.current.valueObject).format(this.current.format);
        return r;
    };

    /**
     * 自定义数据过滤，比如disabled特定的天数等
     * @param  {Object}  参数和返回的格式一致
     * @return {Object}
     */
    NoshCalendar.prototype.dataFilter = null;

    //暴露方法
    window.noshCalendar.c = NoshCalendar;
    window.noshCalendar.i = new NoshCalendar();

    $.fn.noshCalendar = function(options){
		var items = this;
        var i = window.noshCalendar.i;
        i.init();
        $.each(items, function(){
            var me = $(this);
            me.on('focus.noshCalendar', function(){
                var opts = me.data();
                var offset = me.offset();
                var styles = {
                    left: offset.left,
                    top: offset.top + me.outerHeight()
                };
                opts = $.extend(true, options || {}, opts);
                opts.input = me;
                opts.value = me.val();
                i.show(opts, styles);
            });
        });
        return this;
	};
}));
