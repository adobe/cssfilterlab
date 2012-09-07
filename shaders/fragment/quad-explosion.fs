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
