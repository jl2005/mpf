
function schedule(){
	date = new Date();
	if(date.getHours()<=16&&date.getHours()>=14){
		chrome.tabs.create({
			url: "https://www.ebanking.hsbc.com.hk/1/2/logon?LANGTAG=zh&COUNTRYTAG=HK"
		});
		//localStorage["open"] = true;
	}
}
setInterval(schedule, 60*60*1000);
