/*
Copyright 2011 Adobe Systems, incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ . 
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_texture;
uniform float amount;
const float PI = 3.141592;
void main()
{
	vec4 orig = texture2D(u_texture, v_texCoord);
	orig += texture2D(u_texture, v_texCoord - vec2(cos(float(v_texCoord.x)*250.0*PI) * amount, 0));
	orig += texture2D(u_texture, v_texCoord - vec2(sin(float(v_texCoord.y)*250.0*PI) * amount, 0));
	orig += texture2D(u_texture, v_texCoord - vec2(0, cos(float(v_texCoord.x)*250.0*PI) * amount));
	orig += texture2D(u_texture, v_texCoord - vec2(0, sin(float(v_texCoord.y)*250.0*PI) * amount));
	orig /= 5.0;
	gl_FragColor = orig * (1.0 - amount * amount);
}