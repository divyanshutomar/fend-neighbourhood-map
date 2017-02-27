// List of some restaurants in Rohini, Delhi
var local_restaurants = [
    {
        "res_id": 302362,
        "name": "V.V. Eating Joint",
        "location": {
          "lat": 28.7236370000,
          "lng": 77.1277865000
        }
    },
    {
        "name": "Puri Bakers",
        "res_id": 18322619,
        "location": {
          "lat": 28.7233989000,
          "lng": 77.1275673000
        }
    },
    {
        "name": "Bansi Wala Sweets",
        "res_id": 304085,
        "location": {
          "lat": 28.7233687000,
          "lng": 77.1274732000
        }
    },
    {
        "res_id": 9368,
        "name": "Have More Chinese Food Corner",
        "location": {
          "lat": 28.7221222000,
          "lng": 77.1330636000
        }  
    },
    {
        "res_id": 7679,
        "name": "Chit Chat",
        "location": {
          "lat": 28.7236979000,
          "lng": 77.1274382000,
        }
    },
    {
        "res_id": 18420664,
        "name": "Niti Shake & Ice Cream Hub",
        "location": {
          "lat": 28.7237383000,
          "lng": 77.1273933000
        }
    },
    {
        "res_id": 302348,
        "name": "Ane China",
        "location": {
          "lat": 28.7234437000,
          "lng": 77.1271236000
        }
    },
    {
        "res_id": 5264,
        "name": "Ase China",
        "location": {
          "lat": 28.7179306000,
          "lng": 77.1279776000
        }
    },
    {
        "res_id": 5304,
        "name": "Food Valley",
        "location": {
          "lat": 28.7191062000,
          "lng": 77.1257752000
        }
    },
    {
        "res_id": 5311,
        "name": "Khana Khazana",
        "location": {
          "lat": 28.7195115000,
          "lng": 77.1253305000
        }
    }
]

// Zomato API Globals
var zomato_user_key = '495d924b1dbdd783eb045f8649afaab6';
var restDetailsURL = 'https://developers.zomato.com/api/v2.1/restaurant';

// Google Map Globals
var map;
var infoWindow;
var mapBounds;

// Function to set error on page
function setErrorText() {
    document.getElementById('errorMessage').style.display = 'block';
    document.getElementById('errorMessage').innerHTML = 'Sorry, something went wrong. Please try again later.';
}
// Function called when google maps script gets executed upon page load
function initMap() {
    var mapOptions = {
        center: {lat: 28.722175, lng: 77.130014},
        zoom: 16
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    infoWindow = new google.maps.InfoWindow({
        maxWidth: 150,
        content: ""
    });
    mapBounds = new google.maps.LatLngBounds();

    //Toggles Marker's Animation Effect
    function toggleMarkerEffect(targetMarker) {
        if (targetMarker.getAnimation() !== null) {
            targetMarker.setAnimation(null);
        } else {
            targetMarker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                targetMarker.setAnimation(null);
            }, 400);
        }
    };

    // Close info window on losing focus
    map.addListener("click", function(){
        infoWindow.close(infoWindow);
    });

    // Restaurant Object for storing restaurant details
    var Restaurant = function(restData) {
        this.name = ko.observable(restData.name);
        this.location = restData.location;
        this.rest_id = restData.res_id;
        this.ratingVal = 0;
        this.marker = {};
        this.imageURL = '';
        this.cuisines = '';
    }

    // Function to generate content for Restaurant's Info InfoWindow
    function generateInfoContent(restObj) {
        var contentString = `<div class='container'>
            <h2>Restaurant Info :</h2>
            <h4>${restObj.name}</h4>
            <img src=${restObj.imageURL} style='width:200px;height:120px' />
            <h4>Restaurant Rating : ${restObj.ratingVal}/5.0</h4>
            <h4>Cuisines : ${restObj.cuisines}</h4>
            <hr/>
            <h4>Powered by Zomato <img style='width:15px;height:15px;' src="https://b.zmtcdn.com/images/logo/zomato.jpg"></h4>
        </div>`
        var errMessage = "Zomato has no data for this place."
        if (restObj.name.length > 0) {
        return contentString;
        } else {
        return errMessage;
        }
    }

    // Knockout's Controller
    function KO_ViewModel() {
        var self = this;

        this.isNavClosed = ko.observable(false);
        this.navClick = function () {
            this.isNavClosed(!this.isNavClosed());
        };

        // List of initial restaurants
        this.restList = ko.observableArray();
        local_restaurants.forEach(function(item) {
            self.restList.push(new Restaurant(item));
        });

        this.restList().forEach(function(restaurant) {
            var marker = new google.maps.Marker({
                map: map,
                position: restaurant.location,
                animation: google.maps.Animation.DROP
            });
            restaurant.marker = marker;
            // Extend the boundaries of the map to include marker
            mapBounds.extend(marker.position);
            // Open info window on click of a marker
            marker.addListener("click", function(event) {
                infoWindow.setContent(generateInfoContent(restaurant));
                infoWindow.open(map, marker);
                toggleMarkerEffect(marker);
                map.panTo(this.position);
                map.panBy(0, -100);
            });
        });

        // Zomato API request to get details of each restaurant

        self.getZomatoData = ko.computed(function() {
           self.restList().forEach(function(item){
                $.ajax({
                    type: "GET",
                    url: `${restDetailsURL}?res_id=${item.rest_id}`,
                    dataType: "json",
                    headers: {
                        "user-key": zomato_user_key,
                    },
                    cache: false,
                    success: function(data) {
                        item.name = data.name;
                        item.ratingVal = data.user_rating.aggregate_rating;
                        item.imageURL = data.featured_image;
                        item.cuisines = data.cuisines;
                    },
                    error: function(error) {
                        setErrorText();
                    }
                });
           });
        });

        // Triggers the marker click event on click of any item in side list
        this.itemClick = function (restaurant) {
            google.maps.event.trigger(restaurant.marker, "click");
        }

        self.filterStr = ko.observable("");

        this.filteredRestList = ko.dependentObservable(function() {
            var query = this.filterStr().toLowerCase();
            //var self = this;
            if (!query) {
            // Returns the original restaurant list , setting all the markers to visible
            return ko.utils.arrayFilter(self.restList(), function(item) {
                item.marker.setVisible(true);
                return true;
            });
            } else {
                return ko.utils.arrayFilter(this.restList(), function(item) {
                if (item.name.toLowerCase().indexOf(query) >= 0) {
                    return true;
                } else {
                    item.marker.setVisible(false);
                    return false;
                }
                });
            }
            }, this);
        };
    
    // Applying Knockout bindings
    ko.applyBindings(new KO_ViewModel());
}
