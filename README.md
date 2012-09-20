CSS FilterLab
=====

Supported Browsers
-----

CSS FilterLab is using some cutting-edge technology that is available in the latest Google Chrome Canary and WebKit nightly builds. To enjoy the full experience you'll need to turn a few knobs:

### Google Chrome Canary
- Download and install [Google Chrome Canary](https://tools.google.com/dlpage/chromesxs)
- Type `chrome://flags/` in the browser's address bar
- Find the **Enable CSS Shaders** flag and turn it on
- Find the **GPU Accelerated SVG Filters** flag and turn it on
- Relaunch the browser

### WebKit
- Download and install [Webkkit nightly](http://nightly.webkit.org/)
- In the browser's menu select **Develop** > **Enable WebGL**

Enjoy CSS FilterLab!

Running
-----

### Git Submodules

The CodeMirror library is linked as a git submodule.
After you clone the project on your machine you'll need to setup the submodules and pull in their code.

<pre>
cd ./path/to/css/filterlab/
$ git submodule init && git submodule update
</pre>

### File System Access

CSS FilterLab requires HTML5 File System access, but that doesn't work very well when loaded from file:// URLs. For that reason running CSS FilterLab requires serving it from a server. The easiest way to do that on a Mac would be to use python's simple server:

<pre>
cd ./path/to/css/filterlab/
python -m SimpleHTTPServer
</pre>

Open [http://localhost:8000](http://localhost:8000) in your browser.

Legal
----

Notices, terms and conditions pertaining to third party software are located at [http://www.adobe.com/go/thirdparty/](http://www.adobe.com/go/thirdparty/) and incorporated by reference herein.

### jQuery

Copyright 2012 jQuery Foundation and other contributors [http://jquery.com/](http://jquery.com/)

[MIT license](https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt)

### jQuery UI

Copyright (c) 2012 Paul Bakaus, [http://jqueryui.com/](http://jqueryui.com/)

[MIT license](http://jquery-ui.googlecode.com/svn/tags/latest/MIT-LICENSE.txt)

### ANGLE

Copyright (c) 2002-2011 The ANGLE Project Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.

This JavaScript library was automatically generated from the [ANGLE project](http://code.google.com/p/angleproject/) 
using [emscripten](https://github.com/kripken/emscripten)
 
For more information go to [ANGLE.js](https://github.com/adobe/angle.js)

### CodeMirror

Copyright (C) 2012 by Marijn Haverbeke <marijnh@gmail.com>

[MIT License](http://codemirror.net/LICENSE)
