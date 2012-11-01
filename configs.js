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

(function () {
    
function builtin(fn, params) {
    return {
        fn: fn,
        params: params
    };
}

function color(isCss) {
    return {
        type: 'color',
        mixer: 'mixVector',
        generator: isCss ? 'color' : 'vector'
    };
}

function transform() {
    return {
        type: 'transform',
        generator: 'transform',
        mixer: {
            fn: 'mixHash',
            params: ['mixNumber']
        }
    };
}

function range(min, max, step) {
    return {
        type: 'range',
        min: min,
        max: max,
        step: step
    };
}

function vec(type, min, max, step) {
    return {
        type: type,
        generator: 'vector',
        mixer: 'mixVector',
        min: min,
        max: max,
        step: step
    };
}

function vec4(min, max, step) {
    return vec("vec4", min, max, step);
}

function vec3(min, max, step) {
    return vec("vec3", min, max, step);
}

function vec2(min, max, step) {
    return vec("vec2", min, max, step);
}

function units(unit, value) {
    value.unit = unit;
    return value;
}

function checkbox() {
    return {
        type: 'checkbox',
        mixer: 'dontMix'
    };
}

function mix(blendMode, compositeOperator) {
    return {
        blendMode: blendMode || "normal",
        compositeOperator: compositeOperator || "source-atop"
    };
}

function mesh(columns, rows) {
    return {
        columns: columns,
        rows: rows
    };
}

function builtinPercent(fn, defaultValue, maxValue) {
    return {
        type: builtin(fn, ["amount"]),
        params: {
            amount: defaultValue || 0
        },
        config: {
            amount: units("%", range(0, maxValue || 100, 1))
        }
    };
}

function builtinDeg(fn, defaultValue) {
    return {
        type: builtin(fn, ["angle"]),
        params: {
            angle: defaultValue || 0
        },
        config: {
            angle: units("deg", range(0, 360, 1))
        }
    };
}

function normalAmountConfig (defaultValue, min, max, step) {
    if (min === undefined) {
        min = 0.0;
    }
    
    if (max === undefined) {
        max = 0.0;
    }
    
    if (defaultValue === undefined) {
        defaultValue = (max - min) / 2;
    }
    
    if (step === undefined) {
        step = (max - min) / 100;
    }
    
    return {
        params: {
            amount: defaultValue
        },
        config: {
            amount: range(min, max, step)
        }
    };
}

window.filterConfigs = {
    'drop-shadow': {
        type: builtin("drop-shadow", ["offset_x", "offset_y", "radius", "flood_color"]),
        params: {
            offset_x: 5.0,
            offset_y: 5.0,
            radius: 5.0,
            flood_color: [0.0, 0.0, 0.0, 0.5]
        },
        config: {
            offset_x: units("px", range(-100, 100, 0.01)),
            offset_y: units("px", range(-100, 100, 0.01)),
            radius: units("px", range(0, 20, 0.01)),
            flood_color: color(true)
        }
    },
    
    "blur": {
        type: builtin("blur", ["deviation"]),
        params: {
            deviation: 3.0
        },
        config: {
            deviation: units("px", range(0, 10, 0.5))
        }
    },
    
    grayscale: builtinPercent("grayscale", 100),
    'hue-rotate': builtinDeg("hue-rotate", 180),
    invert: builtinPercent("invert", 100),
    opacity: builtinPercent("opacity", 50),
    saturate: builtinPercent("saturate", 1000, 1000),
    sepia: builtinPercent("sepia", 100),
    brightness: builtinPercent("brightness", 25),
    contrast:  builtinPercent("contrast", 50),
    
    warp: {
        hasVertex: true,
        hasFragment: true,
        mix: mix("normal"),
        mesh: mesh(20, 20),
        meshBox: "border-box",
        params: {
            k: null,
            matrix: {
                rotationX: 0,
                rotationY: 0,
                rotationZ: 0
            },
            useColoredBack: 1,
            backColor: [1.0, 1.0, 1.0, 1.0]
        },
        config: {
            k: {
                type: 'warp',
                generator: 'warpArray',
                mixer: 'mixVectorOfVectors'
            },
            matrix: transform(),
            useColoredBack: checkbox(),
            backColor: color()
        }
    },
    "rolling-scroll": {
        hasVertex: true,
        hasFragment: true,
        mix: mix("normal"),
        mesh: mesh(1, 500),
        meshBox: "border-box",
        params: {
            transform: {
                rotationX: 0,
                rotationY: 0,
                rotationZ: 0,
                perspective: 1000
            },
            initialRollSize: 0.05,
            rollRatio: 0.7,
            rollSeparation: 0.005,
            rollDepth: 500,
            useColoredBack: 1,
            backColor: [1.0, 1.0, 1.0, 0.9]
        },
        config: {
            transform: transform(),
            initialRollSize: range(0, 0.1, 0.0001),
            rollRatio: range(0, 1, 0.01),
            rollSeparation: range(0, 0.1, 0.0001),
            rollDepth: range(0, 2000, 1),
            useColoredBack: checkbox(),
            backColor: color()
        }
    },
    "fold": {
        hasVertex: true,
        hasFragment: true,
        mix: mix("multiply"),
        mesh: mesh(8, 50),
        meshBox: "border-box",
        params: {
            transform: {
                rotationX: 0,
                rotationY: -30,
                rotationZ: 0
            },
            t: 0.5,
            spins: 1.5,
            phase: -0.7,
            shadow: 1.5,
            mapDepth: 40,
            mapCurve: -0.3,
            minSpacing: 0.3,
            useColoredBack: 1,
            backColor: [0.5, 0.5, 0.5, 1.0]
        },
        config: {
            transform: transform(),
            t: range(0, 1, 0.01),
            spins: range(0.5, 10, 0.01),
            phase: range(-3.14, 3.14, 0.01),
            shadow: range(0, 2, 0.01),
            mapDepth: range(0.0, 200, 1),
            mapCurve: range(-0.5, 0.5, 0.01),
            minSpacing: range(0, 0.5, 0.01),
            useColoredBack: checkbox(),
            backColor: color()
        }
    },
    "tile-shuffle": {
        hasVertex: true,
        hasFragment: true,
        mix: mix(),
        mesh: mesh(100, 100),
        meshBox: "border-box detached",
        params: {
            matrix: {
                rotationX: 20,
                rotationY: 20,
                rotationZ: 20
            },
            amount: 250,
            t: 0.5
        },
        config: {
            matrix: transform(),
            amount: range(0, 500, 10),
            t: range(0, 1, 0.01)
        }
    },
    "tile-explosion": {
        hasVertex: true,
        hasFragment: true,
        mix: mix(),
        mesh: mesh(100, 100),
        meshBox: "border-box detached",
        params: {
            transform: {
                rotationX: 0,
                rotationY: 0,
                rotationZ: 0
            },
            tileTransform: {
                rotationX: 0,
                rotationY: 0,
                rotationZ: 0
            },
            explosiveness: 1.5,
            tileRotation: [0.0, 0.0, 0.0],
            center: [0.5, 0.5],
            t: 0.2,
            fade: 0.8
        },
        config: {
            transform: transform(),
            tileTransform: transform(),
            explosiveness: range(0, 5, 0.1),
            tileRotation: vec3(-180, 180, 1),
            center: vec2(-1, 1, 0.01),
            t: range(0, 1, 0.01),
            fade: range(0, 1, 0.01)
        }
    },
    "crumple": {
        hasVertex: true,
        hasFragment: true,
        mix: mix("multiply"),
        mesh: mesh(50, 50),
        meshBox: "border-box",
        params: {
            transform: {
                rotationX: 0,
                rotationY: 0,
                rotationZ: 0
            },
            amount: 1, 
            strength: 0.4, 
            lightIntensity: 1.0
        },
        config: {
            transform: transform(),
            amount: range(0, 1, 0.01),
            strength: range(0.0, 10, 0.01),
            lightIntensity: range(0, 10, 0.01)
        }
    },
    "spherify": {
        hasVertex: true,
        hasFragment: true,
        mix: mix("multiply"),
        mesh: mesh(50, 50),
        meshBox: "border-box",
        params: {
            amount: 1,
            sphereRadius: 0.35,
            sphereAxis: [-0.25, 1.0, 0.0],
            sphereRotation: 90,
            ambientLight: 0.0,
            lightPosition: [1.0, -0.25, 0.25],
            lightColor: [1.0, 1.0, 1.0, 1.0],
            transform: {
                rotationX: 0,
                rotationY: 0,
                rotationZ: 0
            }
        },
        config: {
            amount: range(0, 1, 0.01),
            sphereRadius: range(0, 0.5, 0.01),
            sphereAxis: vec3(-1, 1, 0.01),
            sphereRotation: range(0, 360, 1),
            ambientLight: range(0, 1, 0.01),
            lightPosition: vec3(-1, 1, 0.01),
            lightColor: color(),
            transform: transform()
        }
    },
    "tile-flip": {
        hasVertex: true,
        hasFragment: true,
        mix: mix("multiply"),
        mesh: mesh(32, 25),
        meshBox: "border-box detached",
        params: {
            transform: {
                rotationX: 0,
                rotationY: 0,
                rotationZ: 0
            },
            amount: 0.2,
            randomness: 2.0,
            flipAxis: [0.0, 1.0, 0.0],
            tileOutline: 1.0
        },
        config: {
            transform: transform(),
            amount: range(0, 1, 0.01),
            randomness: range(0, 3, 0.01),
            flipAxis: vec3(-1, 1, 0.01),
            tileOutline: checkbox()
        }
    },
    "burn": {
        hasVertex: true,
        hasFragment: true,
        mix: mix("multiply"),
        mesh: mesh(50, 1),
        meshBox: "border-box",
        params: {
            transform: {
                rotationX: 0,
                rotationY: 0,
                rotationZ: 0
            },
            amount: 1.0,
            randomSeed: 0.0
        },
        config: {
            transform: transform(),
            amount: range(0, 1, 0.01),
            randomSeed: range(0, 1, 0.01)
        }
    },
    "dissolve": {
        hasVertex: true,
        hasFragment: true,
        mix: mix("multiply"),
        mesh: mesh(1, 1),
        meshBox: "border-box",
        params: {
            transform: {
                rotationX: 0,
                rotationY: 0,
                rotationZ: 0
            },
            amount: 0.3
        },
        config: {
            transform: transform(),
            amount: range(0, 1, 0.01)
        }
    },
    "page-curl": {
        hasVertex: true,
        hasFragment: true,
        mix: mix("normal"),
        mesh: mesh(50, 50),
        meshBox: "border-box",
        params: {
            transform: {
                rotationX: 0,
                rotationY: 0,
                rotationZ: 0
            },
            curlPosition: [0.0, 0.0],
            curlDirection: 135,
            curlRadius: 0.2,
            bleedThrough: 0.5
        },
        config: {
            transform: transform(),
            curlPosition: vec2(-1, 1, 0.01),
            curlDirection: range(0, 360, 1.0),
            curlRadius: range(0.05, 3, 0.01),
            bleedThrough: range(0, 1, 0.01)
        }       
    },
    "curtains": {
        "hasVertex": true,
        "hasFragment": true,
        "mix": mix("multiply"),
        "mesh": mesh(100, 1),
        "meshBox": "border-box",
        "params": {
            "transform": {
                "rotationX": 0,
                "rotationY": 0,
                "rotationZ": 0,
                "perspective": 2000,
                "scale": 0.99
            },
            "numFolds": 5,
            "foldSize": 2.5,
            "amount": 0.3
        },
        "config": {
            "transform": transform(),
            "numFolds": range(1, 10, 1),
            "foldSize": range(1, 20, 0.1),
            "amount": range(0, 1, 0.01)
        }
    }
};
})();
