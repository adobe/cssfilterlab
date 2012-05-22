/*
Copyright 2011 Adobe Systems, incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ .
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

precision mediump float;

varying float v_lighting;

uniform float t;
uniform vec4 backColor;
uniform float useColoredBack;

void main()
{
    // TODO: When we have more blend modes, we can have the backColor replace the texture color.
    // Or, we can enable gl_FragColor and define its interaction with css_BlendColor.
    if (!gl_FrontFacing && useColoredBack >= 0.5)
        css_BlendColor = backColor;

    css_BlendColor *= vec4(v_lighting, v_lighting, v_lighting, 1.0);
}
