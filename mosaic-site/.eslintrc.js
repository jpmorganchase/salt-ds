module.exports = {
  overrides: [
    {
      files: ['./src/**/*'],
      extends: ['next'],
      rules: {
        'import/no-extraneous-dependencies': ['off'],
        'import/no-duplicates': ['off'],
        'react/react-in-jsx-scope': 'off',
        '@next/next/no-html-link-for-pages': 'off',
        'react/function-component-definition': 'off',
        'react/jsx-filename-extension': ['warn', { extensions: ['.tsx'] }],
        'react/jsx-props-no-spreading': 'off'
      }
    }
  ]
};
