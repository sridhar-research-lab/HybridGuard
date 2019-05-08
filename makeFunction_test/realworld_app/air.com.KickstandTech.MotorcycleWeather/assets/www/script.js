/*  Make preferences full screen
 *  Make temp double slider
 *  Touch for more weather data
 *  Translations
 */

var debug = false,
    latitude = 0,
    longitude = 0,
    forecastArray = [],
	$preferencesPage,
	$homePageList,
	isPanelOpen = false;

/***************************************************
 * Settings Object
 ***************************************************/

var settingsObj = {};
	settingsObj.units = "F";
    settingsObj.minLowTemp = "35";
    settingsObj.maxHighTemp = "100";
    settingsObj.maxChanceOfPrecip = "30";
    settingsObj.maxWind = "20";
    settingsObj.zipCode = "";
    settingsObj.culture = "en-us";
    settingsObj.showSetup = true;    

$(document).on("mobileinit", function(){
	  //apply overrides here
	$.mobile.defaultPageTransition = 'none';
});

$(document).delegate("#home-page", "pageinit", function () {
	if (debug) console.log('pageinit');
	if(navigator.userAgent.indexOf('Windows') != -1) {
		onDeviceReady(); // For chrome development
	} else {
		document.addEventListener("deviceready", onDeviceReady, false);
	}
});								

function onDeviceReady() {
	if(debug) console.log("onDeviceReady");
	// Set Page Title
	$('#home-page .ui-header h1').text(appType+" Weather");
	getSettings();
	setEventHandlers();
}

/***************************************************
 * Event Handlers
 ***************************************************/

function setEventHandlers() {
	if(debug) console.log("eventHandlers");
	$preferencesPage = $('#preferences-page');
	$homePageList = $('#homePageList');
	document.addEventListener("backbutton", onBackKeyDown, false);
	document.addEventListener("menubutton", onMenuKeyDown, false);

	$preferencesPage.on( "change", "#metric", function() {
		$preferencesPage.find('.temp').text('(C)');	
		$preferencesPage.find('.speed').text('(KPH)');
	});
	
	$preferencesPage.on( "change", "#english", function() {
		$preferencesPage.find('.temp').text('(F)');
		$preferencesPage.find('.speed').text('(MPH)');
	});
	
	$preferencesPage.on( "pagebeforehide", function( event, ui ) {
		setSettings();
		updateWeatherData();
		isPanelOpen = false;
	});
	
	$preferencesPage.on( "pagebeforeshow", function( event, ui ) {
		setForm();
		if(settingsObj.units === "C") {
			$preferencesPage.find('#english').prop("checked", false).checkboxradio("refresh");
			$preferencesPage.find('#metric').prop("checked", true).checkboxradio("refresh");
			$preferencesPage.find('.temp').text('(C)');	
			$preferencesPage.find('.speed').text('(KPH)');
		} else {
			$preferencesPage.find('.temp').text('(F)');
			$preferencesPage.find('.speed').text('(MPH)');			
		}
		$("input[type=number]").slider("refresh");
		$('#homePageList').empty();
		isPanelOpen = true;
	});
}

function onBackKeyDown() {
	if(debug) console.log("onBackKeyDown: "+$.mobile.activePage.attr('id'));
	if(isPanelOpen) {
		$preferencesPage.find('.ui-btn-right').trigger('click');
	} else {
		device.exitApp();
	}
}

function onMenuKeyDown() {
	$preferencesPage.panel( "open" );	
}

/***************************************************
 * Get Weather Data
 ***************************************************/

function updateWeatherData() {
	if(debug) console.log('updateWeatherData');
	$.mobile.loading( 'show' );
	if(settingsObj.zipCode && settingsObj.zipCode != "") {
		if(debug) console.log('get weather by zip');
		latitude = 0;
		longitude = 0;
		getMSNWeatherData(settingsObj.zipCode);
	} else {
		if(debug) console.log('get location');
		if(latitude !== 0) {
			getMSNWeatherData(latitude + "," + longitude);			
		} else if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError, { maximumAge: 600000, timeout: 7000, enableHighAccuracy: true });
		} else {
			console.log('geolocation not supported');
		}
	}
}

/***************************************************
 * Location
 ***************************************************/

var onLocationSuccess = function(position) {
	if(debug) console.log('location success');
	latitude = 	position.coords.latitude;
	longitude = position.coords.longitude;
	getMSNWeatherData(position.coords.latitude + "," + position.coords.longitude);
};

function onLocationError(error) {
	if(debug) console.log("onLocationError");
	if(debug) console.log('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
	latitude = 	0;
	longitude = 0;
	$('#homePageList').empty();
	showError('<a href="#preferences-page">Location not found, enter a location</a>');
	$.mobile.loading( 'hide' );
}

/***************************************************
 * Settings
 ***************************************************/

function setSettings() {
	if(debug) console.log("setSettings: "+$('#minLowTemp').val());
	settingsObj.units = $('input:radio[name=units]:checked').val();
	settingsObj.culture = $('#culture').val();
	settingsObj.minLowTemp = $('#minLowTemp').val();
	settingsObj.maxHighTemp = $('#maxHighTemp').val();
	settingsObj.maxChanceOfPrecip = $('#maxChanceOfPrecip').val();
	settingsObj.maxWind = $('#maxWind').val();
	settingsObj.zipCode = $('#zipCodeSetting').val();
	if(settingsObj.showSetup) settingsObj.showSetup = false;	

    var db = window.openDatabase("Database", "1.0", "MotorcycleWeather", 200000);
    db.transaction(populateDB, populateError);
}

function populateDB(tx) {
    tx.executeSql('DROP TABLE IF EXISTS SETTINGS');
    tx.executeSql('CREATE TABLE IF NOT EXISTS SETTINGS (id unique, data)');
    tx.executeSql('INSERT INTO SETTINGS (id, data) VALUES (1, \'' + JSON.stringify(settingsObj) + '\')');
}

function getSettings() {
	if(debug) console.log("getSettings");
    var db = window.openDatabase("Database", "1.0", "MotorcycleWeather", 200000);
    db.transaction(queryDB, queryError);
}

function queryDB(tx) {
    tx.executeSql('SELECT * FROM SETTINGS', [], querySuccess, selectError);
}

// Query the success callback
function querySuccess(tx, results) {
    var len = results.rows.length;
    for (var i=0; i<len; i++){
        settingsObj = JSON.parse(results.rows.item(i).data)
    }
    if(debug) console.log(settingsObj);
    updateWeatherData();
}

function populateError(err) {
	if(debug) console.log("populateError");
    updateWeatherData();
    if(debug) console.log(err.message);
}

function queryError(err) {
	if(debug) console.log("queryError");
    updateWeatherData();
    if(debug) console.log(err.message);
}

function selectError(err) {
	if(debug) console.log("selectError");
    updateWeatherData();
    if(debug) console.log(err.message);
}

function setForm() {
	if(debug) console.log("setForm "+settingsObj.culture);
	if(settingsObj.culture) {
		$('#culture').val(settingsObj.culture).selectmenu("refresh");
	}
	$('input:radio[value=' + settingsObj.culture + ']').prop("checked", true).checkboxradio("refresh");
	$('#maxHighTemp').val(settingsObj.maxHighTemp);
	$('#minLowTemp').val(settingsObj.minLowTemp);
	$('#maxChanceOfPrecip').val(settingsObj.maxChanceOfPrecip);
	$('#maxWind').val(settingsObj.maxWind);
	$('#zipCodeSetting').val(settingsObj.zipCode);
}

function showError(error) {
	$.mobile.loading( 'hide' );
	if($("#error").length) {
		$("#error").remove();
	}
	$('#loading').remove();
	$('#homePageList').prepend('<li data-theme="e" id="error">'+error+'</li>').listview("refresh");
}

/***************************************************
 * Utilities
 ***************************************************/

var AJAXWrapper = {
    getData: function (a) {
        $.mobile.loading("show");
        var b = $.Deferred();
        a.success = b.resolve;
        $.ajax(a).error(function () {
            showError('<a href="javascript:updateWeatherData();">Connection error, try again</a>');
            $.mobile.loading("hide");
        });
        return b.promise();
    }
};