/*
Copyright 2011 Adobe Systems, incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ . 
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

precision mediump float;
uniform sampler2D u_texture;
uniform float amount;

varying vec2 v_texCoord;

mat3 colorMatrix = mat3(
    vec3(0.2127, 0.2127, 0.2127),
    vec3(0.7152, 0.7152, 0.7152),
    vec3(0.0722, 0.0722, 0.0722)
);


void main() {
    vec4 color = texture2D(u_texture, v_texCoord);
    vec4 gray = vec4(color);

    if (gray.a > 0.0) {
        gray.rgb /= gray.a;
    }
    
    gray.rgb = colorMatrix * color.rgb;
    color.rgb *= color.a;
    
    gl_FragColor = (1.0 - amount) * color + amount * gray;
}
