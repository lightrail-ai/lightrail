import { render } from '@testing-library/react';
import React from 'react';
import DiffView, { DiffViewProps } from './DiffView';

describe('DiffView', () => {
    const defaultProps: DiffViewProps = {};

    it('should render', () => {
        const props = { ...defaultProps };
        const { asFragment, queryByText } = render(<DiffView {...props} />);

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText('DiffView')).toBeTruthy();
    });
});
