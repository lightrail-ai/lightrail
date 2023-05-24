import { render } from '@testing-library/react';
import React from 'react';
import EditorNavbar, { EditorNavbarProps } from './EditorNavbar';

describe('EditorNavbar', () => {
    const defaultProps: EditorNavbarProps = {};

    it('should render', () => {
        const props = { ...defaultProps };
        const { asFragment, queryByText } = render(<EditorNavbar {...props} />);

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText('EditorNavbar')).toBeTruthy();
    });
});
