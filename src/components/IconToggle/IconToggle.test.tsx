import { render } from '@testing-library/react';
import React from 'react';
import IconToggle, { IconToggleProps } from './IconToggle';

describe('IconToggle', () => {
    const defaultProps: IconToggleProps = {};

    it('should render', () => {
        const props = { ...defaultProps };
        const { asFragment, queryByText } = render(<IconToggle {...props} />);

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText('IconToggle')).toBeTruthy();
    });
});
