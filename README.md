# jQuery 日历插件 noshCalendar

依赖moment.js [http://momentjs.com/][1]
支持jQuery 1.8+

#### 一、安装
引入calendar.js和calendar.css即可。
在线演示：[http://demo.estorm.cn/noshCalendar/index.html][2]
github: [https://github.com/myestorm/noshCalendar][3]
bug：[https://github.com/myestorm/noshCalendar/issues][4]

#### 二、基础用法

    <input value="2017/03/18 11:23:14" data-show="0" data-footer="true" data-format="YYYY/MM/DD HH:mm:ss" data-start="2005/02/03 11:23:14" data-end="2017/04/18 11:23:14">
    <script>
    $(document).ready(function(){
    $('input').noshCalendar();
    });
    </script>
或者这么用

    <input value="2017/03/18 11:23:14">
    <script>
    $(document).ready(function(){
    $('input').noshCalendar({
            show: 0,
            footer: false,
            format: 'YYYY-MM-DD',
            start: '2005-02-03',
            end: '2017-04-18'
        });
    });
    </script>

input参数说明：

 1. show: 0, 显示几个月，默认0。1则表示显示3个月 2表示显示5个月【以当前value月份为中心，两侧+show个月】
 2. footer: true, 默认true 是否显示底部，不显示底部，仅支持到天 
 3. format: YYYY/MM/DD HH:mm:ss,时间格式，默认YYYY/MM/DD HH:mm:ss ==> 2017/03/18 11:23:14 YYYY/M/D H:m:s ==> 2017/3/18 9:6:14 
 4. start: "", 区间开始，默认为空【即表示不限制】【today：今天】 
 5. end: "", 区间结束，默认为空【即表示不限制】【today：今天】 

PS：如果input的value为空时，则默认为当前时间。value,start,end格式要与format保持一致。

#### 三、全局配置

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
    
修改配置：

    window.noshCalendar.locale.firstDayOfWeek = 7;
    window.noshCalendar.locale.weekdays = ['日', '一', '二', '三', '四', '五', '六'];

PS：如果要修改全局配置，必须在调用noshCalendar方法之前。

#### 四、高级应用
直接显示日历实例：

    var myCalendar = function(){
        var id = 'calendar-box';
        var calendar = new window.noshCalendar.c();
        var defFormat = 'YYYY-MM-DD HH:mm:ss';
        var defTime = moment();
        var opts = {
            input: $('#'+ id),
            width: 430,
            value: defTime.format(defFormat),
            start: '',
            end: '',
            show: 1,
            footer: false,
            format: defFormat
        };
        var styles = {
            position: 'inherit'
        };

        /**这里可以开始重构模板            
        //select option
        calendar.numberSelectOptions = function(){
            return 'numberSelectOptions';
        };
        //头
        calendar.header = function(){
            return 'header';
        };
        //尾
        calendar.footer = function(){
            return 'footer';
        };
        //月
        calendar.days = function(){
            return 'days';
        };
        //body
        calendar.body = function(){
            return 'body';
        };*/

        //这里可以自定义过滤数据
        calendar.dataFilter = function(data){
            /*$.each(data.day.list[1].list, function(k, v) {
                data.day.list[1].list[k].text = '^_^';
            });*/
            return data;
        };

        $.subCal('initCurrent', function(event, current){ //初始化当前对象完成 与上文opts 一致
            if(current.input.is(opts.input)){
                console.log('我是我');
            } else {
                console.log('他不是我!!');
            }
        });

        $.subCal('init', function(event, box){ //初始化完成
            console.log(box);
        });

        $.subCal('show', function(event, box, current, data){ //显示完成
            console.log(box, current, data);
        });

        $.subCal('closed', function(event, input){ //关闭完成
            console.log(input);
        });

        $.subCal('confirm', function(event, current, val){ //点击确认按钮
            console.log(current, val);
        });

        $.subCal('confirmToday', function(event, current, val){ //点击今天按钮
            console.log(current, val);
        });

        $.subCal('change', function(event, box, current, d, data){ //每次值变化
            console.log(box, current, d, data);
        });

        calendar.init(null, id);
        calendar.show(opts, styles);
    };
    myCalendar();


  [1]: http://momentjs.com/
  [2]: http://demo.estorm.cn/noshCalendar/index.html
  [3]: https://github.com/myestorm/noshCalendar
  [4]: https://github.com/myestorm/noshCalendar/issues