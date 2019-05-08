// http://weather.service.msn.com/data.aspx?weadegreetype=C&culture=en-US&weasearchstr=80129
// http://msdn.microsoft.com/en-us/library/office/jj229138.aspx
// http://stackoverflow.com/questions/12142094/msn-weather-api-list-of-conditions

var getMSNWeatherData = function (searchString) {
    NOAAComplete = false;
	var ajaxObject = {
	    url: "http://weather.service.msn.com/data.aspx",
	    cache: false,
	    timeout: 9000,
		dataType: "xml",
	    data: {
	        culture: settingsObj.culture,
			weasearchstr: searchString,
	        weadegreetype: settingsObj.units
	    }
    };
    
	AJAXWrapper.getData(ajaxObject).then(function (xml) {
		var $xml = $(xml);
		if($xml.find('failure').length || $xml.find('weather').length === 0) {
			showError('<a href="#preferences-page"><h2>Try another location</h2></a>');
		} else {
	        var temp = settingsObj.units,
	            speed = (settingsObj.units === "F") ? "M" : "K",
	            $weather = $xml.find('weather'),
	            $weatherData = $weather.eq(0),
	            $current = $weatherData.find('current'),
	            alert = '';
			
			var currentConditions = '<li data-theme="a" class="weather-info">'
					+ '<h4 id="cityState">' + $weather.attr('weatherlocationname') + '</h4>'
					+ '<p>' + $current.attr("temperature") + "&deg;" + temp + "&nbsp;&nbsp;&nbsp;" + $current.attr("skytext")
		            // + " feels like " + $current.attr("feelslike") + "&deg;" + temp
		            // + '<br/>Humidity ' + $current.attr("humidity") + "% "
		            + '<br/><span class="wind">' + $current.attr("winddisplay").replace(' mph','M').replace(' km/hr', 'K') + '</span>' 
		            + '</p></li>';
			
			var $forecastDay = $weatherData.find('forecast'),
	            forecast = "";
			
			$forecastDay.each(function (index) {
				var forecastObject = {};
				// set date
				var shortDate = $(this).find('obsdate').text().substring(0, 5);
				if (parseInt(shortDate.charAt(0)) === 0) {
					shortDate = shortDate.substring(1, 5);
				}
				forecast += '<li data-theme="a" class="weather-info forecast"><img src="images/dot.png" />'
					+ '<h4 class="date">' + $(this).attr('day') + ' ' + $(this).attr('date').substring(5,10) + '</h4>';
				// set high
				forecast += '<div class="highLow">&nbsp;&nbsp;&nbsp;' + $(this).attr('skytextday').replace('Thunderstorms', 'T-storms') + '</div>';
				// set precip    
	            forecastObject.chanceOfRain = $(this).attr('precip');       
				forecast += '<div><span class="precip">' + $(this).attr('precip') + '%</span>' + '</div></li>';
	            forecastArray[index] = forecastObject;
			});
			$('#homePageList').remove();
	
			// warnings
			if($weather.attr('alert')) {
				alert = '<li data-theme="e" data-icon="alert"><a class="link" href="javascript:navigator.app.loadUrl(\'' + $weather.attr('url') + '\', { openExternal:true });">'+$weather.attr('alert')+'</a></li>';
			}
			$('.ui-content').append('<ul data-role="listview" data-theme="c" id="homePageList">' + alert + currentConditions + forecast + '</ul>').trigger('create');
			getAccuWeatherData({lat: $weatherData.attr('lat'), lon: $weatherData.attr('long')});
		}
	});
};
