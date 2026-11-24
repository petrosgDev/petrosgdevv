import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: [
      'dist/**/*',
      '.next/**/*',
      'out/**/*',
      'node_modules/**/*',
      'src/**/*',
      'public/**/*',
      '*.ts',
      '*.mjs',
      '*.js',
    ],
  },
  firebaseRulesPlugin.configs['flat/recommended'],
];
