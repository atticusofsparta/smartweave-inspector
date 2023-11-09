declare module 'react-identicons' {
  import { ComponentType, SVGAttributes } from 'react';

  interface IdenticonProps extends SVGAttributes<SVGElement> {
    string: string;
    size?: number;
    bg?: string;
    fg?: string;
    padding?: number;
    palette?: string[];
    count?: number;
    // Include other props here as needed
  }

  const Identicon: ComponentType<IdenticonProps>;
  export default Identicon;
}
