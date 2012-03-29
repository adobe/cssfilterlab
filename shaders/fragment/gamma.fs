/*
Copyright 2011 Adobe Systems, incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ . 
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

precision mediump float;
uniform sampler2D u_texture;

uniform float amplitude;
uniform float exponent;
uniform float offset;

vec3 a = vec3(amplitude, amplitude, amplitude);
vec3 e = vec3(exponent, exponent, exponent);
vec3 o = vec3(offset, offset, offset);

varying vec2 v_texCoord;

void main() {
    vec4 color = texture2D(u_texture, v_texCoord);
    if (color.a > 0.0) {
        color.rgb /= color.a;
    }
    color.rgb =  a * pow(color.rgb, e) + o;
    color.rgb *= color.a;
    
    gl_FragColor = color;
}
