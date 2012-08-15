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
