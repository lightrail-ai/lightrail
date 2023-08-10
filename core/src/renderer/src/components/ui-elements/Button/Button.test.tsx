import { render } from '@testing-library/react';
import React from 'react';
import Button, { ButtonProps } from './Button';

describe('Button', () => {
    const defaultProps: ButtonProps = {};

    it('should render', () => {
        const props = { ...defaultProps };
        const { asFragment, queryByText } = render(<Button {...props} />);

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText('Button')).toBeTruthy();
    });
});
