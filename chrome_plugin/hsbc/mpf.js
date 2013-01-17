$.mongohq.authenticate({ apikey: '5wtp7my3207bmn7vdotc'});
var titles = [
    "強積金／職業退休計劃 - 香港滙豐",
    "强积金／职业退休计划 - 香港汇丰",
    "MPF / ORSO - HSBC in Hong Kong",
];
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
    return document.head.appendChild(elem);
}

function inject_code_to_list_page(){
    var code = [
        'var cur_page = parseInt($("#RecNo").attr("value"));',
        'var next = cur_page+1;',
        'var text = $("td[colspan=7]").html();',
        'var step = "&nbsp;/&nbsp;".length;',
        'var indexStart = text.indexOf("&nbsp;/&nbsp;")+step;',
        'var indexEnd = text.indexOf("<a", indexStart);',
        'var total = parseInt(text.substring(indexStart,indexEnd));',
        'if(next<=3){ setTimeout("GoPage(next);",15000);}',
        'else{ setTimeout("GoPage(1);",900000); }'
    ];
    code = code.join(' ');
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
    
}
function classify_page(){
    
}
classify_page();
