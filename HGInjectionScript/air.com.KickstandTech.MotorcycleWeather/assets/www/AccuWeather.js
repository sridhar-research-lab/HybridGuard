// http://thale.accu-weather.com/widget/thale/readme.asp

var getAccuWeatherData = function (obj) {
	var ajaxObject = {
	    url: "http://thale.accu-weather.com/widget/thale/weather-data.asp",
	    cache: false,
	    timeout: 9000,
	    dataType: "xml"
	};
	var units = (settingsObj.units === "F") ? "0" : "1"
	if (obj.zipCode) {
		ajaxObject.data = {
            location: obj.zipCode,
            metric: units
	    };
	} else {
		ajaxObject.data = {
			slat: obj.lat,
			slon: obj.lon,
            metric: units
	    };
	}
    
	AJAXWrapper.getData(ajaxObject).then(function (xml) {
		var $xml = $(xml);
		if($xml.find('failure').length) {
			showError('<a href="#preferences-page"><h2>Try another location</h2></a>');
		} else {
	        var $units = $xml.find("units"),
            	temp = $units.find("temp").text(),
	            speed = $units.find("speed").text().charAt(0),
	            $forecastDay = $xml.find('day');
	        	// $('#cityState').text($xml.find("local").find("city").text() + ' ' + $xml.find("local").find("state").text());
			
			$forecastDay.each(function (index) {
				var $daytime = $(this).find('daytime');
				
				// set high
				forecastArray[index].highTemp = $daytime.find('hightemperature').text();
				// set low
				forecastArray[index].lowTemp = $daytime.find('lowtemperature').text();
				$('.highLow').eq(index).html(forecastArray[index].highTemp + '&deg;/' + forecastArray[index].lowTemp  + '&deg;' + temp + " " + $('.highLow').eq(index).html());

				// precip type
				var precipType = "rain";
				if (parseFloat($daytime.find('snowamount').text()) > 0 || parseInt($daytime.find('iceamount').text()) > 0) {
					precipType = "snow";
				}
				$('.precip').eq(index).addClass(precipType).html($('.precip').eq(index).html());
	            forecastArray[index].windSpeed = $daytime.find('windspeed').text();
				$('.precip').eq(index).after('<span class="wind">' + forecastArray[index].windSpeed + speed + ' ' + $daytime.find('winddirection').text() + '</span>');
				$('.forecast').eq(index).find('img').attr('src','images/'+getWeatherImage(forecastArray[index])+'Weather.png');
			});
		}
	    $.mobile.loading( 'hide' );
	});
};

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
