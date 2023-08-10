import { render } from '@testing-library/react';
import React from 'react';
import Settings, { SettingsProps } from './Settings';

describe('Settings', () => {
    const defaultProps: SettingsProps = {};

    it('should render', () => {
        const props = { ...defaultProps };
        const { asFragment, queryByText } = render(<Settings {...props} />);

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText('Settings')).toBeTruthy();
    });
});
