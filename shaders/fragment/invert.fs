/*
Copyright 2011 Adobe Systems, incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ . 
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

precision mediump float;
uniform sampler2D u_texture;
uniform float amount;

varying vec2 v_texCoord;

void main() {
    vec4 color = texture2D(u_texture, v_texCoord);
    vec4 icolor = vec4(color);
    
    if (color.a > 0.0) {
        icolor.rgb /= icolor.a;
    }
    
    icolor = vec4(1.0 - icolor.r, 
                  1.0 - icolor.g,
                  1.0 - icolor.b,
                  icolor.a);
    icolor.rgb *= icolor.a;
    
    gl_FragColor = (1.0 - amount) * color + amount * icolor;
}
