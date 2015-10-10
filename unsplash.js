var args =          require('minimist')(process.argv.slice(2));
var cheerio =       require('cheerio');
var request =       require('request');
var fs =            require('fs');
var request =       require('request');
var mkdirp =        require('mkdirp');
var progressbar =   require('progress');
var folder =        args.folder || 'img/';
var currentPage =   args.start || 1;
var maxPage =       args.end || false;

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
        }

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
    request({ uri: 'https://unsplash.com/?page=' + index }, function(error, response, body) {
        var $ = cheerio.load(body);
        var images = prepareImages($('.js-photo, .js-fluid-image').map(function(){
            return $(this).attr('src');
        }).get(), currentPage);
        var done = 0;
        var total = images.length;
        var bar = new progressbar('Downloading page ' + currentPage + ' [:bar] :percent', {
            total: total
        });

        var download = function(){
            if(done >= total){
                bar.terminate();
                currentPage++;
                downloadPage(currentPage);
            }else{
               downloadImage(images[done++], function(){
                   bar.tick();
                   download();
               });
            }
        };

        if(allowPage(images)){
            download();
        }else{
            console.log('Done with everything');
            process.exit();
        }
    });
};

downloadPage(currentPage);
