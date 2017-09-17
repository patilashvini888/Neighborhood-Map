$(document).ready(function(){

    // Defining ViewModel model here
    function viewModel() {
      var map, infoWindow;
      var self = this;
      // center coordinates for san jose
    var sanjose = new google.maps.LatLng(37.338208,-121.886329);  

      self.markers = ko.observableArray([]);
      self.locations = ko.observableArray([]);
      self.filter =  ko.observable("");
      self.search = ko.observable("");

      // Initialization of google maps based on center coordinates of san jose
    function initialize() {
      var mapOptions = {
        center: sanjose,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      return new google.maps.Map(document.getElementById('map-canvas'), mapOptions);  
    }

    var map = initialize();
      if (!map) {
        alert("Google maps is not loading. Please try again later!");
        return;
      }  
    self.map = ko.observable(map);
    getForeSquareDetails(self.locations, self.map(), self.markers);

    // Function to filter the list view
    self.filteredArray = ko.computed(function() {
    return ko.utils.arrayFilter(self.locations(), function(itm) {
        if (itm.name.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1) {
            if(itm.marker)
              itm.marker.setMap(map); 
          } else {
            if(itm.marker)
              itm.marker.setMap(null);
          }     
          return itm.name.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1;
        });
      }, self);

      self.clickHandler = function(data) {
        highlightOnClick(data, self.map(), self.markers);
      };
    };

     // Marker bouncing
    function addMarkerBounce(marker) {  
     if (marker.setAnimation() != null) {
    marker.setAnimation(null);
      } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    }, 600);
  }
} 

 
  function highlightOnClick(data, map, markers) {

  // close the open infowindow  
  for (var i = 0; i < markers().length; i++) {
    markers()[i].infowindow.close(); 
  }  
  map.setCenter(new google.maps.LatLng(data.location.lat, data.location.lng));
  map.setZoom(12);
  for (var i = 0; i < markers().length; i++) {  
    var content = markers()[i].content.split('<br>');
    if (data.name === content[0]) {     
      addMarkerBounce(markers()[i]);
    }
  }
}  

  
  // Markers assigned for all locations
  function assignMarkers(locations, place, data, map, markers) {
    var latlng = new google.maps.LatLng(data.lat, data.lng);
    var marker = new google.maps.Marker({
      position: latlng,
      map: map,
      animation: google.maps.Animation.DROP,
      content: data.name + "<br>" + data.loc
    });
  
    var infoWindow = new google.maps.InfoWindow({
      content: marker.content
    });
    marker.infowindow = infoWindow;
    markers.push(marker);
    locations()[locations().length - 1].marker = marker;

    google.maps.event.addListener(marker, 'click', function() {
      for (var i = 0; i < markers().length; i++) {
        markers()[i].infowindow.close(); 
      }
      infoWindow.open(map, marker);
    });

    google.maps.event.addListener(marker, 'click', function() {
      addMarkerBounce(marker);
    });
}


    // Creating locations 
    var Model = [
    {"name": "Applebee's Neighborhood Grill & Bar", "latlng": [37.302746,-121.863106]},
    {"name": "The Cheesecake Factory", "latlng": [37.32436,-121.947459]},
    {"name": "P.F. Chang's", "latlng": [37.251223,-121.864116]},   
    {"name": "Grill on the Alley", "latlng": [37.332754,-121.888989]},   
    {"name": "Sultan Bakery", "latlng": [37.340341,-121.912767]},
    {"name": "Milohas", "latlng": [37.25566,-121.897003]},        
    {"name": "Chavelas Restaurant", "latlng": [37.321948,-121.879207]},    
    {"name": "Freshly Baked Eatery", "latlng": [37.339569,-121.889514]},   
    {"name": "The Table", "latlng": [37.308205,-121.901282]},    
    {"name": "Back A Yard", "latlng": [37.336728,-121.892619]}    
      ];


    // Retreiving location data information from foursquare
    function getForeSquareDetails(locations, map, markers) {

      // Called FourSquareAPI settings here
      clientID = "L2YMX4MAPS202H0W2SICIQ20CZXBSC0523QQ1SQZZWNH0SCU";
      clientSecret = "HDCAFWXYLTGVXLSL2GBUXNKAGYFAFEBPSSPUVWSXDQ12REO3";
      var locDataArray = [];
      var foursquareUrl = "";
      var location = [];
      for (var place in Model) {
        foursquareUrl = 'https://api.foursquare.com/v2/venues/search' + '?client_id=' +clientID +'&client_secret=' +clientSecret +
          '&v=20160118' +'&m=foursquare' +'&ll=' + Model[place]["latlng"][0] + ',' + Model[place]["latlng"][1] + '&query=' + Model[place]["name"] + '&intent=match';        
        $.getJSON(foursquareUrl, function(data) {         
          if(data.response.venues){
            var itm = data.response.venues[0];
            locations.push(itm);
            location = {lat: itm.location.lat, lng: itm.location.lng, name: itm.name, loc: itm.location.address + " " + itm.location.city + ", " + itm.location.state + " " + itm.location.postalCode};
            locDataArray.push(location);
            assignMarkers(locations, place, location, map, markers);
          } else {
            alert("Could not retreive data from Four Square. Please try again later!");
            return;
          }
        });    
      }
    } 
  ko.applyBindings(new viewModel());
});