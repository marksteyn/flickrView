/* Controllers */

(function(global) {

  'use strict';
  
  var FLICKR_PHOTOS_PUBLIC_URL = "http://api.flickr.com/services/feeds/photos_public.gne?format=json&jsoncallback=JSON_CALLBACK";
  
  var EXTRACT_PARENS_RE = /\(([^)]+)\)/;
  var WHITE_SPACE_RE = /\s+/;
  
  var flickrViewApp = angular.module('flickrViewApp', ['ngSanitize', 'infinite-scroll']);
    
  flickrViewApp.controller('FlickrViewController', ['$scope', '$http', function($scope, $http) {
    
    $scope.images = [];
    $scope.loading = false;
    $scope.detailImageUrl = null;
    $scope.detailMode = false;
    $scope.tags = '';
    $scope.tagMode = 'all';
    $scope.dateFormat = "d MMM yyyy 'at' HH:mm";
    
    //
    //
    //
    $scope.loadImages = function(clearList) {
      $scope.loading = true;
      
      var feedUrl = FLICKR_PHOTOS_PUBLIC_URL;

      if ($scope.tags) {
        feedUrl += '&tagmode=' + $scope.tagMode + '&tags=' + $scope.tags.trim().split(WHITE_SPACE_RE).join(','); 
      }
            
      $http.jsonp(feedUrl).success(function(data) {

        if (clearList) {
          $scope.images.length = 0;
        }

        data.items.forEach(function(item, index) {
          item.custom = {
            title: item.title.trim() || 'Untitled image',
            largeUrl: item.media.m.replace('m.jpg', 'b.jpg'),
            user: EXTRACT_PARENS_RE.exec(item.author)[1],
            tags: (item.tags && item.tags.trim().split(WHITE_SPACE_RE)) || [],
            cycleIndex: index
          };
        });

        $scope.images.push.apply($scope.images, data.items);
        $scope.loading = false;
      });
    }
    
    //
    //
    //
    $scope.setDetailImage = function(image) {
      if (image) {
        $scope.detailImage = image;
      };
      $scope.detailMode= !!image;
    }
    
    //
    //
    //
    $scope.setTags = function(str) {
      $scope.tags = str;
      $scope.loadImages(true);
    }
  
  }]);
  
  global.flickrViewApp = flickrViewApp;


  
  flickrViewApp.directive('displayFullSizeImage', function () {     
    return {
      link: function(scope, el, attrs) {   
        el.bind('load' , function(event) { 
          el[0].parentNode.style.backgroundImage = 'url(' + el[0].src + ')';      
        });
      }
    }
  });
  


})(window);