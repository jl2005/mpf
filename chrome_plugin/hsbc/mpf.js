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
    var codes = ['HSIF','VAEF','HSHF'];
    //var codes = ['HSIF','VAEF','HSHF','VUEF', 'VSGF'];
    var names = ['HSIF','VAEF','HSHF','VUEF', 'VSGF'];
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
function inject_code_to_page(code){
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
function dropbox_upload(file, msg){
    var appKey = {
        key: 'mhdekr8ni11mgya',
        secret: '99g8t5rrlbnv8vs',
        sandbox: false,
        token: 'vcezb2vjs9f9azy',
        tokenSecret: 'z4ll8q2tvl58ezo',
        uid: 65338611,
    };
    var client = new Dropbox.Client(appKey);
    //client.authDriver(new Dropbox.Drivers.Redirect());
    //client.authenticate(function(error, data) {
    //    if (error) { return showError(error); }
    //    //doSomethingUseful(client);  // The user is now authenticated.
    //});
    msg = JSON.stringify(msg);
    var filename = "/public/HSBC-MPF/" + file +".txt";
    client.writeFile(filename, msg,
        function(error, stat) {
           if (error) 
             return showError(error);
        }
    );
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
    lastfund = Math.round(lastest.total_fund*100)/100;
    if(record.document.total_fund != lastfund){
        real_save(record);
        D_value = record.document.total_fund - lastfund;
        D_value = Math.round(D_value*100)/100;
        if(D_value>0){
            var file = 'Increased by '+ D_value + ', Now total: '+ record.document.total_fund;
            desc = '恭喜，您的强基金账户收入了' + D_value +'元';
        }else{
            var file = 'Decreased by '+ (0-D_value) + ', Now total: '+ record.document.total_fund;;
            desc = '请注意，您的强基金账户损失了' + (0-D_value) +'元';
        }
        desktop_notify(desc);
        dropbox_upload(file, record['document']);
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
    total = Math.round(total*100)/100;
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
        //inject_chart_btn();
        parse_and_save_record();
        //close_window();
        setTimeout(close_window, 2000);
    }
    if(history_page_titles.indexOf(document.title)!=-1){
    }
    if(document.title=="個人網上理財 - 香港匯豐"){
        unsafeInvoke(change_lang_to_ch);
    }
    if(document.title=="个人网上理财 - 香港汇丰"){
        unsafeInvoke(login_step1);
    }
    if(document.title=="输入密码及第二密码 - 香港汇丰"){
        unsafeInvoke(login_step2);
    }
    if(document.title=="我的HSBC - 香港汇丰"){
        unsafeInvoke(goto_mpf_page);
    }
}


function change_lang_to_ch(){
    PC_7_0G3UNU10SD0MHTI7TQA0000000000000_toggleLang('zh', '');
}
function login_step1(){
    document.getElementsByName('u_UserID')[0].value='username';
    document.getElementById('submittype').value = 'click';
    PC_7_0G3UNU10SD0MHTI7TQA0000000000000_selectLogonMode(0)
    PC_7_0G3UNU10SD0MHTI7TQA0000000000000_validate();
}
function login_step2(){
    document.getElementsByName('memorableAnswer')[0].value='password';
    var key_maps = {
        '第一': 'p',
        '第二': 'a',
        '第三': 's',
        '第四': 's',
        '第五': 'w',
        '第六': 'o',
        '倒数第二': 'r',
        '最后': 'd',
    };
    var labels = document.getElementsByTagName('label');
    var psws = Array();
    psws.push(key_maps[labels[2].innerText.replace(/\n|\r/g,"")]);
    psws.push(key_maps[labels[3].innerText.replace(/\n|\r/g,"")]);
    psws.push(key_maps[labels[4].innerText.replace(/\n|\r/g,"")]);
    setTimeout('focusNext(document.PC_7_0G3UNU10SD0MHTI7EMA0000000000000_2ndpwd.RCC_PWD1, document.PC_7_0G3UNU10SD0MHTI7EMA0000000000000_2ndpwd.RCC_PWD2, 1)', 100);
    document.getElementsByName('RCC_PWD1')[0].value = psws[0];
    setTimeout('focusNext(document.PC_7_0G3UNU10SD0MHTI7EMA0000000000000_2ndpwd.RCC_PWD2, document.PC_7_0G3UNU10SD0MHTI7EMA0000000000000_2ndpwd.RCC_PWD3, 1)', 100);
    document.getElementsByName('RCC_PWD2')[0].value = psws[1];
    document.getElementsByName('RCC_PWD3')[0].value = psws[2];
    PC_7_0G3UNU10SD0MHTI7EMA0000000000000_myvalidate(submitURL);
}
function goto_mpf_page(){
    PC_7_0G3UNU10SD0GHOSDV590000000000000_checkDropOff('/1/3/mpf?__cmd-All_MenuRefresh=');
}

function unsafeInvoke(callback) {
	/// <summary>非沙箱模式下的回调</summary>
	var cb = document.createElement("script");
	cb.type = "text/javascript";
	cb.textContent = buildCallback(callback);
	document.head.appendChild(cb);
}

function buildCallback(callback) {
	var content = "";
	content += "(" + buildObjectJavascriptCode(callback) + ")();";
	return content;
}

function buildObjectJavascriptCode(object) {
	/// <summary>将指定的Javascript对象编译为脚本</summary>
	if (!object) return null;

	var t = typeof (object);
	if (t == "string") {
		return "\"" + object.replace(/(\r|\n|\\)/gi, function (a, b) {
			switch (b) {
				case "\r":
					return "\\r";
				case "\n":
					return "\\n";
				case "\\":
					return "\\\\";
			}
		}) + "\"";
	}
	if (t != "object") return object + "";

	var code = [];
	for (var i in object) {
		var obj = object[i];
		var objType = typeof (obj);

		if ((objType == "object" || objType == "string") && obj) {
			code.push(i + ":" + buildObjectJavascriptCode(obj));
		} else {
			code.push(i + ":" + obj);
		}
	}

	return "{" + code.join(",") + "}";
}


get_records();
document.body.addEventListener('click', function() {
    window.webkitNotifications.requestPermission();
});
function close_window(){
    window.open("","_self");
    window.close();
}
//CLASSIFY PAGE
setTimeout(classify_page, 2000);
