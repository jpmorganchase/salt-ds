import { ReactElement } from "react";
import { ExampleContainer } from "../../components/example-container";
import { Image } from "@jpmorganchase/mosaic-site-components";

export const KitchenSink = (): ReactElement => (
  <ExampleContainer type="negative">
    <Image
      src="/img/site/salt-close-up.jpg"
      alt="Close-up photo of some salt granules"
    />
    <p>Example content can be pretty much anything!</p>
    <ul>
      <li>Including</li>
      <li>lists</li>
    </ul>
    <table>
      <thead>
        <tr>
          <th>Or</th>
          <th>even</th>
          <th>tables</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>123</td>
          <td>321</td>
          <td>1337</td>
        </tr>
      </tbody>
    </table>
    <ol>
      <li>or</li>
      <li>ordered</li>
      <li>lists</li>
    </ol>
  </ExampleContainer>
);
