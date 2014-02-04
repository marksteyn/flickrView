/* Flickr View App */

(function(global) {

  'use strict';
  
  //
  // Base url for Flickr photo feed excluding tag parameters
  //
  var FLICKR_PHOTOS_PUBLIC_URL = "http://api.flickr.com/services/feeds/photos_public.gne?format=json&jsoncallback=JSON_CALLBACK";
  
  //
  // Regular expression to match content in parentheses ()
  //
  var EXTRACT_PARENS_RE = /\(([^)]+)\)/;
  
  // 
  // Regular expression to match white space
  //
  var WHITE_SPACE_RE = /\s+/;
  
  //
  // Define app module
  //
  var flickrViewApp = angular.module('flickrViewApp', ['ngSanitize', 'infinite-scroll']);
  
  //
  // Flickr view controller
  //  
  flickrViewApp.controller('FlickrViewController', ['$scope', '$http', function($scope, $http) {
    
    //
    // Array of images displayed in the list
    //
    $scope.images = [];
    
    //
    // Infinite scroll is disabled when trye
    //
    $scope.loading = false;
    
    //
    // Url of image displayed in detail view
    //
    $scope.detailImageUrl = null;
    
    //
    // Set true to enable detail view
    //
    $scope.detailMode = false;
    
    //
    // Tags search string
    //
    $scope.tags = '';
    
    //
    // Tag search mode any|all
    //
    $scope.tagMode = 'all';
    
    //
    // Date format string - see http://docs.angularjs.org/api/ng.filter:date
    //
    $scope.dateFormat = "d MMM yyyy 'at' HH:mm";
    
    //
    // Toggles info panel in detail view
    //
    $scope.showDetailInfo = true;
    
    /**
     Call to load images.     
     @param clearList If true the list is cleared before appending the results.
       If false, results are appended to the existing items.
    */
    $scope.loadImages = function(clearList) {
      //
      // Set loading variable to prevent infinite scroll loading more data while
      // the request is in progress
      //
      $scope.loading = true;

      if (clearList) {
        $scope.images.length = 0;
      }
    
      //
      // Append tag query parameters to url
      //
      var feedUrl = FLICKR_PHOTOS_PUBLIC_URL;
      if ($scope.tags) {
        feedUrl += '&tagmode=' + $scope.tagMode + '&tags=' + $scope.tags.trim().split(WHITE_SPACE_RE).join(','); 
      }
            
      $http.jsonp(feedUrl).success(function(data) {

        //
        // Preprocess the response to make some additional fields available in the view
        // and to add a default title
        // 
        data.items.forEach(function(item, index) {
  
          item.custom = {
            // Set a default title if blank
            title: item.title.trim() || 'Untitled image',
            // derive the largest size image from the thumbnail
            largeUrl: item.media.m.replace('m.jpg', 'b.jpg'),
            // extract the user name
            user: EXTRACT_PARENS_RE.exec(item.author)[1],
            // convert tag string to an array
            tags: (item.tags && item.tags.trim().split(WHITE_SPACE_RE)) || [],
          };
         
          $scope.images.push(item);
        });

        $scope.loading = false;
      });
    }
    
    /**
     Set the detail image.
     The view uses this to switch to detail mode.
     Setting it to a falsey value returns to list mode
     
     @param image object
    */
    $scope.setDetailImage = function(image) {
      if (image) {
        $scope.detailImage = image;
      };
      $scope.detailMode= !!image;
    }
    
    
    /**
      Set the tag string and execute the search.
      Clears the existing search results, and returns to list view
  
      @param string of space separated tags
    */
    $scope.setTags = function(str) {
      $scope.tags = str;
      $scope.detailMode = false;
      $scope.loadImages(true);
    }
    
  }]);
  

  /**
   The detail view opens with the thumbnail set to cover the screen to ensure
   something is visible immediately.  This directive replaces it with the large
   size image once it has loaded.
  */
  flickrViewApp.directive('displayFullSizeImage', function () {     
    return {
      link: function(scope, el, attrs) {   
        el.bind('load' , function(event) { 
          el[0].parentNode.style.backgroundImage = 'url(' + el[0].src + ')';      
        });
      }
    }
  });
  
  
  /**
   Attribute level directive used on a tags to prevent the click event
   bubbling.
  /*/
  flickrViewApp.directive('stopPropagation', function () {
    return {
      restrict: 'A',
        link: function (scope, element, attrs) {
        element.on('click', function(e){
          e.stopPropagation();
          if (attrs.ngClick){
            scope.$eval(attrs.ngClick);
          }
        });
      }
    };
  });
  

  global.flickrViewApp = flickrViewApp;


})(window);