function GalleryAPI()
{

}
document.querySelector("#openAlbums").addEventListener("touchend", function() {
      alert("clicked")
      GalleryAPI.prototype.getAlbums = function(successCallback, errorCallback) {
          cordova.exec(
              successCallback,
              errorCallback,
              'GalleryAPI',
              'getAlbums',
              []
          );
}
}
);

GalleryAPI.prototype.getAlbums = function(successCallback, errorCallback) {
    cordova.exec(
        successCallback,
        errorCallback,
        'GalleryAPI',
        'getAlbums',
        []
    );
};

GalleryAPI.prototype.getMedia = function(albumName, successCallback, errorCallback) {
    cordova.exec(
        successCallback,
        errorCallback,
        'GalleryAPI',
        'getMedia',
        [albumName]
    );
};

module.exports = new GalleryAPI();
