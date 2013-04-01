$( document ).on("pageshow", "#helloWorldPage2", function() {
	HelloWorld.addApplicationAccess(new Date());
	HelloWorld.displayApplicationAccessList();
});
$(document).on("pageinit","#quakeShake", function() {
	QuakeShake.loadData();
	$("#refreshBtn").on("click", QuakeShake.refreshData);
});

jQuery.fn.reverse = function() {
    return this.pushStack(this.get().reverse(), arguments);
};
var HelloWorld = {
	getTimestampObject : function(){
		var savedTimestampStr =localStorage.getItem("helloWorldAccess");
		var savedTimestampObj = null;
		//if we have some JSON text from the local storage, parse into JSON obj
		if(savedTimestampStr != null && savedTimestampStr != ''){
			savedTimestampObj = JSON.parse(savedTimestampStr);
		}
		return savedTimestampObj;
	},
	addApplicationAccess : function (timestamp){
		var savedTimestampObj = this.getTimestampObject();

		//Add the current timestamp to the JSON obj
		if(savedTimestampObj != null){
			savedTimestampObj.push({time:timestamp});
		}else{
			//First visit - add one element to the obj
			savedTimestampObj = [{time: timestamp}];
		}
		//save the string version of the JSON obj in localstorage
		localStorage.setItem("helloWorldAccess", JSON.stringify(savedTimestampObj));
	},
	displayApplicationAccessList : function(){
		var ul = $('#applicationAccessList');
		ul.html("");
		var timestamps = this.getTimestampObject();

		$.each(timestamps.reverse(), function(key){
			var timestamp = new Date(this.time);
			ul.append("<li>"+timestamp.toLocaleDateString()+" at "+ timestamp.toLocaleTimeString() + "</li>");
		});

		$('#applicationAccessList').listview('refresh');
	}
};

var QuakeShake = {
	loadData : function(){
		var url = "http://earthquake.usgs.gov/earthquakes/shakemap/rss.xml";

		$.ajax({
				url: document.location.protocol + '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=30&callback=?&q=' + encodeURIComponent(url),
				success: function(data){
					QuakeShake.processQuakeData(data.responseData.feed.entries);
				},
				crossDomain: true,
				dataType: 'json'
			});
	},
	processQuakeData : function(quakeData){
		var ul = $('#earthquakeList');
		ul.html('');
		ul.append("<li data-role=list-divider>Earthquakes</li>");

		$.each(quakeData, function(key){
			var itemDetails = this.contentSnippet;
			var itemTitle = this.title;
			var itemTime = QuakeShake.getTimeFromContent(itemDetails);
			var itemLatLong = QuakeShake.getLatLong(itemDetails);
			var magnitude = QuakeShake.getMagnitude(this.categories[0]);
			var link = this.link;

			ul.append("<li class='item' id='entry-"+key+"''>"+
						"<a class='"+magnitude+"' href='"+ link + "'>" + 
						"<h1>Title :: "+itemTitle+ "</h1>"+
						"<p> Date :: "+ itemTime.toLocaleDateString()+" at "+ itemTime.toLocaleTimeString() + "</p>" +
						"<p>Lat/Long :: " + itemLatLong + "</p>" +
						"</a>"+
						"<a href='#' class='delete' id='"+key+"'/>"+
					  "</li>");
		});
		$(".delete").click(function(){
			removeRow(this.id);
		});
		$('#earthquakeList').listview('refresh');
	},
	getTimeFromContent : function(item){
		var endStr = "Lat/Lon";
		var startStr = "Date:";

		var startIndex = item.indexOf(startStr);
		var endIndex = item.indexOf(endStr);
		var dateString = item.substring(startIndex, endIndex);
		dateString = dateString.replace(startStr, '');

		var d = new Date(dateString);
		return d;
	},
	getLatLong : function(item){
		var endStr = "Depth:";
		var startStr = "UTCLat/Lon:";

		var startIndex = item.indexOf(startStr);
		var endIndex = item.indexOf(endStr);
		var latLongString = item.substring(startIndex, endIndex);
		latLongString = latLongString.replace(startStr, '');
		return latLongString;
	},
	getMagnitude: function(depthNum){
		var magnitude = "default";
		if (depthNum >= 5){
			magnitude = "lightRed";
		}if(depthNum >= 7){
			magnitude = "red";
		}

		return magnitude;
	},
	refreshData : function(){
		$('#earthquakeList').html('<li>Loading...</li>');
		QuakeShake.loadData();
	},

	removeRow: function(idToRemove){
		idToRemove = "#entry-" + idToRemove;
		$(idToRemove).remove();
	}
};