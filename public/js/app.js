console.log('teste')
// const profile = {};


// function onSuccess(googleUser) {
	
// 	profile.fullName = googleUser.getBasicProfile().getName();
// 	profile.firstName = googleUser.getBasicProfile().getGivenName();
// 	profile.imgUrl = googleUser.getBasicProfile().getImageUrl();
// 	profile.email = googleUser.getBasicProfile().getEmail();


// 	console.log('Full Name: ' + googleUser.getBasicProfile().getName());
// 	console.log('Given Name: ' + googleUser.getBasicProfile().getGivenName());
// 	console.log('Image URL: ' + googleUser.getBasicProfile().getImageUrl());
// 	console.log('Email: ' + googleUser.getBasicProfile().getEmail());
// }
// function onFailure(error) {
//   console.log(error);
// }
// function renderButton() {
//   gapi.signin2.render('my-signin2', {
//     'scope': 'profile email',
//     'width': 240,
//     'height': 50,
//     'longtitle': true,
//     'theme': 'dark',
//     'onsuccess': onSuccess,
//     'onfailure': onFailure
//   });
// }

// // console.log(profile);
// module.exports = profile;


 // Note: This example requires that you consent to location sharing when
      // prompted by your browser. If you see the error "The Geolocation service
      // failed.", it means you probably did not give permission for the browser to
      // locate you.
      // const latLong = []

      // var map, infoWindow;
      // function initMap() {
      //   map = new google.maps.Map(document.getElementById('map'), {
      //     center: {lat: 41.8781, lng: 87.6298},
      //     zoom: 10
      //   });
      //   infoWindow = new google.maps.InfoWindow;
      //   console.log(infoWindow);

      //   // Try HTML5 geolocation.
      //   if (navigator.geolocation) {
      //     navigator.geolocation.getCurrentPosition(function(position) {
      //       var pos = {
      //         lat: position.coords.latitude,
      //         lng: position.coords.longitude
      //       };
      //       latLong.push(pos)

      //       infoWindow.setPosition(pos);
      //       infoWindow.setContent('Location found.');
      //       infoWindow.open(map);
      //       map.setCenter(pos);
      //       let marker = new google.maps.Marker({position: pos, map: map});
      //     }, function() {
      //       handleLocationError(true, infoWindow, map.getCenter());
      //     });
      //   } else {
      //     // Browser doesn't support Geolocation
      //     handleLocationError(false, infoWindow, map.getCenter());
      //   }
      // }

      // function handleLocationError(browserHasGeolocation, infoWindow, pos) {
      //   infoWindow.setPosition(pos);
      //   infoWindow.setContent(browserHasGeolocation ?
      //                         'Error: The Geolocation service failed.' :
      //                         'Error: Your browser doesn\'t support geolocation.');
      //   infoWindow.open(map);
      // }

      // module.exports = position;
//  function initMap() {
//         map = new google.maps.Map(document.getElementById('map'), {
//           center: {lat: 41.8781, lng: 87.6298},
//           zoom: 10
//         });
//  var map, infoWindow;
//   infoWindow = new google.maps.InfoWindow;
//   if (navigator.geolocation) {
//           navigator.geolocation.getCurrentPosition(function(position) {
            
//             const lat = position.coords.latitude
//             const lng = position.coords.longitude
//           })
//      } else {
//           // Browser doesn't support Geolocation
//           const lat = 41.8781
//           const lng = 87.6298
//         }  
// }
// var platform = new H.service.Platform({
//   'app_id': '{9Jfnwd59kOCF5Ej3Gf5C}',
//   'app_code': '{1lglqwoyeqDmQ_kweOKABw}'
// });
// // Retrieve the target element for the map:
// var targetElement = document.getElementById('mapContainer');

// // Get default map types from the platform object:
// var defaultLayers = platform.createDefaultLayers();

// // Instantiate the map:
// var map = new H.Map(
//   document.getElementById('mapContainer'),
//   defaultLayers.normal.map,
//   {
//   zoom: 10,
//   center: { lat: 52.51, lng: 13.4 }
//   });

// // Create the parameters for the geocoding request:
// var geocodingParams = {
//     searchText: '200 S Mathilda Ave, Sunnyvale, CA'
//   };

// // Define a callback function to process the geocoding response:
// var onResult = function(result) {
//   var locations = result.Response.View[0].Result,
//     position,
//     marker;
//   // Add a marker for each location found
//   for (i = 0;  i < locations.length; i++) {
//   position = {
//     lat: locations[i].Location.DisplayPosition.Latitude,
//     lng: locations[i].Location.DisplayPosition.Longitude
//   };
//   marker = new H.map.Marker(position);
//   map.addObject(marker);
//   }
// };

// // Get an instance of the geocoding service:
// var geocoder = platform.getGeocodingService();

// // Call the geocode method with the geocoding parameters,
// // the callback and an error callback function (called if a
// // communication error occurs):
// geocoder.geocode(geocodingParams, onResult, function(e) {
//   alert(e);
// });


