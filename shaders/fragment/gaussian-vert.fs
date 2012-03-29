/*
Copyright 2011 Adobe Systems, incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ . 
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

/**
 * This filter implements the Filter Effects 1.0 gaussian() filter function.
 * 
 * This is a little bit of a stunt as a one-pass filter as Gaussian blurs are notoriously faster
 * as a two pass filter (once in the x-axis, once on the y-axis).
 *
 * A gaussian filter is a convolution kernel where the size of the kernel is: 2 * 3 * s by 2 * 3 * t,
 * where s is the deviation along the x-axis and t is the deviation along the y axis.
 *
 * The size is derived from the fact that on each side of the gaussian's max, the curve goes down
 * to negligible values at 3 times the standard deviation. There is 2 sides. This explains the '2 * 3'
 * factor.
 *
 * The kernel is centered about the processed pixel coordinate. For each x/y (relative to the current
 * pixel), the weights are:
 *
 * H(x) * I(y)
 *
 * where:
 *
 * H(x) = exp(-x2/ (2s2)) / sqrt(2* pi*s2)
 * I(y) = exp(-y2/ (2t2)) / sqrt(2* pi*t2)
 *
 * This filter operates on premultiplied rgba values.
 *
 * @see https://dvcs.w3.org/hg/FXTF/raw-file/tip/filters/publish/Filters.html#feGaussianBlurElement
 * @see http://en.wikipedia.org/wiki/Standard_deviation
 */
 precision mediump float;
 uniform sampler2D u_texture;
 uniform vec2 u_textureSize;

 /* This is called deviation but it really is a kernel. 
  * The reason it is called a deviation is because of the 
  * way we currently 'generate' shader uniforms. See the 
  * 'generator' in param.js.
  */
 uniform float deviation[100]; 
 uniform float kernelSize;

 float dy = 1.0 / u_textureSize.y;

 varying vec2 v_texCoord;

 void main() {
     float weight = 0.0;
     vec4 smp;
     float ws;
     vec4 sum = vec4(0.0, 0.0, 0.0, 0.0);
     int ks = int(kernelSize);


     for (int ri = 0; ri <= 50; ri++) {
         if (ri >= 0 && ri <= 2 * ks) {
             smp = texture2D(u_texture, v_texCoord + vec2(0.0, dy * float(ri - ks)));
             weight = deviation[ri];
             ws += weight;
             sum += weight * smp;
         }
     }

     if (ws > 0.0) {
         sum /= ws;
     }

     gl_FragColor = sum; 
 }