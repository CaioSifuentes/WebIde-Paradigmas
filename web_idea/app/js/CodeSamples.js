import { editor } from "./DocumentVars.js"

const codeSamples = {
    0: ``,
    1: `a = 5\nb = 10\nc = a + b\nprint(c)`,
    2: `a = 0\nfor _ in range(10):\n    a += 1\n    a += 2\nprint(a)`,
    3: `a = 2\nif not a % 2:\n    print('Par')\nelse:\n    print('Impar')`,
    4: `def func(a, b):\n    return a + b\nprint(func(1, 2))`,
    5: `i = 0\nwhile True:\n    i += 1\n    if not i % 10000:\n        print(i)`
};

export function setCode(option) {
    if (codeSamples[option]) {
        editor.setValue(codeSamples[option]);
    }
}
