/*
Copyright 2011 Adobe Systems, incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ . 
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

precision mediump float;

uniform sampler2D u_texture;
uniform float amount;

vec4 col0 = vec4(0.2127 + 0.7873 * amount, 
                 0.2127 - 0.2127 * amount,
                 0.2127 - 0.2127 * amount,
                 0.0);
vec4 col1 = vec4(0.7152 - 0.7152 * amount,
                 0.7152 + 0.2848 * amount,
                 0.7152 - 0.7152 * amount,
                 0.0);
vec4 col2 = vec4(0.0722 - 0.0722 * amount,
                 0.0722 - 0.0722 * amount,
                 0.0722 + 0.9278 * amount,
                 0.0);
                 
vec4 col3 = vec4(0.0,   0.0,   0.0,   1.0);

mat4 colorMatrix = mat4(col0, col1, col2, col3);

varying vec2 v_texCoord;

void main() {
    vec4 color = texture2D(u_texture, v_texCoord);
    vec4 saturate = colorMatrix * color;
    
    gl_FragColor = saturate;
}
