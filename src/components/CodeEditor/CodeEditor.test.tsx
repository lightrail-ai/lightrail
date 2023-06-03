import { render } from '@testing-library/react';
import React from 'react';
import CodeEditor, { CodeEditorProps } from './CodeEditor';

describe('CodeEditor', () => {
    const defaultProps: CodeEditorProps = {};

    it('should render', () => {
        const props = { ...defaultProps };
        const { asFragment, queryByText } = render(<CodeEditor {...props} />);

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText('CodeEditor')).toBeTruthy();
    });
});
