/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

precision mediump float;

// Uniforms passed in from CSS.

uniform float bleedThrough;

// Varyings

varying vec3 v_normal;
varying float v_gradient;

// Main

void main()
{
    if (gl_FrontFacing) {
        // Front shadows.
        css_MixColor = vec4(vec3(0.0), 1.0 - v_normal.z);
    } else {
        // Back shine.
        float gradient = clamp(v_gradient, 0.0, 1.0);
        css_MixColor = vec4(vec3(1.0), gradient * bleedThrough + (1.0 - bleedThrough));
    }
}
