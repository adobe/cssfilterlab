CSS FilterLab
=================

Supported Browsers
-------
CSS FilterLab is using some cutting-edge technology that is available in the latest Google Chrome Canary and Webkit nightly builds. To enjoy the full experience you'll need to turn a few knobs:

### Google Chrome Canary
- Download and install [Google Chrome Canary](https://tools.google.com/dlpage/chromesxs)
- Type `chrome://flags/` in the browser's address bar
- Find the **Enable CSS Shaders** flag and turn it on
- Find the **GPU Accelerated SVG Filters** flag and turn it on
- Relaunch the browser

### WebKit
- Download and install [Webkkit nightly](http://nightly.webkit.org/)
- In the browser's menu click **Develop** > **Enable WebGL**

Enjoy CSS FilterLab!

Running
-------

CSS FilterLab requires HTML5 File System access, but that doesn't work very well when loaded from file:/ URLs. For that reason running CSS FilterLab requires serving it from a server. The easiest way to do that on a Mac would be to use python's simple server:

<pre>
cd ./path/to/css/filterlab/
python -m SimpleHTTPServer
</pre>

Open [http://localhost:8000](http://localhost:8000) in your browser.  


Contributing
------------

To contribute pull requests back to Adobe, please fill out and submit the Contributor License Agreement at http://html.adobe.com/webstandards/csscustomfilters/cssfilterlab/dev/cssfilterlab-cla.html

### CSS Styles
The project uses [SASS](http://sass-lang.com/) to streamline working with CSS files. 

You may edit the CSS files directly. However, if you want to contribute your changes back you'll need to make the edits in the corresponding SCSS files and use SASS to regenerate the CSS files.                                                                  

Working with SASS:    

- [Install SASS](http://sass-lang.com/download.html) (requires Ruby)

- Tell SASS to watch the `style` folder and regenerate CSS files when you make changes to SCSS files  
    - `$ sass --watch --style expanded style/app.scss:style/css/app.css`

See the [SASS tutorial](http://sass-lang.com/tutorial.html) for more details on generating CSS files with SASS. 


