var args =          require('minimist')(process.argv.slice(2));
var cheerio =       require('cheerio');
var request =       require('request');
var fs =            require('fs');
var request =       require('request');
var mkdirp =        require('mkdirp');
var progressbar =   require('progress');
var folder =        args.folder || 'dloaded_images/';
var url =           args.url;

var shouldDownload = function(images){
    if(!images.length) return false;
    return true;
};

var prepareImages = function(arr){
    return arr.map(function(current){
        var url =           current;
        var urlParamSplit = current.split('?');
        var format =        'jpg'
        var arrUrl =        urlParamSplit[0].split('/');
        var filename =      arrUrl[arrUrl.length-2].toLowerCase() + "." + format;
        var imgFolder =     folder;

        filename = new Date().getTime() + "-" + filename; // so we dont get any duplicates

        return {
            url: url,
            folder: imgFolder,
            filename: imgFolder + filename
        };
    });
};

var downloadImage = function(image, callback){
    //console.log('Downloading image: ' + image.url);
    mkdirp(image.folder, function(){
        request.head(image.url, function(err, res, body){
            request(image.url).pipe(fs.createWriteStream(image.filename).on('close', callback));
        });
    });
};

var downloadPage = function(){

    if (!url) {
        console.log('Please specify a URL with the --url flag');
        process.exit();
    } 

    console.log('Downloading from: ' + url);

    request({ uri: url }, function(error, response, body) {
        var $ = cheerio.load(body);
        var images = prepareImages($("a[title$='Download photo']").map(function(){
            return $(this).attr('href');
        }).get());
        var done = 0;
        var total = images.length;
        console.log('Found ' + total + ' images');
        var bar = new progressbar('Downloading [:bar] :percent', {
            total: total
        });

        var download = function(){
            if(done >= total){
                bar.terminate();
            }else{
             downloadImage(images[done++], function(){
                 bar.tick();
                 download();
             });
         }
     };

     if(shouldDownload(images)){
        download();
    }else{
        console.log('Aborting ...');
        process.exit();
    }
});
};

downloadPage();
