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

function position(min, max, step) {
	return {
		type: 'vec3',
		generator: 'vector',
		mixer: 'mixVector',
		min: min,
		max: max,
		step: step
	}
}

function position2D(min, max, step) {
	return {
		type: 'vec2',
		generator: 'vector',
		mixer: 'mixVector',
		min: min,
		max: max,
		step: step
	}
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
};

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
	        factor: "array(" + [1, 1, 2, 6].join(", ") + ")",
	        useColoredBack: 1,
	        backColor: [1.0, 1.0, 1.0, 1.0],
	    },
	    config: {
	        k: {
	            type: 'warp',
	            generator: 'warpArray',
	            mixer: 'mixVectorOfVectors'
	        },
	        factor: {
	            type: 'unknown'
	        },
	        matrix: transform(),
	        useColoredBack: checkbox(),
	        backColor: color(),
	    }
	},
	"rolling-scroll": {
	    hasVertex: true,
	    hasFragment: true,
	    mix: mix(),
	    mesh: mesh(500, 1),
	    meshBox: "border-box",
	    params: {
	        matrix: {
	            rotationX: 0,
	            rotationY: 60,
	            rotationZ: 0
	        },
	        rollRatio: 0.5,
	        initialRollSize: 0.02,
	        rollSeparation: 0.005,
	        depth: 500,
	        useColoredBack: 1,
	        backColor: [1.0, 1.0, 1.0, 0.9],
	    },
	    config: {
	        matrix: transform(),
	        rollRatio: range(0, 1, 0.01),
	        initialRollSize: range(0, 0.1, 0.0001),
	        rollSeparation: range(0, 0.1, 0.0001),
	        depth: range(0, 2000, 1),
	        useColoredBack: checkbox(),
	        backColor: color(),
	    }
	},
	"fold": {
	    hasVertex: true,
	    hasFragment: true,
	    mix: mix("multiply"),
	    mesh: mesh(40, 8),
	    meshBox: "border-box",
	    params: {
	        matrix: {
	            rotationX: 0,
	            rotationY: -24,
	            rotationZ: 0
	        },
	        t: 0.5,
	        spins: 1.5,
	        phase: -0.7,
	        shadow: 1.5,
	        mapDepth: 40,
	        mapCurve: -0.32,
	        minSpacing: 0.37,
	        useColoredBack: 1,
	        backColor: [0.0, 0.0, 0.0, 0.4],
	    },
	    config: {
	        matrix: transform(),
	        t: range(0, 1, 0.01),
	        spins: range(0.5, 10, 0.01),
	        phase: range(-3.14, 3.14, 0.001),
	        shadow: range(0, 2, 0.01),
	        mapDepth: range(0.0, 200, 0.0001),
	        mapCurve: range(-0.5, 0.5, 0.001),
	        minSpacing: range(0, 0.5, 0.001),
	        useColoredBack: checkbox(),
	        backColor: color(),
	    }
	},
	"quad-shuffle": {
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
	        amount: 10,
	        t: 0
	    },
	    config: {
	        matrix: transform(),
	        amount: range(0, 500, 10),
	        t: range(0, 1, 0.01)
	    }
	},
	"quad-explosion": {
	    hasVertex: true,
	    hasFragment: true,
	    mix: mix(),
	    mesh: mesh(76, 100),
	    meshBox: "border-box detached",
	    params: {
	        matrix: {
	            rotationX: 0,
	            rotationY: 0,
	            rotationZ: 0
	        },
	        amount: 1.5,
	        rotateAngleX: 0,
	        rotateAngleY: 0,
	        rotateAngleZ: 0,
	        centerX: 0.5,
	        centerY: 0.5,
	        t: 0.5,
	        fade: 0.7
	    },
	    config: {
	        matrix: transform(),
	        amount: range(0, 5, 0.1),
	        rotateAngleX: range(-180, 180, 0.001),
	        rotateAngleY: range(-180, 180, 0.001),
	        rotateAngleZ: range(-180, 180, 0.001),
	        centerX: range(-1, 2, 0.001),
	        centerY: range(-1, 2, 0.001),
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
	        strength: 0.2, 
	        lightIntensity: 1.05
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
	    	ambientLight: range(0, 1, 0.01),
	    	lightPosition: position(-1, 1, 0.01),
	    	lightColor: color(),
	    	transform: transform()
	    }
	},
	"tile-flip": {
	    hasVertex: true,
	    hasFragment: true,
	    mix: mix("multiply"),
	    mesh: mesh(25, 32),
	    meshBox: "border-box detached",
	    params: {
	    	amount: 0.2,
	    	randomness: 2.0,
	    	transform: {
	    		rotationX: 0,
	            rotationY: 0,
	            rotationZ: 0
	    	}
	    },
	    config: {
	    	amount: range(0, 1, 0.01),
	    	randomness: range(0, 3, 0.01),
	    	transform: transform()
	    }
	},
	"burn": {
	    hasVertex: true,
	    hasFragment: true,
	    mix: mix("multiply"),
	    mesh: mesh(50, 50),
	    meshBox: "border-box detached",
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
	    },
	},
	"dissolve": {
	    hasVertex: true,
	    hasFragment: true,
	    mix: mix("multiply"),
	    mesh: mesh(50, 50),
	    meshBox: "border-box detached",
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
	    meshBox: "border-box detached",
	    params: {
	        cylinderPosition: [0.0, 0.0],
	        cylinderDirection: [-1.0, 1.0],
	        cylinderRadius: 0.2,
	        bleedThrough: 0.5
	    },
	    config: {
	        cylinderPosition: position2D(-1, 1, 0.01),
	        cylinderDirection: position2D(-1, 1, 0.01),
	        cylinderRadius: range(0, 3, 0.01),
	        bleedThrough: range(0, 1, 0.01)
	    }		
	}
};
})()
