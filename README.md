# unsplash-scrape

## Usage

### Install dependencies
```
npm install
```

### Running
In the directory of the repo, run:
```
node unsplash --url=[URL to download from]
```
Example:
```
node unsplash --url=https://unsplash.com/collections/296586/iceland
```

### Flags
You can run the script with optional flags as:
```
node unsplash --folder=images/
```
### Optional flags:
* --folder - Relative directory where the images will be downloaded. Defaults to `dloaded_images/`
