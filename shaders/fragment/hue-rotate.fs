/*
Copyright 2011 Adobe Systems, incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ . 
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

precision mediump float;

uniform sampler2D u_texture;
uniform float angle;

mat3 base0 = mat3(
    vec3(0.2127, 0.2127, 0.2127),
    vec3(0.7152, 0.7152, 0.7152),
    vec3(0.0722, 0.0722, 0.0722)
);

mat3 base1 = mat3(
    vec3(0.7873,  -0.2127, -0.2127),
    vec3(-0.7152,  0.2848, -0.7152),
    vec3(-0.0722, -0.0722,  0.9278)
);

mat3 base2 = mat3(
    vec3(-0.2127,  0.143,  -0.7873),
    vec3(-0.7152,  0.140,   0.7152),
    vec3(0.9278,  -0.283,   0.0722)
);

float PI = 3.141592653;
float angleRad = angle * PI / 180.0;
                 
mat3 hueRotate = base0 + cos(angleRad) * base1 + sin(angleRad) * base2;

varying vec2 v_texCoord;


void main() {
    vec4 color = texture2D(u_texture, v_texCoord);    
    if (color.a > 0.0) {
        color.rgb /= color.a;
    }
    
    color.rgb = hueRotate * color.rgb;
    
    color.rgb *= color.a;
    
    gl_FragColor = color;
}
