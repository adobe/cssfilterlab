CSS FilterLab
=====

Supported Browsers
-----

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
-----

### Git Submodules

The CodeMirror library is linked as a git submodule.
After you clone the project on your machine you'll need to setup the submodules and pull in their code.

`$ git submodule init && git submodule update`

### File System Access

CSS FilterLab requires HTML5 File System access, but that doesn't work very well when loaded from file:/ URLs. For that reason running CSS FilterLab requires serving it from a server. The easiest way to do that on a Mac would be to use python's simple server:

<pre>
cd ./path/to/css/filterlab/
python -m SimpleHTTPServer
</pre>

Open [http://localhost:8000](http://localhost:8000) in your browser.
