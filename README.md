CSS Filter Studio
=================

Running
-------

CSS Filter Studio requires HTML5 File System access, but that doesn't work very well when loaded from file:/ URLs. For that reason running CSS Filter Studio requires serving it from a server. The easiest way to do that on a Mac would be to use python's simple server:

<pre>
cd ./path/to/css/filter/studio/
python -m SimpleHTTPServer
</pre>

Open [http://localhost:8000](http://localhost:8000) in your browser.  


Contributing
------------

### CSS Styles
The project uses [SASS](http://sass-lang.com/) to streamline working with CSS files. 

You may edit the CSS files directly. However, if you want to contribute your changes back you'll need to make the edits in the corresponding SCSS files and use SASS to regenerate the CSS files.                                                                  

Working with SASS:    

- [Install SASS](http://sass-lang.com/download.html) (requires Ruby)

- Tell SASS to watch the `style` folder and regenerate CSS files when you make changes to SCSS files  
    - `$ sass --watch --style expanded style/styles.scss:style/styles.css`

See the [SASS tutorial](http://sass-lang.com/tutorial.html) for more details on generating CSS files with SASS. 


