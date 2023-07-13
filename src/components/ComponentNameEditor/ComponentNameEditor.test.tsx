import { render } from '@testing-library/react';
import React from 'react';
import ComponentNameEditor, { ComponentNameEditorProps } from './ComponentNameEditor';

describe('ComponentNameEditor', () => {
    const defaultProps: ComponentNameEditorProps = {};

    it('should render', () => {
        const props = { ...defaultProps };
        const { asFragment, queryByText } = render(<ComponentNameEditor {...props} />);

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText('ComponentNameEditor')).toBeTruthy();
    });
});
