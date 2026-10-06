export default [
    { ignores: ['dist/**', 'node_modules/**'] },
    {
        files: ['src/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: { window: 'readonly', document: 'readonly', console: 'readonly' },
        },
        rules: {
            'no-unused-vars': 'error',
            'no-undef': 'error',
            'no-unreachable': 'error',
            'no-dupe-keys': 'error',
            'no-duplicate-imports': 'error',
            'no-constant-condition': 'error',
            'valid-typeof': 'error',
        },
    },
]
