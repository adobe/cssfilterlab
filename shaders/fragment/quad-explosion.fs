/*
Copyright 2011 Adobe Systems, incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ .
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

precision mediump float;

uniform float t;
uniform float fade;

void main()
{
    /*
    // As t increases like [0 -> 0.5 -> 1],
    // fadeFactor increases and then decreases like [0 -> 1 -> 0].
    float fadeFactor = 2.0 * t;
    if (fadeFactor > 1.0)
        fadeFactor = 2.0 - fadeFactor;

    float currentFade = 1.0 - fadeFactor * fade;
    css_MixColor = vec4(currentFade);*/
}
