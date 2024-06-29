import { Body } from "@jpmorganchase/mosaic-site-components";
import {
  type MiddlewareResult,
  createMiddlewareRunner,
  middlewarePresets,
} from "@jpmorganchase/mosaic-site-middleware";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import React from "react";

import type { MyAppProps, MyMiddlewareProps } from "../types/mosaic";

/**
 * Extend props passed to MyApp by adding your own middleware ('withMyExampleMiddleware') functions.
 *
 const middlewareRunner = createMiddlewareRunner<ExampleMiddlewareProps, ExampleMiddlewareOptions>({}, 
   [
     ...middlewarePresets,
     [withMyExampleMiddleware, { someProp: 20000 }]
   ]
 );
 */
const middlewareRunner = createMiddlewareRunner<MyMiddlewareProps>(
  {},
  middlewarePresets,
);

export async function getServerSideProps(
  context: GetServerSidePropsContext,
): Promise<Partial<GetServerSidePropsResult<MiddlewareResult<MyAppProps>>>> {
  const props = await middlewareRunner(context, {});
  return props;
}

/** MyApp will be passed MyAppProps which is created by combining the result of all props created by Middleware */
const MyApp = (
  props: JSX.IntrinsicAttributes & {
    [x: string]: any;
    components?: {} | undefined;
    type: any;
  },
) => <Body {...props} />;
export default MyApp;
