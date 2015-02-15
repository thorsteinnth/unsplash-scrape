var args =          require('minimist')(process.argv.slice(2));
var phantom =       require('phantom');
var fs =            require('fs');
var request =       require('request');
var mkdirp =        require('mkdirp');
var folder =        args.folder || 'img/';
var currentPage =   args.start || 1;
var maxPage =       args.end || false;

var getImages = function() {
    var photos = document.querySelectorAll('.js-photo, .js-fluid-image');
    var out = [];

    Array.prototype.forEach.call(photos, function(current){
        if(current){
            out.push(current.src);
        };
    });

    return out;
};

var allowPage = function(page){
    if(!page.length) return false;

    if(maxPage) return currentPage <= maxPage;

    return true;
};

var prepareImages = function(arr, page){
    return arr.map(function(current){
        var urlParams =     current.split('?');
        var url =           urlParams[0];
        var format =        urlParams[1].match(/(?:fm=)(\w+)/)[1]; // some images have the file format in a query param
        var filename =      url.split('/').pop().toLowerCase();
        var imgFolder =     folder + 'page-' + page + '/';

        if(filename.indexOf(format) === -1){
            filename += "." + format;
        };

        filename = new Date().getTime() + "-" + filename; // so we dont get any duplicates

        return {
            url: url,
            folder: imgFolder,
            filename: imgFolder + filename
        };
    });
};

var downloadImage = function(image, callback){
    mkdirp(image.folder, function(){
        request.head(image.url, function(err, res, body){
            request(image.url).pipe(fs.createWriteStream(image.filename).on('close', callback));
        });
    });
};

var downloadPage = function(index){
    phantom.create(function (ph) {
        ph.createPage(function (page) {
            page.open('https://unsplash.com/grid?page=' + index, function (status) {
                page.evaluate(getImages, function (result) {
                    var images = prepareImages(result, currentPage);
                    var done = 0;
                    var total = images.length;
                    var download = function(){

                        if(done >= total){
                            console.log('Done with page ' + currentPage);

                            currentPage++;

                            downloadPage(currentPage);

                            return ph.exit();
                        };

                        downloadImage(images[done], function(){
                            console.log((++done) + " of " + total);
                            download();
                        });
                    };

                    if(allowPage(images)){
                        console.log('Starting page ' + index);
                        download();
                    }else{
                        console.log('Done with everything');
                        process.exit();
                    };
                });
            });
        });
    });
};

downloadPage(currentPage);
