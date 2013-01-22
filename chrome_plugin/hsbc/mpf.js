$.mongohq.authenticate({ apikey: '5wtp7my3207bmn7vdotc'});
var page_titles = [
    "強積金／職業退休計劃 - 香港滙豐",
    "强积金／职业退休计划 - 香港汇丰",
    "MPF / ORSO - HSBC in Hong Kong",
];
var history_page_titles = [
    '強積金過往供款紀錄 - 香港滙豐',
    '强积金过往供款纪录 - 香港汇丰',
    'MPF Contribution History - HSBC in Hong Kong'
]
var languages = [
    'zh-TW',
    '',
    'en',
];

var lastest = null;
var records = null;

function getClass(obj) {
  if (typeof obj === "undefined")
    return "undefined";
  if (obj === null)
    return "null";
  return Object.prototype.toString.call(obj)
    .match(/^\[object\s(.*)\]$/)[1];
}
function RemoveScript( strText )
{
    var regEx = /<script[^>]*>[^>]*<[^>]script>/g;
    return strText.replace(regEx, "");
}
function RemoveHTML( strText )
{
    var regEx = /<[^>]>/g;
    return strText.replace(regEx, "");
}
function RemoveA ( strText )
{
    var regEx = /<a[^>]*>[^>]*<[^>]a>/g;
    return strText.replace(regEx, "");
}

function RemoveAH ( strText )
{
    var regEx = /(<a[^>]*>)|(<[^>]a>)/g;
    return strText.replace(regEx, "");
}

function RemoveCenter( strText )
{
    var regEx = /(<center[^>]*>)|(<[^>]center>)/g;
    return strText.replace(regEx, "");
}
function RemoveBR( strText )
{
    var regEx = /(<br>)/g;
    return strText.replace(regEx, "");
}
function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    //var month = months[a.getMonth()];
    var month = a.getMonth()+1;
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = year+'-'+month+'-'+date+' '+hour+':'+min+':'+sec ;
    return time;
}
function injectEle(tag, type, source, name)
{
    var elem = document.createElement(tag);
    elem.type = type;
    elem.innerHTML = source;
    document[name].appendChild(elem);
}

function show_chart(){
    var codes = ['HSIF','VAEF','VEEF','VUEF', 'VSGF'];
    var names = ['HSIF','VAEF','VEEF','VUEF', 'VSGF'];
    var series = [];
    $.each(codes, function(i, code){
        series[i] = {
            name: code,
            data: records.map(function (value, index, ar){
                for(var j=0;j<value.funds.length;j++){
                    if(value.funds[j].code == code)
                        return value.funds[j].count;
                }
            })
        };
    });
    categories = records.map(function (value, index, ar){
        return timeConverter(value.ts);
    });
    
    chart = new Highcharts.Chart({
        chart: {
            renderTo: 'container',
            type: 'area',
            marginRight: 130,
            marginBottom: 25
        },
        title: {
            text: 'Daily MPF',
            x: -20 //center
        },
        subtitle: {
            text: 'Source: hsbc.com',
            x: -20
        },
        xAxis: {
            categories: categories,
            tickmarkPlacement: 'on',
            title: {
                enabled: false
            }
        },
        yAxis: {
            title: {
                text: 'Money(HKD $)'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }],
            labels: {
                formatter: function() {
                    return this.value / 1000;
                }
            }
        },
        tooltip: {
            shared:true,
            formatter: function() {
                var s = '<b>'+ this.x +'</b>';
                var total = 0;
                $.each(this.points, function(i, point) {
                    s += '<br/>'+ point.series.name +': '+
                        point.y +' $';
                    total += point.y;
                });
                s += '<br/>TOTAL: '+ total+ ' $';

                return s;
            },
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: -10,
            y: 100,
            borderWidth: 0
        },
        plotOptions: {
            area: {
                stacking: 'normal',
                lineColor: '#666666',
                lineWidth: 1,
                marker: {
                    lineWidth: 1,
                    lineColor: '#666666'
                }
            }
        },
        series: series
    });
}

function show_stock_chart(){
    var seriesOptions = [],
        yAxisOptions = [],
        seriesCounter = 0,
        names = ['HSIF','VAEF','VEEF','VUEF', 'VSGF'],
        colors = Highcharts.getOptions().colors;
    $.each(names, function(i, name){
        seriesOptions[i] = {
            name: name,
            data: records.map(function (value, index, ar){
                for(var j=0;j<value.funds.length;j++){
                    if(value.funds[j].code == name)
                        return [value.ts, value.funds[j].count];
                }
            }),
        };
    });
    seriesOptions.push({
        name: 'TOTAL',
        data: records.map(function (value, index, ar){
            return [value.ts, value.total_fund];
        })
    });
    //alert(JSON.stringify(seriesOptions));
    createChart();
    // create the chart when all data is loaded
    function createChart() {
        chart = new Highcharts.StockChart({
            chart: {
                renderTo: 'container'
            },
            rangeSelector: {
                selected: 4
            },
            yAxis: {
                labels: {
                    formatter: function() {
                        return (this.value > 0 ? '+' : '') + this.value + '%';
                    }
                },
                plotLines: [{
                    value: 0,
                    width: 2,
                    color: 'silver'
                }]
            },
            plotOptions: {
                series: {
                    compare: 'percent',
                    step: true,
                }
            },
            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
                valueDecimals: 2
            },
            series: seriesOptions
        });
    }
}
function inject_code_to_page(){
    var code = 'setTimeout("document.location.reload(true)",300000);';
    injectEle("script", "text/javascript",code, 'head');
}
function inject_chart_btn(){
    var code = '<div style="position: absolute;right:550px;top:130px" id="showchart">';
    code += 'Charts</div><div id="container"></div>';
    injectEle("span", "", code, 'body');
    $("#showchart").click(show_chart);
}

function desktop_notify(msg){
    if (window.webkitNotifications.checkPermission() == 0) {
      // 0 is PERMISSION_ALLOWED
      window.webkitNotifications.createNotification(
          'logo.gif', '汇丰强基金', msg).show();
    }
}
function get_records(){
    var ret = $.mongohq.documents.all({
        db_name: 'cuhk',
        col_name: 'mpf',
        query: {
            sort: JSON.stringify({ts: 1}),
            fields: JSON.stringify(['total_fund', 'ts', 'funds']),
            limit: 100,
        },
        success: function(result){
            lastest = result[result.length-1];
            records = result;
        }
    });
}

function save_record_to_mongohq(record){
    function real_save(record){
        $.mongohq.documents.create({
            db_name: 'cuhk',
            col_name: 'mpf',
            params: JSON.stringify(record)
        });
    }
    //try{
    //    JSON.stringify(lastest.funds);
    //} catch (error) {
    //    real_save(record);
    //}
    //if(JSON.stringify(record.document.funds)!=
    //   JSON.stringify(lastest.funds)){
    //    real_save(record);
    //}
    if(record.document.total_fund != lastest.total_fund){
        real_save(record);
        D_value = record.document.total_fund - lastest.total_fund;
        if(D_value>0){
            desc = '恭喜，您的强基金账户收入了' + D_value +'元';
        }else{
            desc = '请注意，您的强基金账户损失了' + (0-D_value) +'元';
        }
        desktop_notify(desc);
        html = "<div style='visibility:hidden;display:hidden;'>";
        html += "<iframe id='tts-iframe' style='display:none' width='1px' ";
        html += "height='1px' src='http://translate.google.cn/translate_tts?q=";
        html += desc;
        html += "&tl=zh-CN' ></iframe>";
        injectEle("span", "", html, 'body');
    }
}

function parse_and_save_record(){
    var record = {};
    var table = document.getElementsByClassName('hsbcTableStyle04')[2];
    var trs = table.getElementsByTagName('tr');
    var money = Array();
    var total = 0.0;
    for(var i=0;i<trs.length-1;i++){
        var fund = {};
        var tds = trs[i].getElementsByTagName('td');
        fund['name'] = tds[0].innerText;
        fund['code'] = tds[1].innerText;
        fund['count'] = parseFloat(tds[2].innerText.replace(/,/g, ''));
        total += fund['count'];
        fund['percent'] = parseFloat(tds[3].innerText);
        money.push(fund);
    }
    var d = new Date();
    record['funds'] = money;
    record['total_fund'] = total;
    record['year'] = d.getFullYear();
    record['month'] = d.getMonth()+1;
    record['date'] = d.getDate();
    record['hour'] = d.getHours();
    record['minute'] = d.getMinutes();
    record['second'] = d.getSeconds();
    record['ts'] = Date.now();
    var newone = {
        document: record
    };
    save_record_to_mongohq(newone);
}

function classify_page(){
    if(page_titles.indexOf(document.title)!=-1){
        inject_code_to_page();
        inject_chart_btn();
        parse_and_save_record();
    }
    if(history_page_titles.indexOf(document.title)!=-1){
        inject_code_to_page();
    }
}

get_records();
document.body.addEventListener('click', function() {
    window.webkitNotifications.requestPermission();
});
setTimeout('classify_page()', 2000);
