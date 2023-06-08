import { render } from '@testing-library/react';
import React from 'react';
import PreviewFrame, { PreviewFrameProps } from './PreviewFrame';

describe('PreviewFrame', () => {
    const defaultProps: PreviewFrameProps = {};

    it('should render', () => {
        const props = { ...defaultProps };
        const { asFragment, queryByText } = render(<PreviewFrame {...props} />);

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText('PreviewFrame')).toBeTruthy();
    });
});
