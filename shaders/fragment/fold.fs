/*
Copyright 2011 Adobe Systems, incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ . 
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

precision mediump float;
varying vec2 v_texCoord;
varying float v_lighting;
uniform sampler2D u_texture;

uniform vec4 backColor;

uniform float useColoredBack;

void main()
{
    vec4 color;
    if (gl_FrontFacing || useColoredBack < 0.5) {
        color = texture2D(u_texture, v_texCoord);
        if (color.w < 0.001)
            discard;
    } else {
        color = backColor;
    }
    
    color = vec4((color.xyz * v_lighting), color.w);
    color = clamp(color, 0.0, 1.0);
    gl_FragColor = color;
}