/*
Copyright 2011 Adobe Systems, incorporated
This work is licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/ . 
Permissions beyond the scope of this license, pertaining to the examples of code included within this work are available at Adobe http://www.adobe.com/communities/guidelines/ccplus/commercialcode_plus_permission.html .
*/

precision mediump float;
uniform sampler2D u_texture;
uniform vec2 delta;
uniform float t;
uniform sampler2D sampler3;

varying vec2 v_texCoord;

float random(vec3 scale, float seed) {
    /* use the fragment position for a different seed per-pixel */
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main() {
    vec4 color = texture2D(u_texture, v_texCoord);
    vec4 tex  = texture2D(sampler3, v_texCoord);
    float gs = (0.1 + (tex.r + tex.g + tex.b) / 3.0) / 1.1   ;
    
    float scale = 10.0 * t * t * t * gs;
    
    float alpha = color.a * scale;
    
    if (alpha > 1.0) {
        alpha = 1.0;
    }

    if (color.a > 0.0) {
        color.rgb /= color.a;
    }
    
    color.a = alpha;
    color.rgb *= color.a;
    
    gl_FragColor = color;
}
