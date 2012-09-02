/*
Copyright 2012 Adobe Systems, Incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ .
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

precision mediump float;

varying float v_lighting;

// This uniform value is passed in using CSS.
uniform vec4 backColor;
uniform float useColoredBack;

const float PI = 3.1415;

void main()
{
	/*
	if (!gl_FrontFacing && useColoredBack >= 0.5)
        css_MixColor = vec4(vec3(v_lighting), 1.0) * backColor;
    else
	    css_MixColor = vec4(vec3(v_lighting), 1.0);
	   */
}
