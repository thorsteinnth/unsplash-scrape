# unsplash-scrape
Quick 'n dirty script to download all the images from https://unsplash.com.

## Usage

### Install dependencies
```
npm install
```
##### Warning!
If you're on Windows, using Visual Studio 2013 and you're getting errors while installing the dependencies, you need to install the dependencies with the msvs_version flag:
```
npm install --msvs_version=2013
```

### Running
In the directory of the repo, run:
```
node unsplash
```

### Flags
You can run the script with optional flags as:
```
node unsplash --folder=images/ --start=12
```
### Optional flags:
* --folder - Relative directory where the images will be downloaded. Defaults to `img/`
* --start - From which page should the script start downloading. Defaults to `1`
* --end - At which page should the script stop downloading. By default it downloads until no more images are available
