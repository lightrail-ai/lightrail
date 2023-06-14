import { render } from '@testing-library/react';
import React from 'react';
import ComponentPreviewDressing, { ComponentPreviewDressingProps } from './ComponentPreviewDressing';

describe('ComponentPreviewDressing', () => {
    const defaultProps: ComponentPreviewDressingProps = {};

    it('should render', () => {
        const props = { ...defaultProps };
        const { asFragment, queryByText } = render(<ComponentPreviewDressing {...props} />);

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText('ComponentPreviewDressing')).toBeTruthy();
    });
});
