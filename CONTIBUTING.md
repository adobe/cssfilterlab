Contributing to CSS FilterLab
=====

To contribute pull requests back to Adobe, please fill out and submit the [Contributor License Agreement](http://html.adobe.com/webstandards/csscustomfilters/cssfilterlab/dev/cssfilterlab-cla.html).

## CSS Styles
The project uses [SASS](http://sass-lang.com/) to streamline working with CSS files. 

You may edit the CSS files directly. However, if you want to contribute your changes back you'll need to make the edits in the corresponding SCSS files and use SASS to regenerate the CSS files.

Working with SASS:    

- [Install SASS](http://sass-lang.com/download.html) (requires Ruby)

- Tell SASS to watch the `style` folder and regenerate CSS files when you make changes to SCSS files  
    - `$ sass --watch --style expanded style/app.scss:style/css/app.css`

See the [SASS tutorial](http://sass-lang.com/tutorial.html) for more details on generating CSS files with SASS. 

## Adding new custom filters

The best way to share custom filters is to use the built-in gist sharing feature. However, if you want to include your filter with the CSS FilterLab project, you need to send us a pull-request. There are some steps that need to be followed.

First you need to submit the CLA at the top of this page.

Then you need the custom filter. The easiest way to create one is using CSS FilterLab itself. If you already have a shader, just fork an existing one and replace the contents with your own. Delete or update the parameters as needed in the "Filter Configuration" tab. You need this step if you don't want to bother writing the JSON configuration manually. The configuration is describing the types of the parameters you need to pass to the shaders. CSS FilterLab uses these configuration objects to create the controls on the left side of the application.

Publish it to GitGub and copy the contents of the config.json file into configs.js. Look for the window.filterConfigs object and add a new property into it. The key will be the name of your new custom filter and the value will be the content you just copied from config.json. 

CSS FilterLab uses the name of the property to look up the shaders in the project, so you need to copy `shader.fs` to `shaders/fragment/[filter_name].fs` and `shader.vs` to `shaders/vertex/[filter_name].vs` .

Note that in `configs.js` we tried to 'compress' the data using some helper functions at the top of the file. Feel free to reuse or add more as you need them. For example, the config for the color parameter is used by multiple filters, so we added the `color()` function to avoid duplicating it all over the place.