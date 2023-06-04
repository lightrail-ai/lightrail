import { render } from '@testing-library/react';
import React from 'react';
import OneTimeModal, { OneTimeModalProps } from './OneTimeModal';

describe('OneTimeModal', () => {
    const defaultProps: OneTimeModalProps = {};

    it('should render', () => {
        const props = { ...defaultProps };
        const { asFragment, queryByText } = render(<OneTimeModal {...props} />);

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText('OneTimeModal')).toBeTruthy();
    });
});
