import React from 'react';
import { useFooter } from '@jpmorganchase/mosaic-store';

export const withFooterAdapter = Component => () => {
  const props = useFooter();
  return <Component {...props} />;
};
