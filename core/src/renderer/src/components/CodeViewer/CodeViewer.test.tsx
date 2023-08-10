import { render } from '@testing-library/react';
import React from 'react';
import CodeViewer, { CodeViewerProps } from './CodeViewer';

describe('CodeViewer', () => {
    const defaultProps: CodeViewerProps = {};

    it('should render', () => {
        const props = { ...defaultProps };
        const { asFragment, queryByText } = render(<CodeViewer {...props} />);

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText('CodeViewer')).toBeTruthy();
    });
});
