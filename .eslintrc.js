module.exports = {
    "env": {
        "node": true,
        "es6":true,
        "browser": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "block-scoped-var": 1,
        "curly": 1,
        "eqeqeq": 1,
        "comma-spacing": 1,
        "comma-style": 1,
        "func-call-spacing": 1,
        "indent": 1,
        "keyword-spacing": 1,
        "linebreak-style": 1,
        "lines-around-comment": 1,
        "space-infix-ops": 1,
        "arrow-spacing": 1,
        "arrow-parens":0,
        "prefer-const": 1,
        "array-callback-return": 1,
        "dot-location": 0,
        "dot-notation": 1,
        "semi": 1,
        "space-before-blocks": 1,
        "space-before-function-paren": 0,
        "space-in-parens": 1,
        "space-unary-ops": 1,
        "spaced-comment": 1,
        "arrow-body-style": 1,
        "rest-spread-spacing": 1,

        "no-console": 0,
        "no-case-declarations":0,
        "no-extra-parens": 1,
        "no-var": 1,
        "no-unsafe-negation": 1,
        "no-restricted-imports": 1,
        "no-duplicate-imports": 1,
        "no-useless-computed-key": 1,
        "no-useless-rename": 1,
        "no-multiple-empty-lines": 1,
        "no-global-assign": 1,
        "no-implicit-globals": 1,
        "no-labels": 1,
        "no-multi-str": 1,
        "no-trailing-spaces": 0,
        "no-unreachable":0,
        "no-eval": 1,
        "no-extend-native": 0,
        "no-extra-label": 1,

        "indent": [
            "off",
            "tab"
        ],
        "linebreak-style": [
            "off",
            "windows"
        ],
        "quotes": [
            "warn",
            "single"
        ],
        "semi": [
            "warn",
            "never"
        ]
    },
    // "globals": { "fetch": false }
};