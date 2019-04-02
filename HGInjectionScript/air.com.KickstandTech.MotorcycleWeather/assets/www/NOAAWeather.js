/***************************************************
 * Weather Forecast Object
 * http://graphical.weather.gov/xml/SOAP_server/ndfdXML.htm
 ***************************************************/

var timeLayoutArray = [],
    weatherForecastArray = [],
    now = new Date();

var getNOAAWeatherData = function (obj) {
	var ajaxObject = {
	    url: "http://graphical.weather.gov/xml/SOAP_server/ndfdXMLclient.php",
	    cache: false,
	    dataType: "xml"
	};    
	// set params
	ajaxObject.data = {			
		product: "time-series",
		end: getFormatedEndDate()+"T00:00:00",
		pop12: "pop12",
		wwa: "wwa",
		unit: "e"
	};
	if (obj.zipCode) {
		ajaxObject.data.zipCodeList = obj.zipCode;
	} else {
		ajaxObject.data.lat = obj.lat;
		ajaxObject.data.lon = obj.long;
	}
	AJAXWrapper.getData(ajaxObject).then(function (xml) {
		var xml = $(xml);
		getHazards(xml);
		getPrecip(xml);
	    $.mobile.loading( 'hide' );
    });
};

var getPrecip = function(xml) {
	var timeLayoutArray = [],
		timeLayout = xml.find('time-layout').eq(0).find('start-valid-time').each(function() {
			timeLayoutArray.push($(this).text());
		}),
		count = 0,
		$forecast = $('.forecast');
    xml.find("probability-of-precipitation").find('value').each(function(index) {
    	if(timeLayoutArray[index].split('T')[1].split(':')[0] < 11 && count < 5) {
    		forecastArray[count].chanceOfRain = $(this).text();
            $forecast.eq(count).find('img').attr('src','images/'+getWeatherImage(forecastArray[count])+'Weather.png').attr('style','opacity:1');
            $forecast.eq(count).find('.precip').html("<label>" + forecastArray[count].precipType + "</label>" + forecastArray[count].chanceOfRain + "%");
    		count++;
    	}
    });
}

var getHazards = function(xml) {
	var uniqueItems = new Array(),
		hazardLinks = "";
    xml.find("hazard").each(function() {
    	var phenomena = $(this).attr("phenomena");
		if($.inArray(phenomena, uniqueItems) === -1) {
			var hazardUrl = $(this).children().eq(0).text();
			uniqueItems.push(phenomena); 
			hazardLinks += "<a href='" + hazardUrl 
				+ "' rel='external' target='_blank'>" + phenomena 
				+ " " + $(this).attr("significance") + "</a> ";
		}
    });
    if(hazardLinks !== "") {
		$('#homePageList').prepend('<li id="weatherAlert" class="ui-li ui-li-static ui-btn-up-e">'+hazardLinks+'</li>');
    }
}

function getWeatherImage(forecastItem) {
    if(forecastItem.highTemp <= parseInt(settingsObj.maxHighTemp)
       && forecastItem.lowTemp >= parseInt(settingsObj.minLowTemp)
       && forecastItem.chanceOfRain <= parseInt(settingsObj.maxChanceOfPrecip)
       && forecastItem.windSpeed <= parseInt(settingsObj.maxWind)) {
        return "good";
    } else {
        return "bad";
    }
}

/***************************************************
 * Utility Methods
 ***************************************************/

function between(x, minNum, maxNum) {
    return x >= minNum && x <= maxNum;
}

function addZero(n){
	return n < 10 ? '0' + n : '' + n;
}

function getFormatedEndDate() {
	var endDate = now;
		endDate.setMonth(endDate.getMonth()+1);
	return getFormatedDate(endDate);
}

function getFormatedDate(thisDate) {
	return thisDate.getFullYear()+"-"+addZero(eval(addZero(eval(thisDate.getMonth()+1))))+ "-"+addZero(thisDate.getDate());
}