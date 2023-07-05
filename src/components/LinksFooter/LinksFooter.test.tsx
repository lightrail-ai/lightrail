import { render } from '@testing-library/react';
import React from 'react';
import LinksFooter, { LinksFooterProps } from './LinksFooter';

describe('LinksFooter', () => {
    const defaultProps: LinksFooterProps = {};

    it('should render', () => {
        const props = { ...defaultProps };
        const { asFragment, queryByText } = render(<LinksFooter {...props} />);

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText('LinksFooter')).toBeTruthy();
    });
});
