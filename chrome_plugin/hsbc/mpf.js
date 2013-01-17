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

function injectScript(source)
{
    var elem = document.createElement("script");
    elem.type = "text/javascript";
    elem.innerHTML = source;
    document.head.appendChild(elem);
}

function inject_code_to_page(){
    var code = 'setTimeout("document.location.reload(true)",300000);';
    injectScript(code);
}

function save_record_to_mongohq(record){
    $.mongohq.documents.create({
        db_name: 'cuhk',
        col_name: 'mpf',
        params: JSON.stringify(record)
    });
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
    var doc = {
        document: record
    };
    save_record_to_mongohq(doc);
}
function classify_page(){
    if(page_titles.indexOf(document.title)!=-1){
        inject_code_to_page();
        parse_and_save_record();
    }
    if(history_page_titles.indexOf(document.title)!=-1){
    }
}

classify_page();
