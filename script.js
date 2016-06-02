/**
 * 	script.js
 *
 *  This script takes care for the visualization and 
 *  the functionality of the StarWars catalogue
 *  application.
 * 
 *  @author Tsvetelina Ikonomova 2016
 */

/**
 * 	Declare the main function.
 */
var App = function()
{
	this.init();
};

// global variables
var allPeople = [];
var allPlanets = [];
var filteredPeopleByPlanet = [];
var filteredByGender = 'all';

/**
 * 	Init function implementation.
 *  The beginning.
 */
App.prototype.init = function()
{
	// get the context
	var that = this;	

	// install on click event on the StarWars title
	$('.main-title').on('click', function() {

		// redirect the user to the peoples view
		window.location.href = window.location.origin + window.location.pathname;
	});

	// we should show the person info view
	if (window.location.hash) {

		// get the persons id from the hash 
		var hash = window.location.hash.split('#').pop();

		// create the request url
		var url = 'http://swapi.co/api' + hash; 

		// create  the callback 
	    var callback = function(json) {
	    	
	    	// parse the data 
	    	var person = JSON.parse(json);

	    	// create the callback for the planets
		    var getPlanet = function(json) {
		    	
		    	// parse the json
		    	var planet = JSON.parse(json);

		    	// add the prsonal info container
		    	that.personalInfo(person, planet);
		    }

		    // send the get request to get the planet
			that.send(person.homeworld, getPlanet);
	    }

	    // send the get request to get the person
		that.send(url, callback);
	}

	// we should show the peoples view 
	else {

		// create the planets url
		var planetsUrl = 'http://swapi.co/api/planets/'; 

		// create the planets callback 
	    var planetsCallback = function(results) {
	    	
	    	// parse the json
	    	var planetsData = JSON.parse(results); 
	   
	   		// add the new planets chunk to the global planets
			allPlanets = allPlanets.concat(planetsData.results);

			// send the request for the next planets chunk if any
			if (planetsData.next) that.send(planetsData.next, planetsCallback);

			// no planets chunks any more - get the people
			else {

				// add the planets filter
				that.addPlanetFilter();

				// update the DOM
				$('.filter').show();
				$('.loading').remove	();

				// create the peoples url
				var peopleUrl = 'http://swapi.co/api/people/'; 

				// create the peoples callback
			    var callback = function(json) {
			    	
			    	// parse the json
			    	var data = JSON.parse(json);
			    	
			    	// loop the add every person
			    	$.each(data.results, function(id, value) {
			    		that.addPerson(value);
			    	});

			    	// add the new peoples chunk to the global peoples
			    	allPeople = allPeople.concat(data.results);

			    	// send the request for the next peoples chunk if any
			    	if (data.next) that.send(data.next, callback);

			    	// no peoples chunks any more - add the peoples filter
			    	else {
			    		that.addGenderFilter();
			    	}
			    }

			    // send the get request to get the people
				that.send(peopleUrl, callback);
			}
		}

		// send the get request to get the planets
		that.send(planetsUrl, planetsCallback);
	}
};

/**
 * 	The GET request to get the data. 
 *  
 *  @param  string    the url 
 *  @param  function  the callback function 
 */
App.prototype.send = function(url, callback) 
{
	// create the request
	var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true); 
    xmlHttp.send(null);
};

/**
 * 	Add a person to the main container. 
 *  
 *  @param  object  the person to add 
 */
App.prototype.addPerson = function(person)
{
	// get the context 
	var that = this;

	// get the main container
	var $mainContainer = $('.main-container');

	// set the planet url - we don't know the planet name by now
	var planetUrl = person.homeworld;

	// add the person container to the DOM
	var $personContainer = $('<div class="person">').text(person.name).appendTo($mainContainer);

	// loop through the global planets 
	$.each(allPlanets, function(id, world) {

		// is this the person planet?
		if (world.url === person.homeworld) {

			// add the planet name to the person container
			$('<div class="planet">').text(world.name).appendTo($personContainer);
		}
	});
	
	// install on click event 
   	$personContainer.on("click", function(event) {
		
		// create the person info url 
		var hash = '#' + person.url.split("api").pop();

		// redirect the user to the person info view
		window.location.hash = hash;

		// restart the application 
		that.init();

	}).bind(that);
};

/**
 * 	Add the personal info container. 
 *  
 *  @param  object  the person  
 *  @param  object  the person's planet
 */
App.prototype.personalInfo = function(person, planet)
{ 
	// get the context 
	var that = this;

	// get the main conainter
	var $main = $('.main');

	// empty the main container
	$main.empty();	

	// add the info container to the DOM 
	var $mainInfo = $('<div class="main-info">').appendTo($main);

	// add the person's data to the DOM
	$('<h1 class="name">').text(person.name).appendTo($mainInfo);
	$('<div class="property gender">').text('Gender: ' + person.gender).appendTo($mainInfo);
	$('<div class="property birth_year">').text('Birth year: ' + person.birth_year).appendTo($mainInfo);
	$('<div class="property skin_color">').text('Skin color: ' + person.skin_color).appendTo($mainInfo);
	$('<div class="property hair_color">').text('Hair color: ' + person.hair_color).appendTo($mainInfo);
	$('<div class="property eye_color">').text('Eye color: ' + person.eye_color).appendTo($mainInfo);
	$('<div class="property height">').text('Height: ' + person.height).appendTo($mainInfo);
	$('<div class="property mass">').text('Mass: ' + person.mass).appendTo($mainInfo);
	$('<div class="property homeworld">').text('Homeworld: ' + planet.name).appendTo($mainInfo);

	// add the planet residents container
	var $residents = $('<div class="property residents">').text(planet.name + ' residents: ').appendTo($mainInfo);

	// loop through the planet residents
	$.each(planet.residents, function(id, value) {
		
		// create the resident callback
	    var callback = function(json) {

	    	// create the resident url 
	    	var hash = '#' + value.split("api").pop();

	    	// parse the json
	    	var person = JSON.parse(json);

	    	// add the resident to the DOM 
	    	var $link = $('<a class="resident">').text(person.name).appendTo($residents);

	    	// add comma if not the last resident
	    	if (planet.residents.length > id + 1) $('<span class="char">').text(', ').appendTo($residents);

	    	// install on click event
	    	$link.on('click', function(event) {

	    		// prevent the default behavior 
	    		event.preventDefault();

	    		// redirect the user to the resident info
	    		window.location.hash = hash;

	    		// restart the application
	    		that.init();
	    	});
	    }

	    // send the get request to get the resident
		that.send(value, callback);
	});
};

/**
 * 	Add the planet filter. 
 */
App.prototype.addPlanetFilter = function()
{ 
	// get the context
	var that = this;

	// get the planet filter 
	var $planetFilter = $('select#planet');

	// loop through the global planets
	$.each(allPlanets, function(id, value) {
		
		// if the planet has residents, add it to the filter
		if (value.residents.length) $('<option>').attr('value', value.name).text(value.name).appendTo($planetFilter);
	});

	// install on change event 
	$planetFilter.on('change', function(event) {

		// planet filter is set to all
		if ($planetFilter[0].value == 'all') {

			// gender filter is set to all - display all possible people
			if (filteredByGender === 'all') filteredPeopleByPlanet = allPeople;

			// gender is something else - filter by gender
			else {

				// get the filtered people by gender
				filteredPeopleByPlanet = allPeople.filter(function (el) {
					return (filteredByGender === el.gender);
				});
			}
		}

		// planets filter is set to specific planet
		else {	

			// the planet url 
			var planerUrl; 

			// loop through the global planets
			$.each(allPlanets, function(id, world) {

				// the planet is the same as the filter 
	    		if (world.name === $planetFilter[0].value) {

	    			// set the planet url
					planerUrl = world.url;
	    		}
	    	});

	    	// get the filtered people by this specific planet
			filteredPeopleByPlanet = allPeople.filter(function (el) {
				
				// the gender filter is set to all - filter only by specific planet 
				if (filteredByGender === 'all') return (el.homeworld === planerUrl);

				// filter by the specific planet and by the set gender filter
				else return (el.homeworld === planerUrl && filteredByGender === el.gender);
			});
		}

		// empty the main container
		$('.main-container').empty();

		// loop through the filtered people 
		$.each(filteredPeopleByPlanet, function(id, value) {

			// add every person
    		that.addPerson(value);
    	});
	}).bind(that);    
};

/**
 * 	Add the gender filter. 
 */
App.prototype.addGenderFilter = function()
{ 
	// get the context
	var that = this;

	// get the gender filter
	var $genderFilter = $('select#gender');

	// install on change event on the gender filter
	$genderFilter.on('change', function(event) {

		// if we have filter by planet, we have to filter by gender through the planet filter
		var currentFilteredPeople = filteredPeopleByPlanet.length ? filteredPeopleByPlanet : allPeople;

		// get the gender to filter
		filteredByGender = $genderFilter[0].value;

		// we have gender set to all - no need to filter by gender
		if ($genderFilter[0].value == 'all') filteredPeopleByGender = currentFilteredPeople;

		// we have specific gender set
		else {	

			// filter the people by this specific gender
			filteredPeopleByGender = currentFilteredPeople.filter(function (el) {
				return (el.gender === $genderFilter[0].value);
			});
		}

		// empty the main container
		$('.main-container').empty();

		// loop through the filtered people 
		$.each(filteredPeopleByGender, function(id, value) {

			// add every person
    		that.addPerson(value);
    	});
	}).bind(that);    
};
