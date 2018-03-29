CSS FilterLab
=====

Deprecation
-----

This repo is unmaintained and has been archived. 

Supported Browsers
-----

CSS FilterLab uses CSS Filters, an exciting web technology that's becoming available in more and more browsers.
Check out [Can I Use](http://caniuse.com/css-filters) for availability information.

Articles about FilterLab
-----

[Introducing CSS FilterLab](http://www.adobe.com/devnet/html5/articles/css-filterlab.html) by Razvan Caliman at Adobe

[CSS FilterLab Detailed Walkthrough](http://blattchat.com/2012/10/02/css-filterlab/) from Alan Greenblatt's blog

Note: These articles mention CSS Custom Filters, an experimental technology no longer available in CSS FilterLab.

Contributing to FilterLab
-----
Pull requests are reviewed and accepted.

Check out our [contributing page](CONTRIBUTING.md) for more info.

Running FilterLab Locally
-----

### Git Submodules

The CodeMirror library is linked as a git submodule.
After you clone the project on your machine you'll need to setup the submodules and pull in their code.

<pre>
cd ./path/to/css/filterlab/
$ git submodule update --init
</pre>

### Build

CSS FilterLab uses [Grunt.js](http://gruntjs.com/) to concatenate and minify JavaScript & CSS resources. [Grunt.js](http://gruntjs.com/) is build on nodejs, so if you don't have it already installed, go to [node.js website](http://nodejs.org/) and follow the instructions to install it. After that use the command line node package manager to install grunt.js:

<pre>
$ sudo npm install -g grunt
</pre>

The grunt.js project file uses other node.js modules. To quicly install all the required libraries run "npm install" in the project folder.

<pre>
cd ./path/to/css/filterlab/
$ sudo npm install
</pre>

You also need to make sure you have Ruby & Sass installed.  If you're on OS X or Linux you probably already have them installed.  Try <code>ruby -v</code> in your terminal.  When you've confirmed you have Ruby installed, run <code>sudo gem install sass</code> to get Sass.

To build CSS FilterLab, you need to run the "grunt" command line tool in the project folder. This will generate the "dist/" folder.

<pre>
cd ./path/to/css/filterlab/
$ grunt
</pre>

### File System Access

CSS FilterLab requires XHR access, but that doesn't work very well when loaded from file:// URLs. For that reason running CSS FilterLab requires serving it from a server. The easiest way to do that on a Mac would be to use python's simple server:

<pre>
cd [./path/to/css/filterlab]/dist/
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
